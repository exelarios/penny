package db

import (
	"errors"
	"main/graph/model"
	"main/models"

	"gorm.io/gorm"
)

func FindMachine(db *gorm.DB, name string, location string) (*models.Machine, error) {
	machine := &models.Machine{
		Name:     name,
		Location: location,
	}

	result := db.Model(&models.Machine{}).First(machine)

	return machine, result.Error
}

func DoesMachineExist(db *gorm.DB, name string, location string) (bool, error) {

	machine := &models.Machine{
		Name:     name,
		Location: location,
	}

	result := db.Model(&models.Machine{}).Limit(1).Where(machine).First(machine)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return false, nil
	}

	return true, result.Error
}

func InsertMachine(db *gorm.DB, input *model.Machine) error {
	coordinate := &models.Coordinate{}
	if input.Coordinate != nil {
		coordinate = &models.Coordinate{
			Latitude:  input.Coordinate.Latitude,
			Longitude: input.Coordinate.Longitude,
		}
	}

	machine := &models.Machine{
		Name:       input.Name,
		Location:   input.Location,
		City:       input.City,
		Designs:    input.Designs,
		Updated:    input.Updated,
		Coordinate: coordinate,
	}

	result := db.Model(&models.Machine{}).FirstOrCreate(machine)

	return result.Error
}
