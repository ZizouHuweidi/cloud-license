package internal

import (
	"log"
	"time"
	"fmt"
	"os"

	"gorm.io/gorm"
)

func StartNotificationWorker(db *gorm.DB) {
	go func() {
		for {
			checkAndNotifyExpiringLicenses(db)
			time.Sleep(24 * time.Hour) // Run daily
		}
	}()
}

func checkAndNotifyExpiringLicenses(db *gorm.DB) {
	var licenses []License
	threshold := time.Now().Add(30 * 24 * time.Hour)
	if err := db.Where("expiration_date <= ?", threshold).Find(&licenses).Error; err != nil {
		log.Println("[notify] DB error:", err)
		return
	}
	now := time.Now()
	var expiring []License
	for _, lic := range licenses {
		if lic.ExpirationDate.Sub(now) < 30*24*time.Hour {
			expiring = append(expiring, lic)
		}
	}
	if len(expiring) == 0 {
		return
	}
	// Build CSV summary
	csv := "LicenseID,DeviceServiceTag,LicenseType,ExpirationDate\n"
	for _, lic := range expiring {
		var device Device
		if lic.DeviceID != 0 {
			db.First(&device, lic.DeviceID)
		}
		csv += fmt.Sprintf("%d,%s,%s,%s\n", lic.ID, device.ServiceTag, lic.LicenseType, lic.ExpirationDate.Format("2006-01-02"))
	}
	notifyEmail := os.Getenv("NOTIFY_EMAIL")
	subject := "Expiring Licenses Notification"
	body := fmt.Sprintf("%d licenses are expiring within 30 days. See attached CSV.", len(expiring))
	err := SendEmailWithAttachment(notifyEmail, subject, body, "expiring_licenses.csv", []byte(csv))
	if err != nil {
		log.Println("[notify] Failed to send notification email:", err)
	} else {
		log.Println("[notify] Sent expiring licenses notification to", notifyEmail)
	}
}
