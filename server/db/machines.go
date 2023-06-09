package db

import (
	"errors"
	"main/graph/model"
	"main/models"

	"gorm.io/gorm"
)

func FindMachine(db *gorm.DB, name string, location string) (*models.Machine, error) {
	machine := &models.Machine{
		Name: name,
	}

	result := db.Model(&models.Machine{}).First(machine)

	return machine, result.Error
}

func DoesMachineExist(db *gorm.DB, name string, location string) (bool, error) {

	machine := &models.Machine{
		Name: name,
	}

	result := db.Model(&models.Machine{}).Limit(1).Where(machine).First(machine)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return false, nil
	}

	return true, result.Error
}

func InsertMachine(db *gorm.DB, input *model.Machine) error {
	coordinate := &models.Coordinate{
		Latitude:  input.Coordinate.Latitude,
		Longitude: input.Coordinate.Longitude,
	}

	machine := &models.Machine{
		Name:       input.Name,
		City:       input.City,
		Coordinate: coordinate,
	}

	result := db.Model(&models.Machine{}).FirstOrCreate(machine)

	return result.Error
}
