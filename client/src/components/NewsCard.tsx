import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Newspaper } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: string;
}

interface NewsCardProps {
  articles: NewsArticle[];
  category: string;
  onReadMore?: (url: string) => void;
}

export default function NewsCard({ articles, category, onReadMore }: NewsCardProps) {
  const handleReadMore = (url: string) => {
    if (onReadMore) {
      onReadMore(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sports': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'technology': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'business': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'health': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'science': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'entertainment': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg" data-testid="card-news">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Latest News</CardTitle>
          </div>
          <Badge className={getCategoryColor(category)} data-testid="badge-news-category">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
        </div>
        <CardDescription>
          Here are the latest headlines
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {articles.map((article, index) => (
          <div 
            key={index} 
            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            data-testid={`news-article-${index}`}
          >
            <div className="flex gap-4">
              {article.urlToImage && (
                <div className="flex-shrink-0">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title}
                    className="w-20 h-20 object-cover rounded-md"
                    data-testid={`img-article-${index}`}
                  />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <h3 
                  className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100"
                  data-testid={`title-article-${index}`}
                >
                  {article.title}
                </h3>
                
                <p 
                  className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2"
                  data-testid={`description-article-${index}`}
                >
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Badge variant="outline" className="text-xs" data-testid={`source-article-${index}`}>
                      {article.source}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span data-testid={`time-article-${index}`}>
                        {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReadMore(article.url)}
                    className="text-xs"
                    data-testid={`button-read-more-${index}`}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Read More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}