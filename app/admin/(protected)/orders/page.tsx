
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
import { MoreHorizontal } from "lucide-react";
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
            toast({ variant: "destructive", title: "Error", description: "Could not fetch orders." });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleUpdateStatus = async (orderId: number, status: 'processing' | 'complete' | 'cancelled') => {
        try {
            await updateOrderStatus(orderId, status);
            toast({ title: "Status Updated", description: `Order status changed to ${status}.` });
            fetchData();
        } catch (error) {
             toast({ variant: "destructive", title: "Update Failed", description: "Could not update order status." });
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>A list of all recent orders.</CardDescription>
            </CardHeader>
            <CardContent>
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'complete')}>Mark as Complete</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'processing')}>Mark as Processing</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(order.id, 'cancelled')}>Cancel Order</DropdownMenuItem>
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
}
