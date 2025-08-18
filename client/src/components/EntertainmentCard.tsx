import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Quote } from "lucide-react";

interface EntertainmentCardProps {
  data: {
    contentType: "joke" | "quote";
    content: string;
    author?: string;
    category?: string;
    tags?: string[];
  };
}

export function EntertainmentCard({ data }: EntertainmentCardProps) {
  const isJoke = data.contentType === "joke";
  
  return (
    <Card className="w-full max-w-lg" data-testid="card-entertainment">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isJoke ? (
            <>
              <Smile className="w-5 h-5 text-yellow-500" />
              <span>Joke</span>
            </>
          ) : (
            <>
              <Quote className="w-5 h-5 text-blue-500" />
              <span>Inspirational Quote</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`text-lg ${isJoke ? 'font-normal' : 'font-medium italic'}`}>
          {isJoke && <span className="text-2xl">"</span>}
          <span data-testid="text-entertainment-content">{data.content}</span>
          {isJoke && <span className="text-2xl">"</span>}
        </div>
        
        {data.author && (
          <div className="text-right text-sm text-muted-foreground" data-testid="text-entertainment-author">
            — {data.author}
          </div>
        )}
        
        {data.category && isJoke && (
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold">Category:</span>
            <span className="ml-1" data-testid="text-entertainment-category">
              {data.category}
            </span>
          </div>
        )}
        
        {data.tags && data.tags.length > 0 && !isJoke && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                data-testid={`tag-entertainment-${index}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}