package internal

import (
	"gopkg.in/gomail.v2"
	"os"
	"io"
	"strconv"
)

func SendEmailWithAttachment(to, subject, body, filename string, data []byte) error {
	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("SMTP_USER"))
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)
	m.Attach(filename, gomail.SetCopyFunc(func(w io.Writer) error {
		_, err := w.Write(data)
		return err
	}))
	d := gomail.NewDialer(
		os.Getenv("SMTP_HOST"),
		atoiEnv("SMTP_PORT", 25),
		os.Getenv("SMTP_USER"),
		os.Getenv("SMTP_PASS"),
	)
	return d.DialAndSend(m)
}

func atoiEnv(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}
