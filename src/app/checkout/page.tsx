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
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

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
    city: 'Nairobi',
    delivery_date: '',
    delivery_time: '',
    delivery_method: 'delivery',
    pickup_location: '',
    special_instructions: '',
    coordinates: null
  });

  useEffect(() => {
    if (cart.length === 0) {
        router.push('/');
    }
  }, [cart, router]);

  const depositAmount = totalPrice * 0.8;

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

  return (
    <div className="min-h-screen bg-background">
        <header className="bg-card border-b p-4 sticky top-0 z-20">
            <div className="container mx-auto flex justify-between items-center">
                <Button variant="ghost" onClick={() => router.push('/')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Button>
                <h1 className="text-2xl font-bold font-headline">Checkout</h1>
                <div></div>
            </div>
        </header>
        <main className="container mx-auto p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="md:col-span-1 order-2 md:order-1">
                    {view === 'delivery' && (
                        <div className="bg-card p-6 rounded-lg border">
                            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                            <DeliveryForm deliveryInfo={deliveryInfo} setDeliveryInfo={setDeliveryInfo} />
                            <Button onClick={handlePlaceOrder} className="w-full mt-6" size="lg" disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="animate-spin" /> : "Proceed to Payment"}
                            </Button>
                        </div>
                    )}
                    {view === 'payment' && orderResponse && (
                        <div>
                             <h2 className="text-xl font-semibold mb-4">Payment</h2>
                            <PaymentForm
                                orderNumber={orderResponse.orderNumber}
                                depositAmount={orderResponse.depositAmount}
                                totalPrice={totalPrice}
                                customerEmail={deliveryInfo.email}
                                customerPhone={deliveryInfo.phone}
                                onPaymentSuccess={handlePaymentSuccess}
                                onBack={() => setView('delivery')}
                            />
                        </div>
                    )}
                </div>
                <div className="md:col-span-1 order-1 md:order-2 bg-card p-6 rounded-lg border self-start sticky top-24">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
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
                    <Separator className="my-4" />
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span>Delivery</span>
                            <span className="font-medium text-primary">Free</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                         <div className="flex justify-between text-primary mt-2">
                            <span>80% Deposit to Pay</span>
                            <span className="font-bold">{formatPrice(depositAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}
