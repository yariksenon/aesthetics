package config

import (
	"fmt"
	"github.com/spf13/viper"
)

type Config struct {
	Database struct {
		User     string `yaml:"username"`
		Password string `yaml:"password"`
		Host     string `yaml:"host"`
		Port     string `yaml:"port"`
		DBName   string `yaml:"name"`
	} `yaml:"database"`

	Smtp struct {
		Password string `yaml:"password"`
		From     string `yaml:"from"`
		Host     string `yaml:"host"`
		Port     string `yaml:"port"`
	} `yaml:"smtp"`

	Redis struct {
		Password string `yaml:"password"`
		Host     string `yaml:"host"`
		Port     string `yaml:"port"`
		DB       int    `yaml:"db"`
	} `yaml:"redis"`

	Twilio struct {
		AccountSID   string `yaml:"accountSID"`
		AuthToken    string `yaml:"authToken"`
		TwilioNumber string `yaml:"twilioNumber"`
	}
}

func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")

	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("Error reading config file, %w", err)
	}
	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("Unable to unmarshalling config, %w", err)
	}

	return &config, nil
}
