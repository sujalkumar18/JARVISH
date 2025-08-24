import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Settings, Bot, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  walletBalance: number;
  toggleWallet: () => void;
  toggleSettings: () => void;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  walletBalance, 
  toggleWallet, 
  toggleSettings,
  user,
  onLogout
}) => {
  const { theme, toggleTheme } = useTheme();
  
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      });
      if (onLogout) {
        onLogout();
      }
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      window.location.reload();
    }
  };
  
  return (
    <header className="px-4 py-3 flex justify-between items-center border-b border-white/20 dark:border-gray-700/50 backdrop-blur-lg bg-white/10 dark:bg-slate-900/20">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center shadow-lg animate-pulse-soft">
          <Bot className="text-white h-4 w-4" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Jarvish
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          onClick={toggleWallet}
          className="flex items-center px-4 py-2 glass-card rounded-xl text-sm hover:shadow-lg transition-all duration-200 hover:scale-105"
          data-testid="button-wallet"
        >
          <svg 
            className="mr-2 h-4 w-4 text-green-500" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
          <span className="font-semibold text-gray-800 dark:text-white">
            ${walletBalance.toFixed(2)}
          </span>
        </button>
        
        <button 
          onClick={toggleTheme}
          className="p-2 glass-card rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Toggle theme"
          data-testid="button-theme-toggle"
        >
          {theme === 'dark' ? 
            <Sun className="h-5 w-5 text-yellow-500" /> : 
            <Moon className="h-5 w-5 text-indigo-600" />
          }
        </button>
        
        <button 
          onClick={toggleSettings}
          className="p-2 glass-card rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Open settings"
          data-testid="button-settings"
        >
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-10 px-3 glass-card rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs gradient-bg text-white font-semibold">
                    {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-800 dark:text-white hidden sm:block">
                  {user.firstName || ''} {user.lastName || ''}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border-white/20">
              <DropdownMenuItem className="flex items-center space-x-3 p-3">
                <User className="h-4 w-4 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{user.firstName || ''} {user.lastName || ''}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem 
                className="flex items-center space-x-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
