import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, ShoppingCart, Cake, Tag, LogOut, Home } from "lucide-react";
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
        <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
          <SidebarHeader className="h-14 flex items-center justify-center">
             <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
                <Cake className="h-6 w-6" />
                <span className="group-data-[collapsible=icon]:hidden">Cake Paradise</span>
             </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                 <SidebarMenuButton asChild tooltip="Dashboard">
                    <Link href="/admin/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Orders">
                    <Link href="/admin/orders"><ShoppingCart /><span>Orders</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Cakes">
                    <Link href="/admin/cakes"><Cake /><span>Cakes</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Special Offers">
                    <Link href="/admin/offers"><Tag /><span>Offers</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Back to Shop">
                        <Link href="/"><Home /><span>Back to Shop</span></Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Logout">
                        <LogOut /><span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col">
           <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold">Admin Panel</h1>
                </div>
                <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="@admin" />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
           </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
