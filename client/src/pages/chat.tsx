import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ChatHeader from "@/components/chat-header";
import ChatSidebar from "@/components/chat-sidebar";
import ChatInterface from "@/components/chat-interface";
import { Chat, Message } from "@shared/schema";

export default function ChatPage() {
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(true);
  const [interactionMode, setInteractionMode] = useState<'text' | 'voice' | 'webcam' | 'screen'>('text');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all chats
  const { data: chats = [], isLoading: chatsLoading } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
  });

  // Fetch messages for current chat
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/chats", currentChatId, "messages"],
    enabled: !!currentChatId,
  });

  // Create new chat mutation
  const createChatMutation = useMutation({
    mutationFn: async (data: { title: string; language: string }) => {
      const response = await apiRequest("POST", "/api/chats", data);
      return response.json();
    },
    onSuccess: (newChat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setCurrentChatId(newChat.id);
      setIsSidebarOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { chatId: number; content: string; role: string }) => {
      const response = await apiRequest("POST", `/api/chats/${data.chatId}/messages`, {
        content: data.content,
        role: data.role,
        metadata: { language: currentLanguage }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", currentChatId, "messages"] });
    },
  });

  // Streaming state
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Get AI response with streaming
  const getAIResponseMutation = useMutation({
    mutationFn: async (data: { chatId: number; userMessage: string; language: string; topic?: string }) => {
      if (!isStreamingEnabled) {
        // Use regular API call without streaming
        const response = await apiRequest("POST", `/api/chats/${data.chatId}/respond-legacy`, data);
        return response.json();
      }

      setIsStreaming(true);
      setStreamingMessage("");
      console.log('Starting streaming request...');
      
      const response = await fetch(`/api/chats/${data.chatId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('Response received:', response.status);

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                console.log('Streaming content:', data.content);
                setStreamingMessage(data.content);
              } else if (data.type === 'complete') {
                setIsStreaming(false);
                setStreamingMessage("");
                queryClient.invalidateQueries({ queryKey: ["/api/chats", currentChatId, "messages"] });
                return data.message;
              } else if (data.type === 'error') {
                setIsStreaming(false);
                setStreamingMessage("");
                throw new Error(data.message);
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      }
    },
    onError: () => {
      setIsStreaming(false);
      setStreamingMessage("");
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    },
  });

  const handleNewChat = () => {
    const title = "New Chat";
    createChatMutation.mutate({ title, language: currentLanguage });
  };

  const handleSelectChat = (chatId: number) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (content: string, topic?: string) => {
    if (!currentChatId) {
      // Create new chat if none exists
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      const newChat = await createChatMutation.mutateAsync({ title, language: currentLanguage });
      setCurrentChatId(newChat.id);
      
      // Send user message
      await sendMessageMutation.mutateAsync({
        chatId: newChat.id,
        content,
        role: "user"
      });
      
      // Get AI response
      getAIResponseMutation.mutate({
        chatId: newChat.id,
        userMessage: content,
        language: currentLanguage,
        topic
      });
    } else {
      // Send user message to existing chat
      await sendMessageMutation.mutateAsync({
        chatId: currentChatId,
        content,
        role: "user"
      });
      
      // Get AI response
      getAIResponseMutation.mutate({
        chatId: currentChatId,
        userMessage: content,
        language: currentLanguage,
        topic
      });
    }
  };

  const handleQuickTopic = (topic: string) => {
    const topicQuestions = {
      assembly: "How do I assemble a drone for the first time?",
      components: "What are the essential components of a drone?",
      maintenance: "How do I maintain my drone properly?",
      simulation: "How can I use Simscape for drone simulations?",
      rules: "What are the DGCA regulations for drones in India?",
      usecases: "What are the main use cases for drones in agriculture?"
    };

    const question = topicQuestions[topic as keyof typeof topicQuestions];
    if (question) {
      handleSendMessage(question, topic);
    }
  };

  // Auto-select first chat if none selected
  useEffect(() => {
    if (!currentChatId && chats.length > 0) {
      setCurrentChatId(chats[0].id);
    }
  }, [chats, currentChatId]);

  return (
    <div className="h-screen flex flex-col bg-neutral-bg">
      <ChatHeader 
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isStreamingEnabled={isStreamingEnabled}
        onStreamingToggle={setIsStreamingEnabled}
        interactionMode={interactionMode}
        onInteractionModeChange={setInteractionMode}
      />
      
      <div className="flex flex-1 pt-16">
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          isLoading={chatsLoading}
        />
        
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <ChatInterface
          messages={messages}
          currentChatId={currentChatId}
          isLoading={messagesLoading || sendMessageMutation.isPending}
          isAIResponding={getAIResponseMutation.isPending || isStreaming}
          streamingMessage={streamingMessage}
          isStreaming={isStreaming}
          interactionMode={interactionMode}
          onSendMessage={handleSendMessage}
          onQuickTopic={handleQuickTopic}
        />
      </div>
    </div>
  );
}
