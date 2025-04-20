package internal

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// POST /devices/:id/export
func ExportDeviceHandler(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		format := c.FormValue("format")
		email := c.FormValue("email")
		var device Device
		if err := db.Preload("Licenses").First(&device, id).Error; err != nil {
			return c.JSON(http.StatusNotFound, echo.Map{"error": "device not found"})
		}
		var fileData []byte
		var filename string
		var contentType string
		var err error
		if strings.ToLower(format) == "excel" {
			fileData, err = ExportDeviceExcel(&device)
			filename = "device.xlsx"
			contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		} else {
			fileData, err = ExportDevicePDF(&device)
			filename = "device.pdf"
			contentType = "application/pdf"
		}
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		if email != "" {
			subject := "Device Export"
			body := "Attached is the export for device " + device.ServiceTag
			err = SendEmailWithAttachment(email, subject, body, filename, fileData)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to send email: " + err.Error()})
			}
			return c.JSON(http.StatusOK, echo.Map{"message": "email sent"})
		}
		return c.Blob(http.StatusOK, contentType, fileData)
	}
}

// POST /licenses/:id/export
func ExportLicenseHandler(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		format := c.FormValue("format")
		email := c.FormValue("email")
		var license License
		if err := db.Preload("Device").First(&license, id).Error; err != nil {
			return c.JSON(http.StatusNotFound, echo.Map{"error": "license not found"})
		}
		var fileData []byte
		var filename string
		var contentType string
		var err error
		if strings.ToLower(format) == "excel" {
			fileData, err = ExportLicenseExcel(db, &license)
			filename = "license.xlsx"
			contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		} else {
			fileData, err = ExportLicensePDF(db, &license)
			filename = "license.pdf"
			contentType = "application/pdf"
		}
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}
		if email != "" {
			subject := "License Export"
			body := "Attached is the export for license " + license.LicenseType
			err = SendEmailWithAttachment(email, subject, body, filename, fileData)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to send email: " + err.Error()})
			}
			return c.JSON(http.StatusOK, echo.Map{"message": "email sent"})
		}
		return c.Blob(http.StatusOK, contentType, fileData)
	}
}

// TODO: Bulk export endpoints can be added here for /devices/export and /licenses/export
