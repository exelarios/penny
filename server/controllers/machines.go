package controllers

import (
	"fmt"
	"main/constants"
	"main/graph/model"
	"main/maps"
	"main/models"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/gocolly/colly"
	"gorm.io/gorm"
)

type MachineController struct {
	Database *gorm.DB
}

func isMachineDeprecated(designs string) bool {
	return designs == "Gone" || designs == "Moved"
}

func removeHTMLTags(in string) string {
	// regex to match html tag
	const pattern = `(<\/?[a-zA-A]+?[^>]*\/?>)*`
	r := regexp.MustCompile(pattern)
	groups := r.FindAllString(in, -1)
	// should replace long string first
	sort.Slice(groups, func(i, j int) bool {
		return len(groups[i]) > len(groups[j])
	})
	for _, group := range groups {
		if strings.TrimSpace(group) != "" {
			in = strings.ReplaceAll(in, group, "")
		}
	}
	return in
}

func (m *MachineController) Scrap(code int) ([]*models.Machine, error) {
	fmt.Println("Begin scrapping ... ")
	var machines []*models.Machine
	var URLs []string

	fetchURL := fmt.Sprintf("%sLocations.aspx?area=%d", constants.BASE_URL, code)

	locations := colly.NewCollector()
	details := colly.NewCollector()

	locations.OnHTML("table#DG.tbllist tr:not(tr:nth-child(1))", func(element *colly.HTMLElement) {
		designs := element.ChildText("td:nth-child(3)")
		if !isMachineDeprecated(designs) {
			href := element.ChildAttr("a[href]", "href")

			link, err := url.Parse(href)
			if err != nil {
				panic(err)
			}

			parameters, _ := url.ParseQuery(link.RawQuery)
			id, err := strconv.Atoi(parameters["location"][0])
			if err != nil {
				panic(err)
			}

			detailsURL := fmt.Sprintf("%sDetails.aspx?location=%d", constants.BASE_URL, id)
			URLs = append(URLs, detailsURL)
		}
	})

	locations.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	details.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	locations.Visit(fetchURL)

	store := make(chan *models.Machine, len(URLs))

	details.OnHTML("table#ReportLocation", func(element *colly.HTMLElement) {
		parameters, _ := url.ParseQuery(element.Request.URL.RawQuery)
		id, err := strconv.Atoi(parameters["location"][0])
		if err != nil {
			panic(err)
		}

		name := element.ChildAttr("input#ReportLocation_Location", "value")
		fmt.Println(name)
		address := element.ChildAttr("input#ReportLocation_Address", "value")
		city := element.ChildAttr("input#ReportLocation_City", "value")
		country := element.ChildText("select#ReportLocation_CountryList > option[selected]")
		if country == "United States" {
			state := element.ChildText("select#ReportLocation_StateList > option[selected]")
			country = fmt.Sprintf("%s, %s", state, country)
		}

		comments := element.ChildText("textarea#ReportLocation_Comments")
		zipcode := element.ChildAttr("input#ReportLocation_Zip", "value")
		website := element.ChildAttr("input#ReportLocation_Website", "value")
		phone := element.ChildAttr("input#ReportLocation_Phone", "value")
		status := element.ChildText("select#ReportLocation_StatusList > option[selected]")

		// Collecting machine designs
		var devices []*models.Device
		var quantityDrops []string
		var deviceTypes []string
		designs := element.ChildAttrs("input[id$=_MachineName]", "value")
		element.ForEach("select[id$=_QuantityDrop] > option[selected]", func(i int, h *colly.HTMLElement) {
			quantityDrops = append(quantityDrops, h.Text)
		})

		element.ForEach("select[id$=_DesignDrop] > option[selected]", func(i int, h *colly.HTMLElement) {
			deviceTypes = append(deviceTypes, h.Text)
		})

		for i := 0; i < len(designs); i++ {
			name := designs[i]
			quantity := quantityDrops[i]
			deviceType := deviceTypes[i]

			design, err := strconv.Atoi(quantity)
			if err != nil {
				design = 0
			}

			device := &models.Device{
				Name:       name,
				Designs:    design,
				DeviceType: deviceType,
				MachineID:  id,
			}

			devices = append(devices, device)
		}

		comments = removeHTMLTags(comments)

		machine := &models.Machine{
			Id:       id,
			Name:     name,
			Address:  address,
			City:     city,
			Country:  country,
			ZipCode:  zipcode,
			Website:  website,
			Phone:    phone,
			Area:     code,
			Status:   status,
			Comments: comments,
			Devices:  devices,
		}

		store <- machine
	})

	for _, URL := range URLs {
		go details.Visit(URL)
	}

	for i := 0; i < len(URLs); i++ {
		machine := <-store
		machines = append(machines, machine)
	}

	fmt.Println("End scrapping ... ")

	return machines, nil
}

func getCorrdinates(client *maps.Map, address string, output chan *models.Coordinate) {
	latlong, err := client.Latlong(address)
	if err != nil {
		panic(err)
	}

	coordinate := &models.Coordinate{
		Latitude:  latlong.Latitude,
		Longitude: latlong.Longitude,
	}

	output <- coordinate
}

func (m *MachineController) Migrate(code int) error {
	client, err := maps.CreateClient(os.Getenv("GOOGLE_MAPS_API_KEY"))
	if err != nil {
		panic(err)
	}

	machines, err := m.Scrap(code)
	if err != nil {
		return err
	}

	var coordinateRequest string
	for _, machine := range machines {
		if &machine.Address != nil {
			coordinateRequest = fmt.Sprintf("%s %s, %s %s", machine.Address, machine.City, machine.Country, machine.ZipCode)
		} else {
			coordinateRequest = fmt.Sprintf("%s, %s, %s", machine.Name, machine.City, machine.Country)
		}

		var latlong = make(chan *models.Coordinate)

		go getCorrdinates(client, coordinateRequest, latlong)

		machine.Coordinate = <-latlong

		result := m.Database.Model(&models.Machine{}).FirstOrCreate(&machine)
		if result.RowsAffected <= 0 {
			m.Database.Model(&models.Machine{}).Where("id = ?", machine.Id).Updates(machine)
		}
	}

	return nil
}

func (m *MachineController) GetMachineById(id int) (*model.Machine, error) {
	var output *models.Machine
	var devices []*model.Device

	response := m.Database.Model(&models.Machine{}).Preload("Devices").First(&output, &models.Machine{
		Id: id,
	})

	if response.Error != nil {
		return nil, response.Error
	}

	for _, device := range output.Devices {
		output := model.Device{
			Name:       device.Name,
			Designs:    device.Designs,
			DeviceType: device.DeviceType,
			MachineID:  device.MachineID,
		}

		devices = append(devices, &output)
	}

	coordinate := &model.Coordinate{
		Latitude:  output.Coordinate.Latitude,
		Longitude: output.Coordinate.Longitude,
	}

	machine := &model.Machine{
		ID:         output.Id,
		Name:       output.Name,
		Address:    &output.Address,
		City:       output.City,
		Status:     output.Status,
		Country:    output.Country,
		ZipCode:    &output.ZipCode,
		Phone:      &output.Phone,
		Website:    &output.Website,
		Devices:    devices,
		Area:       output.Area,
		Coordinate: coordinate,
		Comments:   output.Comments,
	}

	return machine, nil
}

func (m *MachineController) GetMachinesByCode(code int) ([]*model.Machine, error) {
	// todo: if no data is found, call scrap()
	var machines []*models.Machine
	var output []*model.Machine
	machinesResult := m.Database.Model(&models.Machine{}).Preload("Devices").Where("area = ?", code).Find(&machines)
	if machinesResult.Error != nil {
		return nil, machinesResult.Error
	}

	for _, machine := range machines {
		var devices []*model.Device

		for _, device := range machine.Devices {
			output := model.Device{
				Name:       device.Name,
				Designs:    device.Designs,
				DeviceType: device.DeviceType,
				MachineID:  device.MachineID,
			}

			devices = append(devices, &output)
		}

		coordinate := &model.Coordinate{
			Latitude:  machine.Coordinate.Latitude,
			Longitude: machine.Coordinate.Longitude,
		}

		machine := &model.Machine{
			ID:         machine.Id,
			Name:       machine.Name,
			Address:    &machine.Address,
			City:       machine.City,
			Status:     machine.Status,
			Country:    machine.Country,
			ZipCode:    &machine.ZipCode,
			Phone:      &machine.Phone,
			Website:    &machine.Website,
			Devices:    devices,
			Area:       machine.Area,
			Coordinate: coordinate,
			Comments:   machine.Comments,
		}

		output = append(output, machine)
	}
	return output, nil
}
