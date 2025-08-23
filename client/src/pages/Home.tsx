import React from "react";
import Header from "@/components/Header";
import ConversationArea from "@/components/ConversationArea";
import VoiceInput from "@/components/VoiceInput";
import WalletPanel from "@/components/WalletPanel";
import SettingsPanel from "@/components/SettingsPanel";
import { useAIAssistant } from "@/context/AIAssistantContext";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

const Home: React.FC = () => {
  const { wallet, settings, updateSettings } = useAIAssistant();
  const [isWalletOpen, setIsWalletOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    // Get current user info
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // User not authenticated, will be handled by App component
      });
  }, []);
  
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
        user={user}
        onLogout={() => setUser(null)}
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
