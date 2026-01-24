'use client';

import { useEffect, useState } from "react";
import { getCustomizationOptions } from "@/services/cake-service";
import type { CustomizationOptions, Flavor, Size, Color, Topping } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type CustomizationCategory = "flavors" | "sizes" | "colors" | "toppings";
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const categoryTitles: Record<CustomizationCategory, string> = {
    flavors: "Flavors",
    sizes: "Sizes",
    colors: "Colors",
    toppings: "Toppings",
};

export default function CustomizationsPage() {
    const [options, setOptions] = useState<CustomizationOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const optionsData = await getCustomizationOptions();
            setOptions(optionsData);
            setLoading(false);
        }
        fetchData();
    }, []);

    const handleAdd = (category: CustomizationCategory) => {
        // This would open a dialog/form to add a new item.
        // On submission, an API call would be made.
        /*
        const newItemData = { ... }; // from form
        fetch(`${API_BASE_URL}/customizations/${category}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
            body: JSON.stringify(newItemData),
        }).then(response => {
            if (response.ok) {
                toast({ title: 'Item Added' });
                // Re-fetch options
            } else {
                toast({ variant: 'destructive', title: 'Error' });
            }
        });
        */
        toast({ title: 'Prototype Action', description: `This would open a form to add a new ${category.slice(0, -1)}.` });
    };
    
    const handleEdit = (category: CustomizationCategory, itemId: string) => {
        toast({ title: 'Prototype Action', description: `This would open an edit form for item ${itemId} in ${category}.` });
    };

    const handleDelete = (category: CustomizationCategory, itemId: string) => {
        // This would show a confirmation dialog first.
        /*
        fetch(`${API_BASE_URL}/customizations/${category}/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        }).then(response => {
            if (response.ok) {
                toast({ title: 'Item Deleted' });
                // Re-fetch options or update state locally
            } else {
                toast({ variant: 'destructive', title: 'Error' });
            }
        });
        */
        toast({ variant: 'destructive', title: 'Prototype Action', description: `This would delete item ${itemId} from ${category}.` });
    };

    const renderTable = (category: CustomizationCategory, data: (Flavor | Size | Color | Topping)[]) => (
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
                                    { (category === 'colors' || category === 'flavors') && <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell> }
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    { category === 'sizes' && <TableCell><Skeleton className="h-5 w-24" /></TableCell> }
                                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                           ))
                        ) : (
                            data.map(item => (
                                <TableRow key={item.id}>
                                    { category === 'colors' && (
                                        <TableCell>
                                            <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: (item as Color).hex_value }}></div>
                                        </TableCell>
                                    )}
                                     { category === 'flavors' && (
                                        <TableCell>
                                            <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: (item as Flavor).color }}></div>
                                        </TableCell>
                                    )}
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    { category === 'sizes' && <TableCell>{(item as Size).serves}</TableCell> }
                                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(category, item.id)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(category, item.id)} className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

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
        </div>
    );
}
