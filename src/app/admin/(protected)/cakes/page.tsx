'use client';
import { useEffect, useState, useCallback } from "react";
import { getCakes } from "@/services/cake-service";
import type { Cake } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function CakesPage() {
    const [cakes, setCakes] = useState<Cake[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const cakesData = await getCakes();
            // We filter out the custom cake placeholder
            setCakes(cakesData.filter(c => c.id !== 'custom-cake'));
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch cakes." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = () => {
        // In a real app, this would open a form/dialog to create a new cake.
        // For this example, we'll simulate creating a new cake with placeholder data.
        const newCakeData = { name: "New Awesome Cake", base_price: 3000, customizable: true, description: "A new cake." };
        
        fetch(`${API_BASE_URL}/cakes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
            body: JSON.stringify(newCakeData),
        }).then(async response => {
            if (response.ok) {
                toast({ title: "Cake Created", description: "The new cake has been added." });
                await fetchData(); // Re-fetch cakes
            } else {
                const error = await response.json();
                toast({ variant: "destructive", title: "Error", description: error.message || "Could not create cake." });
            }
        }).catch(err => {
            toast({ variant: "destructive", title: "Error", description: err.message || "Could not create cake." });
        });
    };

    const handleEdit = (cakeId: string) => {
        // This would open a form/dialog pre-filled with the cake's data.
        // The form would include a toggle for the 'customizable' field.
        // For demonstration, we'll just show the toast.
        toast({ title: "Prototype Action", description: `This would open an 'Edit' form for cake ${cakeId}.` });
    };

    const handleDelete = async (cakeId: string, cakeName: string) => {
        // This would show a confirmation dialog first.
        if (!confirm(`Are you sure you want to delete "${cakeName}"?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cakes/${cakeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete cake.');
            }

            // Remove the cake from the local state to update the UI instantly
            setCakes(prevCakes => prevCakes.filter(c => c.id !== cakeId));

            toast({
                title: 'Cake Deleted',
                description: `"${cakeName}" has been successfully deleted.`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: error.message || 'An unknown error occurred.',
            });
        }
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Cakes</CardTitle>
                    <CardDescription>Manage your available cakes.</CardDescription>
                </div>
                <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Cake
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                             <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                           ))
                        ) : (
                            cakes.map(cake => {
                                const image = PlaceHolderImages.find(img => img.id === cake.image_id) || PlaceHolderImages[0];
                                return (
                                <TableRow key={cake.id}>
                                    <TableCell>
                                        <Image src={image.imageUrl} alt={cake.name} width={48} height={48} className="rounded-md object-cover h-12 w-12" />
                                    </TableCell>
                                    <TableCell className="font-medium">{cake.name}</TableCell>
                                    <TableCell><Badge variant="outline">{cake.category}</Badge></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-primary fill-primary" /> {cake.rating.toFixed(1)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{formatPrice(cake.base_price)}</TableCell>
                                     <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(cake.id)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(cake.id, cake.name)} className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
