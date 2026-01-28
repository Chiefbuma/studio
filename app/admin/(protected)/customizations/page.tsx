
'use client';

import { useEffect, useState, useCallback } from "react";
import { getCustomizationOptions, deleteCustomizationOption } from "@/services/cake-service";
import type { CustomizationOptions, Flavor, Size, Color, Topping, CustomizationCategory, CustomizationData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, MoreVertical } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CustomizationDialog } from "@/components/admin/customization-dialog";

type ModalState = {
    isOpen: boolean;
    category?: CustomizationCategory;
    item?: CustomizationData | null;
}

const categoryTitles: Record<CustomizationCategory, string> = {
    flavors: "Flavors",
    sizes: "Sizes",
    colors: "Colors",
    toppings: "Toppings",
};

export default function CustomizationsPage() {
    const [options, setOptions] = useState<CustomizationOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const optionsData = await getCustomizationOptions();
            setOptions(optionsData);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Could not fetch customization options.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = (category: CustomizationCategory) => {
        setModalState({ isOpen: true, category, item: null });
    };
    
    const handleEdit = (category: CustomizationCategory, item: CustomizationData) => {
        setModalState({ isOpen: true, category, item });
    };

    const handleDelete = async (category: CustomizationCategory, itemId: string, itemName: string) => {
        if (!confirm(`Are you sure you want to delete "${itemName}" from ${category}?`)) return;
        
        try {
            await deleteCustomizationOption(category, itemId);
            toast({ title: 'Item Deleted', description: `Item "${itemName}" was deleted from ${category}.` });
            fetchData();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Could not delete the item. Please try again.`;
            toast({ variant: 'destructive', title: 'Deletion Failed', description: errorMessage });
        }
    };

    const handleFormSubmit = () => {
        setModalState({ isOpen: false });
        fetchData();
    };

    const renderTable = (category: CustomizationCategory, data: (Flavor | Size | Color | Topping)[]) => {
         const renderActions = (item: CustomizationData) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4 md:hidden" />
                        <MoreHorizontal className="h-4 w-4 hidden md:inline-flex" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(category, item)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(category, item.id, item.name)} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{categoryTitles[category]}</CardTitle>
                        <CardDescription>Manage your available {category.toLowerCase()}.</CardDescription>
                    </div>
                    <Button onClick={() => handleAdd(category)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add {categoryTitles[category].slice(0, -1)}
                    </Button>
                </CardHeader>
                <CardContent>
                     {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                        {loading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <Card key={i} className="p-3"><Skeleton className="h-10 w-full" /></Card>
                            ))
                        ) : (
                            data.map(item => (
                                <Card key={item.id} className="p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            {category === 'colors' && <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: (item as Color).hex_value }}></div>}
                                            {category === 'flavors' && <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: (item as Flavor).color }}></div>}
                                            <div className="flex-grow">
                                                <p className="font-bold">{item.name}</p>
                                                {category === 'sizes' && <p className="text-xs text-muted-foreground">{(item as Size).serves}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-primary">{formatPrice(item.price)}</p>
                                            {renderActions(item)}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {category === 'colors' && <TableHead className="w-[50px]">Color</TableHead>}
                                    {category === 'flavors' && <TableHead className="w-[50px]">Preview</TableHead>}
                                    <TableHead>Name</TableHead>
                                    {category === 'sizes' && <TableHead>Serves</TableHead>}
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {(category === 'colors' || category === 'flavors') && <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>}
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            {category === 'sizes' && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                ))
                                ) : (
                                    data.map(item => (
                                        <TableRow key={item.id}>
                                            {category === 'colors' && (
                                                <TableCell>
                                                    <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: (item as Color).hex_value }}></div>
                                                </TableCell>
                                            )}
                                            {category === 'flavors' && (
                                                <TableCell>
                                                    <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: (item as Flavor).color }}></div>
                                                </TableCell>
                                            )}
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            {category === 'sizes' && <TableCell>{(item as Size).serves}</TableCell>}
                                            <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                                            <TableCell className="text-right">
                                               {renderActions(item)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manage Customizations</h1>
            <Tabs defaultValue="flavors" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="flavors">Flavors</TabsTrigger>
                    <TabsTrigger value="sizes">Sizes</TabsTrigger>
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="toppings">Toppings</TabsTrigger>
                </TabsList>
                <TabsContent value="flavors" className="mt-4">
                    {renderTable('flavors', options?.flavors || [])}
                </TabsContent>
                <TabsContent value="sizes" className="mt-4">
                    {renderTable('sizes', options?.sizes || [])}
                </TabsContent>
                <TabsContent value="colors" className="mt-4">
                    {renderTable('colors', options?.colors || [])}
                </TabsContent>
                <TabsContent value="toppings" className="mt-4">
                    {renderTable('toppings', options?.toppings || [])}
                </TabsContent>
            </Tabs>
             {modalState.isOpen && modalState.category && (
                <CustomizationDialog 
                    isOpen={modalState.isOpen}
                    onOpenChange={(isOpen) => setModalState(prev => ({...prev, isOpen}))}
                    onFormSubmit={handleFormSubmit}
                    category={modalState.category}
                    itemToEdit={modalState.item}
                />
            )}
        </div>
    );
}
