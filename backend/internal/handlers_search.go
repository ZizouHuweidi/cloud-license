package internal

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// GET /devices/search?service_tag=...
func SearchDevices(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		tag := c.QueryParam("service_tag")
		var devices []Device
		if tag != "" {
			if err := db.Preload("Licenses").Where("service_tag = ?", tag).Find(&devices).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
			}
		} else {
			if err := db.Preload("Licenses").Find(&devices).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
			}
		}
		return c.JSON(http.StatusOK, devices)
	}
}

// GET /licenses/search?license_type=...
func SearchLicenses(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		typeStr := c.QueryParam("license_type")
		var licenses []License
		if typeStr != "" {
			if err := db.Where("license_type = ?", typeStr).Find(&licenses).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
			}
		} else {
			if err := db.Find(&licenses).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
			}
		}
		return c.JSON(http.StatusOK, licenses)
	}
}
