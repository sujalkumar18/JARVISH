import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp } from "lucide-react";

interface CurrencyCardProps {
  data: {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: string;
    convertedAmount: string;
    lastUpdated: string;
  };
}

export function CurrencyCard({ data }: CurrencyCardProps) {
  return (
    <Card className="w-full max-w-md" data-testid="card-currency">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span>Currency Exchange</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold" data-testid="text-currency-from-amount">
              {data.amount}
            </div>
            <div className="text-sm text-muted-foreground font-semibold" data-testid="text-currency-from">
              {data.fromCurrency}
            </div>
          </div>
          
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600" data-testid="text-currency-to-amount">
              {data.convertedAmount}
            </div>
            <div className="text-sm text-muted-foreground font-semibold" data-testid="text-currency-to">
              {data.toCurrency}
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Exchange Rate</span>
            <span className="font-semibold" data-testid="text-currency-rate">
              1 {data.fromCurrency} = {data.exchangeRate} {data.toCurrency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Updated</span>
            <span className="text-sm" data-testid="text-currency-updated">
              {data.lastUpdated}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}