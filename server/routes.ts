import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/chats", async (req, res) => {
    try {
      const chats = await storage.getChats();
      res.json(chats);
    } catch {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", async (req, res) => {
    try {
      const validatedData = insertChatSchema.parse(req.body);
      const chat = await storage.createChat(validatedData);
      res.json(chat);
    } catch {
      res.status(400).json({ message: "Invalid chat data" });
    }
  });

  app.get("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      if (isNaN(chatId)) return res.status(400).json({ message: "Invalid chat ID" });

      const messages = await storage.getMessagesByChatId(chatId);
      res.json(messages);
    } catch {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      if (isNaN(chatId)) return res.status(400).json({ message: "Invalid chat ID" });

      const validatedData = insertMessageSchema.parse({ ...req.body, chatId });
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.post("/api/chats/:id/respond", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const { userMessage, language = "en", topic } = req.body;
      if (isNaN(chatId)) return res.status(400).json({ message: "Invalid chat ID" });

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control"
      });

      const aiResponse = generateAIResponse(userMessage, language, topic);
      const words = aiResponse.split(" ");
      let streamedContent = "";

      for (let i = 0; i < words.length; i++) {
        streamedContent += (i > 0 ? " " : "") + words[i];
        res.write(
          `data: ${JSON.stringify({
            type: "content",
            content: streamedContent,
            isComplete: i === words.length - 1
          })}\n\n`
        );
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      }

      const message = await storage.createMessage({
        chatId,
        role: "assistant",
        content: aiResponse,
        metadata: { language, topic }
      });

      res.write(
        `data: ${JSON.stringify({
          type: "complete",
          message
        })}\n\n`
      );
      res.end();
    } catch {
      res.write(`data: ${JSON.stringify({ type: "error", message: "Failed to generate response" })}\n\n`);
      res.end();
    }
  });

  app.post("/api/chats/:id/respond-legacy", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const { userMessage, language = "en", topic } = req.body;
      if (isNaN(chatId)) return res.status(400).json({ message: "Invalid chat ID" });

      const aiResponse = generateAIResponse(userMessage, language, topic);

      const message = await storage.createMessage({
        chatId,
        role: "assistant",
        content: aiResponse,
        metadata: { language, topic }
      });

      res.json(message);
    } catch {
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// ---------- Multilingual AI Response Generator Function ----------

function generateAIResponse(userMessage: string, language: string, topic?: string): string {
  const responses = {
    en: {
      assembly: `To assemble a drone for the first time, follow these steps:

1. **Prepare your workspace**: Choose a clean, well-lit area with sufficient space.
2. **Gather tools**: You'll need screwdrivers, hex keys, and cable ties.
3. **Frame assembly**: Start with the main frame and attach the arms securely.
4. **Motor installation**: Mount motors to each arm, ensuring proper orientation.
5. **ESC connection**: Connect Electronic Speed Controllers to motors and the flight controller.
6. **Flight controller**: Mount centrally and connect to the receiver, GPS, and sensors.
7. **Propeller installation**: Attach propellers last, ensuring correct rotation direction.
8. **Testing**: Perform pre-flight checks and calibrations before flying.`,

      components: `Essential drone components include:

**Frame/Chassis**: Physical structure made of carbon fiber, plastic, or aluminum.
**Motors**: Usually brushless DC motors (BLDC) for thrust.
**Propellers**: Paired with motors to generate lift.
**ESCs**: Control motor speed based on signals from the flight controller.
**Battery**: Typically LiPo batteries for high energy density.
**Power Distribution Board (PDB)**: Distributes power to all components.
**Flight Controller (FC)**: The brain of the drone, stabilizes and navigates.
**Sensors**: Includes IMU, barometer, magnetometer, and GPS.
**Camera/Gimbal**: Optional for photography or surveillance.
**Communication systems**: Includes radio transmitter/receiver, telemetry, FPV.`,

      maintenance: `Drone maintenance tips:

- **Pre-flight checks**: Examine frame, motor, and propellers for cracks or damage.
- **Battery care**: Store LiPo batteries at 3.7–3.8V/cell, avoid overcharging or full discharging.
- **Motor care**: Clean dust, check for unusual noises, lubricate if needed.
- **Firmware updates**: Update flight controller firmware (e.g., ArduPilot, PX4).
- **Sensor calibration**: Regularly calibrate compass, accelerometer, barometer, and GPS.`,

      rules: `DGCA (India) Drone Regulations:

- **Registration**: All drones must be registered on the Digital Sky Platform.
- **License**: Remote Pilot License required for commercial drones.
- **No-Fly Zones**: Near airports, borders, military areas.
- **Altitude Limit**: 120 meters (400 feet) max for standard operations.
- **Visual Line of Sight (VLOS)**: Mandatory.
- **Geo-fencing & real-time tracking**: Required for mid and large-sized drones.
- **Insurance**: Required for commercial drones.`,

      simulation: `Drone Simulation with Simscape:

- **Multibody Modeling**: Create physical models of drones.
- **Sensor Simulation**: Model GPS, barometers, and magnetometers.
- **Control Systems**: Design PID and feedback controllers.
- **Environmental Conditions**: Simulate wind, gravity, terrain.
- **Testing**: Test stability, fault handling, mission planning.`,

      usecases: `Drone Use Cases:

- **Agriculture**: Crop monitoring, pesticide spraying.
- **Surveillance**: Border patrol, traffic monitoring.
- **Delivery**: Last-mile parcel delivery.
- **Infrastructure Inspection**: Power lines, bridges, pipelines.
- **Emergency Response**: Search and rescue, fire monitoring.
- **Mapping & Surveying**: Aerial data collection.`,

      default: `I'm your Drone AI Assistant! I can help with drone assembly, components, maintenance, DGCA rules, simulation, and use cases. Ask me anything!`
    },

    hi: {
      assembly: `पहली बार ड्रोन असेंबली के लिए इन चरणों का पालन करें:

1. कार्यस्थल तैयार करें – साफ और रोशनी वाला स्थान चुनें।
2. उपकरण एकत्र करें – स्क्रूड्राइवर, हेक्स की, केबल टाई।
3. फ्रेम असेंबली – मुख्य फ्रेम पर बाहें जोड़ें।
4. मोटर लगाएं – सही दिशा में हर बाहु पर।
5. ESC को जोड़ें – मोटर और फ्लाइट कंट्रोलर से।
6. फ्लाइट कंट्रोलर लगाएं – रिसीवर और सेंसर से कनेक्ट करें।
7. प्रोपेलर लगाएं – सही दिशा में लगाना जरूरी है।
8. टेस्टिंग करें – उड़ान से पहले पूरी जांच करें।`,

      components: `ड्रोन के आवश्यक घटक:

- **फ्रेम**: कार्बन फाइबर या एल्युमिनियम से बना होता है।
- **मोटर**: ब्रशलेस डीसी मोटर अधिक उपयुक्त होती है।
- **प्रोपेलर**: लिफ्ट प्रदान करते हैं।
- **ESC**: मोटर की गति को नियंत्रित करता है।
- **बैटरी**: सामान्यतः LiPo बैटरी होती है।
- **पावर डिस्ट्रीब्यूशन बोर्ड (PDB)**: सभी कंपोनेंट्स को बिजली देता है।
- **फ्लाइट कंट्रोलर**: ड्रोन का मस्तिष्क होता है।
- **सेंसर**: IMU, GPS, बैरोमीटर आदि।
- **कैमरा और गिंबल**: निगरानी या फोटो के लिए।
- **कम्युनिकेशन सिस्टम**: रेडियो, टेलीमेट्री, FPV।`,

      maintenance: `ड्रोन मेंटेनेंस के सुझाव:

- उड़ान से पहले जांच करें।
- बैटरी को सही वोल्टेज पर स्टोर करें।
- मोटर की सफाई और जांच करें।
- सॉफ़्टवेयर अपडेट और सेंसर कैलिब्रेशन करें।`,

      rules: `DGCA के नियम:

- रजिस्ट्रेशन अनिवार्य है।
- कमर्शियल उड़ानों के लिए लाइसेंस आवश्यक है।
- हवाई अड्डों के पास उड़ान वर्जित है।
- अधिकतम ऊंचाई 120 मीटर।
- दृश्यमान उड़ान (VLOS) जरूरी है।
- कमर्शियल ड्रोन के लिए बीमा जरूरी है।`,

      simulation: `Simscape के साथ ड्रोन सिमुलेशन:

- फिजिकल मॉडलिंग करें।
- सेंसर डेटा सिमुलेट करें।
- कंट्रोल डिजाइन करें।
- टेस्टिंग और मिशन प्लानिंग करें।`,

      usecases: `ड्रोन के उपयोग:

- कृषि – छिड़काव और निगरानी।
- डिलीवरी – पार्सल डिलीवरी।
- सर्वेक्षण – मानचित्रण और डेटा संग्रह।
- सुरक्षा – निगरानी और गश्त।
- आपदा प्रबंधन – खोज और बचाव।`,

      default: `मैं आपका ड्रोन AI सहायक हूं। ड्रोन असेंबली, नियम, और उपयोग मामलों में आपकी मदद कर सकता हूं।`
    },

    te: {
      assembly: `డ్రోన్ అసెంబ్లీ చేసే విధానం:

1. పని స్థలం సిద్ధం చేయండి.
2. అవసరమైన టూల్స్ సిద్ధం చేసుకోండి.
3. ఫ్రేమ్‌ను జోడించండి.
4. ప్రతి ఆర్మ్ పై మోటార్లు అమర్చండి.
5. ESCలను మోటార్లకు కనెక్ట్ చేయండి.
6. ఫ్లైట్ కంట్రోలర్‌ను అమర్చి, సెంసర్లు కలపండి.
7. ప్రొపెల్లర్లను చివర్లో అమర్చండి – దిశను పరిశీలించండి.
8. ముందస్తు టెస్ట్‌లు నిర్వహించండి.`,

      components: `డ్రోన్ ముఖ్య భాగాలు:

- **ఫ్రేమ్** – కార్బన్ ఫైబర్ లేదా అల్యూమినియం తో తయారు.
- **మోటార్లు** – BLDC మోటార్లు ఎక్కువగా ఉపయోగిస్తారు.
- **ప్రొపెల్లర్లు** – లిఫ్ట్ కోసం.
- **ESCలు** – మోటార్ స్పీడ్ నియంత్రణ.
- **బ్యాటరీ** – LiPo బ్యాటరీ ఎక్కువగా ఉపయోగించబడుతుంది.
- **పవర్ డిస్ట్రిబ్యూషన్ బోర్డు** – విద్యుత్ పంపిణీ కోసం.
- **ఫ్లైట్ కంట్రోలర్** – డ్రోన్ బ్రెయిన్.
- **సెన్సర్లు** – IMU, GPS, మాగ్నెటోమీటర్.
- **కెమేరా/గింబల్** – వీడియో కోసం.
- **కమ్యూనికేషన్ సిస్టమ్** – రేడియో, టెలీమెట్రీ, FPV.`,

      maintenance: `మెయింటెనెన్స్ సూచనలు:

- ప్రతి ఫ్లైట్ ముందు దృఢత తనిఖీ చేయండి.
- బ్యాటరీ సురక్షితంగా నిల్వ చేయండి.
- మోటార్లు శుభ్రంగా ఉంచండి.
- సెన్సర్ క్యాలిబ్రేషన్ తప్పనిసరి.`,

      rules: `DGCA నియమాలు:

- Digital Sky ద్వారా రిజిస్ట్రేషన్ తప్పనిసరి.
- వాణిజ్య ప్రయాణాల కోసం లైసెన్స్ అవసరం.
- ఎయిర్‌పోర్ట్స్ పక్కన ఫ్లైట్ నిషేధం.
- గరిష్ట ఎత్తు: 120 మీటర్లు.
- వాస్తవ దృశ్య పరిధి అవసరం.
- బీమా వాణిజ్య డ్రోన్లకు అవసరం.`,

      simulation: `Simscape తో సిమ్యులేషన్:

- డ్రోన్ మల్టీబాడీ మోడలింగ్ చేయవచ్చు.
- సెన్సర్ ఇన్‌పుట్‌లు సిమ్యులేట్ చేయండి.
- PID కంట్రోల్ ట్యూనింగ్ చేయండి.
- పర్యావరణ పరిస్థితులు సెట్ చేయవచ్చు.`,

      usecases: `డ్రోన్ల వాడకాలు:

- వ్యవసాయం – పంట పర్యవేక్షణ.
- డెలివరీ – చిన్న పార్సిల్ పంపిణీ.
- మ్యాపింగ్ – సర్వేలు, డేటా సేకరణ.
- భద్రత – గస్తీ, పర్యవేక్షణ.
- అత్యవసర స్పందన – రిస్క్యూ, ఫైర్ ట్రాకింగ్.`,

      default: `నేను మీ డ్రోన్ AI సహాయకుడిని. డ్రోన్ భాగాలు, రూల్స్, అసెంబ్లీ గురించి అడగండి!`
    }
  };

  const languageResponses = responses[language as keyof typeof responses] || responses.en;
  const lowerMessage = userMessage.toLowerCase();

  const inferTopic = (): keyof typeof responses.en => {
    if (topic) return topic as keyof typeof responses.en;
    if (lowerMessage.includes("assembly")) return "assembly";
    if (lowerMessage.includes("component") || lowerMessage.includes("parts")) return "components";
    if (lowerMessage.includes("maintain") || lowerMessage.includes("maintenance")) return "maintenance";
    if (lowerMessage.includes("dgca") || lowerMessage.includes("rule")) return "rules";
    if (lowerMessage.includes("simulate") || lowerMessage.includes("simulation") || lowerMessage.includes("simscape")) return "simulation";
    if (lowerMessage.includes("use case") || lowerMessage.includes("agriculture") || lowerMessage.includes("delivery")) return "usecases";
    return "default";
  };

  const selectedTopic = inferTopic();
  return languageResponses[selectedTopic] || languageResponses.default;
}
