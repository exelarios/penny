// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"time"
)

type Authentication struct {
	User         *User     `json:"user"`
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	ExpiredAt    time.Time `json:"expiredAt"`
}

type Coordinate struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Device struct {
	Name       string `json:"name"`
	Designs    int    `json:"designs"`
	DeviceType string `json:"deviceType"`
	MachineID  int    `json:"machineID"`
}

type GetMachineByCodeInput struct {
	Area int `json:"area"`
}

type GetMachineByRegionInput struct {
	Region string `json:"region"`
}

type Location struct {
	Name       string      `json:"name"`
	URL        string      `json:"url"`
	Area       int         `json:"area"`
	Coordinate *Coordinate `json:"coordinate"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Machine struct {
	ID         int         `json:"id"`
	Name       string      `json:"name"`
	Address    *string     `json:"address,omitempty"`
	Country    string      `json:"country"`
	ZipCode    *string     `json:"zipCode,omitempty"`
	Website    *string     `json:"website,omitempty"`
	Phone      *string     `json:"phone,omitempty"`
	City       string      `json:"city"`
	Status     *string     `json:"status,omitempty"`
	Area       int         `json:"area"`
	Comments   string      `json:"comments"`
	Coordinate *Coordinate `json:"coordinate,omitempty"`
	Devices    []*Device   `json:"devices,omitempty"`
}

type MachineGroup struct {
	Name       string      `json:"name"`
	City       string      `json:"city"`
	Coordinate *Coordinate `json:"coordinate"`
}

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
