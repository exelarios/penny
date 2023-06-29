package models

import (
	"time"
)

type Coordinate struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Device struct {
	Name       string `json:"name" gorm:"primaryKey"`
	Designs    int    `json:"designs"`
	DeviceType string `json:"deviceType"`
	MachineID  int    `json:"machine_id"`
}

type Location struct {
	Name       string      `json:"name" gorm:"primaryKey"`
	URL        string      `json:"url"`
	Area       int         `json:"area"`
	Coordinate *Coordinate `json:"coordinate" gorm:"embedded; embeddedPrefix:coordinate_"`
}

type Machine struct {
	Id         int         `json:"id" gorm:"primaryKey"`
	Name       string      `json:"name"`
	Address    string      `json:"address"`
	Country    string      `json:"country"`
	ZipCode    string      `json:"zipCode"`
	Website    string      `json:"website"`
	Phone      string      `json:"phone"`
	City       string      `json:"city"`
	Area       int         `json:"area"`
	Status     string      `json:"status"`
	Comments   string      `json:"comments"`
	Updated    time.Time   `json:"updated"`
	Coordinate *Coordinate `json:"coordinate" gorm:"embedded; embeddedPrefix:coordinate_"`
	Devices    []*Device   `json:"devices" gorm:"foreignKey:MachineID; constraint:OnUpdate:CASCADE, OnDelete:CASCADE;"`
}
