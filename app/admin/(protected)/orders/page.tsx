
'use client';

import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "@/services/cake-service";
import type { Order } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const ordersData = await getOrders();
            setOrders(ordersData);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Could not fetch orders.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
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
                    <MoreVertical className="h-4 w-4 md:hidden" />
                    <MoreHorizontal className="h-4 w-4 hidden md:inline-flex" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'complete')}>Mark as Complete</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'processing')}>Mark as Processing</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(order.id, 'cancelled')}>Cancel Order</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>A list of all recent orders.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Mobile View */}
                <div className="md:hidden space-y-4">
                     {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="p-4"><Skeleton className="h-20 w-full" /></Card>
                        ))
                    ) : (
                        orders.map(order => (
                            <Card key={order.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="font-bold">{order.customer_name}</p>
                                            <p className="text-sm text-muted-foreground">{order.order_number}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), "MMM d, yyyy")}</p>
                                        </div>
                                        <div className="flex-shrink-0">{renderOrderActions(order)}</div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getOrderStatusVariant(order.order_status)} className="capitalize">{order.order_status}</Badge>
                                            <Badge variant={getPaymentStatusVariant(order.payment_status)} className="capitalize">{order.payment_status}</Badge>
                                        </div>
                                        <p className="font-bold text-lg text-primary">{formatPrice(order.total_price)}</p>
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
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Order Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">Total</TableHead>
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
                                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                            ))
                            ) : (
                                orders.map(order => (
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
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
