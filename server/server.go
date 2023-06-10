package main

import (
	"log"
	"main/controllers"
	"main/graph"
	"net/http"
	"os"

	"main/db"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"
)

const defaultPort = "8080"

func setupDotEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Failed to load .env file. Please check if there's a `.env` in the parent directory")
	}
}

func main() {
	setupDotEnv()

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	database := db.Setup()

	gql := handler.NewDefaultServer(
		graph.NewExecutableSchema(graph.Config{
			Resolvers: &graph.Resolver{
				MachineController:  &controllers.MachineController{Database: database},
				LocationController: &controllers.LocationController{Database: database},
			},
		}),
	)

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", gql)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
