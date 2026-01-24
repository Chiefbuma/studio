'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Cake, CustomizationOptions, Customizations, DeliveryInfo } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { placeOrder } from '@/lib/actions';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CustomizationForm } from './customization-form';
import { DeliveryForm } from './delivery-form';
import { PaymentForm } from './payment-form';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart } from 'lucide-react';

interface CustomizationModalProps {
  cake: Cake;
  isOpen: boolean;
  onClose: () => void;
  customizationOptions: CustomizationOptions;
  isCustom: boolean;
}

export function CustomizationModal({ cake, isOpen, onClose, customizationOptions, isCustom }: CustomizationModalProps) {
  const [view, setView] = useState<'customizing' | 'delivery' | 'payment'>('customizing');
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [customizations, setCustomizations] = useState<Customizations>({
    flavor: customizationOptions.flavors?.[0]?.id || null,
    size: customizationOptions.sizes?.[0]?.id || null,
    color: customizationOptions.colors?.[0]?.id || null,
    toppings: []
  });

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Nairobi',
    delivery_date: '',
    delivery_time: '',
    delivery_method: 'delivery',
    pickup_location: '',
    special_instructions: '',
    coordinates: null
  });

  const [orderResponse, setOrderResponse] = useState<{orderNumber: string; depositAmount: number} | null>(null);

  useEffect(() => {
    // Reset state when modal is opened
    if (isOpen) {
      setView(isCustom ? 'customizing' : 'delivery');
      setCustomizations({
        flavor: customizationOptions.flavors?.[0]?.id || null,
        size: customizationOptions.sizes?.[0]?.id || null,
        color: customizationOptions.colors?.[0]?.id || null,
        toppings: []
      });
      setOrderResponse(null);
    }
  }, [isOpen, cake, customizationOptions, isCustom]);

  const totalPrice = useMemo(() => {
    if (!isCustom) {
      return cake.base_price;
    }

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
  }, [isCustom, cake, customizations, customizationOptions]);
  
  const depositAmount = totalPrice * 0.8;

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

  const handleProceedToDelivery = () => {
    if (!customizations.flavor || !customizations.size) {
      toast({
        variant: "destructive",
        title: "Missing selections",
        description: "Please select a flavor and size to continue.",
      });
      return;
    }
    setView('delivery');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const result = await placeOrder({
        cake,
        customizations: isCustom ? customizations : { flavor: null, size: null, color: null, toppings: [] },
        deliveryInfo,
        totalPrice,
        depositAmount
    });
    setIsProcessing(false);

    if (result.success) {
      toast({
        title: "Order Placed!",
        description: `Your order #${result.orderNumber} is ready for payment.`,
      });
      setOrderResponse({ orderNumber: result.orderNumber, depositAmount: result.depositAmount });
      setView('payment');
    } else {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: result.error || "An unknown error occurred.",
      });
    }
  };

  const cakeImage = PlaceHolderImages.find(img => img.id === cake.image_id) || PlaceHolderImages[0];

  const getTitle = () => {
    switch (view) {
      case 'customizing': return 'Create Your Custom Cake';
      case 'delivery': return 'Delivery & Contact Information';
      case 'payment': return 'Complete Your Order';
      default: return 'Cake Paradise';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
          <DialogDescription>
            {view === 'customizing' && 'Make it yours! Select your options below.'}
            {view === 'delivery' && 'Tell us where to send your delicious cake.'}
            {view === 'payment' && `Final step! Pay the 80% deposit for order #${orderResponse?.orderNumber}.`}
          </DialogDescription>
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
            {view === 'customizing' && isCustom && (
              <CustomizationForm
                cake={cake}
                customizationOptions={customizationOptions}
                customizations={customizations}
                handleCustomizationChange={handleCustomizationChange}
              />
            )}
            {view === 'delivery' && (
              <DeliveryForm
                deliveryInfo={deliveryInfo}
                setDeliveryInfo={setDeliveryInfo}
              />
            )}
            {view === 'payment' && orderResponse && (
              <PaymentForm
                orderNumber={orderResponse.orderNumber}
                depositAmount={orderResponse.depositAmount}
                customerEmail={deliveryInfo.email}
                customerPhone={deliveryInfo.phone}
                onPaymentSuccess={() => {
                  toast({ title: "Payment Confirmed!", description: "Your order is being prepared." });
                  onClose();
                }}
              />
            )}
             
             {!orderResponse && (
                <div className="mt-auto pt-4 space-y-4">
                  <Separator />
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total Price</span>
                          <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-primary">
                          <span>80% Deposit</span>
                          <span className="font-bold">{formatPrice(depositAmount)}</span>
                      </div>
                  </div>

                  {view === 'customizing' && isCustom && (
                      <Button onClick={handleProceedToDelivery} className="w-full" size="lg">
                          Proceed to Delivery
                          <ShoppingCart className="ml-2 h-5 w-5" />
                      </Button>
                  )}

                  {view === 'delivery' && (
                      <div className="flex gap-4">
                          {isCustom && <Button variant="outline" onClick={() => setView('customizing')} className="w-full" size="lg">Back</Button>}
                          <Button onClick={handlePlaceOrder} className="w-full" size="lg" disabled={isProcessing}>
                              {isProcessing ? <Loader2 className="animate-spin" /> : "Place Order"}
                          </Button>
                      </div>
                  )}
              </div>
             )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
