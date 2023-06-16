package models

import (
	"time"
)

type Coordinate struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Location struct {
	Name       string      `json:"name" gorm:"primaryKey"`
	URL        string      `json:"url"`
	Area       int         `json:"area"`
	Coordinate *Coordinate `json:"coordinate" gorm:"embedded; embeddedPrefix:coordinate_"`
}

type Machine struct {
	Name       string      `json:"name" gorm:"primaryKey"`
	Location   string      `json:"location" gorm:"primaryKey"`
	City       string      `json:"city"`
	Area       int         `json:"area"`
	Region     string      `json:"region"`
	Designs    string      `json:"designs"`
	Updated    time.Time   `json:"updated"`
	Coordinate *Coordinate `json:"coordinate,omitempty" gorm:"embedded; embeddedPrefix:coordinate_"`
}
