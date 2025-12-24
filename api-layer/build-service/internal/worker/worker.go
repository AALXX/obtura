package worker

import (
    "log"
    "encoding/json"
    amqp "github.com/rabbitmq/amqp091-go"
)

type Worker struct {
    conn    *amqp.Connection
    channel *amqp.Channel
}

func NewWorker(rabbitmqURL string) (*Worker, error) {
    conn, err := amqp.Dial(rabbitmqURL)
    if err != nil {
        return nil, err
    }

    channel, err := conn.Channel()
    if err != nil {
        return nil, err
    }

    return &Worker{
        conn:    conn,
        channel: channel,
    }, nil
}

func (w *Worker) Start() error {
    err := w.channel.ExchangeDeclare(
        "obtura.builds", 
        "topic",          
        true,             
        false,            
        false,            
        false,            
        nil,              
    )
    if err != nil {
        return err
    }

    queue, err := w.channel.QueueDeclare(
        "build-queue",    
        true,             
        false,            
        false,            
        false,            
        nil,              
    )
    if err != nil {
        return err
    }

    err = w.channel.QueueBind(
        queue.Name,      
        "build.triggered", 
        "obtura.builds",  
        false,
        nil,
    )
    if err != nil {
        return err
    }

    messages, err := w.channel.Consume(
        queue.Name,     
        "",              
        false,            
        false,            
        false,            
        false,            
        nil,              
    )
    if err != nil {
        return err
    }

    log.Println("✅ Build Service is now listening for messages...")

    for msg := range messages {
        log.Printf("📨 Received message: %s", string(msg.Body))
        
        go w.handleBuildJob(msg)
    }

    return nil
}

func (w *Worker) handleBuildJob(msg amqp.Delivery) {
    var job struct {
        BuildID    string  `json:"buildId"`
        ProjectID  string  `json:"projectId"`
        CommitHash string `json:"commitHash"`
        Branch     string `json:"branch"`
    }

    err := json.Unmarshal(msg.Body, &job)
    if err != nil {
        log.Printf("❌ Failed to parse message: %v", err)
        msg.Nack(false, false)
        return
    }

    log.Printf("🔨 Building project %d, build %d...", job.ProjectID, job.BuildID)

    // DO THE ACTUAL BUILD WORK HERE
    // err := w.buildProject(job)

    // Simulate build
    // time.Sleep(5 * time.Second)

    // 8. Acknowledge the message - tells RabbitMQ "I'm done with this"
    msg.Ack(false)
    
    log.Printf("✅ Build %d completed!", job.BuildID)
}