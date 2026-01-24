'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import { DeliveryForm } from '@/components/cake-paradise/customization/delivery-form';
import { PaymentForm } from '@/components/cake-paradise/customization/payment-form';
import type { DeliveryInfo } from '@/lib/types';
import { placeOrder } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ShoppingCart, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AnimatePresence, motion } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from '@/components/ui/card';

// Component for Order Summary, now collapsible
const OrderSummaryCollapsible = () => {
    const { cart, totalPrice } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-8">
            <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center w-full p-4 border rounded-lg bg-card cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                         <ShoppingCart className="h-5 w-5 text-primary" />
                         <span className="font-semibold">{isOpen ? 'Hide' : 'Show'} Order Summary</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">{formatPrice(totalPrice)}</span>
                        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                 <div className="py-4 space-y-4">
                    {cart.map(item => {
                        const image = PlaceHolderImages.find(img => img.id === item.image_id) || PlaceHolderImages[0];
                        return (
                            <div key={item.id} className="flex items-start gap-4">
                                <Image src={image.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover h-16 w-16" />
                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        );
                    })}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<'delivery' | 'payment'>('delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResponse, setOrderResponse] = useState<{orderNumber: string; depositAmount: number} | null>(null);

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    delivery_date: '',
    delivery_time: '',
    delivery_method: 'delivery',
    pickup_location: '',
    special_instructions: '',
    coordinates: null
  });

  useEffect(() => {
    // Redirect to home if cart is empty on mount.
    if (cart.length === 0) {
        router.replace('/');
    }
  }, [cart, router]);

  const depositAmount = totalPrice * 0.8;
  const customerEmail = deliveryInfo.email || `${deliveryInfo.phone}@whiskedelights.com`; // Paystack requires an email.

  if (cart.length === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Your cart is empty. Redirecting...</p>
            </div>
        </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const result = await placeOrder({
        items: cart,
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

  const handlePaymentSuccess = (response: { reference: string }) => {
    toast({
      title: "Payment Confirmed!",
      description: `Your order is being prepared. Ref: ${response.reference}`,
    });
    clearCart();
    router.push('/');
  }
  
  const stageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-background">
        <header className="bg-card border-b p-4 sticky top-0 z-20">
            <div className="container mx-auto flex items-center">
                <Button variant="ghost" onClick={() => view === 'delivery' ? router.push('/') : setView('delivery')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> 
                    Back
                </Button>
                <div className="flex-1 text-center">
                    <h1 className="text-xl md:text-2xl font-bold font-headline">
                        {view === 'delivery' ? 'Checkout' : 'Payment'}
                    </h1>
                </div>
                <div className="w-20"></div> {/* Spacer to balance the back button */}
            </div>
        </header>
        
        <main className="container mx-auto p-4 md:p-8 max-w-3xl">
             <OrderSummaryCollapsible />

             <div className="grid grid-cols-2 gap-4 text-center mb-8">
                <div className={`p-3 rounded-lg border-2 transition-colors ${view === 'delivery' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <h3 className="font-semibold text-lg">1. Delivery Details</h3>
                </div>
                 <div className={`p-3 rounded-lg border-2 transition-colors ${view === 'payment' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <h3 className="font-semibold text-lg">2. Payment</h3>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'delivery' && (
                    <motion.div
                        key="delivery"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={stageVariants}
                        transition={{ duration: 0.3 }}
                    >
                         <Card>
                            <CardContent className="p-6">
                                <DeliveryForm deliveryInfo={deliveryInfo} setDeliveryInfo={setDeliveryInfo} />
                                <Button onClick={handlePlaceOrder} className="w-full mt-6" size="lg" disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="animate-spin" /> : "Proceed to Payment"}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                
                {view === 'payment' && orderResponse && (
                     <motion.div
                        key="payment"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={stageVariants}
                        transition={{ duration: 0.3 }}
                    >
                        <PaymentForm
                            orderNumber={orderResponse.orderNumber}
                            depositAmount={orderResponse.depositAmount}
                            totalPrice={totalPrice}
                            customerEmail={customerEmail}
                            customerPhone={deliveryInfo.phone}
                            onPaymentSuccess={handlePaymentSuccess}
                            onBack={() => setView('delivery')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    </div>
  );
}
