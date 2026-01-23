'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Loader2, PartyPopper } from "lucide-react";
import { useState } from "react";

interface PaymentFormProps {
    orderNumber: string;
    depositAmount: number;
    customerEmail: string;
    customerPhone: string;
    onPaymentSuccess: () => void;
}

export function PaymentForm({ orderNumber, depositAmount, customerPhone, onPaymentSuccess }: PaymentFormProps) {
    const [isPaying, setIsPaying] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    const handleSimulatePayment = async () => {
        setIsPaying(true);
        setPaymentStatus('processing');

        // Simulate API call to payment gateway
        await new Promise(resolve => setTimeout(resolve, 3000));

        setIsPaying(false);
        setPaymentStatus('success');

        // Wait a bit on success screen before calling parent callback
        await new Promise(resolve => setTimeout(resolve, 2000));
        onPaymentSuccess();
    };

    if (paymentStatus === 'success') {
        return (
            <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                <PartyPopper className="w-16 h-16 text-primary animate-bounce mb-4" />
                <h3 className="text-2xl font-bold text-foreground">Payment Confirmed!</h3>
                <p className="text-muted-foreground mt-2">
                    Your order #{orderNumber} is now being prepared. Thank you!
                </p>
            </div>
        );
    }

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>M-Pesa Payment</CardTitle>
                <CardDescription>
                    Complete the 80% deposit to confirm your order.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-center">
                    <div className="text-sm text-muted-foreground">Deposit Amount</div>
                    <div className="text-4xl font-bold text-primary">{formatPrice(depositAmount)}</div>
                    <div className="text-xs text-muted-foreground">Order #{orderNumber}</div>
                </div>

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">A payment prompt will be sent to your phone number:</p>
                    <p className="font-bold text-foreground text-lg">{customerPhone}</p>
                </div>

                <Button
                    onClick={handleSimulatePayment}
                    className="w-full"
                    size="lg"
                    disabled={isPaying}
                >
                    {isPaying ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing Payment...
                        </>
                    ) : (
                        `Pay ${formatPrice(depositAmount)}`
                    )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    This is a simulation. No real payment will be processed.
                </p>
            </CardContent>
        </Card>
    );
}
