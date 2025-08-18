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
    if (task.phonetic && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Use speech synthesis to pronounce the word
      const utterance = new SpeechSynthesisUtterance(task.word);
      utterance.rate = 0.8; // Slightly slower for better clarity
      window.speechSynthesis.speak(utterance);
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
        {/* Translations Section */}
        {task.translations && task.translations.length > 0 && (
          <div className="space-y-4">
            {task.translations.map((translation, transIndex) => (
              <div key={transIndex} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                    {translation.languageName} Translation
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <p className="text-lg font-semibold text-green-800 dark:text-green-200" data-testid={`text-translation-${transIndex}`}>
                      {translation.translatedWord}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                      onClick={() => {
                        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          const utterance = new SpeechSynthesisUtterance(translation.translatedWord);
                          utterance.lang = translation.language;
                          utterance.rate = 0.8;
                          window.speechSynthesis.speak(utterance);
                        }
                      }}
                      data-testid={`button-pronounce-translation-${transIndex}`}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {translation.translatedDefinitions && translation.translatedDefinitions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Translated Definitions:</p>
                      {translation.translatedDefinitions.map((def, defIndex) => (
                        <p key={defIndex} className="text-sm text-green-600 dark:text-green-400 pl-2 border-l border-green-300 dark:border-green-700" data-testid={`text-translated-definition-${transIndex}-${defIndex}`}>
                          {def}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Dictionary Meanings Section */}
        {task.meanings && task.meanings.length > 0 && task.meanings.map((meaning, meaningIndex) => (
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