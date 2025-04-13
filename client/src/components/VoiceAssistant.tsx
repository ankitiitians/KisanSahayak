import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoiceAssistantProps {
  language: 'en' | 'hi'; 
}

export default function VoiceAssistant({ language }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);
  
  // Common phrases that can be spoken
  const phrases = {
    en: {
      welcome: 'Welcome to Bharat Fasal. How can I help you today?',
      categories: 'We have vegetables, fruits, grains, spices, dairy, and organic products.',
      help: 'You can browse products, register as a farmer or customer, or contact support.'
    },
    hi: {
      welcome: 'भारत फसल में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूं?',
      categories: 'हमारे पास सब्जियां, फल, अनाज, मसाले, डेयरी और जैविक उत्पाद हैं।',
      help: 'आप उत्पादों को ब्राउज़ कर सकते हैं, किसान या ग्राहक के रूप में पंजीकरण कर सकते हैं, या सहायता से संपर्क कर सकते हैं।'
    }
  };

  useEffect(() => {
    // Check if browser supports speech synthesis
    if (!'speechSynthesis' in window) {
      setHasVoiceSupport(false);
    }
  }, []);

  const speak = (text: string) => {
    if (!hasVoiceSupport) return;
    
    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    utterance.lang = language === 'en' ? 'en-IN' : 'hi-IN';
    
    // Set voice (try to find an appropriate voice)
    const voices = window.speechSynthesis.getVoices();
    const voiceForLang = voices.find(voice => voice.lang.includes(language));
    if (voiceForLang) {
      utterance.voice = voiceForLang;
    }
    
    // Speak
    window.speechSynthesis.speak(utterance);
  };
  
  const handleToggleListening = () => {
    setIsListening(!isListening);
    
    // When turning on, speak welcome message
    if (!isListening) {
      speak(phrases[language].welcome);
    } else {
      // Stop speaking when turning off
      window.speechSynthesis.cancel();
    }
  };
  
  const handleSpeakHelp = () => {
    speak(phrases[language].help);
  };
  
  const handleSpeakCategories = () => {
    speak(phrases[language].categories);
  };
  
  if (!hasVoiceSupport) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        {isListening && (
          <div className="bg-white p-3 rounded-lg shadow-lg mb-2 w-64">
            <h4 className="font-medium text-sm mb-2">
              {language === 'en' ? 'Voice Assistant' : 'आवाज सहायक'}
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSpeakHelp}
                className="text-xs"
              >
                {language === 'en' ? 'Help' : 'मदद'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSpeakCategories}
                className="text-xs"
              >
                {language === 'en' ? 'Categories' : 'श्रेणियाँ'}
              </Button>
            </div>
          </div>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isListening ? "default" : "outline"}
                size="icon" 
                onClick={handleToggleListening}
                className={`rounded-full w-12 h-12 shadow-md ${isListening ? 'bg-primary text-white' : 'bg-white'}`}
              >
                {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isListening 
                ? (language === 'en' ? 'Voice Assistant active' : 'आवाज सहायक सक्रिय है') 
                : (language === 'en' ? 'Activate Voice Assistant' : 'आवाज सहायक सक्रिय करें')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}