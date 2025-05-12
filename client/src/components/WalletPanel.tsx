import React, { useState } from "react";
import { WalletState } from "@/context/AIAssistantContext";
import { X, Plus, ArrowLeftRight, CreditCard, Zap, Coins } from "lucide-react";
import { formatDistance } from "date-fns";
import { useAIAssistant } from "@/context/AIAssistantContext";
import { apiRequest } from "@/lib/queryClient";

interface WalletPanelProps {
  isOpen: boolean;
  closeWallet: () => void;
  wallet: WalletState;
}

const WalletPanel: React.FC<WalletPanelProps> = ({ 
  isOpen, 
  closeWallet, 
  wallet 
}) => {
  const { updateWalletBalance, settings, updateSettings } = useAIAssistant();
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [addAmount, setAddAmount] = useState("50");
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "food":
        return <svg className="text-primary" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 11h.01M11 15h.01M16 16h.01M11 11h.01M13 13h.01M18 18.01l-5-2.001-5 2.001V7.999l5-2 5 2.001v10.011z"></path><path d="M12 2a3 3 0 0 0-3 3v7h6V5a3 3 0 0 0-3-3z"></path><path d="M12 2v8m0 4v10"></path></svg>;
      case "ticket":
        return <svg className="text-pink-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>;
      case "topup":
        return <Plus className="text-green-500" />;
      default:
        return <ArrowLeftRight className="text-gray-500" />;
    }
  };

  const handleAddFunds = async () => {
    setIsLoading(true);
    try {
      const amount = parseFloat(addAmount);
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }
      
      const response = await apiRequest("POST", "/api/wallet/add-funds", {
        amount
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the wallet state
        await updateWalletBalance(amount);
        setIsAddingFunds(false);
        setAddAmount("50");
      }
    } catch (error) {
      console.error("Error adding funds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoTopUp = () => {
    updateSettings({
      autoPayment: !settings.autoPayment
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center">
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-xl max-w-md mx-auto p-5 shadow-lg transform transition-transform duration-300"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Wallet</h2>
          <button 
            onClick={closeWallet}
            className="text-gray-500 dark:text-gray-400"
            aria-label="Close wallet"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Balance card */}
        <div className="bg-gradient-to-r from-primary to-pink-500 rounded-xl p-5 text-white mb-5">
          <p className="text-sm opacity-80 mb-1">Available Balance</p>
          <h3 className="text-3xl font-bold mb-3">${wallet.balance.toFixed(2)}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsAddingFunds(true)} 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg text-sm flex items-center"
              disabled={isAddingFunds}
            >
              <Plus className="mr-1 h-4 w-4" />
              <span>Add Money</span>
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg text-sm flex items-center">
              <ArrowLeftRight className="mr-1 h-4 w-4" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
        
        {/* Add Funds form */}
        {isAddingFunds && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-5 animate-in fade-in">
            <h4 className="font-medium text-gray-800 dark:text-white mb-3">Add Funds to Wallet</h4>
            <div className="relative mb-3">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                min="5"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2 px-4 pl-8 text-gray-800 dark:text-white"
              />
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setAddAmount("50")}
                className={`flex-1 py-1.5 rounded-lg text-sm ${addAmount === "50" ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-900'}`}
              >
                $50
              </button>
              <button 
                onClick={() => setAddAmount("100")}
                className={`flex-1 py-1.5 rounded-lg text-sm ${addAmount === "100" ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-900'}`}
              >
                $100
              </button>
              <button 
                onClick={() => setAddAmount("200")}
                className={`flex-1 py-1.5 rounded-lg text-sm ${addAmount === "200" ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-900'}`}
              >
                $200
              </button>
            </div>
            <div className="flex space-x-2 mt-3">
              <button 
                onClick={handleAddFunds}
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded-lg font-medium flex items-center justify-center"
              >
                {isLoading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                ) : (
                  <Coins className="mr-2 h-4 w-4" />
                )}
                <span>Add Funds</span>
              </button>
              <button 
                onClick={() => setIsAddingFunds(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Auto Top-up Settings */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="text-yellow-500 mr-3 h-5 w-5" />
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Auto Top-up</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically adds money when balance is low
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                className="sr-only peer"
                checked={settings.autoPayment}
                onChange={handleToggleAutoTopUp}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
          {settings.autoPayment && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              When enabled, your wallet will automatically add funds in $50 increments if your balance is too low to complete a transaction.
            </div>
          )}
        </div>

        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Transactions</h3>
        <div className="space-y-3 mb-5">
          {wallet.transactions.length > 0 ? (
            wallet.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    transaction.type === "food" ? "bg-primary bg-opacity-10" :
                    transaction.type === "ticket" ? "bg-pink-500 bg-opacity-10" :
                    transaction.type === "topup" ? "bg-green-500 bg-opacity-10" :
                    "bg-gray-500 bg-opacity-10"
                  }`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">{transaction.description}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistance(new Date(transaction.date), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <span className={`font-medium ${
                  transaction.amount < 0 ? "text-gray-800 dark:text-white" : "text-green-500"
                }`}>
                  {transaction.amount < 0 ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No recent transactions
            </p>
          )}
        </div>
        
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Methods</h3>
        <div className="space-y-3">
          {wallet.paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                {method.type === "visa" ? (
                  <svg className="text-blue-600 mr-3" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M14.0696 8.11969L10.3296 15.8997H8.37964L6.51964 9.8397C6.41964 9.4797 6.25964 9.3297 5.93964 9.1697C5.40964 8.9197 4.55964 8.6797 3.83964 8.5297L3.87964 8.1197H7.01964C7.41964 8.1197 7.75964 8.3697 7.84964 8.8097L8.77964 13.5497L11.1696 8.1197H14.0696V8.11969ZM20.1596 13.1697C20.1696 11.5197 17.9896 11.3797 18.0096 10.5297C18.0196 10.2197 18.3196 9.8897 18.9796 9.7997C19.3096 9.7597 20.1196 9.7297 21.0496 10.1597L21.4096 8.4997C20.9596 8.3297 20.3796 8.1597 19.6496 8.1597C16.9996 8.1597 15.1296 9.5197 15.1096 11.4997C15.0896 12.9297 16.4296 13.7197 17.4396 14.1997C18.4896 14.6897 18.8396 15.0197 18.8296 15.4697C18.8196 16.1497 18.0296 16.4397 17.2896 16.4497C16.0796 16.4697 15.3896 16.0597 14.8296 15.7597L14.4496 17.4697C15.0096 17.7697 16.0496 18.0397 17.1296 18.0497C19.9396 18.0497 21.7896 16.7097 21.7996 14.5997C21.8196 13.5097 21.2796 12.6497 20.1596 13.1697V13.1697ZM25.5396 15.8997H27.7396L25.8896 8.1197H23.9396C23.5896 8.1197 23.2796 8.3497 23.1496 8.6797L19.9396 15.8997H22.7796L23.2296 14.5897H26.2496L26.5396 15.8997H25.5396ZM23.8496 12.9297L25.1396 9.7197L25.8696 12.9297H23.8496ZM16.0696 8.1197L13.8296 15.8997H11.1296L13.3696 8.1197H16.0696Z"></path></svg>
                ) : (
                  <svg className="text-orange-600 mr-3" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8.58753 16.5473H5.41323V7.45166H8.58753V16.5473ZM7.00038 6.11916C5.88724 6.11916 5 5.3873 5 4.27916C5.00033 3.78894 5.19191 3.32115 5.53358 2.97982C5.87525 2.63849 6.34313 2.44708 6.83324 2.44666C7.32334 2.44624 7.7915 2.63683 8.13374 2.97762C8.47598 3.31841 8.66843 3.78582 8.66967 4.27604C8.67091 4.76627 8.48027 5.2347 8.13934 5.57703C7.79841 5.91936 7.33104 6.11151 6.84094 6.11272L7.00038 6.11916ZM19.0004 16.5473H15.8295V12.2757C15.8295 11.0938 15.808 9.53769 14.1445 9.53769C12.4564 9.53769 12.2077 10.8419 12.2077 12.1892V16.547H9.03386V7.45166H11.9704V8.78416H12.0143C12.481 8.02071 13.4751 7.22166 14.9439 7.22166C18.1511 7.22166 19 9.43325 19 12.3092L19.0004 16.5473Z"></path></svg>
                )}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {method.type === "visa" ? "Visa" : "Mastercard"} ending in {method.last4}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Expires {method.expiryDate}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full ${
                method.isDefault ? "bg-primary flex items-center justify-center" : "border border-gray-300 dark:border-gray-600"
              }`}>
                {method.isDefault && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
            </div>
          ))}
          
          <button className="w-full mt-2 flex items-center justify-center text-primary py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Add Payment Method</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletPanel;
