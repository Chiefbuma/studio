'use client';
import type { Cake, SpecialOffer as SpecialOfferType } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, CheckCircle, Clock, Crown, Star, Sparkles, Cake as CakeIcon, Trophy } from "lucide-react";

interface SpecialOfferProps {
    specialOffer: SpecialOfferType | null;
    onOrder: (cake: Cake) => void;
    onOrderCustom: () => void;
    onNavigateToMenu: () => void;
}

export default function SpecialOffer({ specialOffer, onOrder, onOrderCustom, onNavigateToMenu }: SpecialOfferProps) {
    if (!specialOffer || !specialOffer.cake) {
        return <SpecialOfferSkeleton onNavigateToMenu={onNavigateToMenu} hasError={!specialOffer} />;
    }

    const { cake, discount_percentage, special_price } = specialOffer;
    const cakeImage = PlaceHolderImages.find(img => img.id === cake.image_id) || PlaceHolderImages[0];

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-black text-white"></div>
            
            <div className="relative z-10 w-full max-w-6xl mx-auto">
                <div className="relative bg-card/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary/20 overflow-hidden group grid md:grid-cols-2 md:items-center">
                    
                    {/* Image section */}
                    <div className="relative h-80 md:h-full min-h-[300px] md:min-h-[600px]">
                        <Image
                            src={cakeImage.imageUrl}
                            alt={cake.name}
                            fill
                            className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-500"
                            data-ai-hint={cakeImage.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        
                        <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-2 rounded-full shadow-lg">
                            <Crown className="w-5 h-5 text-amber-300" />
                            <span className="font-bold text-sm uppercase tracking-wider">Today's Special</span>
                        </div>
                        
                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-2 shadow-xl border border-primary/20">
                            <div className="text-center">
                                <div className="flex justify-center items-center gap-1 text-lg font-bold text-primary"><Trophy className="w-5 h-5" />1</div>
                                <div className="text-xs text-muted-foreground">Best Seller</div>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm p-2 rounded-xl shadow-lg flex items-center gap-2 border border-primary/20">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <div>
                                <div className="font-bold text-sm text-foreground">{cake.orders_count}+ Orders</div>
                                <div className="text-xs text-muted-foreground">This Month</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Text content section */}
                    <div className="p-6 sm:p-8 md:p-12 text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight text-balance mt-6 md:mt-0">{cake.name}</h1>
                        <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-xl text-balance mx-auto md:mx-0">{cake.description}</p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 mb-6 text-sm text-white">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-accent" />
                                <span className="font-bold">{cake.rating.toFixed(1)} Rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent" />
                                <span>Ready in {cake.ready_time}</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-end justify-center md:justify-start gap-4 mb-8">
                            <div className="text-3xl sm:text-4xl font-bold text-accent">{formatPrice(special_price)}</div>
                            <div className="text-lg text-muted-foreground line-through">{formatPrice(cake.base_price)}</div>
                            <div className="bg-primary/20 text-white px-3 py-1 rounded-full font-bold text-sm border border-primary">
                                {discount_percentage}% OFF
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button size="lg" className="shadow-lg hover:shadow-primary/50 transition-shadow w-full" onClick={() => onOrder(cake)}>
                                <CakeIcon className="mr-2 h-5 w-5" /> Add to Cart
                            </Button>
                             <Button size="lg" variant="secondary" className="w-full" onClick={onOrderCustom}>
                                <Sparkles className="mr-2 h-5 w-5" /> Create Your Own
                             </Button>
                        </div>
                        <Button variant="outline" className="bg-card/10 border-primary/30 hover:bg-card/20 w-full mt-3 text-white" onClick={onNavigateToMenu}>
                            View Full Menu <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SpecialOfferSkeleton({ onNavigateToMenu, hasError }: { onNavigateToMenu: () => void, hasError: boolean }) {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-800 via-stone-900 to-black text-white">
            <div className="text-center px-4">
                {hasError ? (
                     <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                ) : (
                    <div className="w-12 h-12 border-4 border-primary/50 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                )}
                <h3 className="text-2xl font-bold text-white mb-3">
                    {hasError ? "No Special Offer Today" : "Loading Today's Special..."}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    {hasError ? "Check back tomorrow for our delicious daily special, or view our full collection." : "Getting the most delicious deal ready for you."}
                </p>
                {hasError && (
                    <Button size="lg" onClick={onNavigateToMenu}>
                        View Our Collection <ArrowRight className="ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
}
