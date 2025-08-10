import React from "react";
import Header from "@/components/Header";
import ConversationArea from "@/components/ConversationArea";
import VoiceInput from "@/components/VoiceInput";
import WalletPanel from "@/components/WalletPanel";
import SettingsPanel from "@/components/SettingsPanel";
import { useAIAssistant } from "@/context/AIAssistantContext";

const Home: React.FC = () => {
  const { wallet, settings, updateSettings } = useAIAssistant();
  const [isWalletOpen, setIsWalletOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  
  const toggleWallet = () => {
    setIsWalletOpen(prev => !prev);
    if (isSettingsOpen) setIsSettingsOpen(false);
  };
  
  const toggleSettings = () => {
    setIsSettingsOpen(prev => !prev);
    if (isWalletOpen) setIsWalletOpen(false);
  };
  
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-light-gray dark:bg-dark-gray transition-colors duration-200">
      <Header 
        walletBalance={wallet.balance}
        toggleWallet={toggleWallet}
        toggleSettings={toggleSettings}
      />
      
      <ConversationArea />
      
      <VoiceInput />
      
      <WalletPanel 
        isOpen={isWalletOpen}
        closeWallet={() => setIsWalletOpen(false)}
        wallet={wallet}
      />
      
      <SettingsPanel 
        isOpen={isSettingsOpen}
        closeSettings={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
};

export default Home;
