import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Menu, Settings } from "lucide-react";

interface ChatHeaderProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  onToggleSidebar: () => void;
}

const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { value: "ml", label: "മലയാളം (Malayalam)" },
  { value: "bn", label: "বাংলা (Bengali)" },
  { value: "mr", label: "मराठी (Marathi)" },
];

export default function ChatHeader({ currentLanguage, onLanguageChange, onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-2xl text-primary">🚁</div>
            <h1 className="text-xl font-semibold text-dark-text">Drone AI Studio</h1>
            <span className="text-sm text-gray-500 hidden sm:inline">Ask Anything About Drones</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={currentLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-48 border border-gray-300 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
