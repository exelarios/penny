package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.31

import (
	"context"
	"fmt"
	"main/graph/model"
)

func (r *mutationResolver) Login(ctx context.Context, input model.LoginInput) (*model.Authentication, error) {
	panic(fmt.Errorf("not implemented: Login - login"))
}

func (r *queryResolver) Locations(ctx context.Context) ([]*model.Location, error) {
	return r.LocationController.GetLocations()
}

func (r *queryResolver) GetMachineByID(ctx context.Context, input model.GetMachineByID) (*model.Machine, error) {
	return r.MachineController.GetMachineById(input.ID)
}

func (r *queryResolver) GetMachinesByCode(ctx context.Context, input model.GetMachineByCodeInput) ([]*model.Machine, error) {
	return r.MachineController.GetMachinesByCode(input.Area)
}

func (r *queryResolver) GetMachinesByRegion(ctx context.Context, input model.GetMachineByRegionInput) ([]*model.Machine, error) {
	return nil, nil
}

func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
