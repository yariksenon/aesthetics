package twilio

import (
	"github.com/twilio/twilio-go"
	twilioApi "github.com/twilio/twilio-go/rest/api/v2010" // Используем псевдоним twilioApi
)

type TwilioClient struct {
	client       *twilio.RestClient
	twilioNumber string
}

func NewTwilioClient(twilioNumber, accountSID, authToken string) *TwilioClient {
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSID,
		Password: authToken,
	})
	return &TwilioClient{
		client:       client,
		twilioNumber: twilioNumber,
	}
}

func (t *TwilioClient) SendVerificationCode(phoneNumber, code string) error {
	params := &twilioApi.CreateMessageParams{} // Используем twilioApi
	params.SetTo(phoneNumber)
	params.SetFrom(t.twilioNumber)
	params.SetBody("Ваш код подтверждения: " + code)

	_, err := t.client.Api.CreateMessage(params)
	return err
}
