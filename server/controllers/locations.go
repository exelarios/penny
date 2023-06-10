package controllers

import (
	"fmt"
	"main/constants"
	"main/model"
	"net/url"
	"regexp"
	"strconv"

	"github.com/go-pg/pg/v10"
	"github.com/gocolly/colly"
)

type LocationController struct {
	Database *pg.DB
}

func (l *LocationController) GetLocations() ([]*model.Location, error) {
	var states []*model.Location

	collector := colly.NewCollector()

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

		state := &model.Location{
			Name: name,
			Area: area,
			URL:  fmt.Sprintf("%sLocations.aspx?area=%s", constants.BASE_URL, parameters["area"][0]),
		}

		states = append(states, state)
	})

	collector.Visit(constants.URL)

	return states, nil
}
