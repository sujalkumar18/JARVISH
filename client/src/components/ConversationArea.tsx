import React, { useRef, useEffect } from "react";
import { useAIAssistant, Task } from "@/context/AIAssistantContext";
import TaskCard from "@/components/TaskCard";
import { Bot, User } from "lucide-react";

const ConversationArea: React.FC = () => {
  const { messages, tasks, isTyping } = useAIAssistant();
  const conversationEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  
  const getTasksForMessage = (messageIndex: number): Task[] => {
    // Show tasks for recent assistant messages (simple approach: show latest tasks for recent messages)
    const isRecentMessage = messageIndex >= Math.max(0, messages.length - 3);
    if (isRecentMessage && tasks.length > 0) {
      // Return the most recent task if this is one of the last few messages
      return tasks.slice(-1);
    }
    return [];
  };
  
  return (
    <main className="flex-1 overflow-y-auto p-4 pb-24 bg-transparent">
      <div className="space-y-6">
        {messages.map((message, index) => (
          <div key={message.id} className="animate-fade-in">
            {message.type === "assistant" ? (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 gradient-bg rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-blue-100 dark:ring-blue-900/20">
                  <Bot className="text-white h-4 w-4" />
                </div>
                <div className="space-y-3 max-w-[85%]">
                  <div className="chat-bubble glass-card bg-white/80 dark:bg-slate-800/90 border-l-4 border-blue-500">
                    <p className="text-gray-800 dark:text-gray-100 leading-relaxed">{message.content}</p>
                  </div>
                  
                  {/* Render any tasks associated with this message */}
                  {getTasksForMessage(index).map((task) => (
                    <div key={task.id} className="animate-slide-up">
                      <TaskCard task={task} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-end space-x-3">
                <div className="gradient-bg chat-bubble max-w-[85%] shadow-lg ring-1 ring-white/20">
                  <p className="text-white font-medium">{message.content}</p>
                </div>
                <div className="w-8 h-8 glass-card rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-purple-100 dark:ring-purple-900/20">
                  <User className="text-gray-600 dark:text-gray-300 h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-4 animate-fade-in">
            <div className="w-10 h-10 gradient-bg rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-blue-100 dark:ring-blue-900/20 animate-pulse-soft">
              <Bot className="text-white h-5 w-5" />
            </div>
            <div className="chat-bubble glass-card bg-white/80 dark:bg-slate-800/90 border-l-4 border-blue-500">
              <div className="flex items-center justify-center h-6">
                <span className="w-1.5 h-4 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full mx-1 animate-[wave_1s_ease-in-out_infinite]"></span>
                <span className="w-1.5 h-4 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full mx-1 animate-[wave_1s_ease-in-out_0.1s_infinite]"></span>
                <span className="w-1.5 h-4 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full mx-1 animate-[wave_1s_ease-in-out_0.2s_infinite]"></span>
                <span className="w-1.5 h-4 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full mx-1 animate-[wave_1s_ease-in-out_0.3s_infinite]"></span>
                <span className="w-1.5 h-4 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full mx-1 animate-[wave_1s_ease-in-out_0.4s_infinite]"></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={conversationEndRef} />
      </div>
    </main>
  );
};

export default ConversationArea;
