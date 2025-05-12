import { useCallback } from "react";

interface SpeechSynthesisHook {
  speak: (text: string, rate?: number) => void;
  cancel: () => void;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const synth = window.speechSynthesis;
  
  const speak = useCallback((text: string, rate: number = 1) => {
    if (!synth) return;
    
    // Cancel any ongoing speech
    synth.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure options
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Use a female voice if available
    const voices = synth.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Google UK English Female')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Speak the utterance
    synth.speak(utterance);
  }, [synth]);
  
  const cancel = useCallback(() => {
    if (!synth) return;
    synth.cancel();
  }, [synth]);
  
  const isPaused = synth ? synth.paused : false;
  
  const pause = useCallback(() => {
    if (!synth) return;
    synth.pause();
  }, [synth]);
  
  const resume = useCallback(() => {
    if (!synth) return;
    synth.resume();
  }, [synth]);
  
  return {
    speak,
    cancel,
    isPaused,
    pause,
    resume
  };
}
