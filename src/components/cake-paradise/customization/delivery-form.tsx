'use client';

import { useState, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DeliveryInfo } from "@/lib/types";
import { Store, Truck, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places'];

interface LocationSearchInputProps {
    onLocationSelect: (address: string, lat: number, lng: number) => void;
    initialValue?: string;
}

function LocationSearchInput({ onLocationSelect, initialValue = '' }: LocationSearchInputProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocompleteInstance;
    }, []);

    const onUnmount = useCallback(() => {
        autocompleteRef.current = null;
    }, []);

    const onPlaceChanged = () => {
        const autocomplete = autocompleteRef.current;
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            const address = place.formatted_address || '';
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();

            if (address && lat && lng) {
                onLocationSelect(address, lat, lng);
            }
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    };

    if (loadError) {
        return <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">Error loading maps. Please check your Google Maps API key.</div>;
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground p-2 bg-muted/50 rounded-md h-10">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading map search...</span>
            </div>
        );
    }

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            onUnmount={onUnmount}
            fields={['formatted_address', 'geometry.location']}
            options={{ componentRestrictions: { country: 'ke' } }} // Restrict to Kenya
        >
            <Input
                type="text"
                placeholder="Search for your address, estate or building..."
                defaultValue={initialValue}
            />
        </Autocomplete>
    );
}

interface DeliveryFormProps {
    deliveryInfo: DeliveryInfo;
    setDeliveryInfo: Dispatch<SetStateAction<DeliveryInfo>>;
}

export function DeliveryForm({ deliveryInfo, setDeliveryInfo }: DeliveryFormProps) {
    const { toast } = useToast();

    const handleInputChange = (field: keyof DeliveryInfo, value: string) => {
        setDeliveryInfo(prev => ({ ...prev, [field]: value }));
    };
    
    const handleLocationSelect = (address: string, lat: number, lng: number) => {
        setDeliveryInfo(prev => ({
            ...prev,
            address: address,
            coordinates: { lat, lng }
        }));
        toast({
            title: "Address Selected!",
            description: `Address set successfully.`,
        });
    }

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
            </div>

            {deliveryInfo.delivery_method === 'delivery' ? (
                <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <LocationSearchInput 
                        onLocationSelect={handleLocationSelect}
                        initialValue={deliveryInfo.address}
                    />
                    <div className="flex justify-between items-center pt-1">
                        <p className="text-xs text-muted-foreground">Search and select your delivery location.</p>
                        {deliveryInfo.coordinates && (
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Location Captured
                            </p>
                        )}
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
