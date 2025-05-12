import React, { useState, useEffect } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAIAssistant } from "@/context/AIAssistantContext";
import { Mic, StopCircle, SendHorizontal } from "lucide-react";

const VoiceInput: React.FC = () => {
  const { 
    isListening, 
    setIsListening, 
    userInput, 
    setUserInput, 
    handleSendMessage, 
    handleVoiceInput
  } = useAIAssistant();
  
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  
  // Synchronize component listening state with context state
  useEffect(() => {
    setIsListening(listening);
  }, [listening, setIsListening]);
  
  // Process transcript when speech recognition stops
  useEffect(() => {
    if (!listening && transcript) {
      handleVoiceInput(transcript);
    }
  }, [listening, transcript, handleVoiceInput]);
  
  const toggleVoiceInput = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      handleSendMessage(userInput);
    }
  };
  
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex items-center">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center px-4 py-2 mr-2">
              <input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white"
              />
              <button 
                type="submit" 
                disabled={!userInput.trim()}
                className="text-primary p-1 disabled:opacity-50"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">No mic</span>
            </div>
          </form>
          <p className="mt-2 text-xs text-center text-red-500">
            Your browser doesn't support speech recognition.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center px-4 py-2 mr-2">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white"
            />
            <button 
              type="submit" 
              disabled={!userInput.trim()}
              className="text-primary p-1 disabled:opacity-50"
            >
              <SendHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          <button 
            type="button"
            onClick={toggleVoiceInput}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center relative"
          >
            {listening && (
              <div className="absolute w-full h-full rounded-full bg-primary opacity-70 animate-[pulse-ring_1.25s_cubic-bezier(0.215,0.61,0.355,1)_infinite]"></div>
            )}
            {listening ? (
              <StopCircle className="text-white h-6 w-6" />
            ) : (
              <Mic className="text-white h-6 w-6" />
            )}
          </button>
        </form>
        
        {listening && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Listening...</p>
            <div className="flex items-center justify-center h-6 space-x-1">
              <span className="w-1 h-5 bg-primary rounded-full animate-[wave_1s_ease-in-out_infinite]"></span>
              <span className="w-1 h-5 bg-primary rounded-full animate-[wave_1s_ease-in-out_0.1s_infinite]"></span>
              <span className="w-1 h-5 bg-primary rounded-full animate-[wave_1s_ease-in-out_0.2s_infinite]"></span>
              <span className="w-1 h-5 bg-primary rounded-full animate-[wave_1s_ease-in-out_0.3s_infinite]"></span>
              <span className="w-1 h-5 bg-primary rounded-full animate-[wave_1s_ease-in-out_0.4s_infinite]"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;
