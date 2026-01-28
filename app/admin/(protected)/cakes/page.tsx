
'use client';
import { useEffect, useState, useCallback } from "react";
import { getCakes, getCustomizationOptions, deleteCake } from "@/services/cake-service";
import type { Cake, CustomizationOptions } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Star, Image as ImageIcon, MoreVertical } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
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
    }, []);

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

    const renderCakeActions = (cake: Cake) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4 md:hidden" />
                    <MoreHorizontal className="h-4 w-4 hidden md:inline-flex" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(cake)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(cake.id, cake.name)} className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

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
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {loading ? (
                             Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="p-4"><Skeleton className="h-24 w-full" /></Card>
                             ))
                        ) : (
                            cakes.map(cake => (
                                <Card key={cake.id}>
                                    <CardContent className="p-4 flex gap-4 items-start">
                                        {cake.image_data_uri ? (
                                            <Image src={cake.image_data_uri} alt={cake.name} width={80} height={80} className="rounded-md object-cover aspect-square" />
                                        ) : (
                                            <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-grow space-y-1">
                                            <h3 className="font-bold">{cake.name}</h3>
                                            <Badge variant="outline">{cake.category}</Badge>
                                            <div className="text-sm font-medium text-primary">{formatPrice(cake.base_price)}</div>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Star className="w-4 h-4 text-primary fill-primary" /> {cake.rating.toFixed(1)}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {renderCakeActions(cake)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                    
                    {/* Desktop View */}
                    <div className="hidden md:block border rounded-md">
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
                                    cakes.map(cake => (
                                        <TableRow key={cake.id}>
                                            <TableCell>
                                                {cake.image_data_uri ? (
                                                    <Image src={cake.image_data_uri} alt={cake.name} width={48} height={48} className="rounded-md object-cover h-12 w-12" />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                                    </div>
                                                )}
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
                                               {renderCakeActions(cake)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <CakeDialog 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onFormSubmit={handleFormSubmit}
                cakeToEdit={editingCake}
                flavors={customizationOptions?.flavors || []}
            />
        </>
    );
}
