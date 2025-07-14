import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat routes
  app.get("/api/chats", async (req, res) => {
    try {
      const chats = await storage.getChats();
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", async (req, res) => {
    try {
      const validatedData = insertChatSchema.parse(req.body);
      const chat = await storage.createChat(validatedData);
      res.json(chat);
    } catch (error) {
      res.status(400).json({ message: "Invalid chat data" });
    }
  });

  app.get("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      if (isNaN(chatId)) {
        return res.status(400).json({ message: "Invalid chat ID" });
      }
      
      const messages = await storage.getMessagesByChatId(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      if (isNaN(chatId)) {
        return res.status(400).json({ message: "Invalid chat ID" });
      }

      const validatedData = insertMessageSchema.parse({
        ...req.body,
        chatId
      });
      
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // AI response endpoint
  app.post("/api/chats/:id/respond", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const { userMessage, language = "en", topic } = req.body;
      
      if (isNaN(chatId)) {
        return res.status(400).json({ message: "Invalid chat ID" });
      }

      // Generate AI response based on message content and language
      const aiResponse = generateAIResponse(userMessage, language, topic);
      
      // Save AI response as message
      const message = await storage.createMessage({
        chatId,
        role: "assistant",
        content: aiResponse,
        metadata: { language, topic }
      });

      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateAIResponse(userMessage: string, language: string, topic?: string): string {
  const responses = {
    en: {
      assembly: "To assemble a drone for the first time, follow these steps:\n\n1. **Prepare your workspace**: Choose a clean, well-lit area with sufficient space.\n\n2. **Gather tools**: You'll need screwdrivers, hex keys, and cable ties.\n\n3. **Frame assembly**: Start with the main frame and attach the arms securely.\n\n4. **Motor installation**: Mount motors to each arm, ensuring proper orientation.\n\n5. **ESC connection**: Connect Electronic Speed Controllers to motors and flight controller.\n\n6. **Flight controller**: Mount centrally and connect to receiver, GPS, and other components.\n\n7. **Propeller installation**: Attach propellers last, ensuring correct rotation direction.\n\n8. **Testing**: Perform pre-flight checks before maiden flight.",
      components: "Essential drone components include:\n\n**Flight Controller**: The brain of your drone, processes sensor data and controls flight.\n\n**Motors**: Brushless motors provide thrust. Choose based on payload and frame size.\n\n**ESCs**: Electronic Speed Controllers regulate motor speed based on flight controller signals.\n\n**Propellers**: Generate thrust. Size and pitch affect performance and efficiency.\n\n**Battery**: LiPo batteries provide power. Consider capacity, voltage, and discharge rate.\n\n**Frame**: Provides structure. Materials include carbon fiber, aluminum, and plastic.\n\n**Sensors**: Gyroscope, accelerometer, magnetometer, and GPS for stable flight.\n\n**Camera/Gimbal**: For aerial photography and videography applications.",
      maintenance: "Proper drone maintenance ensures longevity and safe operation:\n\n**Pre-flight checks**: Inspect propellers, battery connections, and frame integrity.\n\n**Battery care**: Store at proper voltage levels, avoid over-discharge, check for swelling.\n\n**Motor maintenance**: Clean debris, check for smooth rotation, replace worn bearings.\n\n**Calibration**: Regularly calibrate compass, accelerometer, and gimbal.\n\n**Firmware updates**: Keep flight controller firmware current for bug fixes and features.\n\n**Storage**: Store in dry environment, remove batteries for long-term storage.",
      simulation: "Simscape provides powerful tools for drone simulation:\n\n**Multibody modeling**: Create accurate physical representations of drone components.\n\n**Control system design**: Test flight controllers before hardware implementation.\n\n**Environmental factors**: Simulate wind, turbulence, and payload variations.\n\n**Sensor modeling**: Include realistic sensor noise and delays.\n\n**Mission planning**: Test autonomous flight paths and obstacle avoidance.\n\n**Performance optimization**: Analyze efficiency and stability characteristics.",
      rules: "DGCA (Directorate General of Civil Aviation) drone regulations in India:\n\n**Registration**: All drones must be registered on the Digital Sky platform.\n\n**Pilot license**: RPAS (Remotely Piloted Aircraft Systems) pilot license required for commercial operations.\n\n**No-fly zones**: Restricted around airports, military installations, and international borders.\n\n**Altitude limits**: Maximum 400 feet AGL (Above Ground Level) for civilian operations.\n\n**Visual line of sight**: Pilot must maintain visual contact with drone.\n\n**Insurance**: Third-party insurance mandatory for commercial operations.\n\n**Import regulations**: Type certificate required for drone imports.",
      usecases: "Drone applications in agriculture and other sectors:\n\n**Precision Agriculture**: Crop monitoring, pest detection, and yield estimation using multispectral imaging.\n\n**Spraying Operations**: Targeted pesticide and fertilizer application with GPS guidance.\n\n**Livestock Monitoring**: Track animal health and movement patterns.\n\n**Delivery Services**: Last-mile delivery for medical supplies and e-commerce.\n\n**Surveillance**: Security monitoring, border patrol, and disaster response.\n\n**Infrastructure Inspection**: Power lines, pipelines, and building assessments.\n\n**Mapping and Surveying**: High-resolution aerial mapping and 3D modeling.",
      default: "I'm your Drone AI Assistant! I can help you with drone assembly, components, maintenance, DGCA regulations in India, simulations, and various use cases like agriculture and delivery. What would you like to know?"
    },
    hi: {
      assembly: "पहली बार ड्रोन असेंबली के लिए इन चरणों का पालन करें:\n\n1. **कार्यस्थल तैयार करें**: एक साफ, अच्छी रोशनी वाला क्षेत्र चुनें।\n\n2. **उपकरण इकट्ठे करें**: स्क्रूड्राइवर, हेक्स की, और केबल टाई की आवश्यकता होगी।\n\n3. **फ्रेम असेंबली**: मुख्य फ्रेम से शुरू करें और आर्म्स को सुरक्षित रूप से जोड़ें।\n\n4. **मोटर इंस्टॉलेशन**: प्रत्येक आर्म पर मोटर माउंट करें।\n\n5. **ESC कनेक्शन**: इलेक्ट्रॉनिक स्पीड कंट्रोलर्स को मोटर्स और फ्लाइट कंट्रोलर से जोड़ें।\n\nक्या आपको किसी विशिष्ट चरण के बारे में और जानकारी चाहिए?",
      default: "मैं आपका ड्रोन AI असिस्टेंट हूं! मैं ड्रोन असेंबली, घटकों, रखरखाव, भारत में DGCA नियमों आदि में आपकी मदद कर सकता हूं।"
    },
    te: {
      default: "నేను మీ డ్రోన్ AI అసిస్టెంట్! డ్రోన్ అసెంబ్లీ, భాగాలు, నిర్వహణ, భారతదేశంలో DGCA నిబంధనలు మొదలైన వాటిలో నేను మీకు సహాయం చేయగలను।"
    },
    ta: {
      default: "நான் உங்கள் ட்ரோன் AI உதவியாளர்! ட்ரோன் அசெம்ப்ளி, கூறுகள், பராமரிப்பு, இந்தியாவில் DGCA விதிமுறைகள் போன்றவற்றில் உங்களுக்கு உதவ முடியும்."
    },
    kn: {
      default: "ನಾನು ನಿಮ್ಮ ಡ್ರೋನ್ AI ಸಹಾಯಕ! ಡ್ರೋನ್ ಅಸೆಂಬ್ಲಿ, ಘಟಕಗಳು, ನಿರ್ವಹಣೆ, ಭಾರತದಲ್ಲಿ DGCA ನಿಯಮಗಳು ಇತ್ಯಾದಿಗಳಲ್ಲಿ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ."
    },
    ml: {
      default: "ഞാൻ നിങ്ങളുടെ ഡ്രോൺ AI അസിസ്റ്റന്റ് ആണ്! ഡ്രോൺ അസംബ്ലി, ഘടകങ്ങൾ, പരിപാലനം, ഇന്ത്യയിലെ DGCA നിയമങ്ങൾ തുടങ്ങിയവയിൽ എനിക്ക് നിങ്ങളെ സഹായിക്കാൻ കഴിയും."
    },
    bn: {
      default: "আমি আপনার ড্রোন AI সহায়ক! ড্রোন অ্যাসেম্বলি, উপাদান, রক্ষণাবেক্ষণ, ভারতে DGCA নিয়মাবলী ইত্যাদিতে আমি আপনাকে সাহায্য করতে পারি।"
    },
    mr: {
      default: "मी तुमचा ड्रोन AI सहाय्यक आहे! ड्रोन असेंब्ली, घटक, देखभाल, भारतातील DGCA नियम इत्यादींमध्ये मी तुम्हाला मदत करू शकतो।"
    }
  };

  const languageResponses = responses[language as keyof typeof responses] || responses.en;
  const lowerMessage = userMessage.toLowerCase();
  
  if (topic) {
    return languageResponses[topic as keyof typeof languageResponses] || languageResponses.default;
  }
  
  if (lowerMessage.includes('assembly') || lowerMessage.includes('assemble')) {
    return languageResponses.assembly || languageResponses.default;
  } else if (lowerMessage.includes('component') || lowerMessage.includes('parts')) {
    return languageResponses.components || languageResponses.default;
  } else if (lowerMessage.includes('maintenance') || lowerMessage.includes('maintain')) {
    return languageResponses.maintenance || languageResponses.default;
  } else if (lowerMessage.includes('dgca') || lowerMessage.includes('rules') || lowerMessage.includes('regulation')) {
    return languageResponses.rules || languageResponses.default;
  } else if (lowerMessage.includes('simulation') || lowerMessage.includes('simscape')) {
    return languageResponses.simulation || languageResponses.default;
  } else if (lowerMessage.includes('agriculture') || lowerMessage.includes('delivery') || lowerMessage.includes('use case')) {
    return languageResponses.usecases || languageResponses.default;
  }
  
  return languageResponses.default;
}
