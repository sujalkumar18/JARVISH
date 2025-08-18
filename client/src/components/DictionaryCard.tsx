import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Volume2 } from "lucide-react";
import { DictionaryTask } from "@/context/AIAssistantContext";
import { Button } from "@/components/ui/button";

interface DictionaryCardProps {
  task: DictionaryTask;
}

export function DictionaryCard({ task }: DictionaryCardProps) {
  const playPronunciation = () => {
    if (task.phonetic) {
      // Use speech synthesis to pronounce the word
      const utterance = new SpeechSynthesisUtterance(task.word);
      utterance.rate = 0.8; // Slightly slower for better clarity
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800" data-testid={`card-dictionary-${task.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100" data-testid={`text-word-${task.word}`}>
                {task.word}
              </CardTitle>
              {task.phonetic && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-phonetic-${task.word}`}>
                    {task.phonetic}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6"
                    onClick={playPronunciation}
                    data-testid={`button-pronounce-${task.word}`}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {task.meanings.map((meaning, meaningIndex) => (
          <div key={meaningIndex} className="space-y-3">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700" data-testid={`badge-part-of-speech-${meaningIndex}`}>
              {meaning.partOfSpeech}
            </Badge>
            
            <div className="space-y-4">
              {meaning.definitions.map((definition, defIndex) => (
                <div key={defIndex} className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed" data-testid={`text-definition-${meaningIndex}-${defIndex}`}>
                    <span className="font-medium">Definition:</span> {definition.definition}
                  </p>
                  
                  {definition.example && (
                    <p className="text-gray-600 dark:text-gray-400 italic pl-4 border-l-2 border-gray-300 dark:border-gray-600" data-testid={`text-example-${meaningIndex}-${defIndex}`}>
                      <span className="font-medium not-italic">Example:</span> "{definition.example}"
                    </p>
                  )}
                  
                  {(definition.synonyms && definition.synonyms.length > 0) && (
                    <div className="flex flex-wrap items-center space-x-2">
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Synonyms:</span>
                      <div className="flex flex-wrap gap-1">
                        {definition.synonyms.map((synonym, synIndex) => (
                          <Badge key={synIndex} variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" data-testid={`badge-synonym-${meaningIndex}-${defIndex}-${synIndex}`}>
                            {synonym}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(definition.antonyms && definition.antonyms.length > 0) && (
                    <div className="flex flex-wrap items-center space-x-2">
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">Antonyms:</span>
                      <div className="flex flex-wrap gap-1">
                        {definition.antonyms.map((antonym, antIndex) => (
                          <Badge key={antIndex} variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" data-testid={`badge-antonym-${meaningIndex}-${defIndex}-${antIndex}`}>
                            {antonym}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {defIndex < meaning.definitions.length - 1 && (
                    <Separator className="my-3" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}