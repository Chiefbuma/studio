
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import type { DeliveryInfo, CustomizationOptions, OrderPayload } from '@/lib/types';
import { placeOrder, logError } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Image as ImageIcon, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DeliveryForm } from '@/components/cake-paradise/customization/delivery-form';
import { getCustomizationOptions } from '@/services/cake-service';

const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
const ownerWhatsAppNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER || '';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart, itemCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
      name: '',
      phone: '',
      address: '',
      delivery_date: '',
      delivery_time: '',
      delivery_method: 'delivery',
      pickup_location: 'Main Bakery - Nairobi CBD',
      special_instructions: '',
      coordinates: null
  });
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Redirect to home if cart is empty on mount.
    if (itemCount === 0) {
        router.replace('/');
    }
    
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
  }, [itemCount, router, toast]);

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  const isFormInvalid = !deliveryInfo.name.trim() || 
                      !deliveryInfo.phone.trim() ||
                      (deliveryInfo.delivery_method === 'delivery' && !deliveryInfo.address.trim()) ||
                      (deliveryInfo.delivery_method === 'pickup' && !deliveryInfo.pickup_location.trim());

  const depositAmount = totalPrice * 0.8;
  const customerEmail = `${deliveryInfo.phone}@whiskedelights.com`;

  const handlePaymentSuccess = (response: { reference: string }, orderNumber: string) => {
    const message = generateWhatsAppMessage(orderNumber);
    const whatsappUrl = `https://wa.me/${ownerWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    
    if (ownerWhatsAppNumber) {
      window.open(whatsappUrl, '_blank');
    }

    toast({
      title: "Payment Confirmed!",
      description: `Your order #${orderNumber} is being prepared. Ref: ${response.reference}`,
    });
    
    clearCart();
    router.replace('/');
  };

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
    message += `*Deposit Paid:* ${formatPrice(depositAmount)}\n`;
    message += `*Status:* PAID ✅`;

    return message;
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
        const payload: OrderPayload = { items: cart, deliveryInfo, totalPrice, depositAmount };
        const result = await placeOrder(payload);

        if (result.success) {
          toast({
            title: "Order Confirmed!",
            description: `Your order #${result.orderNumber} is confirmed. Proceeding to payment...`,
          });
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
     if (!paystackPublicKey || (!paystackPublicKey.startsWith('pk_test_') && !paystackPublicKey.startsWith('pk_live_'))) {
        const errorMsg = "Payment gateway is not configured correctly.";
        toast({ variant: 'destructive', title: 'Payment Gateway Error', description: errorMsg });
        logError(errorMsg);
        setIsProcessing(false);
        return;
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
        setIsProcessing(false);
        const errorMessage = `Paystack payment was not completed for order ${orderNumber}. User closed the modal.`;
        logError(errorMessage);
        toast({ variant: "destructive", title: 'Payment Incomplete', description: 'Your payment was not completed.' });
      }
    });
    handler.openIframe();
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
        
        <main className="container mx-auto p-4 md:p-8">
             <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Left Column: Delivery Form */}
                <Card className='h-fit'>
                    <CardHeader>
                        <CardTitle>Delivery Details</CardTitle>
                        <CardDescription>Where should we send your delicious cake?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DeliveryForm deliveryInfo={deliveryInfo} setDeliveryInfo={setDeliveryInfo} />
                    </CardContent>
                </Card>

                {/* Right Column: Order Summary & Payment */}
                <div className="space-y-6">
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
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle>Payment</CardTitle>
                             <CardDescription>An 80% deposit is required to confirm your order.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Order Price</span>
                                <span className="font-medium">{formatPrice(totalPrice)}</span>
                            </div>
                             <div className="flex justify-between items-center text-lg">
                                <span className="font-bold text-primary">80% Deposit Required</span>
                                <span className="font-bold text-primary">{formatPrice(depositAmount)}</span>
                            </div>
                            
                            <Button size="lg" className="w-full" disabled={isFormInvalid || isProcessing} onClick={handleCheckout}>
                                {isProcessing ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please wait...</>
                                ) : (
                                    <><Lock className="mr-2 h-4 w-4" />Place Order & Pay</>
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
