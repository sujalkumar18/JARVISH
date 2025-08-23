import { apiRequest } from "@/lib/queryClient";

export interface AIResponse {
  message: string;
  intent?: string;
  action?: string;
  entities?: Record<string, any>;
}

export async function processVoiceCommand(text: string): Promise<AIResponse> {
  try {
    const response = await apiRequest("POST", "/api/assistant/process", {
      command: text,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error processing voice command:", error);
    return {
      message: "Sorry, I couldn't process your request. Please try again.",
    };
  }
}

export async function generateFoodOrder(command: string) {
  try {
    const response = await apiRequest("POST", "/api/assistant/food-order", {
      command,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error generating food order:", error);
    throw new Error("Failed to generate food order");
  }
}

export async function generateTicketBooking(command: string) {
  try {
    const response = await apiRequest("POST", "/api/assistant/ticket-booking", {
      command,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error generating ticket booking:", error);
    throw new Error("Failed to generate ticket booking");
  }
}

export async function processPayment(amount: number, description: string) {
  try {
    const response = await apiRequest("POST", "/api/wallet/process-payment", {
      amount,
      description,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error processing payment:", error);
    throw new Error("Failed to process payment");
  }
}

export async function addFundsToWallet(amount: number) {
  try {
    const response = await apiRequest("POST", "/api/wallet/add-funds", {
      amount,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error adding funds to wallet:", error);
    throw new Error("Failed to add funds to wallet");
  }
}
