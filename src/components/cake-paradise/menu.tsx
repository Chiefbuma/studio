'use client';

import Image from 'next/image';
import type { Cake } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { BackToHomeButton } from './back-to-home-button';
import { Star, Clock, ShoppingCart, BookOpen, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MenuProps {
  cakes: Cake[];
  onOrder: (cake: Cake) => void;
  onBack: () => void;
}

const CakeCard = ({ cake, onOrder }: { cake: Cake, onOrder: (cake: Cake) => void }) => {
    const cakeImage = PlaceHolderImages.find(img => img.id === cake.image_id) || PlaceHolderImages[0];
    return (
        <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 transform-gpu w-full shadow-xl">
            <div className="relative">
                <Image
                    src={cakeImage.imageUrl}
                    alt={cake.name}
                    width={600}
                    height={800}
                    className="w-full h-80 object-cover"
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
                <p className="text-muted-foreground mb-4 text-sm flex-grow line-clamp-3">{cake.description}</p>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2"><ShoppingCart className="w-3 h-3" /> {cake.orders_count}+ orders</div>
                    <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> {cake.ready_time}</div>
                </div>

                <Button className="w-full mt-auto" onClick={() => onOrder(cake)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Customize
                </Button>
            </CardContent>
        </Card>
    );
};


export default function Menu({ cakes, onOrder, onBack }: MenuProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const isMobile = useIsMobile();
    const [isInteracting, setIsInteracting] = useState(false);

    const nextSlide = () => {
        setIsInteracting(true);
        setCurrentSlide((prev) => (prev === cakes.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setIsInteracting(true);
        setCurrentSlide((prev) => (prev === 0 ? cakes.length - 1 : prev - 1));
    };

    useEffect(() => {
        const interactionTimer = setTimeout(() => setIsInteracting(false), 5000);
        return () => clearTimeout(interactionTimer);
    }, [currentSlide]);
    
    useEffect(() => {
        if (isInteracting) return;
        const autoplay = setInterval(nextSlide, 5000);
        return () => clearInterval(autoplay);
    }, [isInteracting, cakes.length]);
    
    if (!cakes || cakes.length === 0) {
        return <div>Loading cakes...</div>
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-background via-amber-50 to-background py-16 sm:py-24 px-4 overflow-x-hidden">
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

                {isMobile ? (
                    // Mobile: Simple Swiper
                    <div className="relative w-full max-w-sm mx-auto h-[550px] flex items-center justify-center">
                         <AnimatePresence initial={false}>
                            <motion.div
                                key={currentSlide}
                                className="w-full absolute"
                                initial={{ x: '100%', opacity: 0, scale: 0.8 }}
                                animate={{ x: '0%', opacity: 1, scale: 1 }}
                                exit={{ x: '-100%', opacity: 0, scale: 0.8 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <CakeCard cake={cakes[currentSlide]} onOrder={onOrder} />
                            </motion.div>
                        </AnimatePresence>
                         <Button onClick={prevSlide} size="icon" variant="outline" className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10 rounded-full h-10 w-10"><ChevronLeft /></Button>
                         <Button onClick={nextSlide} size="icon" variant="outline" className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10 rounded-full h-10 w-10"><ChevronRight /></Button>
                    </div>
                ) : (
                    // Desktop: 3D Perspective Carousel
                    <div className="relative w-full h-[550px] flex items-center justify-center" style={{ perspective: '1200px' }}>
                        <AnimatePresence>
                            {cakes.map((cake, index) => {
                                const distance = index - currentSlide;
                                let circularDistance = distance;
                                const half = cakes.length / 2;
                                if (distance > half) {
                                    circularDistance = distance - cakes.length;
                                } else if (distance < -half) {
                                    circularDistance = distance + cakes.length;
                                }
                                
                                if (Math.abs(circularDistance) > 2) {
                                    return null;
                                }

                                const isCenter = circularDistance === 0;
                                const isAdjacent = Math.abs(circularDistance) === 1;

                                const scale = 1 - Math.abs(circularDistance) * 0.2;
                                const opacity = isCenter ? 1 : (isAdjacent ? 0.7 : 0);
                                const zIndex = 100 - Math.abs(circularDistance);
                                const translateX = circularDistance * 60; // In percentage
                                const rotateY = circularDistance * -20; // In degrees
                                
                                return (
                                    <motion.div
                                        key={cake.id}
                                        className="absolute w-full max-w-sm"
                                        style={{ transformStyle: 'preserve-3d', zIndex }}
                                        initial={{ scale: 0, opacity: 0, x: '0%', rotateY: 0 }}
                                        animate={{
                                            scale: isCenter ? 1.05 : scale,
                                            opacity: opacity,
                                            x: `${translateX}%`,
                                            rotateY: rotateY,
                                        }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                        layout
                                    >
                                        <CakeCard cake={cake} onOrder={onOrder} />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        <Button onClick={prevSlide} size="icon" variant="outline" className="absolute -left-8 top-1/2 -translate-y-1/2 z-[101] rounded-full h-12 w-12"><ChevronLeft /></Button>
                        <Button onClick={nextSlide} size="icon" variant="outline" className="absolute -right-8 top-1/2 -translate-y-1/2 z-[101] rounded-full h-12 w-12"><ChevronRight /></Button>
                    </div>
                )}
                 <div className="flex justify-center gap-2 mt-8">
                    {cakes.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setIsInteracting(true);
                                setCurrentSlide(index);
                            }}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                currentSlide === index ? "w-6 bg-primary" : "w-2 bg-muted hover:bg-primary/50"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
