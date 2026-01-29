
'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { getOrders, updateOrderStatus, getCustomizationOptions } from "@/services/cake-service";
import type { Order, CustomizationOptions } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { OrderDetailsDialog } from "@/components/admin/order-details-dialog";

type SortableOrderKeys = keyof Order;

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // State for new table features
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableOrderKeys; direction: 'ascending' | 'descending' } | null>({ key: 'created_at', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // State for details modal
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersData, customOptionsData] = await Promise.all([getOrders(), getCustomizationOptions()]);
            setOrders(ordersData);
            setCustomizationOptions(customOptionsData);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Could not fetch data.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Memoized data processing pipeline
    const processedOrders = useMemo(() => {
        let filteredOrders = orders.filter(order =>
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_phone.includes(searchQuery)
        );

        if (sortConfig !== null) {
            filteredOrders.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                // Special handling for date strings
                if (sortConfig.key === 'created_at') {
                    const dateA = new Date(aValue as string).getTime();
                    const dateB = new Date(bValue as string).getTime();
                    if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filteredOrders;
    }, [orders, searchQuery, sortConfig]);

    const totalPages = Math.ceil(processedOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [processedOrders, currentPage]);

    const handleSort = (key: SortableOrderKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleUpdateStatus = async (orderId: number, status: 'processing' | 'complete' | 'cancelled') => {
        try {
            await updateOrderStatus(orderId, status);
            toast({ title: "Status Updated", description: `Order status changed to ${status}.` });
            fetchData();
        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : "Could not update order status.";
             toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
        }
    };
    
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    const getOrderStatusVariant = (status: 'processing' | 'complete' | 'cancelled') => {
        switch (status) {
            case 'processing': return 'secondary';
            case 'complete': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const getPaymentStatusVariant = (status: 'paid' | 'pending') => {
        switch (status) {
            case 'paid': return 'default';
            case 'pending': return 'outline';
            default: return 'outline';
        }
    }

    const renderOrderActions = (order: Order) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewDetails(order)}>View Details</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'complete')}>Mark as Complete</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'processing')}>Mark as Processing</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(order.id, 'cancelled')}>Cancel Order</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
    
    const renderSortableHeader = (key: SortableOrderKeys, label: string) => (
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
                <CardHeader>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>A list of all recent orders ({orders.length} total).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Search by order #, name, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {renderSortableHeader('order_number', 'Order')}
                                    {renderSortableHeader('customer_name', 'Customer')}
                                    {renderSortableHeader('created_at', 'Date')}
                                    {renderSortableHeader('order_status', 'Order Status')}
                                    {renderSortableHeader('payment_status', 'Payment')}
                                    {renderSortableHeader('total_price', 'Total')}
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                ))
                                ) : paginatedOrders.length > 0 ? (
                                    paginatedOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.order_number}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.customer_name}</div>
                                                <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                                            </TableCell>
                                            <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                                            <TableCell>
                                                <Badge variant={getOrderStatusVariant(order.order_status)} className="capitalize">{order.order_status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getPaymentStatusVariant(order.payment_status)} className="capitalize">{order.payment_status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{formatPrice(order.total_price)}</TableCell>
                                            <TableCell className="text-right">
                                               {renderOrderActions(order)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No orders found.
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
            {selectedOrder && customizationOptions && (
                <OrderDetailsDialog
                    isOpen={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                    order={selectedOrder}
                    customizationOptions={customizationOptions}
                />
            )}
        </>
    );
}

    

    