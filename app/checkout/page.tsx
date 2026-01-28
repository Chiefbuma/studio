'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import type { DeliveryInfo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DeliveryForm } from '@/components/cake-paradise/customization/delivery-form';

export default function CheckoutPage() {
  const { cart, totalPrice, setDeliveryInfo: saveDeliveryInfo, itemCount } = useCart();
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
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Redirect to home if cart is empty on mount.
    if (itemCount === 0) {
        router.replace('/');
    }
  }, [itemCount, router]);

  if (!isClient || itemCount === 0) {
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

  const handleReviewOrder = () => {
    if (isFormInvalid) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all required delivery details."
        });
        return;
    }
    saveDeliveryInfo(deliveryInfo);
    router.push('/payment');
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
                    <Button size="lg" className="w-full" disabled={isFormInvalid} onClick={handleReviewOrder}>
                        Review Your Order
                    </Button>
                </div>
            </div>
        </main>
    </div>
  );
}
