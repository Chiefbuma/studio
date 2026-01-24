'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import { DeliveryForm } from '@/components/cake-paradise/customization/delivery-form';
import type { DeliveryInfo } from '@/lib/types';
import { placeOrder } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ShoppingCart, ChevronDown, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from '@/components/ui/card';

// Paystack public key from environment variables
const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

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
  const [isProcessing, setIsProcessing] = useState(false);

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: '',
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
  const customerEmail = `${deliveryInfo.phone}@whiskedelights.com`; 

  const handlePaymentSuccess = (response: { reference: string }, orderNumber: string) => {
    toast({
      title: "Payment Confirmed!",
      description: `Your order #${orderNumber} is being prepared. Ref: ${response.reference}`,
    });
    clearCart();
    router.push('/');
  }

  const handlePlaceOrderAndPay = async () => {
    // Basic validation
    if (!deliveryInfo.name.trim() || !deliveryInfo.phone.trim()) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter your name and phone number.' });
        return;
    }
     if (deliveryInfo.delivery_method === 'delivery' && !deliveryInfo.address.trim()) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a delivery address.' });
        return;
    }
     if (deliveryInfo.delivery_method === 'pickup' && !deliveryInfo.pickup_location.trim()) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a pickup location.' });
        return;
    }

    setIsProcessing(true);

    const result = await placeOrder({
        items: cart,
        deliveryInfo,
        totalPrice,
        depositAmount
    });

    if (result.success) {
      // Order placed successfully, now trigger payment
      toast({
        title: "Order Placed!",
        description: `Your order #${result.orderNumber} is ready for payment.`,
      });
      triggerPaystackPayment(result.orderNumber, result.depositAmount);
    } else {
      // Order failed
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: result.error || "An unknown error occurred.",
      });
      setIsProcessing(false);
    }
  };

  const triggerPaystackPayment = (orderNumber: string, amount: number) => {
     if (!paystackPublicKey || (!paystackPublicKey.startsWith('pk_test_') && !paystackPublicKey.startsWith('pk_live_'))) {
        toast({
            variant: 'destructive',
            title: 'Payment Gateway Error',
            description: 'The payment gateway is not configured correctly.',
        });
        console.error("Paystack public key is missing or invalid.");
        setIsProcessing(false);
        return;
    }

    const handler = (window as any).PaystackPop.setup({
      key: paystackPublicKey,
      email: customerEmail,
      amount: Math.round(amount * 100), // Amount in kobo/cents
      phone: deliveryInfo.phone,
      ref: `WD_${orderNumber}_${Date.now()}`,
      metadata: {
        order_number: orderNumber,
        customer_phone: deliveryInfo.phone,
        payment_type: "M-PESA Deposit"
      },
      channels: ['mobile_money'],
      callback: function(response: any) {
        // No need to setIsProcessing(false) here, as we navigate away
        handlePaymentSuccess(response, orderNumber);
      },
      onClose: function() {
        setIsProcessing(false);
        toast({
          variant: "destructive",
          title: 'Payment Cancelled',
          description: 'Your order has been saved. You can try again later.',
        });
      }
    });

    handler.openIframe();
  }

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

  return (
    <div className="min-h-screen bg-background">
        <header className="bg-card border-b p-4 sticky top-0 z-20">
            <div className="container mx-auto flex items-center">
                <Button variant="ghost" onClick={() => router.push('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> 
                    Back to Shop
                </Button>
                <div className="flex-1 text-center">
                    <h1 className="text-xl md:text-2xl font-bold font-headline">
                        Checkout
                    </h1>
                </div>
                <div className="w-32"></div> {/* Spacer to balance the back button */}
            </div>
        </header>
        
        <main className="container mx-auto p-4 md:p-8 max-w-3xl">
             <OrderSummaryCollapsible />

             <Card>
                <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Delivery Details</h3>
                    <DeliveryForm deliveryInfo={deliveryInfo} setDeliveryInfo={setDeliveryInfo} />
                    <Button onClick={handlePlaceOrderAndPay} className="w-full mt-6" size="lg" disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : (
                          <>
                            <Lock className="mr-2 h-5 w-5" />
                            {`Place Order & Pay ${formatPrice(depositAmount)}`}
                          </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
