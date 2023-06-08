package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.31

import (
	"context"
	"fmt"
	"main/graph/model"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/araddon/dateparse"
	"github.com/gocolly/colly"
)

const (
	BASE_URL = "http://209.221.138.252/"
	URL      = BASE_URL + "AreaList.aspx"
)

// Login is the resolver for the login field.
func (r *mutationResolver) Login(ctx context.Context, input model.LoginInput) (*model.Authentication, error) {
	panic(fmt.Errorf("not implemented: Login - login"))
}

// Locations is the resolver for the locations field.
func (r *queryResolver) Locations(ctx context.Context) ([]*model.Location, error) {
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
			URL:  fmt.Sprintf("%sLocations.aspx?area=%s", BASE_URL, parameters["area"][0]),
		}

		states = append(states, state)
	})

	collector.Visit(URL)

	return states, nil
}

// GetMachinesByCode is the resolver for the getMachinesByCode field.
func (r *queryResolver) GetMachinesByCode(ctx context.Context, input model.GetMachineByCodeInput) ([]*model.Machine, error) {
	var fetchURL = fmt.Sprintf("%sLocations.aspx?area=%d", BASE_URL, input.Area)
	var machines []*model.Machine

	collector := colly.NewCollector()

	collector.OnHTML("table#DG.tbllist tr:not(tr:nth-child(1))", func(element *colly.HTMLElement) {

		location := element.ChildText("td:nth-child(1) span")
		name := element.ChildText("td:nth-child(1)")
		name = strings.Replace(name, location, "", 1)

		city := element.ChildText("td:nth-child(2)")
		designs := element.ChildText("td:nth-child(3)")
		updated := element.ChildText("td:nth-child(5)")

		date, err := dateparse.ParseLocal(updated)
		if err != nil {
			panic(err)
		}

		machine := &model.Machine{
			City:     city,
			Name:     name,
			Location: location,
			Designs:  designs,
			Updated:  date,
		}

		machines = append(machines, machine)
	})

	collector.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	collector.Visit(fetchURL)

	return machines, nil
}

// GetMachinesByRegion is the resolver for the getMachinesByRegion field.
func (r *queryResolver) GetMachinesByRegion(ctx context.Context, input model.GetMachineByRegionInput) ([]*model.Machine, error) {
	return nil, nil
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
