package db

import (
	"errors"
	"fmt"
	"main/models"

	"gorm.io/gorm"
)

func InsertLocation(db *gorm.DB, input *models.Location) error {

	doesExist := db.Model(&models.Location{}).Limit(1).Where("name = ?", input.Name).First(input)
	if errors.Is(doesExist.Error, gorm.ErrRecordNotFound) {
		fmt.Printf("%s, isn't found. Creating..", input.Name)
		result := db.Model(&models.Location{}).Create(input)
		if result.Error != nil {
			return result.Error
		}
	} else {
		result := db.Debug().Model(&models.Location{}).Where("name = ?", input.Name).Updates(&input)
		if result.Error != nil {
			return result.Error
		}
	}

	return nil
}

func InsertLocations(db *gorm.DB, locations []*models.Location) error {
	// var output []*models.Location
	for _, location := range locations {
		err := InsertLocation(db, location)
		if err != nil {
			return err
		}
	}

	return nil
}
