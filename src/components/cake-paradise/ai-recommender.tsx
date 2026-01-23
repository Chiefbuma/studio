'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { personalizedCakeRecommendations } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function AiRecommender() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    const result = await personalizedCakeRecommendations();
    
    if (result.success && result.data) {
      setRecommendations(result.data);
      toast({
        title: "Voilà! Fresh Recommendations!",
        description: "We've picked out a few cakes just for you.",
      });
    } else {
      setError(result.error || 'Could not fetch recommendations.');
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "We couldn't get recommendations at this time. Please try again.",
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          <span>For You: AI Recommendations</span>
        </CardTitle>
        <CardDescription>
          Based on your (hypothetical) order history, we think you'll love these!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 && !isLoading && !error && (
           <div className="text-center p-4 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">Click the button to get your personalized cake suggestions.</p>
             <Button onClick={handleGetRecommendations} disabled={isLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                Find My Perfect Cake
             </Button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Baking up some ideas...</p>
          </div>
        )}

        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map((rec, index) => (
                <Card key={index} className="flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-lg">{rec}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-end">
                    <div className="w-full space-y-2">
                        <p className="text-xs text-muted-foreground">Is this a good suggestion?</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm"><ThumbsUp className="h-4 w-4 mr-2"/> Yes</Button>
                            <Button variant="outline" size="sm"><ThumbsDown className="h-4 w-4 mr-2"/> No</Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
             <Button onClick={handleGetRecommendations} disabled={isLoading} variant="outline" className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Get New Recommendations
             </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
