'use client';

import { useEffect, useState } from "react";
import { getOrders } from "@/services/cake-service";
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

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const ordersData = await getOrders();
            setOrders(ordersData);
            setLoading(false);
        }
        fetchData();
    }, []);
    
    const handleUpdateStatus = (orderId: number, status: 'processing' | 'complete' | 'cancelled') => {
        // In a real app, this would show a dialog to confirm and then make an API call.
        /*
        fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
            body: JSON.stringify({ status }),
        }).then(response => {
            if (response.ok) {
                toast({ title: "Status Updated", description: `Order status changed to ${status}.` });
                // Re-fetch orders or update state locally
                setOrders(prev => prev.map(o => o.id === orderId ? {...o, order_status: status} : o));
            } else {
                toast({ variant: "destructive", title: "Error", description: "Could not update status." });
            }
        });
        */
        toast({ title: "Prototype Action", description: `This would update order #${orderId} to "${status}".` });
        // Optimistically update UI for prototype
        setOrders(prev => prev.map(o => o.id === orderId ? {...o, order_status: status} : o));
    };

    const getStatusVariant = (status: 'processing' | 'complete' | 'cancelled') => {
        switch (status) {
            case 'processing': return 'secondary';
            case 'complete': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

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
                            <TableHead>Status</TableHead>
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
                                        <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                                    </TableCell>
                                    <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.order_status)} className="capitalize">{order.order_status}</Badge>
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
