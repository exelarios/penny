package maps

import (
	"context"
	"fmt"

	"googlemaps.github.io/maps"
)

type Map struct {
	client *maps.Client
}

type Coordinate struct {
	Latitude  float64
	Longitude float64
}

func CreateClient(key string) (*Map, error) {
	client, err := maps.NewClient(maps.WithAPIKey(key))
	if err != nil {
		return nil, err
	}

	mapping := &Map{
		client: client,
	}

	return mapping, err
}

func (m *Map) Latlong(address string) (*Coordinate, error) {
	fmt.Printf("finding... => %s\n", address)
	request := &maps.GeocodingRequest{
		Address: address,
	}

	response, err := m.client.Geocode(context.Background(), request)
	if err != nil {
		return nil, err
	}

	if len(response) == 0 {
		return nil, nil
	}

	result := response[0]

	coordinate := &Coordinate{
		Latitude:  result.Geometry.Location.Lat,
		Longitude: result.Geometry.Location.Lng,
	}

	return coordinate, nil
}
