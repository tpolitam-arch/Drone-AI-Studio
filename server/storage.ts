import { chats, messages, users, type User, type InsertUser, type Chat, type InsertChat, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChats(): Promise<Chat[]>;
  getChatById(id: number): Promise<Chat | undefined>;
  updateChat(id: number, updates: Partial<Chat>): Promise<Chat | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChatId(chatId: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentChatId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentChatId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.currentChatId++;
    const now = new Date();
    const chat: Chat = { 
      ...insertChat,
      language: insertChat.language || "en",
      id,
      createdAt: now,
      updatedAt: now
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChats(): Promise<Chat[]> {
    return Array.from(this.chats.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getChatById(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async updateChat(id: number, updates: Partial<Chat>): Promise<Chat | undefined> {
    const chat = this.chats.get(id);
    if (!chat) return undefined;
    
    const updatedChat: Chat = { 
      ...chat, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.chats.set(id, updatedChat);
    return updatedChat;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage,
      metadata: insertMessage.metadata || null,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    
    // Update chat's updatedAt timestamp
    const chat = this.chats.get(insertMessage.chatId);
    if (chat) {
      this.chats.set(insertMessage.chatId, { ...chat, updatedAt: new Date() });
    }
    
    return message;
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = new MemStorage();
