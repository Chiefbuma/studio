'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getOrders, getCakes } from "@/services/cake-service";
import type { Order, Cake } from "@/lib/types";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [cakes, setCakes] = useState<Cake[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [ordersData, cakesData] = await Promise.all([getOrders(), getCakes()]);
            setOrders(ordersData);
            setCakes(cakesData);
            setLoading(false);
        }
        fetchData();
    }, []);

    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    const totalOrders = orders.length;
    const totalCakes = cakes.length;
    const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
            </div>
        );
    }
    
    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">From all sales</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Total orders placed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{uniqueCustomers}</div>
                        <p className="text-xs text-muted-foreground">Unique customers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCakes}</div>
                        <p className="text-xs text-muted-foreground">Different cakes available</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome Admin!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This is your central hub for managing Cake Paradise. You can view recent orders, manage your cakes and special offers, and see key statistics about your store. Use the navigation on the left to get started.</p>
                        <p className="mt-4 text-sm text-muted-foreground">Note: This is a prototype admin panel. Changes made here will not be saved permanently as it currently operates on mock data.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
