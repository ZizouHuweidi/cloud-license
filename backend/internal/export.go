package internal

import (
	"bytes"
	"fmt"
	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

// Excel export for a single device
func ExportDeviceExcel(device *Device) ([]byte, error) {
	f := excelize.NewFile()
	f.SetSheetName("Sheet1", "Device")
	f.SetCellValue("Device", "A1", "Service Tag")
	f.SetCellValue("Device", "B1", device.ServiceTag)
	f.SetCellValue("Device", "A2", "Device Type")
	f.SetCellValue("Device", "B2", device.DeviceType)
	f.SetCellValue("Device", "A3", "Licenses")
	row := 4
	for _, lic := range device.Licenses {
		f.SetCellValue("Device", fmt.Sprintf("A%d", row), lic.LicenseType)
		f.SetCellValue("Device", fmt.Sprintf("B%d", row), lic.ExpirationDate.Format("2006-01-02"))
		row++
	}
	buf, err := f.WriteToBuffer()
	return buf.Bytes(), err
}

// PDF export for a single device
func ExportDevicePDF(device *Device) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Device Info")
	pdf.Ln(12)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, "Service Tag: "+device.ServiceTag)
	pdf.Ln(8)
	pdf.Cell(40, 10, "Device Type: "+device.DeviceType)
	pdf.Ln(8)
	pdf.Cell(40, 10, "Licenses:")
	pdf.Ln(8)
	for _, lic := range device.Licenses {
		pdf.Cell(40, 10, "- "+lic.LicenseType+" (Expires: "+lic.ExpirationDate.Format("2006-01-02")+")")
		pdf.Ln(8)
	}
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	return buf.Bytes(), err
}

// Excel export for a single license
func ExportLicenseExcel(db *gorm.DB, license *License) ([]byte, error) {
	f := excelize.NewFile()
	f.SetSheetName("Sheet1", "License")
	f.SetCellValue("License", "A1", "License Type")
	f.SetCellValue("License", "B1", license.LicenseType)
	f.SetCellValue("License", "A2", "Expiration Date")
	f.SetCellValue("License", "B2", license.ExpirationDate.Format("2006-01-02"))
	f.SetCellValue("License", "A3", "Device Service Tag")
	var serviceTag string
	var device Device
	if license.DeviceID != 0 {
		db.First(&device, license.DeviceID)
		serviceTag = device.ServiceTag
	}
	f.SetCellValue("License", "B3", serviceTag)
	buf, err := f.WriteToBuffer()
	return buf.Bytes(), err
}

// PDF export for a single license
func ExportLicensePDF(db *gorm.DB, license *License) ([]byte, error) {
	var device Device
	if license.DeviceID != 0 {
		db.First(&device, license.DeviceID)
	}
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "License Info")
	pdf.Ln(12)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, "License Type: "+license.LicenseType)
	pdf.Ln(8)
	pdf.Cell(40, 10, "Expiration Date: "+license.ExpirationDate.Format("2006-01-02"))
	pdf.Ln(8)
	var serviceTag string
	if license.DeviceID != 0 {
		db.First(&device, license.DeviceID)
		serviceTag = device.ServiceTag
	}
	pdf.Cell(40, 10, "Device Service Tag: "+serviceTag)
	pdf.Ln(8)
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	return buf.Bytes(), err
}
