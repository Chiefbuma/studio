
'use client';

import { useEffect, useState, useCallback } from "react";
import { getSpecialOffer, getCakes, updateSpecialOffer } from "@/services/cake-service";
import type { SpecialOffer, Cake } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function OffersPage() {
    const [specialOffer, setSpecialOffer] = useState<SpecialOffer | null>(null);
    const [cakes, setCakes] = useState<Cake[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

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

        try {
            const updatedOffer = await updateSpecialOffer({ cake_id: selectedCakeId, discount_percentage: discount });
            setSpecialOffer(updatedOffer);
            toast({
                title: 'Special Offer Updated',
                description: `The special offer has been updated successfully.`,
            });
            fetchData();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: `Could not update the special offer.`,
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
        // This state allows creating a new offer if one doesn't exist
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Special Offer</CardTitle>
                    <CardDescription>There is no special offer. Create one now.</CardDescription>
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
                    <Button onClick={handleUpdateOffer}>Create Special Offer</Button>
                </CardContent>
            </Card>
        )
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
