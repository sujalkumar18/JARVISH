import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WikipediaCardProps {
  data: {
    title: string;
    extract: string;
    thumbnail: string;
    pageUrl?: string;
    lang: string;
    searchTerm: string;
  };
}

export function WikipediaCard({ data }: WikipediaCardProps) {
  return (
    <Card className="w-full max-w-2xl" data-testid="card-wikipedia">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span data-testid="text-wikipedia-title">{data.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <img 
            src={data.thumbnail}
            alt={data.title}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
            data-testid="img-wikipedia-thumbnail"
          />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-wikipedia-extract">
              {data.extract}
            </p>
          </div>
        </div>
        
        {data.pageUrl && (
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              data-testid="button-wikipedia-read-more"
              onClick={() => window.open(data.pageUrl, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Read more on Wikipedia
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
          <span>Source: Wikipedia ({data.lang?.toUpperCase()})</span>
          <span data-testid="text-wikipedia-search-term">
            Search: "{data.searchTerm}"
          </span>
        </div>
      </CardContent>
    </Card>
  );
}