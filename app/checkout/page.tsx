'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import { DeliveryForm } from '@/components/cake-paradise/customization/delivery-form';
import type { DeliveryInfo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { getCustomizationOptions } from '@/services/cake-service';


export default function CheckoutPage() {
  const { cart, deliveryInfo: contextDeliveryInfo, setDeliveryInfo } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [formDeliveryInfo, setFormDeliveryInfo] = useState<DeliveryInfo>(
    contextDeliveryInfo || {
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


  const isFormInvalid = !formDeliveryInfo.name.trim() || 
                      !formDeliveryInfo.phone.trim() ||
                      (formDeliveryInfo.delivery_method === 'delivery' && !formDeliveryInfo.address.trim()) ||
                      (formDeliveryInfo.delivery_method === 'pickup' && !formDeliveryInfo.pickup_location.trim());

  const handleReviewOrder = () => {
    if (isFormInvalid) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all the required fields to continue."
      });
      return;
    }
    setDeliveryInfo(formDeliveryInfo);
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
                        Delivery Details
                    </h1>
                </div>
                <div className="w-32"></div> {/* Spacer to balance the back button */}
            </div>
        </header>
        
        <main className="container mx-auto p-4 md:p-8 max-w-3xl">
            <Card>
                <CardContent className="p-6">
                    <DeliveryForm deliveryInfo={formDeliveryInfo} setDeliveryInfo={setFormDeliveryInfo} />
                    <Button onClick={handleReviewOrder} className="w-full mt-6" size="lg" disabled={isFormInvalid}>
                        Review Your Order
                    </Button>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
