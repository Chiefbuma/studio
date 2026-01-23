'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DeliveryInfo } from "@/lib/types";
import { Store, Truck } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface DeliveryFormProps {
    deliveryInfo: DeliveryInfo;
    setDeliveryInfo: Dispatch<SetStateAction<DeliveryInfo>>;
}

export function DeliveryForm({ deliveryInfo, setDeliveryInfo }: DeliveryFormProps) {
    const handleInputChange = (field: keyof DeliveryInfo, value: string) => {
        setDeliveryInfo(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-3">
            <div>
                <Label>Delivery Method</Label>
                <RadioGroup
                    defaultValue="delivery"
                    className="grid grid-cols-2 gap-4 mt-2"
                    value={deliveryInfo.delivery_method}
                    onValueChange={(value: 'delivery' | 'pickup') => handleInputChange('delivery_method', value)}
                >
                    <div>
                        <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                        <Label htmlFor="delivery" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Truck className="mb-3 h-6 w-6" />
                            Delivery
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                        <Label htmlFor="pickup" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Store className="mb-3 h-6 w-6" />
                            Pickup
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" placeholder="John Doe" value={deliveryInfo.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" type="tel" placeholder="0712345678" value={deliveryInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="for-receipts@example.com" value={deliveryInfo.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                    <p className="text-xs text-muted-foreground">Optional, for order confirmation and receipts.</p>
                </div>
            </div>

            {deliveryInfo.delivery_method === 'delivery' ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address *</Label>
                        <Textarea id="address" placeholder="e.g., Vision Tower, 5th Floor, Muthithi Road" value={deliveryInfo.address} onChange={(e) => handleInputChange('address', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select value={deliveryInfo.city} onValueChange={(value) => handleInputChange('city', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Nairobi">Nairobi</SelectItem>
                                <SelectItem value="Mombasa">Mombasa</SelectItem>
                                <SelectItem value="Kisumu">Kisumu</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="pickup_location">Pickup Location *</Label>
                    <Select value={deliveryInfo.pickup_location} onValueChange={(value) => handleInputChange('pickup_location', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Main Bakery - Nairobi CBD">Main Bakery - Nairobi CBD</SelectItem>
                            <SelectItem value="Westlands Branch">Westlands Branch</SelectItem>
                            <SelectItem value="Karen Branch">Karen Branch</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="delivery_date">Preferred Date</Label>
                    <Input id="delivery_date" type="date" value={deliveryInfo.delivery_date} onChange={(e) => handleInputChange('delivery_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="delivery_time">Preferred Time</Label>
                    <Input id="delivery_time" type="time" value={deliveryInfo.delivery_time} onChange={(e) => handleInputChange('delivery_time', e.target.value)} />
                </div>
            </div>

             <div className="space-y-2">
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea id="special_instructions" placeholder="e.g., 'Happy Birthday, Jane!' message on the cake." value={deliveryInfo.special_instructions} onChange={(e) => handleInputChange('special_instructions', e.target.value)} />
            </div>
        </div>
    );
}
