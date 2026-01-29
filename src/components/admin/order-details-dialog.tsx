
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Order, CartItem, CustomizationOptions } from '@/lib/types';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import Image from 'next/image';
import { ImageIcon, User, Phone, Truck, Store, Calendar, Clock, FileText, Info } from 'lucide-react';
import { Badge } from '../ui/badge';

interface OrderDetailsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order;
    customizationOptions: CustomizationOptions;
}

function getCustomizationName(type: 'flavor' | 'size' | 'color' | 'topping', id: string, options: CustomizationOptions): string {
    const pluralType = type === 'topping' ? 'toppings' : `${type}s`;
    const item = options[pluralType]?.find(opt => opt.id === id);
    return item?.name || id;
}

export function OrderDetailsDialog({ isOpen, onOpenChange, order, customizationOptions }: OrderDetailsDialogProps) {

    const renderCustomizations = (item: CartItem) => {
        const { customizations } = item;
        if (!customizations || Object.values(customizations).every(val => val === null || (Array.isArray(val) && val.length === 0))) {
            return <p className="text-xs text-muted-foreground">Standard</p>;
        }

        return (
             <ul className="text-xs list-disc list-inside text-muted-foreground space-y-1 mt-1">
                {customizations.flavor && <li>Flavor: {getCustomizationName('flavor', customizations.flavor, customizationOptions)}</li>}
                {customizations.size && <li>Size: {getCustomizationName('size', customizations.size, customizationOptions)}</li>}
                {customizations.color && <li>Color: {getCustomizationName('color', customizations.color, customizationOptions)}</li>}
                {customizations.toppings.length > 0 && (
                    <li>Toppings: {customizations.toppings.map(t => getCustomizationName('topping', t, customizationOptions)).join(', ')}</li>
                )}
            </ul>
        )
    }

    const getOrderStatusVariant = (status: 'processing' | 'complete' | 'cancelled') => {
        switch (status) {
            case 'processing': return 'secondary';
            case 'complete': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const getPaymentStatusVariant = (status: 'paid' | 'pending') => {
        switch (status) {
            case 'paid': return 'default';
            case 'pending': return 'outline';
            default: return 'outline';
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                        Details for order #{order.order_number}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-4 -mr-6 space-y-6">
                    {/* Status and Customer Info */}
                    <Card>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-2"><Info className="w-4 h-4" />Status</h4>
                                <div className="flex items-center gap-2">
                                     <Badge variant={getOrderStatusVariant(order.order_status)} className="capitalize text-xs">{order.order_status}</Badge>
                                     <Badge variant={getPaymentStatusVariant(order.payment_status)} className="capitalize text-xs">{order.payment_status}</Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-2"><User className="w-4 h-4" />Customer</h4>
                                <p className="text-sm">{order.customer_name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> {order.customer_phone}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery Info */}
                    <Card>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-2">{order.delivery_method === 'delivery' ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}Delivery Details</h4>
                                <p className="text-sm font-medium capitalize">{order.delivery_method}</p>
                                <p className="text-sm text-muted-foreground">
                                    {order.delivery_method === 'delivery' ? order.delivery_address : order.pickup_location}
                                </p>
                            </div>
                             <div className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-2"><Calendar className="w-4 h-4" />Date & Time</h4>
                                <p className="text-sm">{order.delivery_date ? format(new Date(order.delivery_date), "PPP") : 'Not specified'}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), "MMM d, yyyy, h:mm a")}</p>
                            </div>
                             {order.special_instructions && (
                                <div className="space-y-2 md:col-span-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4" />Instructions</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">{order.special_instructions}</p>
                                </div>
                             )}
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-4">Order Items ({order.items.length})</h4>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                            {item.image_data_uri ? (
                                                <Image src={item.image_data_uri} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></p>
                                            {renderCustomizations(item)}
                                        </div>
                                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-4" />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(order.total_price)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span>Total Price</span>
                                    <span>{formatPrice(order.total_price)}</span>
                                </div>
                                <div className="flex justify-between text-primary">
                                    <span className="font-semibold">Deposit Paid</span>
                                    <span className="font-bold">{formatPrice(order.deposit_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}


    