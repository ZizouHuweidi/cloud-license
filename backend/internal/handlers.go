package internal

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// Device Handlers
func ListDevices(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var devices []Device
		if err := db.Preload("Licenses").Find(&devices).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, devices)
	}
}

func GetDevice(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id, _ := strconv.Atoi(c.Param("id"))
		var device Device
		if err := db.Preload("Licenses").First(&device, id).Error; err != nil {
			return c.JSON(http.StatusNotFound, echo.Map{"error": "device not found"})
		}
		return c.JSON(http.StatusOK, device)
	}
}

func CreateDevice(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var device Device
		if err := c.Bind(&device); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
		}
		if err := db.Create(&device).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		return c.JSON(http.StatusCreated, device)
	}
}

func UpdateDevice(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id, _ := strconv.Atoi(c.Param("id"))
		var device Device
		if err := db.First(&device, id).Error; err != nil {
			return c.JSON(http.StatusNotFound, echo.Map{"error": "device not found"})
		}
		if err := c.Bind(&device); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
		}
		if err := db.Save(&device).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, device)
	}
}

func DeleteDevice(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id, _ := strconv.Atoi(c.Param("id"))
		if err := db.Delete(&Device{}, id).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		return c.NoContent(http.StatusNoContent)
	}
}

// License Handlers
func ListLicenses(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var licenses []License
		if err := db.Find(&licenses).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, licenses)
	}
}

func GetLicense(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id, _ := strconv.Atoi(c.Param("id"))
		var license License
		if err := db.First(&license, id).Error; err != nil {
			return c.JSON(http.StatusNotFound, echo.Map{"error": "license not found"})
		}
		return c.JSON(http.StatusOK, license)
	}
}

func CreateLicense(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var license License
		if err := c.Bind(&license); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
		}
		if err := db.Create(&license).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		return c.JSON(http.StatusCreated, license)
	}
}

func UpdateLicense(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id, _ := strconv.Atoi(c.Param("id"))
		var license License
		if err := db.First(&license, id).Error; err != nil {
			return c.JSON(http.StatusNotFound, echo.Map{"error": "license not found"})
		}
		if err := c.Bind(&license); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
		}
		if err := db.Save(&license).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, license)
	}
}

func DeleteLicense(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id, _ := strconv.Atoi(c.Param("id"))
		if err := db.Delete(&License{}, id).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		return c.NoContent(http.StatusNoContent)
	}
}
