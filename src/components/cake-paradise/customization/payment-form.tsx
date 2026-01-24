'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, CreditCard, Loader2, Lock, Milestone } from "lucide-react";
import { Separator } from '@/components/ui/separator';

// You need to add this to your .env file
const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

interface PaymentFormProps {
    orderNumber: string;
    depositAmount: number;
    totalPrice: number;
    customerEmail: string;
    customerPhone: string;
    onPaymentSuccess: (response: { reference: string }) => void;
    onBack: () => void;
}

export function PaymentForm({ 
    orderNumber, 
    depositAmount, 
    totalPrice,
    customerEmail,
    customerPhone,
    onPaymentSuccess,
    onBack
}: PaymentFormProps) {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [mpesaPhone, setMpesaPhone] = useState(customerPhone || '');
    
    const payWithPaystackMpesa = () => {
        if (!paystackPublicKey || (!paystackPublicKey.startsWith('pk_test_') && !paystackPublicKey.startsWith('pk_live_'))) {
            toast({
                variant: 'destructive',
                title: 'Paystack Key Not Found',
                description: 'Please add your Paystack public key to your .env file.',
            });
            console.error("Paystack public key is missing or invalid. It should start with 'pk_test_' or 'pk_live_'.");
            return;
        }

        if (!mpesaPhone || !/^(07|01)\d{8}$/.test(mpesaPhone)) {
          toast({
              variant: 'destructive',
              title: 'Invalid Phone Number',
              description: 'Please enter a valid Kenyan phone number (e.g., 0712345678).',
          });
          return;
        }
    
        setIsProcessing(true);
    
        const handler = (window as any).PaystackPop.setup({
          key: paystackPublicKey,
          email: customerEmail,
          amount: Math.round(depositAmount * 100), // Amount in kobo/cents
          currency: 'KES',
          ref: `WD_${orderNumber}_${Date.now()}`,
          phone: mpesaPhone,
          metadata: {
            order_number: orderNumber,
            customer_phone: mpesaPhone,
            payment_type: "M-PESA Deposit"
          },
          channels: ['mobile_money'],
          callback: function(response: any) {
            setIsProcessing(false);
            toast({
              title: "✅ Payment Successful!",
              description: `Order #${orderNumber} confirmed. Ref: ${response.reference}`,
            });
            onPaymentSuccess(response);
          },
          onClose: function() {
            setIsProcessing(false);
            toast({
              variant: "destructive",
              title: 'Payment Cancelled',
              description: 'You can try again.',
            });
          }
        });
    
        handler.openIframe();
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                    <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Complete Your Payment</CardTitle>
                <CardDescription>
                    Pay the 80% deposit for order #{orderNumber} to confirm.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Order Price:</span>
                        <span className="font-medium">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Balance on Delivery:</span>
                        <span className="font-medium">{formatPrice(totalPrice - depositAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-primary font-semibold">Deposit to Pay:</span>
                        <span className="font-bold text-2xl text-primary">{formatPrice(depositAmount)}</span>
                    </div>
                </div>

                <div className='space-y-2'>
                    <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                    <Input 
                        id="mpesa-phone"
                        type="tel"
                        value={mpesaPhone}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setMpesaPhone(value);
                        }}
                        placeholder="0712345678"
                    />
                    <p className="text-xs text-muted-foreground">An STK push will be sent to this number.</p>
                </div>

                <Button
                    onClick={payWithPaystackMpesa}
                    className="w-full"
                    size="lg"
                    disabled={isProcessing || !mpesaPhone}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Lock className="mr-2 h-5 w-5" />
                            {`Pay ${formatPrice(depositAmount)} with M-Pesa`}
                        </>
                    )}
                </Button>
                
                <div className="pt-4">
                    <Button
                        onClick={onBack}
                        className="w-full"
                        variant="outline"
                        disabled={isProcessing}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Delivery Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
