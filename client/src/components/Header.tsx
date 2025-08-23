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
    <header className="px-4 py-3 flex justify-between items-center border-b dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Bot className="text-white h-4 w-4" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Jarvish</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleWallet}
          className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
        >
          <svg 
            className="mr-2 h-4 w-4 text-primary" 
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
          <span className="font-medium text-gray-700 dark:text-gray-300">
            ${walletBalance.toFixed(2)}
          </span>
        </button>
        
        <button 
          onClick={toggleTheme}
          className="text-gray-600 dark:text-gray-300 p-1"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        <button 
          onClick={toggleSettings}
          className="text-gray-600 dark:text-gray-300 p-1"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-8 px-2 bg-gray-100 dark:bg-gray-800">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary text-white">
                    {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user.firstName || ''} {user.lastName || ''}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.firstName || ''} {user.lastName || ''}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center space-x-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
