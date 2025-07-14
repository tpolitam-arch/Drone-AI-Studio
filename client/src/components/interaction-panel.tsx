import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Camera, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractionPanelProps {
  interactionMode: 'text' | 'voice' | 'webcam' | 'screen';
  onTranscription: (text: string) => void;
  isActive: boolean;
}

export default function InteractionPanel({ 
  interactionMode, 
  onTranscription,
  isActive 
}: InteractionPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscription(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onTranscription]);

  const startVoiceRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
    }
  };

  const stopVoiceRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsVideoActive(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsVideoActive(false);
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScreenSharing(true);
      
      // Handle screen share ending
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const stopScreenShare = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsScreenSharing(false);
  };

  if (!isActive || interactionMode === 'text') {
    return null;
  }

  return (
    <Card className="p-4 m-4 bg-white border border-gray-200">
      <div className="space-y-4">
        {/* Voice Mode */}
        {interactionMode === 'voice' && (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Voice Interaction</h3>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={cn(
                  "px-6 py-3 text-white rounded-lg",
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-green-500 hover:bg-green-600"
                )}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Start Voice Input
                  </>
                )}
              </Button>
            </div>
            {isRecording && (
              <div className="mt-4 text-sm text-gray-600">
                🎙️ Listening... Ask your drone questions!
              </div>
            )}
          </div>
        )}

        {/* Webcam Mode */}
        {interactionMode === 'webcam' && (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Webcam Interaction</h3>
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                onClick={isVideoActive ? stopWebcam : startWebcam}
                className={cn(
                  "px-6 py-3 text-white rounded-lg",
                  isVideoActive 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {isVideoActive ? (
                  <>
                    <VideoOff className="h-5 w-5 mr-2" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5 mr-2" />
                    Start Camera
                  </>
                )}
              </Button>
            </div>
            {isVideoActive && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <div className="mt-2 text-sm text-gray-600">
                  📹 Camera active - Show your drone or parts for analysis!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screen Share Mode */}
        {interactionMode === 'screen' && (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Screen Share Interaction</h3>
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className={cn(
                  "px-6 py-3 text-white rounded-lg",
                  isScreenSharing 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-purple-500 hover:bg-purple-600"
                )}
              >
                {isScreenSharing ? (
                  <>
                    <MonitorOff className="h-5 w-5 mr-2" />
                    Stop Sharing
                  </>
                ) : (
                  <>
                    <Monitor className="h-5 w-5 mr-2" />
                    Share Screen
                  </>
                )}
              </Button>
            </div>
            {isScreenSharing && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <div className="mt-2 text-sm text-gray-600">
                  🖥️ Screen sharing active - Show drone software, simulations, or documentation!
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Ask questions about what you're showing and get expert drone advice!
        </div>
      </div>
    </Card>
  );
}