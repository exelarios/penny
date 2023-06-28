package main

import (
	"log"
	"os"

	"main/controllers"
	"main/db"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func reconcile(db *gorm.DB) {
	// locations := &controllers.LocationController{
	// 	Database: db,
	// }

	machines := &controllers.MachineController{
		Database: db,
	}

	// data, err := machines.Scrap(45)
	// if err != nil {
	// 	panic(err)
	// }

	// fmt.Println(data)

	err := machines.Migrate(45)
	if err != nil {
		panic(err)
	}

	// err := locations.Scrap()
	// if err != nil {
	// 	panic(err)
	// }
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
