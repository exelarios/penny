package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	"main/controllers"
	"main/model"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	locations          []*model.Location
	MachineController  *controllers.MachineController
	LocationController *controllers.LocationController
}
