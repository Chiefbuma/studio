'use client';

import Link from 'next/link';
import { Cake, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AppHeader() {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex justify-between items-center py-3 px-4 md:px-8">
        <Link href="/" onClick={() => window.location.reload()} className="flex items-center gap-2 font-bold text-lg text-primary">
          <Cake className="h-6 w-6" />
          <span>WhiskeDelights</span>
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
            Admin Panel
          </Link>
          <Button
            onClick={() => setIsCartOpen(true)}
            variant="ghost"
            size="icon"
            className="relative h-10 w-10"
          >
            <ShoppingCart className="h-6 w-6 text-primary" />
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs p-0"
              >
                {itemCount}
              </Badge>
            )}
            <span className="sr-only">Open Cart</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
