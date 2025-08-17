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
    <main className="flex-1 overflow-y-auto p-4 pb-24">
      <div className="space-y-6">
        {messages.map((message, index) => (
          <div key={message.id}>
            {message.type === "assistant" ? (
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white h-4 w-4" />
                </div>
                <div className="space-y-3 max-w-[85%]">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-800 dark:text-gray-200">{message.content}</p>
                  </div>
                  
                  {/* Render any tasks associated with this message */}
                  {getTasksForMessage(index).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-end space-x-2">
                <div className="bg-primary rounded-lg p-3 max-w-[85%]">
                  <p className="text-white">{message.content}</p>
                </div>
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white h-4 w-4" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-center h-6">
                <span className="w-1 h-3 bg-primary rounded mx-0.5 animate-[wave_1s_ease-in-out_infinite]"></span>
                <span className="w-1 h-3 bg-primary rounded mx-0.5 animate-[wave_1s_ease-in-out_0.1s_infinite]"></span>
                <span className="w-1 h-3 bg-primary rounded mx-0.5 animate-[wave_1s_ease-in-out_0.2s_infinite]"></span>
                <span className="w-1 h-3 bg-primary rounded mx-0.5 animate-[wave_1s_ease-in-out_0.3s_infinite]"></span>
                <span className="w-1 h-3 bg-primary rounded mx-0.5 animate-[wave_1s_ease-in-out_0.4s_infinite]"></span>
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
