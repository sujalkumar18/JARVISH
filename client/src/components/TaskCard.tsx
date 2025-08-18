import React, { useState } from "react";
import { useAIAssistant, FoodOrderTask, TicketTask, NewsTask, DictionaryTask } from "@/context/AIAssistantContext";
import { Check, Utensils, Ticket, Clock, MapPin, Star, Zap, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import NewsCard from "./NewsCard";
import { DictionaryCard } from "./DictionaryCard";

interface TaskCardProps {
  task: FoodOrderTask | TicketTask | NewsTask | DictionaryTask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { confirmTask, cancelTask, wallet, settings } = useAIAssistant();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  
  const handleConfirm = async (taskId: string) => {
    setIsProcessing(true);
    setPaymentError("");
    
    try {
      // Check if we need auto top-up
      const taskTotal = (task as any).total || 0;
      
      if (wallet.balance < taskTotal) {
        // Insufficient balance, need to check if auto top-up is enabled
        if (!settings.autoPayment) {
          setPaymentError("Insufficient funds. Enable auto top-up or add funds to your wallet.");
          setIsProcessing(false);
          return;
        }
        
        // Process payment with auto top-up
        const response = await apiRequest("POST", "/api/wallet/process-payment", {
          amount: taskTotal,
          description: task.type === "food" ? (task as FoodOrderTask).restaurant : "Movie Tickets",
          autoTopUp: true
        });
        
        const result = await response.json();
        
        if (!result.success) {
          setPaymentError(result.message || "Payment failed");
          setIsProcessing(false);
          return;
        }
        
        // If payment was successful, continue with the confirmation
        await confirmTask(taskId);
      } else {
        // Sufficient balance, proceed normally
        await confirmTask(taskId);
      }
    } catch (error) {
      console.error("Error confirming task:", error);
      setPaymentError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (task.type === "food") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Utensils className="text-primary h-4 w-4" />
            <h3 className="font-medium text-gray-800 dark:text-white">Food Order</h3>
          </div>
          <span className={`text-xs py-1 px-2 rounded-full ${
            task.status === "pending" 
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
              : task.status === "confirmed" || task.status === "delivered"
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          }`}>
            {task.status === "pending" ? "Pending" : 
             task.status === "confirmed" ? "Confirmed" :
             task.status === "delivered" ? "Delivered" : "Cancelled"}
          </span>
        </div>
        
        <div className="p-4">
          {task.image && (
            <img 
              src={task.image} 
              alt={`${task.restaurant} food`} 
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}
          
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white">{task.restaurant}</h4>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Star className="text-yellow-400 h-3 w-3 mr-1" fill="currentColor" />
                <span>{task.rating}</span>
                <span className="mx-1">•</span>
                <span>{task.deliveryTime}</span>
                <span className="mx-1">•</span>
                <span>{task.distance}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">${task.total - task.deliveryFee}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Delivery: ${task.deliveryFee}</p>
            </div>
          </div>
          
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-3 my-2">
            {task.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  {item.quantity} × {item.name}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Balance information */}
          <div className="flex justify-between items-center mt-3 mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total amount:</span>
            <span className="font-medium text-gray-900 dark:text-white">${task.total.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Wallet balance:</span>
            <span className={`font-medium ${wallet.balance < task.total ? "text-red-500" : "text-green-500"}`}>
              ${wallet.balance.toFixed(2)}
            </span>
          </div>
          
          {wallet.balance < task.total && settings.autoPayment && (
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-2 rounded-lg text-sm mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-500" />
              Auto top-up will be applied to complete this payment
            </div>
          )}
          
          {paymentError && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-2 rounded-lg text-sm mb-3 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              {paymentError}
            </div>
          )}
          
          {task.status === "pending" && (
            <>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <p>Would you like to confirm this order?</p>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button 
                  onClick={() => handleConfirm(task.id)}
                  disabled={isProcessing}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </button>
                <button 
                  onClick={() => cancelTask(task.id)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          
          {task.status === "confirmed" && (
            <>
              <div className="flex justify-between items-start mb-3">
                <div>
                  {task.orderNumber && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order #{task.orderNumber}</p>
                  )}
                </div>
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Check className="mr-1 h-3 w-3" />
                  <span>Paid ${task.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>Delivery by {task.deliveryTime}</span>
                </div>
                <a href="#" className="text-primary hover:underline">Track Order</a>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your food is being prepared and will be delivered to your saved address.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  } else if (task.type === "ticket") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Ticket className="text-pink-500 h-4 w-4" />
            <h3 className="font-medium text-gray-800 dark:text-white">Movie Tickets</h3>
          </div>
          <span className={`text-xs py-1 px-2 rounded-full ${
            task.status === "select" 
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
              : task.status === "confirmed"
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          }`}>
            {task.status === "select" ? "Select Options" : 
             task.status === "confirmed" ? "Confirmed" : "Cancelled"}
          </span>
        </div>
        
        <div className="p-4">
          {task.image && (
            <img 
              src={task.image} 
              alt="Movie theater entrance with displays" 
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}
          
          {task.status === "select" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Movie
                </label>
                <div className="flex overflow-x-auto pb-2 -mx-1 space-x-2">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex-shrink-0 w-36 cursor-pointer border-2 border-primary">
                    <h4 className="font-medium text-sm">{task.options.movie}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Action • PG-13</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex-shrink-0 w-36 cursor-pointer">
                    <h4 className="font-medium text-sm">Dune</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sci-Fi • PG-13</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex-shrink-0 w-36 cursor-pointer">
                    <h4 className="font-medium text-sm">No Time To Die</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Action • PG-13</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center cursor-pointer">
                    <p className="text-sm font-medium">5:30 PM</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center cursor-pointer border-2 border-primary">
                    <p className="text-sm font-medium">{task.options.time}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center cursor-pointer">
                    <p className="text-sm font-medium">10:30 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center space-x-3">
                  <button className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300">-</span>
                  </button>
                  <span className="text-lg font-medium text-gray-800 dark:text-white">
                    {task.options.tickets}
                  </span>
                  <button className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300">+</span>
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    {task.options.tickets} Tickets × ${task.ticketPrice.toFixed(2)}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${(task.options.tickets * task.ticketPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                  <span className="text-gray-600 dark:text-gray-400">${task.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium mt-2">
                  <span className="text-gray-800 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">${task.total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Balance information */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Wallet balance:</span>
                <span className={`font-medium ${wallet.balance < task.total ? "text-red-500" : "text-green-500"}`}>
                  ${wallet.balance.toFixed(2)}
                </span>
              </div>
              
              {wallet.balance < task.total && settings.autoPayment && (
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-2 rounded-lg text-sm mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-blue-500" />
                  Auto top-up will be applied to complete this payment
                </div>
              )}
              
              {paymentError && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-2 rounded-lg text-sm mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  {paymentError}
                </div>
              )}
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleConfirm(task.id)}
                  disabled={isProcessing}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    "Book Tickets"
                  )}
                </button>
                <button 
                  onClick={() => cancelTask(task.id)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          
          {task.status === "confirmed" && (
            <>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{task.venue}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {task.options.movie} - {task.options.time}
                  </p>
                </div>
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Check className="mr-1 h-3 w-3" />
                  <span>Paid ${task.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  <span>Screen 4, Row H, Seats 12-{11 + task.options.tickets}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your tickets have been booked. Please show the QR code at the entrance.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  } else if (task.type === "news") {
    return (
      <NewsCard 
        articles={task.articles}
        category={task.category}
      />
    );
  } else if (task.type === "dictionary") {
    return (
      <DictionaryCard task={task} />
    );
  }
  
  return null;
};

export default TaskCard;
