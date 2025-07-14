import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Wrench, Cpu, Settings, Play, Gavel, Sprout } from "lucide-react";
import { Message } from "@shared/schema";
import StreamingMessage from "./streaming-message";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: Message[];
  currentChatId: number | null;
  isLoading: boolean;
  isAIResponding: boolean;
  streamingMessage?: string;
  isStreaming?: boolean;
  onSendMessage: (content: string, topic?: string) => void;
  onQuickTopic: (topic: string) => void;
}

const quickTopics = [
  { id: "assembly", label: "Drone Assembly", icon: Wrench },
  { id: "components", label: "Components", icon: Cpu },
  { id: "maintenance", label: "Maintenance", icon: Settings },
  { id: "simulation", label: "Simulations", icon: Play },
  { id: "rules", label: "DGCA Rules", icon: Gavel },
  { id: "usecases", label: "Use Cases", icon: Sprout },
];

export default function ChatInterface({ 
  messages, 
  currentChatId, 
  isLoading, 
  isAIResponding,
  streamingMessage = "",
  isStreaming = false,
  onSendMessage, 
  onQuickTopic 
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isAIResponding) {
      onSendMessage(inputValue.trim());
      setInputValue("");
      setCharCount(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setInputValue(value);
      setCharCount(value.length);
    }
  };

  const showWelcome = !currentChatId || messages.length === 0;

  return (
    <main className="flex-1 flex flex-col bg-white">
      {/* Quick Topic Buttons */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {quickTopics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <Button
                key={topic.id}
                variant="outline"
                onClick={() => onQuickTopic(topic.id)}
                disabled={isAIResponding}
                className="text-gray-700 hover:bg-primary hover:text-white transition-all"
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {topic.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {showWelcome ? (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🚁</span>
            </div>
            <h2 className="text-2xl font-semibold text-dark-text mb-2">Welcome to Drone AI Studio</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Ask me anything about drones, from assembly and components to regulations and use cases. 
              I can respond in multiple Indian languages!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div className="max-w-3xl">
                  {message.role === "user" ? (
                    <div className="bg-primary text-white rounded-2xl rounded-tr-md px-4 py-3 chat-bubble">
                      <p>{message.content}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-100 text-dark-text rounded-2xl rounded-tl-md px-4 py-3 chat-bubble">
                      <div className="flex items-center mb-2">
                        <span className="text-primary mr-2">🤖</span>
                        <span className="text-sm font-medium text-primary">Drone AI Assistant</span>
                      </div>
                      <StreamingMessage content={message.content} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isStreaming && streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-3xl">
                  <div className="bg-gray-100 text-dark-text rounded-2xl rounded-tl-md px-4 py-3 chat-bubble">
                    <div className="flex items-center mb-2">
                      <span className="text-primary mr-2">🤖</span>
                      <span className="text-sm font-medium text-primary">Drone AI Assistant</span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <StreamingMessage content={streamingMessage} speed={0} />
                      <span className="streaming-dot ml-1">●</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isAIResponding && !isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-3xl">
                  <div className="bg-gray-100 text-dark-text rounded-2xl rounded-tl-md px-4 py-3 chat-bubble">
                    <div className="flex items-center mb-2">
                      <span className="text-primary mr-2">🤖</span>
                      <span className="text-sm font-medium text-primary">Drone AI Assistant</span>
                    </div>
                    <div className="streaming-dot">●</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about drones..."
                className="resize-none min-h-[44px] max-h-[120px] pr-12 border-gray-300 focus:ring-primary focus:border-primary"
                disabled={isAIResponding}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isAIResponding}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-blue-700 p-2 h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className={cn(
              charCount > 1800 ? "text-red-500" : ""
            )}>
              {charCount}/2000
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
