'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Cake, CustomizationOptions, Customizations } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CustomizationForm } from './customization-form';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

interface CustomizationModalProps {
  cake: Cake;
  isOpen: boolean;
  onClose: () => void;
  customizationOptions: CustomizationOptions;
  isCustom: boolean;
}

export function CustomizationModal({ cake, isOpen, onClose, customizationOptions }: CustomizationModalProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [customizations, setCustomizations] = useState<Customizations>({
    flavor: customizationOptions.flavors?.[0]?.id || null,
    size: customizationOptions.sizes?.[0]?.id || null,
    color: customizationOptions.colors?.[0]?.id || null,
    toppings: []
  });

  useEffect(() => {
    if (isOpen) {
      setCustomizations({
        flavor: customizationOptions.flavors?.[0]?.id || null,
        size: customizationOptions.sizes?.[0]?.id || null,
        color: customizationOptions.colors?.[0]?.id || null,
        toppings: []
      });
    }
  }, [isOpen, customizationOptions]);

  const totalPrice = useMemo(() => {
    let total = cake.base_price; // Starts at 0 for custom cake
    const { flavors, sizes, colors, toppings } = customizationOptions;

    const selectedFlavor = flavors?.find(f => f.id === customizations.flavor);
    if (selectedFlavor) total += selectedFlavor.price;

    const selectedSize = sizes?.find(s => s.id === customizations.size);
    if (selectedSize) total += selectedSize.price;

    const selectedColor = colors?.find(c => c.id === customizations.color);
    if (selectedColor) total += selectedColor.price;
    
    customizations.toppings.forEach(toppingId => {
      const selectedTopping = toppings?.find(t => t.id === toppingId);
      if (selectedTopping) total += selectedTopping.price;
    });

    return total;
  }, [cake, customizations, customizationOptions]);

  const handleCustomizationChange = (type: keyof Customizations, value: string) => {
    if (type === 'toppings') {
      setCustomizations(prev => ({
        ...prev,
        toppings: prev.toppings.includes(value)
          ? prev.toppings.filter(id => id !== value)
          : [...prev.toppings, value]
      }));
    } else {
      setCustomizations(prev => ({ ...prev, [type]: value }));
    }
  };

  const handleAddToCart = () => {
    if (!customizations.flavor || !customizations.size) {
      toast({
        variant: "destructive",
        title: "Missing selections",
        description: "Please select a flavor and size to continue.",
      });
      return;
    }
    addToCart(cake, 1, totalPrice, customizations);
    onClose();
  };

  const cakeImage = PlaceHolderImages.find(img => img.id === cake.image_id) || PlaceHolderImages[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Create Your Custom Cake</DialogTitle>
          <DialogDescription>Make it yours! Select your options below.</DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 overflow-y-auto px-6 pb-6">
          <div className="relative rounded-lg overflow-hidden h-64 md:h-full">
            <Image
              src={cakeImage.imageUrl}
              alt={cake.name}
              fill
              className="object-cover"
              data-ai-hint={cakeImage.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold font-headline">{cake.name}</h3>
                <p className="text-sm">Base Price: {formatPrice(cake.base_price)}</p>
            </div>
          </div>

          <div className="flex flex-col">
            <CustomizationForm
                cake={cake}
                customizationOptions={customizationOptions}
                customizations={customizations}
                handleCustomizationChange={handleCustomizationChange}
              />
             
             <div className="mt-auto pt-4 space-y-4">
                <Separator />
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total Price</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>
                </div>

                <Button onClick={handleAddToCart} className="w-full" size="lg">
                    Add to Cart
                    <ShoppingCart className="ml-2 h-5 w-5" />
                </Button>
              </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
