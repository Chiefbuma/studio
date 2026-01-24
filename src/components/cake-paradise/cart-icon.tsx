'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function CartIcon() {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <Button
      onClick={() => setIsCartOpen(true)}
      variant="outline"
      size="icon"
      className="fixed bottom-4 right-4 z-50 bg-card/80 backdrop-blur-sm rounded-full shadow-lg h-16 w-16 hover:scale-110 transition-transform"
    >
      <ShoppingCart className="h-8 w-8 text-primary" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full text-xs"
        >
          {itemCount}
        </Badge>
      )}
      <span className="sr-only">Open Cart</span>
    </Button>
  );
}
