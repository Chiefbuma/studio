
'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { getCustomizationOptions, deleteCustomizationOption } from "@/services/cake-service";
import type { CustomizationOptions, Flavor, Size, Color, Topping, CustomizationCategory, CustomizationData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, MoreVertical, ArrowUpDown, Trash2, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CustomizationDialog } from "@/components/admin/customization-dialog";
import { Checkbox } from "@/components/ui/checkbox";

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

    // State for advanced table features
    const [activeTab, setActiveTab] = useState<CustomizationCategory>('flavors');
    const [sortConfigs, setSortConfigs] = useState<Partial<Record<CustomizationCategory, { key: string; direction: 'ascending' | 'descending' }>>>({});
    const [selectedRows, setSelectedRows] = useState<Partial<Record<CustomizationCategory, Set<string>>>>({});

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

    // Advanced table feature handlers
    const handleSort = (category: CustomizationCategory, key: string) => {
        setSortConfigs(prev => {
            const currentSort = prev[category];
            let direction: 'ascending' | 'descending' = 'ascending';
            if (currentSort && currentSort.key === key && currentSort.direction === 'ascending') {
                direction = 'descending';
            }
            return { ...prev, [category]: { key, direction } };
        });
    };

    const handleSelectRow = (category: CustomizationCategory, id: string) => {
        setSelectedRows(prev => {
            const newSelection = new Set(prev[category] || []);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return { ...prev, [category]: newSelection };
        });
    };

    const handleSelectAll = (category: CustomizationCategory, data: CustomizationData[]) => {
        setSelectedRows(prev => {
            const currentSelection = prev[category] || new Set();
            if (currentSelection.size === data.length) {
                return { ...prev, [category]: new Set() };
            } else {
                return { ...prev, [category]: new Set(data.map(item => item.id)) };
            }
        });
    };

    const handleDeleteSelected = async () => {
        const selectedIds = selectedRows[activeTab];
        if (!selectedIds || selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected item(s) from ${categoryTitles[activeTab]}?`)) return;

        const promises = Array.from(selectedIds).map(id => deleteCustomizationOption(activeTab, id));
        try {
            await Promise.all(promises);
            toast({ title: 'Bulk Deletion Successful', description: `${selectedIds.size} item(s) deleted.` });
            setSelectedRows(prev => ({ ...prev, [activeTab]: new Set() }));
            fetchData();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Could not complete bulk deletion.`;
            toast({ variant: 'destructive', title: 'Bulk Deletion Failed', description: errorMessage });
        }
    };

    const processedData = useMemo(() => {
        if (!options) return {};
        const result: Partial<Record<CustomizationCategory, any[]>> = {};
        for (const key in options) {
            const category = key as CustomizationCategory;
            let data = [...(options[category] || [])];
            const sortConfig = sortConfigs[category];
            if (sortConfig) {
                data.sort((a, b) => {
                    const aValue = a[sortConfig.key];
                    const bValue = b[sortConfig.key];
                    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                });
            }
            result[category] = data;
        }
        return result;
    }, [options, sortConfigs]);

    const renderTable = (category: CustomizationCategory) => {
        const data = processedData[category] || [];
        const selection = selectedRows[category] || new Set();

        const renderSortableHeader = (key: string, label: string) => (
            <TableHead>
                <Button variant="ghost" onClick={() => handleSort(category, key)}>
                    {label}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </TableHead>
        );

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
                    <div className="flex-1">
                        <CardTitle>{categoryTitles[category]}</CardTitle>
                        <CardDescription>Manage your available {category.toLowerCase()}.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        {selection.size > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Actions ({selection.size})
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleDeleteSelected} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Selected
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <Button onClick={() => handleAdd(category)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add {categoryTitles[category].slice(0, -1)}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="p-2 w-[48px]">
                                         <Checkbox
                                            checked={data.length > 0 && selection.size === data.length}
                                            indeterminate={selection.size > 0 && selection.size < data.length}
                                            onCheckedChange={() => handleSelectAll(category, data)}
                                        />
                                    </TableHead>
                                    {category === 'colors' && <TableHead className="w-[50px]">Color</TableHead>}
                                    {category === 'flavors' && <TableHead className="w-[50px]">Preview</TableHead>}
                                    {renderSortableHeader('name', 'Name')}
                                    {category === 'sizes' && <TableHead>Serves</TableHead>}
                                    {renderSortableHeader('price', 'Price')}
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                                            {(category === 'colors' || category === 'flavors') && <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>}
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            {category === 'sizes' && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                                            <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                ))
                                ) : (
                                    data.map(item => (
                                        <TableRow key={item.id} data-state={selection.has(item.id) && "selected"}>
                                            <TableCell className="p-2">
                                                <Checkbox
                                                    checked={selection.has(item.id)}
                                                    onCheckedChange={() => handleSelectRow(category, item.id)}
                                                />
                                            </TableCell>
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
            <Tabs defaultValue="flavors" className="w-full" onValueChange={(value) => setActiveTab(value as CustomizationCategory)}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="flavors">Flavors</TabsTrigger>
                    <TabsTrigger value="sizes">Sizes</TabsTrigger>
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="toppings">Toppings</TabsTrigger>
                </TabsList>
                <TabsContent value="flavors" className="mt-4">
                    {renderTable('flavors')}
                </TabsContent>
                <TabsContent value="sizes" className="mt-4">
                    {renderTable('sizes')}
                </TabsContent>
                <TabsContent value="colors" className="mt-4">
                    {renderTable('colors')}
                </TabsContent>
                <TabsContent value="toppings" className="mt-4">
                    {renderTable('toppings')}
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

    