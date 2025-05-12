import React from "react";
import { X, Moon, Volume2, Sliders, CreditCard, Bell, History } from "lucide-react";
import { SettingsState } from "@/context/AIAssistantContext";
import { useAIAssistant } from "@/context/AIAssistantContext";

interface SettingsPanelProps {
  isOpen: boolean;
  closeSettings: () => void;
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  closeSettings, 
  settings, 
  updateSettings 
}) => {
  const { clearHistory } = useAIAssistant();
  
  if (!isOpen) return null;
  
  const handleToggleChange = (setting: keyof SettingsState) => {
    updateSettings({
      [setting]: !settings[setting as keyof SettingsState]
    });
  };
  
  const handleVoiceSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      voiceSpeed: Number(e.target.value)
    });
  };
  
  const getVoiceSpeedLabel = (speed: number) => {
    switch (speed) {
      case 0.5: return "Slow";
      case 0.75: return "Relaxed";
      case 1: return "Normal";
      case 1.25: return "Fast";
      case 1.5: return "Rapid";
      default: return "Normal";
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center">
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-xl max-w-md mx-auto p-5 shadow-lg transform transition-transform duration-300"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h2>
          <button 
            onClick={closeSettings}
            className="text-gray-500 dark:text-gray-400"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-5">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Appearance</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Moon className="text-gray-600 dark:text-gray-400 mr-3 h-5 w-5" />
                <span className="text-gray-800 dark:text-white">Dark Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  className="sr-only peer"
                  checked={document.documentElement.classList.contains('dark')}
                  onChange={() => document.dispatchEvent(new CustomEvent('toggleTheme'))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Voice & Speech</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <Volume2 className="text-gray-600 dark:text-gray-400 mr-3 h-5 w-5" />
                  <span className="text-gray-800 dark:text-white">Voice Responses</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.voiceResponses}
                    onChange={() => handleToggleChange('voiceResponses')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Sliders className="text-gray-600 dark:text-gray-400 mr-3 h-5 w-5" />
                    <span className="text-gray-800 dark:text-white">Voice Speed</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getVoiceSpeedLabel(settings.voiceSpeed)}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.25" 
                  value={settings.voiceSpeed} 
                  onChange={handleVoiceSpeedChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Payment</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="text-gray-600 dark:text-gray-400 mr-3 h-5 w-5" />
                  <span className="text-gray-800 dark:text-white">Auto-Payment</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.autoPayment}
                    onChange={() => handleToggleChange('autoPayment')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <Bell className="text-gray-600 dark:text-gray-400 mr-3 h-5 w-5" />
                  <span className="text-gray-800 dark:text-white">Payment Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.paymentNotifications}
                    onChange={() => handleToggleChange('paymentNotifications')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Privacy</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <History className="text-gray-600 dark:text-gray-400 mr-3 h-5 w-5" />
                  <span className="text-gray-800 dark:text-white">Save Conversation History</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.saveHistory}
                    onChange={() => handleToggleChange('saveHistory')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <button 
                onClick={clearHistory}
                className="w-full text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Clear All Conversation History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
