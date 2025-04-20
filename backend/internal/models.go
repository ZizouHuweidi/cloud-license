package internal

import (
	"time"
	"gorm.io/gorm"
)

type Device struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	ServiceTag string         `gorm:"uniqueIndex;size:64;not null" json:"service_tag"`
	DeviceType string         `gorm:"size:32;not null" json:"device_type"`
	Licenses   []License      `gorm:"constraint:OnDelete:CASCADE;" json:"licenses"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type License struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	LicenseType   string    `gorm:"size:64;not null" json:"license_type"`
	ExpirationDate time.Time `gorm:"not null" json:"expiration_date"`
	DeviceID      uint      `gorm:"not null;index" json:"device_id"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;size:128;not null" json:"email"`
	PasswordHash string    `gorm:"size:128;not null" json:"-"`
	MFASecret    string    `gorm:"size:64" json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
