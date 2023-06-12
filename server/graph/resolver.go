package graph

import (
	"main/controllers"
	"main/graph/model"
)

type Resolver struct {
	locations          []*model.Location
	MachineController  *controllers.MachineController
	LocationController *controllers.LocationController
}
