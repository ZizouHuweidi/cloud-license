package internal

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/pquerna/otp/totp"
	"gorm.io/gorm"
)

// POST /mfa/setup
func MFASetupHandler(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userCtx, ok := c.Get("user").(UserContext)
		if !ok {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "unauthorized"})
		}
		var user User
		if err := db.First(&user, userCtx.UserID).Error; err != nil {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "user not found"})
		}
		secret := totp.GenerateOpts{
			Issuer:      "CloudLicenseDashboard",
			AccountName: user.Email,
		}
		key, err := totp.Generate(secret)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to generate MFA secret"})
		}
		user.MFASecret = key.Secret()
		if err := db.Save(&user).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to save MFA secret"})
		}
		return c.JSON(http.StatusOK, echo.Map{
			"secret": key.Secret(),
			"url":    key.URL(),
		})
	}
}

// POST /mfa/verify
func MFAVerifyHandler(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userCtx, ok := c.Get("user").(UserContext)
		if !ok {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "unauthorized"})
		}
		var req struct {
			Code string `json:"code"`
		}
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
		}
		var user User
		if err := db.First(&user, userCtx.UserID).Error; err != nil {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "user not found"})
		}
		if user.MFASecret == "" {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": "MFA not setup"})
		}
		verified := totp.Validate(req.Code, user.MFASecret)
		return c.JSON(http.StatusOK, echo.Map{"verified": verified})
	}
}
