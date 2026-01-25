'use client';

import { useEffect, useState, useCallback } from "react";
import { getSpecialOffer, getCakes } from "@/services/cake-service";
import type { SpecialOffer, Cake } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function OffersPage() {
    const [specialOffer, setSpecialOffer] = useState<SpecialOffer | null>(null);
    const [cakes, setCakes] = useState<Cake[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Local state to manage form changes before saving
    const [selectedCakeId, setSelectedCakeId] = useState<string>('');
    const [discount, setDiscount] = useState<number>(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [offerData, cakesData] = await Promise.all([getSpecialOffer(), getCakes()]);
            setSpecialOffer(offerData);
            if (offerData) {
                setSelectedCakeId(offerData.cake.id);
                setDiscount(offerData.discount_percentage);
            }
            setCakes(cakesData.filter(c => c.id !== 'custom-cake'));
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load offer data.' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const selectedCake = cakes.find(c => c.id === selectedCakeId);
    const originalPrice = selectedCake?.base_price || 0;
    const discountedPrice = originalPrice - (originalPrice * (discount / 100));

    const handleUpdateOffer = async () => {
        if (!selectedCakeId || !discount) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a cake and enter a discount.' });
            return;
        }

        const payload = {
            cake_id: selectedCakeId,
            discount_percentage: discount,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/special-offer`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update the special offer.');
            }

            const updatedOffer = await response.json();
            
            // Update the local state with the new data from the server
            setSpecialOffer(updatedOffer);
            setSelectedCakeId(updatedOffer.cake.id);
            setDiscount(updatedOffer.discount_percentage);

            toast({
                title: 'Special Offer Updated',
                description: `The special offer has been successfully updated.`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'An unknown error occurred.',
            });
        }
    };

    if (loading) {
        return (
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        )
    }

    if (!specialOffer) {
        return <p>No special offer data found. You can create one from the backend.</p>
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Manage Special Offer</CardTitle>
                <CardDescription>Update the daily special offer for the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="cake-select">Select Cake for Offer</Label>
                    <Select value={selectedCakeId} onValueChange={setSelectedCakeId}>
                        <SelectTrigger id="cake-select">
                            <SelectValue placeholder="Select a cake" />
                        </SelectTrigger>
                        <SelectContent>
                            {cakes.map(cake => (
                                <SelectItem key={cake.id} value={cake.id}>
                                    {cake.name} - {formatPrice(cake.base_price)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="discount">Discount Percentage (%)</Label>
                    <Input id="discount" type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                </div>
                 <div className="space-y-2">
                    <Label>Calculated Prices</Label>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 border">
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Original Price:</span>
                            <span className="font-medium">{formatPrice(originalPrice)}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Discounted Price:</span>
                            <span className="font-bold text-lg text-primary">{formatPrice(discountedPrice)}</span>
                        </div>
                    </div>
                </div>
                <Button onClick={handleUpdateOffer}>Update Special Offer</Button>
            </CardContent>
        </Card>
    );
}
