package db

import (
	"fmt"
	"log"
	"main/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func createSchema(db *gorm.DB) error {

	db.AutoMigrate(&models.Machine{})
	db.AutoMigrate(&models.Location{})
	db.AutoMigrate(&models.Device{})

	return nil
}

func Setup(databaseURL string) *gorm.DB {
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN: databaseURL,
	}), &gorm.Config{})

	if err != nil {
		log.Fatalf("Failed to parse database credentials.\n %s", err.Error())
	}

	createSchema(db)

	fmt.Println("Sucessfully connected to database.. 🥳")

	return db
}
