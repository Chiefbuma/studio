'use client';
import type { Cake, SpecialOffer as SpecialOfferType } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SocialIcons } from "./social-icons";
import { ArrowRight, CheckCircle, Clock, Crown, Star, Sparkles, Cake as CakeIcon } from "lucide-react";

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
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-stone-800 via-stone-900 to-black text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50"></div>
            <SocialIcons />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-12 min-h-screen flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 lg:gap-12">
                <div className="lg:w-1/2 w-full flex">
                    <div className="relative group w-full">
                         <div className="absolute -inset-2 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all duration-500 animate-pulse"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-background/10 h-96 lg:h-full">
                            <Image
                                src={cakeImage.imageUrl}
                                alt={cake.name}
                                fill
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                                data-ai-hint={cakeImage.imageHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            
                            <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm p-3 rounded-xl shadow-lg flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="font-bold text-sm text-foreground">{cake.orders_count}+ Orders</div>
                                    <div className="text-xs text-muted-foreground">This Month</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/2 w-full">
                    <div className="relative bg-card/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 shadow-2xl border border-primary/20 overflow-hidden flex flex-col justify-center">
                        <div className="absolute -top-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                        
                        <div className="relative z-10">
                            <div className="flex flex-col items-start gap-3 mb-6">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 rounded-full shadow-lg">
                                    <Crown className="w-4 h-4 text-amber-300" />
                                    <span className="font-bold text-xs uppercase tracking-wider">Today's Special</span>
                                </div>
                                <div className="bg-background/80 backdrop-blur-sm p-3 rounded-xl shadow-lg text-center border border-background/20">
                                    <div className="text-2xl font-bold text-primary">#1</div>
                                    <div className="text-xs text-foreground font-semibold uppercase tracking-wider">Best Seller</div>
                                </div>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-background mb-4 leading-tight text-balance">{cake.name}</h1>
                            <p className="text-muted-foreground text-base sm:text-lg mb-6 max-w-xl text-balance">{cake.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-accent" />
                                    <span className="font-bold">{cake.rating.toFixed(1)} Rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-accent" />
                                    <span>Ready in {cake.ready_time}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-end gap-4 mb-8">
                                <div className="text-4xl sm:text-5xl font-bold text-accent">{formatPrice(special_price)}</div>
                                <div className="text-xl text-muted-foreground line-through">{formatPrice(cake.base_price)}</div>
                                <div className="bg-primary/20 text-primary-foreground px-3 py-1 rounded-full font-bold text-sm border border-primary">
                                    {discount_percentage}% OFF
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                                <Button className="shadow-lg hover:shadow-primary/50 transition-shadow" onClick={() => onOrder(cake)}>
                                    <CakeIcon className="mr-2 h-5 w-5" /> Add to Cart
                                </Button>
                                 <Button variant="secondary" onClick={onOrderCustom}>
                                    <Sparkles className="mr-2 h-5 w-5" /> Create Your Own
                                 </Button>
                                <Button variant="outline" className="bg-card/10 border-primary/30 hover:bg-card/20" onClick={onNavigateToMenu}>
                                    View Full Menu <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
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
                <h3 className="text-2xl font-bold text-background mb-3">
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
