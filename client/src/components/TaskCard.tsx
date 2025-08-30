import React, { useState } from "react";
import { useAIAssistant, FoodOrderTask, TicketTask, NewsTask, DictionaryTask, WeatherTask, CurrencyTask, EntertainmentTask, WikipediaTask, TrainTask, YouTubeTask } from "@/context/AIAssistantContext";
import { Check, Utensils, Ticket, Clock, MapPin, Star, Zap, AlertCircle, Train, ArrowRight, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import NewsCard from "./NewsCard";
import { DictionaryCard } from "./DictionaryCard";
import { WeatherCard } from "./WeatherCard";
import { CurrencyCard } from "./CurrencyCard";
import { EntertainmentCard } from "./EntertainmentCard";
import { WikipediaCard } from "./WikipediaCard";
import { YouTubeCard } from "./YouTubeCard";

interface TaskCardProps {
  task: FoodOrderTask | TicketTask | NewsTask | DictionaryTask | WeatherTask | CurrencyTask | EntertainmentTask | WikipediaTask | TrainTask | YouTubeTask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { confirmTask, cancelTask, wallet, settings } = useAIAssistant();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  
  const handleConfirm = async (taskId: string) => {
    setIsProcessing(true);
    setPaymentError("");
    
    try {
      // Simply use the confirmTask function from context which handles auto payment logic
      await confirmTask(taskId);
    } catch (error) {
      console.error("Error confirming task:", error);
      setPaymentError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (task.type === "train") {
    return (
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-white/20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-xl shadow-lg">
              <Train className="text-white h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Train Ticket</h3>
          </div>
          <span className={`text-xs font-medium py-2 px-3 rounded-xl shadow-sm ${
            task.status === "pending" 
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300 ring-1 ring-yellow-300"
              : task.status === "confirmed" || task.status === "boarding"
                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 ring-1 ring-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300 ring-1 ring-red-300"
          }`}>
            {task.status === "pending" ? "🕐 Pending" : 
             task.status === "confirmed" ? "✅ Confirmed" :
             task.status === "boarding" ? "🚂 Boarding" : "❌ Cancelled"}
          </span>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{task.from}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{task.departure}</span>
              </div>
              <div className="flex flex-col items-center mx-4">
                <ArrowRight className="text-blue-500 h-5 w-5" />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.duration}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{task.to}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{task.arrival}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Train:</span>
                <p className="font-semibold text-gray-900 dark:text-white">{task.trainNumber} - {task.trainName}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Class:</span>
                <p className="font-semibold text-gray-900 dark:text-white">{task.classType}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Date:</span>
                <p className="font-semibold text-gray-900 dark:text-white">{task.date}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Distance:</span>
                <p className="font-semibold text-gray-900 dark:text-white">{task.distance}</p>
              </div>
            </div>
            
            {task.status === "confirmed" && task.pnr && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">PNR:</span>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{task.pnr}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Coach:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{task.coach}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Platform:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{task.platform}</p>
                  </div>
                </div>
                {task.seatNumbers && task.seatNumbers.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Seats:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{task.seatNumbers.join(", ")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">₹{task.price}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{task.seats} seats available</span>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Wallet balance:</span>
            <span className={`font-medium ${wallet.balance < task.price ? "text-red-500" : "text-green-500"}`}>
              ₹{wallet.balance.toFixed(2)}
            </span>
          </div>
          
          {wallet.balance < task.price && settings.autoPayment && (
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-2 rounded-lg text-sm mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-500" />
              Auto top-up will be applied to complete this payment
            </div>
          )}
          
          {paymentError && (
            <div className="glass-card border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-xl text-sm mb-4 flex items-center animate-fade-in">
              <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              <span className="font-medium">{paymentError}</span>
            </div>
          )}
          
          {task.status === "pending" && (
            <>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <p>Would you like to confirm this train booking?</p>
              </div>
              
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={() => handleConfirm(task.id)}
                  disabled={isProcessing}
                  className="flex-1 gradient-bg hover:shadow-lg text-white py-2 px-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-confirm-train"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Book Ticket
                    </>
                  )}
                </button>
                <button 
                  onClick={() => cancelTask(task.id)}
                  disabled={isProcessing}
                  className="flex-1 glass-card hover:shadow-lg text-gray-800 dark:text-white py-2 px-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-cancel-train"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          
          {task.status === "confirmed" && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span className="font-semibold text-green-800 dark:text-green-200">Ticket Booked Successfully!</span>
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-300">₹{task.price}</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your e-ticket has been sent to your registered email. Please arrive at the station 30 minutes before departure.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (task.type === "food") {
    return (
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up">
        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-white/20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500 rounded-xl shadow-lg">
              <Utensils className="text-white h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Food Order</h3>
          </div>
          <span className={`text-xs font-medium py-2 px-3 rounded-xl shadow-sm ${
            task.status === "pending" 
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300 ring-1 ring-yellow-300"
              : task.status === "confirmed" || task.status === "delivered"
                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 ring-1 ring-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300 ring-1 ring-red-300"
          }`}>
            {task.status === "pending" ? "🕐 Pending" : 
             task.status === "confirmed" ? "✅ Confirmed" :
             task.status === "delivered" ? "🚚 Delivered" : "❌ Cancelled"}
          </span>
        </div>
        
        <div className="p-4">
          {task.image && (
            <img 
              src={task.image} 
              alt={`${task.restaurant} food`} 
              className="w-full h-32 object-cover rounded-xl mb-3 shadow-md ring-1 ring-gray-200 dark:ring-gray-700"
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
            <div className="glass-card border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-xl text-sm mb-4 flex items-center animate-fade-in">
              <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              <span className="font-medium">{paymentError}</span>
            </div>
          )}
          
          {task.status === "pending" && (
            <>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <p>Would you like to confirm this order?</p>
              </div>
              
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={() => handleConfirm(task.id)}
                  disabled={isProcessing}
                  className="flex-1 gradient-bg hover:shadow-lg text-white py-2 px-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-confirm-food"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    "🍽️ Confirm Order"
                  )}
                </button>
                <button 
                  onClick={() => cancelTask(task.id)}
                  disabled={isProcessing}
                  className="flex-1 glass-card hover:shadow-lg text-gray-800 dark:text-white py-2 px-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-cancel-food"
                >
                  ❌ Cancel
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
  } else if (task.type === "youtube") {
    return (
      <YouTubeCard 
        searchQuery={task.searchQuery}
        videos={task.videos}
        selectedVideo={task.selectedVideo}
      />
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
  } else if (task.type === "weather") {
    return (
      <WeatherCard data={task} />
    );
  } else if (task.type === "currency") {
    return (
      <CurrencyCard data={task} />
    );
  } else if (task.type === "entertainment") {
    return (
      <EntertainmentCard data={task} />
    );
  } else if (task.type === "wikipedia") {
    return (
      <WikipediaCard data={task} />
    );
  }
  
  return null;
};

export default TaskCard;
