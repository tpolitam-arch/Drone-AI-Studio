import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Chat } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  isLoading: boolean;
}

export default function ChatSidebar({ 
  chats, 
  currentChatId, 
  isOpen, 
  onClose, 
  onSelectChat, 
  onNewChat,
  isLoading 
}: ChatSidebarProps) {
  return (
    <aside className={cn(
      "w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out fixed lg:relative z-40 h-full",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-dark-text">Chat History</h2>
        <Button 
          onClick={onNewChat}
          className="bg-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-100 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-colors",
                currentChatId === chat.id 
                  ? "bg-primary text-white" 
                  : "bg-gray-50 hover:bg-gray-100"
              )}
            >
              <div className="font-medium text-sm mb-1 truncate">{chat.title}</div>
              <div className={cn(
                "text-xs",
                currentChatId === chat.id ? "text-blue-100" : "text-gray-500"
              )}>
                {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
