package controllers

import (
	"fmt"
	"main/constants"
	"main/graph/model"
	"main/maps"
	"main/models"
	"os"
	"strings"

	"github.com/araddon/dateparse"
	"github.com/gocolly/colly"
	"gorm.io/gorm"
)

type MachineController struct {
	Database *gorm.DB
}

func isMachineDeprecated(designs string) bool {
	return designs == "Gone" || designs == "Moved"
}

func (m *MachineController) Scrap(code int) error {
	fetchURL := fmt.Sprintf("%sLocations.aspx?area=%d", constants.BASE_URL, code)

	client, err := maps.CreateClient(os.Getenv("GOOGLE_MAPS_API_KEY"))
	if err != nil {
		panic(err)
	}

	place := &models.Location{}
	errPlace := m.Database.Limit(1).Where("area = ?", code).First(place).Error
	if errPlace != nil {
		panic(errPlace)
	}

	collector := colly.NewCollector()

	collector.OnHTML("table#DG.tbllist tr:not(tr:nth-child(1))", func(element *colly.HTMLElement) {
		designs := element.ChildText("td:nth-child(3)")

		if !isMachineDeprecated(designs) {
			location := element.ChildText("td:nth-child(1) span")
			name := element.ChildText("td:nth-child(1)")
			name = strings.Replace(name, location, "", 1)

			city := element.ChildText("td:nth-child(2)")
			updated := element.ChildText("td:nth-child(5)")

			date, err := dateparse.ParseLocal(updated)
			if err != nil {
				panic(err)
			}

			coordinateResult, err := client.Latlong(fmt.Sprintf("%s %s", name, location))
			if err != nil {
				panic(err)
			}

			coordinate := &models.Coordinate{}
			if coordinateResult != nil {
				coordinate = &models.Coordinate{
					Latitude:  coordinateResult.Latitude,
					Longitude: coordinateResult.Longitude,
				}
			} else {
				coordinate = nil
			}

			machine := &models.Machine{
				City:       city,
				Name:       name,
				Location:   location,
				Designs:    designs,
				Coordinate: coordinate,
				Region:     place.Name,
				Updated:    date,
				Area:       code,
			}

			result := m.Database.Model(&models.Machine{}).FirstOrCreate(machine)
			if result.Error != nil {
				panic(result.Error)
			}
		}
	})

	collector.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	collector.Visit(fetchURL)

	return nil
}

func (m *MachineController) GetMachinesByCode(code int) ([]*model.Machine, error) {
	// todo: if no data is found, call scrap()
	var machines []models.Machine
	var output []*model.Machine
	result := m.Database.Model(&models.Machine{}).Where("area = ?", code).Find(&machines)
	if result.Error != nil {
		return nil, result.Error
	}

	for _, machine := range machines {
		coordinate := &model.Coordinate{}
		if machine.Coordinate != nil {
			coordinate = &model.Coordinate{
				Latitude:  machine.Coordinate.Latitude,
				Longitude: machine.Coordinate.Longitude,
			}
		} else {
			coordinate = nil
		}

		machine := &model.Machine{
			City:       machine.City,
			Name:       machine.Name,
			Location:   machine.Location,
			Designs:    machine.Designs,
			Coordinate: coordinate,
			Region:     machine.Region,
			Updated:    machine.Updated,
			Area:       code,
		}

		output = append(output, machine)
	}
	return output, nil
}
