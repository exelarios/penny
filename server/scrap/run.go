package main

import (
	"log"
	"main/db"
	"os"

	"main/controllers"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func reconcile(db *gorm.DB) {
	locations := &controllers.LocationController{
		Database: db,
	}

	// machines := &controllers.MachineController{
	// 	Database: db,
	// }

	// machineError := machines.Scrap(45)
	// if machineError != nil {
	// 	panic(machineError)
	// }

	err := locations.Scrap()
	if err != nil {
		panic(err)
	}
}

func setupDotEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Failed to load .env file. Please check if there's a `.env` in the parent directory")
	}
}

func main() {
	setupDotEnv()

	db := db.Setup(os.Getenv("DB_HOST"))

	reconcile(db)
}
