
'use client';

import { useState, useRef, Dispatch, SetStateAction, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DeliveryInfo } from "@/lib/types";
import { Store, Truck, MapPin, Loader2, LocateFixed, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';

interface LocationSearchInputProps {
    onLocationSelect: (address: string, lat: number, lng: number) => void;
    initialValue?: string;
}

function LocationSearchInput({ onLocationSelect, initialValue = '' }: LocationSearchInputProps) {
    const { toast } = useToast();
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setQuery(initialValue);
    }, [initialValue]);

    const handleSearch = async (searchQuery: string) => {
        if (searchQuery.trim().length < 3) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ke&limit=5`, {
                headers: { 'Accept-Language': 'en', 'User-Agent': 'WhiskeDelights/1.0' }
            });
            const data = await response.json();
            setResults(data);
            setShowResults(true);
        } catch (error) {
            console.error("Failed to fetch from Nominatim:", error);
            toast({ variant: 'destructive', title: "Address search failed" });
        } finally {
            setLoading(false);
        }
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            handleSearch(newQuery);
        }, 500); // 500ms debounce
    }
    
    const handleSelectResult = (result: any) => {
        const address = result.display_name;
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setQuery(address);
        onLocationSelect(address, lat, lng);
        setShowResults(false);
    }
    
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({ variant: "destructive", title: "Geolocation is not supported by your browser." });
            return;
        }

        setLoading(true);
        
        const success = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                    { headers: { 'Accept-Language': 'en', 'User-Agent': 'WhiskeDelights/1.0' } }
                );
                const data = await response.json();
                const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                setQuery(address);
                onLocationSelect(address, latitude, longitude);
            } catch (error) {
                const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                setQuery(address);
                onLocationSelect(address, latitude, longitude);
            } finally {
                setLoading(false);
            }
        };

        const error = () => {
            setLoading(false);
            toast({ variant: "destructive", title: "Unable to retrieve your location.", description: "Please enable location services or search manually." });
        };

        navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
    }

    return (
        <div className="relative">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        onFocus={() => query.length > 2 && setShowResults(true)}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay hiding to allow click
                        className="pl-9"
                    />
                    {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                </div>
                <Button type="button" variant="outline" size="icon" onClick={handleGetCurrentLocation} title="Use my current location">
                    <LocateFixed className="h-5 w-5 text-primary" />
                </Button>
            </div>
            
            {showResults && results.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {results.map((result) => (
                         <button
                            key={result.place_id}
                            type="button"
                            className="w-full text-left p-3 text-sm hover:bg-accent"
                            onClick={() => handleSelectResult(result)}
                        >
                            {result.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
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
            description: `Location has been set successfully.`,
        });
    }

    const minDate = format(addDays(new Date(), 2), 'yyyy-MM-dd');

    return (
        <div className="space-y-6">
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
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={deliveryInfo.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" placeholder="0712345678" value={deliveryInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
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
                        <p className="text-xs text-muted-foreground">Search for your address or use the location button.</p>
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
                    <Input id="delivery_date" type="date" value={deliveryInfo.delivery_date} onChange={(e) => handleInputChange('delivery_date', e.target.value)} min={minDate} />
                    <p className="text-xs text-muted-foreground mt-1">Heads up: We require 48 hours to prepare your cake.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="delivery_time">Preferred Time Slot</Label>
                    <Select value={deliveryInfo.delivery_time} onValueChange={(value) => handleInputChange('delivery_time', value)}>
                        <SelectTrigger id="delivery_time">
                            <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Morning (9am - 12pm)">Morning (9am - 12pm)</SelectItem>
                            <SelectItem value="Afternoon (12pm - 4pm)">Afternoon (12pm - 4pm)</SelectItem>
                            <SelectItem value="Evening (4pm - 7pm)">Evening (4pm - 7pm)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

             <div className="space-y-2">
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea id="special_instructions" placeholder="e.g., allergies, custom message on cake" value={deliveryInfo.special_instructions} onChange={(e) => handleInputChange('special_instructions', e.target.value)} />
            </div>
        </div>
    );
}
