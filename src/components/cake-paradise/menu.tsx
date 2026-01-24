'use client';

import Image from 'next/image';
import type { Cake } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { BackToHomeButton } from './back-to-home-button';
import { Star, Clock, ShoppingCart, BookOpen } from 'lucide-react';
import { AiRecommender } from './ai-recommender';

interface MenuProps {
  cakes: Cake[];
  onOrder: (cake: Cake) => void;
  onBack: () => void;
}

export default function Menu({ cakes, onOrder, onBack }: MenuProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-amber-50 to-background py-16 sm:py-24 px-4">
      <BackToHomeButton onBack={onBack} />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="secondary" className="mb-4 text-sm">
            <BookOpen className="w-4 h-4 mr-2"/>
            Our Collection
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Signature Creations
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            Explore our exclusive range of artisan cakes, handcrafted with love and the finest ingredients.
          </p>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {cakes.map((cake) => {
              const cakeImage = PlaceHolderImages.find(img => img.id === cake.image_id) || PlaceHolderImages[0];
              return (
                <CarouselItem key={cake.id} className="pl-4 md:basis-1/2 lg:basis-1/3 group">
                  <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 transform-gpu group-hover:scale-[1.02] group-hover:shadow-2xl">
                    <div className="relative">
                      <Image
                        src={cakeImage.imageUrl}
                        alt={cake.name}
                        width={600}
                        height={800}
                        className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                        data-ai-hint={cakeImage.imageHint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                       <Badge className="absolute top-4 left-4" variant="secondary">{cake.category}</Badge>
                       <div className="absolute top-4 right-4 bg-background/90 text-primary font-bold px-3 py-1 rounded-full text-lg shadow-md">{formatPrice(cake.base_price)}</div>
                    </div>
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-bold text-foreground">{cake.name}</h3>
                        <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{cake.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4 text-sm flex-grow">{cake.description}</p>
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-2"><ShoppingCart className="w-3 h-3" /> {cake.orders_count}+ orders</div>
                        <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> {cake.ready_time}</div>
                      </div>

                      <Button className="w-full mt-auto" onClick={() => onOrder(cake)}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Order Now
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        
        <div className="max-w-4xl mx-auto mt-16 sm:mt-24">
            <AiRecommender />
        </div>
      </div>
    </div>
  );
}
