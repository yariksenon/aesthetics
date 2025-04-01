package config

import (
	"github.com/golang-jwt/jwt/v5"
	"time"
)

var JWTSecret = []byte("TheSecretKeyAlwayssafe")

func GenerateJWT(userID int, username string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	})

	return token.SignedString(JWTSecret)
}

func ParseJWT(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return JWTSecret, nil
	})
}
