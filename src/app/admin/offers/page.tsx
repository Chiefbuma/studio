'use client';

import { useEffect, useState } from "react";
import { getSpecialOffer, getCakes } from "@/services/cake-service";
import type { SpecialOffer, Cake } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

export default function OffersPage() {
    const [specialOffer, setSpecialOffer] = useState<SpecialOffer | null>(null);
    const [cakes, setCakes] = useState<Cake[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [offerData, cakesData] = await Promise.all([getSpecialOffer(), getCakes()]);
            setSpecialOffer(offerData);
            setCakes(cakesData.filter(c => c.id !== 'custom-cake'));
            setLoading(false);
        }
        fetchData();
    }, []);

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
        return <p>No special offer data found.</p>
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
                    <Select defaultValue={specialOffer.cake.id}>
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
                    <Input id="discount" type="number" defaultValue={specialOffer.discount_percentage} />
                </div>
                 <div className="space-y-2">
                    <Label>Calculated Prices</Label>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 border">
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Original Price:</span>
                            <span className="font-medium">{formatPrice(specialOffer.original_price)}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Discounted Price:</span>
                            <span className="font-bold text-lg text-primary">{formatPrice(specialOffer.special_price)}</span>
                        </div>
                    </div>
                </div>
                <Button>Update Special Offer</Button>
            </CardContent>
        </Card>
    );
}
