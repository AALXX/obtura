package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"build-service/internal/worker"
)

func main() {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "ok",
		})
	})

	w, err := worker.NewWorker("amqp://obtura:obtura123@rabbitmq:5672")
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		if err := w.Start(); err != nil {
			log.Fatalf("worker failed: %v", err)
		}
	}()

	if err := r.Run(":5050"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
