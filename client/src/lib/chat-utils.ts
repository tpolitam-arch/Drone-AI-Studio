export const LANGUAGES = {
  en: "English",
  hi: "हिंदी (Hindi)",
  te: "తెలుగు (Telugu)",
  ta: "தமிழ் (Tamil)",
  kn: "ಕನ್ನಡ (Kannada)",
  ml: "മലയാളം (Malayalam)",
  bn: "বাংলা (Bengali)",
  mr: "मराठी (Marathi)",
};

export const QUICK_TOPICS = {
  assembly: {
    id: "assembly",
    label: "Drone Assembly",
    question: "How do I assemble a drone for the first time?",
  },
  components: {
    id: "components",
    label: "Components",
    question: "What are the essential components of a drone?",
  },
  maintenance: {
    id: "maintenance",
    label: "Maintenance",
    question: "How do I maintain my drone properly?",
  },
  simulation: {
    id: "simulation",
    label: "Simulations",
    question: "How can I use Simscape for drone simulations?",
  },
  rules: {
    id: "rules",
    label: "DGCA Rules",
    question: "What are the DGCA regulations for drones in India?",
  },
  usecases: {
    id: "usecases",
    label: "Use Cases",
    question: "What are the main use cases for drones in agriculture?",
  },
};

export function formatMessageTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

export function extractTopicFromMessage(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('assembly') || lowerMessage.includes('assemble')) {
    return 'assembly';
  } else if (lowerMessage.includes('component') || lowerMessage.includes('parts')) {
    return 'components';
  } else if (lowerMessage.includes('maintenance') || lowerMessage.includes('maintain')) {
    return 'maintenance';
  } else if (lowerMessage.includes('dgca') || lowerMessage.includes('rules') || lowerMessage.includes('regulation')) {
    return 'rules';
  } else if (lowerMessage.includes('simulation') || lowerMessage.includes('simscape')) {
    return 'simulation';
  } else if (lowerMessage.includes('agriculture') || lowerMessage.includes('delivery') || lowerMessage.includes('use case')) {
    return 'usecases';
  }
  
  return undefined;
}
