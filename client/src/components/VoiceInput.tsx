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
      <div className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto p-6">
        <div className="glass-card border-white/20 shadow-2xl rounded-2xl p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 glass-card rounded-2xl flex items-center px-4 py-3 border-white/10">
              <input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                data-testid="input-message"
              />
              <button 
                type="submit" 
                disabled={!userInput.trim()}
                className="gradient-bg text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 hover:scale-105"
                data-testid="button-send"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center">
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
    <div className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto p-6">
      <div className="glass-card border-white/20 shadow-2xl rounded-2xl p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 glass-card rounded-2xl flex items-center px-4 py-3 border-white/10">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              data-testid="input-message"
            />
            <button 
              type="submit" 
              disabled={!userInput.trim()}
              className="gradient-bg text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 hover:scale-105"
              data-testid="button-send"
            >
              <SendHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          <button 
            type="button"
            onClick={toggleVoiceInput}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center relative transition-all duration-300 hover:scale-110 shadow-lg ${
              listening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse-soft ring-4 ring-red-200 dark:ring-red-900/50' 
                : 'gradient-bg hover:shadow-xl ring-2 ring-blue-200 dark:ring-blue-900/50'
            }`}
            data-testid="button-voice"
          >
            {listening && (
              <div className="absolute w-full h-full rounded-2xl bg-red-400 opacity-60 animate-ping"></div>
            )}
            {listening ? (
              <StopCircle className="text-white h-6 w-6 z-10" />
            ) : (
              <Mic className="text-white h-6 w-6" />
            )}
          </button>
        </form>
        
        {listening && (
          <div className="mt-4 text-center animate-fade-in">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🎤 Listening...</p>
            <div className="flex items-center justify-center h-8 space-x-1">
              <span className="w-2 h-6 bg-gradient-to-t from-red-400 to-red-600 rounded-full animate-[wave_1s_ease-in-out_infinite]"></span>
              <span className="w-2 h-6 bg-gradient-to-t from-red-400 to-red-600 rounded-full animate-[wave_1s_ease-in-out_0.1s_infinite]"></span>
              <span className="w-2 h-6 bg-gradient-to-t from-red-400 to-red-600 rounded-full animate-[wave_1s_ease-in-out_0.2s_infinite]"></span>
              <span className="w-2 h-6 bg-gradient-to-t from-red-400 to-red-600 rounded-full animate-[wave_1s_ease-in-out_0.3s_infinite]"></span>
              <span className="w-2 h-6 bg-gradient-to-t from-red-400 to-red-600 rounded-full animate-[wave_1s_ease-in-out_0.4s_infinite]"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;
