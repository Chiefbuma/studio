
'use client';
import { useEffect, useState, useCallback } from "react";
import { getCakes, deleteCake, getCustomizationOptions } from "@/services/cake-service";
import type { Cake, CustomizationOptions } from "@/lib/types";
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
import { CakeDialog } from "@/components/admin/cake-dialog";

export default function CakesPage() {
    const [cakes, setCakes] = useState<Cake[]>([]);
    const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCake, setEditingCake] = useState<Cake | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [cakesData, customOptionsData] = await Promise.all([
                getCakes(),
                getCustomizationOptions()
            ]);
            setCakes(cakesData.filter(c => c.id !== 'custom-cake'));
            setCustomizationOptions(customOptionsData);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Could not fetch data.";
            toast({ variant: "destructive", title: "Data Fetching Error", description: errorMessage });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = () => {
        setEditingCake(null);
        setIsModalOpen(true);
    };

    const handleEdit = (cake: Cake) => {
        setEditingCake(cake);
        setIsModalOpen(true);
    };

    const handleDelete = async (cakeId: string, cakeName: string) => {
        if (!confirm(`Are you sure you want to delete "${cakeName}"?`)) return;
        
        try {
            await deleteCake(cakeId);
            toast({
                title: 'Cake Deleted',
                description: `"${cakeName}" has been successfully deleted.`,
            });
            fetchData();
        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : `Could not delete "${cakeName}". Please try again.`;
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: errorMessage,
            });
        }
    };
    
    const handleFormSubmit = () => {
        setIsModalOpen(false);
        fetchData();
    }

    return (
        <>
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
                                <TableHead>Customizable</TableHead>
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
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
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
                                        <TableCell>
                                            <Badge variant={cake.customizable ? 'secondary' : 'outline'}>
                                                {cake.customizable ? 'Yes' : 'No'}
                                            </Badge>
                                        </TableCell>
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
                                                    <DropdownMenuItem onClick={() => handleEdit(cake)}>Edit</DropdownMenuItem>
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
            <CakeDialog 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onFormSubmit={handleFormSubmit}
                cakeToEdit={editingCake}
                flavors={customizationOptions?.flavors || []}
                images={PlaceHolderImages}
            />
        </>
    );
}
