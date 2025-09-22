"use client"

import { Input } from "@/components/ui/input"

import { Card } from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import { useEffect } from "react"

import { useRef } from "react"

import { useState } from "react"

import type React from "react"
import { BarChart3, Users, UserPlus, HelpCircle } from "lucide-react" // Import BarChart3, Users, and UserPlus icons
import { Bot, User, Zap, MessageCircle } from "lucide-react"
import axios from "axios"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMode, setStreamingMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fetchStreamRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      content:
        "Hello! I'm your Campus Admin AI Assistant. I can help you add students, manage records, and answer questions about student data. Try asking me to 'add a new student' or 'show me student statistics'.",
      isUser: false,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [])

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage.id
  }

  const updateMessage = (id: string, content: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, content } : msg)))
  }

  const handleRegularChat = async (message: string) => {
    setIsLoading(true)
    addMessage(message, true)

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: message,
      })

      addMessage(response.data.reply, false)
    } catch (error) {
      console.error("Chat error:", error)
      addMessage("Sorry, I encountered an error. Please try again.", false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStreamingChat = async (message: string) => {
    setIsStreaming(true)
    addMessage(message, true)

    const messageId = addMessage("", false)
    let accumulatedContent = ""

    try {
      console.log("[v0] Starting streaming chat request")
      const response = await fetch("http://localhost:8000/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body reader available")
      }

      fetchStreamRef.current = reader

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log("[v0] Streaming completed")
          setIsStreaming(false)
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        console.log("[v0] Received chunk:", chunk)

        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            console.log("[v0] Processing data:", data)

            if (data && data !== "[DONE]") {
              accumulatedContent += data
              console.log("[v0] Accumulated content:", accumulatedContent)
              updateMessage(messageId, accumulatedContent)

              setTimeout(() => {
                scrollToBottom()
              }, 0)
            } else if (data === "[DONE]") {
              console.log("[v0] Stream completed with [DONE]")
              setIsStreaming(false)
              break
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error)
      setIsStreaming(false)
      if (accumulatedContent === "") {
        updateMessage(messageId, "Sorry, I encountered an error with streaming. Please try again.")
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading || isStreaming) return

    const message = inputMessage.trim()
    setInputMessage("")

    if (streamingMode) {
      handleStreamingChat(message)
    } else {
      handleRegularChat(message)
    }
  }

  const stopStreaming = () => {
    setIsStreaming(false)
    fetchStreamRef.current?.cancel()
  }

  const quickActions = [
    { label: "Add Student", message: "I want to add a new student", icon: UserPlus },
    { label: "View Statistics", message: "Show me student statistics", icon: BarChart3 },
    { label: "List Students", message: "Show me all students", icon: Users },
    { label: "Ask About Saylani", message: "Tell me about Saylani", icon: HelpCircle },
  ]

  const handleQuickAction = (message: string) => {
    setInputMessage(message)
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 md:pl-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Campus Admin AI</h1>
                <p className="text-sm text-muted-foreground">
                  {streamingMode ? "Streaming mode enabled" : "Regular chat mode"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={streamingMode ? "default" : "outline"}
                size="sm"
                onClick={() => setStreamingMode(!streamingMode)}
                className="gap-2"
              >
                <Zap className="w-4 h-4" />
                {streamingMode ? "Streaming" : "Regular"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length <= 1 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-2">Campus Admin Assistant</h2>
                  <p className="text-muted-foreground max-w-md mb-6">
                    I can help you manage students, view analytics, and handle administrative tasks. Try one of these
                    quick actions or ask me anything!
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.message)}
                        className="gap-2"
                        disabled={isLoading || isStreaming}
                      >
                        {action.icon && <action.icon className="w-4 h-4" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}>
                  {!message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}

                  <Card
                    className={`max-w-[70%] p-4 ${
                      message.isUser ? "bg-primary text-primary-foreground ml-12" : "bg-card text-card-foreground mr-12"
                    }`}
                  >
                    {message.content === "" && isStreaming && !message.isUser ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-xs">Receiving response...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`text-xs mt-2 opacity-70 ${
                            message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </>
                    )}
                  </Card>

                  {message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}

            {(isLoading || isStreaming) && !streamingMode && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                </div>
                <Card className="max-w-[70%] p-4 bg-card text-card-foreground mr-12">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}

            {isStreaming && streamingMode && (
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={stopStreaming} className="gap-2 bg-transparent">
                  Stop Streaming
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about institue, add students, view analytics, or manage records..."
                disabled={isLoading || isStreaming}
                className="flex-1"
              />
              <Button type="submit" disabled={!inputMessage.trim() || isLoading || isStreaming} className="gap-2">
                <Bot className="w-4 h-4" />
                Send
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
