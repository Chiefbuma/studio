
'use client';
import { useEffect, useState, useMemo, useCallback } from "react";
import { getCakes, getCustomizationOptions, deleteCake } from "@/services/cake-service";
import type { Cake, CustomizationOptions } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Star, Image as ImageIcon, MoreVertical, ArrowUpDown, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CakeDialog } from "@/components/admin/cake-dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type SortableCakeKeys = keyof Cake;

export default function CakesPage() {
    const [cakes, setCakes] = useState<Cake[]>([]);
    const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCake, setEditingCake] = useState<Cake | null>(null);
    const { toast } = useToast();

    // State for new table features
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableCakeKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

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
    }, []); // Removed `toast` from dependency array to fix infinite loop

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Memoized data processing pipeline
    const processedCakes = useMemo(() => {
        let filteredCakes = cakes.filter(cake =>
            cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cake.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortConfig !== null) {
            filteredCakes.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filteredCakes;
    }, [cakes, searchQuery, sortConfig]);

    const totalPages = Math.ceil(processedCakes.length / ITEMS_PER_PAGE);
    const paginatedCakes = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedCakes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [processedCakes, currentPage]);

    const handleSort = (key: SortableCakeKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return newSelection;
        });
    };
    
    const handleSelectAll = () => {
        if (selectedRows.size === paginatedCakes.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedCakes.map(c => c.id)));
        }
    };
    
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
            toast({ title: 'Cake Deleted', description: `"${cakeName}" has been successfully deleted.` });
            fetchData();
        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : `Could not delete "${cakeName}".`;
            toast({ variant: 'destructive', title: 'Deletion Failed', description: errorMessage });
        }
    };
    
    const handleDeleteSelected = async () => {
        if (selectedRows.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedRows.size} selected cake(s)?`)) return;

        const promises = Array.from(selectedRows).map(id => deleteCake(id));
        try {
            await Promise.all(promises);
            toast({ title: 'Bulk Deletion Successful', description: `${selectedRows.size} cake(s) deleted.` });
            setSelectedRows(new Set());
            fetchData();
        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : `Could not complete bulk deletion.`;
            toast({ variant: 'destructive', title: 'Bulk Deletion Failed', description: errorMessage });
        }
    };
    
    const handleFormSubmit = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const renderCakeActions = (cake: Cake) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(cake)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(cake.id, cake.name)} className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderSortableHeader = (key: SortableCakeKeys, label: string) => (
        <TableHead>
            <Button variant="ghost" onClick={() => handleSort(key)}>
                {label}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </TableHead>
    );

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle>Cakes</CardTitle>
                        <CardDescription>Manage your available cakes ({cakes.length} total).</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedRows.size > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Actions ({selectedRows.size})
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
                        <Button onClick={handleCreate}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Cake
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Search by name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    
                    {/* Responsive Container */}
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead padding="checkbox" className="p-2">
                                        <Checkbox
                                            checked={selectedRows.size === paginatedCakes.length && paginatedCakes.length > 0}
                                            indeterminate={selectedRows.size > 0 && selectedRows.size < paginatedCakes.length}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    {renderSortableHeader('name', 'Name')}
                                    {renderSortableHeader('customizable', 'Customizable')}
                                    {renderSortableHeader('category', 'Category')}
                                    {renderSortableHeader('rating', 'Rating')}
                                    {renderSortableHeader('base_price', 'Price')}
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                                            <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                ))
                                ) : paginatedCakes.length > 0 ? (
                                    paginatedCakes.map(cake => (
                                        <TableRow key={cake.id} data-state={selectedRows.has(cake.id) && "selected"}>
                                            <TableCell className="p-2">
                                                <Checkbox
                                                    checked={selectedRows.has(cake.id)}
                                                    onCheckedChange={() => handleSelectRow(cake.id)}
                                                />
                                            </TableCell>
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
                                            <TableCell>{formatPrice(cake.base_price)}</TableCell>
                                            <TableCell className="text-right">
                                               {renderCakeActions(cake)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No cakes found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
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

    