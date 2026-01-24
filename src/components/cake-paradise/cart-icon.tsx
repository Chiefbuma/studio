'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * A floating icon that displays the number of items in the cart
 * and opens the cart sheet when clicked.
 */
export function CartIcon() {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <Button
      onClick={() => setIsCartOpen(true)}
      variant="outline"
      size="icon"
      className="fixed top-5 right-5 z-50 bg-card/80 backdrop-blur-sm rounded-full shadow-lg h-14 w-14 hover:scale-110 transition-transform"
    >
      <ShoppingCart className="h-7 w-7 text-primary" />
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
