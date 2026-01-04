package logger

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type LogMessage struct {
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
	BuildID   string    `json:"buildId"`
}

type LogBroker struct {
	clients    map[string]map[chan LogMessage]bool
	newClients chan clientSubscription
	closing    chan clientSubscription
	messages   chan LogMessage
	mu         sync.RWMutex
}

type clientSubscription struct {
	buildID string
	client  chan LogMessage
}

var globalLogBroker *LogBroker

func init() {
	globalLogBroker = NewLogBroker()
	go globalLogBroker.Start()
}

func NewLogBroker() *LogBroker {
	return &LogBroker{
		clients:    make(map[string]map[chan LogMessage]bool),
		newClients: make(chan clientSubscription),
		closing:    make(chan clientSubscription),
		messages:   make(chan LogMessage, 100),
	}
}

func (b *LogBroker) Start() {
	for {
		select {
		case sub := <-b.newClients:
			b.mu.Lock()
			if b.clients[sub.buildID] == nil {
				b.clients[sub.buildID] = make(map[chan LogMessage]bool)
			}
			b.clients[sub.buildID][sub.client] = true
			b.mu.Unlock()
			log.Printf("📡 New SSE client connected for build %s (total: %d)",
				sub.buildID, len(b.clients[sub.buildID]))

		case sub := <-b.closing:
			b.mu.Lock()
			if clients, ok := b.clients[sub.buildID]; ok {
				delete(clients, sub.client)
				close(sub.client)
				if len(clients) == 0 {
					delete(b.clients, sub.buildID)
				}
			}
			b.mu.Unlock()
			log.Printf("📡 SSE client disconnected for build %s", sub.buildID)

		case msg := <-b.messages:
			b.mu.RLock()
			if clients, ok := b.clients[msg.BuildID]; ok {
				for client := range clients {
					select {
					case client <- msg:
					case <-time.After(100 * time.Millisecond):
						log.Printf("⚠️ Client timeout for build %s", msg.BuildID)
					}
				}
			}
			b.mu.RUnlock()
		}
	}
}

func (b *LogBroker) PublishLog(buildID, logType, message string) {
	msg := LogMessage{
		Type:      logType,
		Message:   message,
		Timestamp: time.Now(),
		BuildID:   buildID,
	}

	select {
	case b.messages <- msg:
	case <-time.After(100 * time.Millisecond):
		log.Printf("⚠️ Failed to publish log for build %s: broker busy", buildID)
	}
}

func HandleBuildLogsSSE(c *gin.Context) {
	buildID := c.Param("buildId")

	if buildID == "" {
		c.JSON(400, gin.H{"error": "Build ID is required"})
		return
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	client := make(chan LogMessage, 10)

	globalLogBroker.newClients <- clientSubscription{
		buildID: buildID,
		client:  client,
	}

	c.SSEvent("connected", gin.H{"buildId": buildID, "message": "Connected to build logs"})
	c.Writer.Flush()

	ctx := c.Request.Context()
	heartbeat := time.NewTicker(15 * time.Second)
	defer heartbeat.Stop()

	for {
		select {
		case <-ctx.Done():
			globalLogBroker.closing <- clientSubscription{
				buildID: buildID,
				client:  client,
			}
			return

		case <-heartbeat.C:
			c.SSEvent("heartbeat", gin.H{"time": time.Now().Unix()})
			c.Writer.Flush()

		case msg := <-client:
			data, _ := json.Marshal(msg)
			fmt.Fprintf(c.Writer, "event: log\ndata: %s\n\n", data)
			c.Writer.Flush()
		}
	}
}

func GetLogBroker() *LogBroker {
	return globalLogBroker
}
