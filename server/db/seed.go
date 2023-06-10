package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/go-pg/pg/v10"
)

func createSchema() error {

	return nil
}

func Setup() *pg.DB {
	dbCredentials, err := pg.ParseURL(os.Getenv("DB_HOST"))
	if err != nil {
		log.Fatalf("Failed to parse database credentials.\n %s", err.Error())
	}

	db := pg.Connect(dbCredentials)
	defer db.Close()

	fmt.Println("Pinging database.. ")
	pingError := db.Ping(context.Background())
	if pingError != nil {
		log.Fatalf("Failed to make a connection to the requested database.\n %s", pingError.Error())
	}

	fmt.Println("Sucessfully connected to database.. 🥳")

	return db
}
