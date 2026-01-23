'use client';

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Home } from "lucide-react";

interface BackToHomeButtonProps {
  onBack: () => void;
}

export function BackToHomeButton({ onBack }: BackToHomeButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 bg-card/80 backdrop-blur-sm rounded-full shadow-lg h-12 w-12 hover:scale-110 transition-transform"
          >
            <Home className="h-6 w-6 text-primary" />
            <span className="sr-only">Return to Home</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Return to Home</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
