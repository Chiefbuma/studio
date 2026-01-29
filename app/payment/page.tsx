
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import type { CustomizationOptions } from '@/lib/types';
import { placeOrder, logError } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Image as ImageIcon, Lock, Store, Truck, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCustomizationOptions } from '@/services/cake-service';
import { Separator } from '@/components/ui/separator';

const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
const ownerWhatsAppNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER || '';

export default function PaymentPage() {
  const { cart, totalPrice, deliveryInfo, clearCheckoutData } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  
  // State management for the payment flow
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ orderNumber: string; depositAmount: number } | null>(null);

  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions | null>(null);

  useEffect(() => {
    if (!deliveryInfo || cart.length === 0) {
      router.replace('/checkout');
    }
  }, [cart, deliveryInfo, router]);

  useEffect(() => {
    async function fetchOptions() {
      try {
          const options = await getCustomizationOptions();
          setCustomizationOptions(options);
      } catch (error) {
          console.error("Failed to fetch customization options for checkout", error);
          toast({variant: "destructive", title: "Could not load required data."});
      }
    }
    fetchOptions();
  }, [toast]);

  if (!deliveryInfo || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading details...</p>
        </div>
      </div>
    );
  }

  const finalDepositAmount = totalPrice * 0.8;
  const customerEmail = `${deliveryInfo.phone}@whiskedelights.com`; 

  const handlePaymentSuccess = (response: { reference: string }, orderNumber: string) => {
    setIsProcessing(false);
    const message = generateWhatsAppMessage(orderNumber);
    const whatsappUrl = `https://wa.me/${ownerWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    
    if (ownerWhatsAppNumber) {
      window.open(whatsappUrl, '_blank');
    }

    toast({
      title: "Payment Confirmed!",
      description: `Your order #${orderNumber} is being prepared. Ref: ${response.reference}`,
      duration: 10000,
    });
    
    clearCheckoutData();
    router.replace('/');
  }

  const generateWhatsAppMessage = (orderNumber: string): string => {
    if (!customizationOptions) return 'Order details are incomplete.';

    let message = `*New Cake Order!* 🎉\n\n`;
    message += `*Order Number:* ${orderNumber}\n\n`;
    message += `*--- Order Details ---*\n`;

    cart.forEach(item => {
      message += `*🎂 ${item.name} (x${item.quantity})*\n`;
      message += `   - *Price:* ${formatPrice(item.price * item.quantity)}\n`;

      if (item.customizations) {
        const { flavor, size, color, toppings } = item.customizations;
        const flavorName = customizationOptions.flavors.find(f => f.id === flavor)?.name;
        const sizeName = customizationOptions.sizes.find(s => s.id === size)?.name;
        const colorName = customizationOptions.colors.find(c => c.id === color)?.name;
        const toppingNames = toppings.map(tId => customizationOptions.toppings.find(t => t.id === tId)?.name).filter(Boolean);

        message += `   *Customizations:*\n`;
        if (flavorName) message += `     - *Flavor:* ${flavorName}\n`;
        if (sizeName) message += `     - *Size:* ${sizeName}\n`;
        if (colorName) message += `     - *Color:* ${colorName}\n`;
        if (toppingNames.length > 0) message += `     - *Toppings:* ${toppingNames.join(', ')}\n`;
      }
      message += '\n';
    });

    message += `*--- Delivery Info ---*\n`;
    message += `*Customer:* ${deliveryInfo.name}\n`;
    message += `*Phone:* ${deliveryInfo.phone}\n`;
    message += `*Method:* ${deliveryInfo.delivery_method}\n`;

    if (deliveryInfo.delivery_method === 'delivery') {
      message += `*Address:* ${deliveryInfo.address}\n`;
      if (deliveryInfo.coordinates) {
        const { lat, lng } = deliveryInfo.coordinates;
        message += `*Map Link:* https://maps.google.com/?q=${lat},${lng}\n`;
      }
    } else {
      message += `*Pickup Location:* ${deliveryInfo.pickup_location}\n`;
    }

    if (deliveryInfo.delivery_date) message += `*Date:* ${deliveryInfo.delivery_date}\n`;
    if (deliveryInfo.delivery_time) message += `*Time:* ${deliveryInfo.delivery_time}\n`;
    if (deliveryInfo.special_instructions) message += `*Instructions:* ${deliveryInfo.special_instructions}\n`;

    message += `\n*--- Payment ---*\n`;
    message += `*Total Price:* ${formatPrice(totalPrice)}\n`;
    message += `*Deposit Paid:* ${formatPrice(orderDetails?.depositAmount || finalDepositAmount)}\n`;
    message += `*Status:* PAID ✅`;

    return message;
  };

  const handleCheckout = async () => {
    setIsProcessing(true);

    // If order is already placed, just retry payment
    if (orderPlaced && orderDetails) {
        triggerPaystackPayment(orderDetails.orderNumber, orderDetails.depositAmount);
        return;
    }

    try {
        const result = await placeOrder({
            items: cart,
            deliveryInfo,
            totalPrice,
            depositAmount: finalDepositAmount,
        });

        if (result.success && result.orderNumber) {
          toast({
            title: "Order Confirmed!",
            description: `Your order #${result.orderNumber} is confirmed. Proceeding to payment...`,
          });
          setOrderDetails({ orderNumber: result.orderNumber, depositAmount: result.depositAmount });
          setOrderPlaced(true);
          triggerPaystackPayment(result.orderNumber, result.depositAmount);
        } else {
          toast({ variant: "destructive", title: "Order Failed", description: result.error });
          setIsProcessing(false);
        }
    } catch (error) {
        const errorMessage = `Checkout failed unexpectedly: ${error instanceof Error ? error.message : 'Unknown error'}`;
        await logError(errorMessage);
        toast({ variant: "destructive", title: "An Unexpected Error Occurred", description: "Could not place your order. Please try again later."});
        setIsProcessing(false);
    }
  };

  const triggerPaystackPayment = (orderNumber: string, amount: number) => {
     try {
        if (!paystackPublicKey || (!paystackPublicKey.startsWith('pk_test_') && !paystackPublicKey.startsWith('pk_live_'))) {
            throw new Error("Payment gateway is not configured correctly. Paystack public key is missing or invalid.");
        }

        if (!(window as any).PaystackPop) {
            throw new Error("Payment gateway (Paystack) failed to load. Please check your internet connection and try again.");
        }

        const handler = (window as any).PaystackPop.setup({
            key: paystackPublicKey,
            email: customerEmail,
            amount: Math.round(amount * 100),
            currency: 'KES',
            phone: deliveryInfo.phone,
            ref: `WD_${orderNumber}_${Date.now()}`,
            metadata: { order_number: orderNumber, customer_phone: deliveryInfo.phone, payment_type: "Deposit" },
            callback: (response: any) => handlePaymentSuccess(response, orderNumber),
            onClose: () => {
                setIsProcessing(false); // Re-enable the button to allow retry
                const errorMessage = `Paystack payment was not completed for order ${orderNumber}. User closed the modal.`;
                logError(errorMessage);
                toast({ variant: "destructive", title: 'Payment Incomplete', description: 'You can click "Retry Payment" to try again.' });
            }
        });
        handler.openIframe();
     } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while trying to open the payment modal.";
        logError(`triggerPaystackPayment error for order ${orderNumber}: ${errorMessage}`);
        toast({ variant: 'destructive', title: 'Payment Error', description: errorMessage });
        setIsProcessing(false); // Re-enable button on failure
     }
  }
  
  return (
    <div className="min-h-screen bg-background">
        <header className="bg-card border-b p-4 sticky top-0 z-20">
            <div className="container mx-auto flex items-center">
                <Button variant="ghost" onClick={() => router.push('/checkout')} disabled={isProcessing}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> 
                    Edit Details
                </Button>
                <div className="flex-1 text-center">
                    <h1 className="text-xl md:text-2xl font-bold font-headline">
                        Confirm Your Order
                    </h1>
                </div>
                <div className="w-32"></div>
            </div>
        </header>
        
        <main className="container mx-auto p-4 md:p-8 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Order Summary */}
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        {item.image_data_uri ? (
                                            <Image src={item.image_data_uri} alt={item.name} width={64} height={64} className="rounded-md object-cover h-16 w-16" />
                                        ) : (
                                            <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Right Column: Delivery & Payment */}
                <div className="space-y-6">
                    <Card>
                         <CardHeader>
                            <CardTitle>Review Details</CardTitle>
                             <CardDescription>Please confirm your details below.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                             <div>
                                <p className="font-semibold">Contact</p>
                                <p className="text-muted-foreground">{deliveryInfo.name}</p>
                                <p className="text-muted-foreground">{deliveryInfo.phone}</p>
                            </div>
                             <div>
                                {deliveryInfo.delivery_method === 'delivery' ? (
                                    <>
                                        <p className="font-semibold flex items-center gap-2"><Truck className="h-4 w-4"/> Delivery</p>
                                        <p className="text-muted-foreground">{deliveryInfo.address}</p>
                                    </>
                                ) : (
                                     <>
                                        <p className="font-semibold flex items-center gap-2"><Store className="h-4 w-4"/> Pickup</p>
                                        <p className="text-muted-foreground">{deliveryInfo.pickup_location}</p>
                                    </>
                                )}
                            </div>
                             {(deliveryInfo.delivery_date || deliveryInfo.delivery_time) && <div>
                                <p className="font-semibold">Date & Time</p>
                                <p className="text-muted-foreground">{deliveryInfo.delivery_date} at {deliveryInfo.delivery_time}</p>
                            </div>}
                        </CardContent>
                    </Card>
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Order Price</span>
                                <span className="font-medium">{formatPrice(totalPrice)}</span>
                            </div>
                             <div className="flex justify-between items-center text-lg">
                                <span className="font-bold text-primary">80% Deposit Required</span>
                                <span className="font-bold text-primary">{formatPrice(finalDepositAmount)}</span>
                            </div>
                             <Button onClick={handleCheckout} size="lg" className="w-full" disabled={isProcessing}>
                                {isProcessing ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please wait...</>
                                ) : orderPlaced ? (
                                    <><RefreshCw className="mr-2 h-4 w-4" />Retry Payment</>
                                ) : (
                                    <><Lock className="mr-2 h-4 w-4" />Confirm & Proceed to Pay</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </div>
  );
}
