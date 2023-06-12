package controllers

import (
	"fmt"
	"main/constants"
	"main/db"
	"main/graph/model"
	"main/maps"
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
	return designs != "Gone" && designs != "Moved"
}

func (m *MachineController) GetMachinesByCode(code int) ([]*model.Machine, error) {
	fetchURL := fmt.Sprintf("%sLocations.aspx?area=%d", constants.BASE_URL, code)
	var machines []*model.Machine

	client, err := maps.CreateClient(os.Getenv("GOOGLE_MAPS_API_KEY"))
	if err != nil {
		panic(err)
	}

	collector := colly.NewCollector()

	collector.OnHTML("table#DG.tbllist tr:not(tr:nth-child(1))", func(element *colly.HTMLElement) {
		designs := element.ChildText("td:nth-child(3)")

		if isMachineDeprecated(designs) {
			location := element.ChildText("td:nth-child(1) span")
			name := element.ChildText("td:nth-child(1)")
			name = strings.Replace(name, location, "", 1)

			city := element.ChildText("td:nth-child(2)")
			updated := element.ChildText("td:nth-child(5)")

			doesMachineExist, err := db.DoesMachineExist(m.Database, name, location)
			if err != nil {
				panic(err)
			}

			if doesMachineExist {
				// todo: make some checks if we have the most updated information
				result, err := db.FindMachine(m.Database, name, location)
				if err != nil {
					panic(err)
				}

				coordinate := &model.Coordinate{
					Latitude:  result.Coordinate.Latitude,
					Longitude: result.Coordinate.Longitude,
				}

				machine := &model.Machine{
					Name:       result.Name,
					Location:   result.Location,
					Designs:    result.Designs,
					City:       result.City,
					Updated:    result.Updated,
					Coordinate: coordinate,
				}

				machines = append(machines, machine)
			} else {
				date, err := dateparse.ParseLocal(updated)
				if err != nil {
					panic(err)
				}

				coordinateResult, err := client.Latlong(fmt.Sprintf("%s %s", name, location))
				if err != nil {
					panic(err)
				}

				coordinate := &model.Coordinate{}
				if coordinateResult != nil {
					coordinate = &model.Coordinate{
						Latitude:  coordinateResult.Latitude,
						Longitude: coordinateResult.Longitude,
					}
				} else {
					coordinate = nil
				}

				machine := &model.Machine{
					City:       city,
					Name:       name,
					Location:   location,
					Designs:    designs,
					Coordinate: coordinate,
					Updated:    date,
					Area:       code,
				}

				insertError := db.InsertMachine(m.Database, machine)
				if insertError != nil {
					panic(insertError)
				}

				machines = append(machines, machine)
			}
		}
	})

	collector.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	collector.Visit(fetchURL)

	return machines, nil

	// Iterate though all the requested machines.
	// For each machine, we check if it exist in the database
	// If it doesn't exist in the databse, we will add it onto the database
	// If it already exist, we will check each field, if it needs updating
	// The superkey will be the name and location (superkey)
}
