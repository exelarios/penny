package controllers

import (
	"fmt"
	"main/constants"
	"main/db"
	"main/graph/model"
	"main/maps"
	"main/models"
	"net/url"
	"os"
	"regexp"
	"strconv"

	"github.com/gocolly/colly"
	"gorm.io/gorm"
)

type LocationController struct {
	Database *gorm.DB
}

func (l *LocationController) Scrap() error {
	var locations []*models.Location

	collector := colly.NewCollector()

	client, err := maps.CreateClient(os.Getenv("GOOGLE_MAPS_API_KEY"))
	if err != nil {
		panic(err)
	}

	collector.OnHTML("#StatesList a[href]", func(element *colly.HTMLElement) {
		href := element.Attr("href")

		link, err := url.Parse(href)
		if err != nil {
			panic(err)
		}

		parameters, _ := url.ParseQuery(link.RawQuery)
		area, err := strconv.Atoi(parameters["area"][0])
		if err != nil {
			panic(err)
		}

		// Parsing the name and removing unnecessary tokens from the name.
		regex := regexp.MustCompile(`^\s+|\n|\t`)
		name := regex.ReplaceAllLiteralString(element.Text, "")

		coordinateResult, err := client.Latlong(fmt.Sprintf("%s, United States", name))
		if err != nil {
			panic(err)
		}

		coordinate := &models.Coordinate{
			Longitude: coordinateResult.Longitude,
			Latitude:  coordinateResult.Latitude,
		}

		state := &models.Location{
			Name:       name,
			Area:       area,
			URL:        fmt.Sprintf("%sLocations.aspx?area=%s", constants.BASE_URL, parameters["area"][0]),
			Coordinate: coordinate,
		}

		locations = append(locations, state)
	})

	collector.Visit(constants.URL)

	insertError := db.InsertLocations(l.Database, locations)
	if insertError != nil {
		return insertError
	}

	return nil
}

func (l *LocationController) GetLocations() ([]*model.Location, error) {
	var locations []models.Location
	var output []*model.Location

	result := l.Database.Model(&models.Location{}).Find(&locations)
	if result.Error != nil {
		return nil, result.Error
	}

	for _, location := range locations {
		coordinate := &model.Coordinate{
			Latitude:  location.Coordinate.Latitude,
			Longitude: location.Coordinate.Longitude,
		}

		location := &model.Location{
			Name:       location.Name,
			URL:        location.URL,
			Area:       location.Area,
			Coordinate: coordinate,
		}

		output = append(output, location)
	}

	return output, nil
}
