package internal

import (
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

func RegisterHandler(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var req RegisterRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
		}
		if req.Email == "" || req.Password == "" {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": "email and password required"})
		}
		hash, err := HashPassword(req.Password)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to hash password"})
		}
		user := User{Email: req.Email, PasswordHash: hash}
		if err := db.Create(&user).Error; err != nil {
			return c.JSON(http.StatusConflict, echo.Map{"error": "email already used"})
		}
		return c.JSON(http.StatusCreated, echo.Map{"message": "registered"})
	}
}

func LoginHandler(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var req LoginRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
		}
		var user User
		if err := db.First(&user, "email = ?", req.Email).Error; err != nil {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "invalid credentials"})
		}
		if !CheckPasswordHash(req.Password, user.PasswordHash) {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "invalid credentials"})
		}
		token, err := GenerateJWT(user.ID, user.Email)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to generate token"})
		}
		return c.JSON(http.StatusOK, LoginResponse{Token: token})
	}
}

// JWT Middleware
type UserContext struct {
	UserID uint
	Email  string
}

func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "missing or invalid token"})
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := ParseJWT(tokenStr)
		if err != nil || !token.Valid {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "invalid token"})
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "invalid token claims"})
		}
		c.Set("user", UserContext{
			UserID: uint(claims["user_id"].(float64)),
			Email:  claims["email"].(string),
		})
		return next(c)
	}
}
