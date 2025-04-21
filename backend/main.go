package main

import (
	"log"
	"os"

	"cloud-license-backend/internal"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load env
	_ = godotenv.Load()

	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database:", err)
	}

	// Auto-migrate models
	err = db.AutoMigrate(&internal.Device{}, &internal.License{}, &internal.User{})
	if err != nil {
		log.Fatal("failed to auto-migrate:", err)
	}

	// Start notification worker
	internal.StartNotificationWorker(db)

	e := echo.New()

	// Health check
	e.GET("/health", func(c echo.Context) error {
		return c.String(200, "Backend is healthy")
	})

	// Auth routes
	e.POST("/register", internal.RegisterHandler(db))
	e.POST("/login", internal.LoginHandler(db))

	// Protected group
	api := e.Group("", internal.JWTMiddleware)

	// MFA endpoints
	api.GET("/mfa/status", internal.MFAStatusHandler(db))
	api.POST("/mfa/setup", internal.MFASetupHandler(db))
	api.POST("/mfa/verify", internal.MFAVerifyHandler(db))

	// Device routes
	api.GET("/devices", internal.ListDevices(db))
	api.GET("/devices/:id", internal.GetDevice(db))
	api.POST("/devices", internal.CreateDevice(db))
	api.PUT("/devices/:id", internal.UpdateDevice(db))
	api.DELETE("/devices/:id", internal.DeleteDevice(db))
	api.GET("/devices/search", internal.SearchDevices(db))
	api.POST("/devices/:id/export", internal.ExportDeviceHandler(db))

	// License routes
	api.GET("/licenses", internal.ListLicenses(db))
	api.GET("/licenses/:id", internal.GetLicense(db))
	api.POST("/licenses", internal.CreateLicense(db))
	api.PUT("/licenses/:id", internal.UpdateLicense(db))
	api.DELETE("/licenses/:id", internal.DeleteLicense(db))
	api.GET("/licenses/search", internal.SearchLicenses(db))
	api.POST("/licenses/:id/export", internal.ExportLicenseHandler(db))

	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Starting server on :" + port)
	e.Logger.Fatal(e.Start(":" + port))
}
