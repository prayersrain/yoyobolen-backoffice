"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, Banknote, Receipt, 
  TrendingUp as TrendingUpLucide, ShoppingBag, 
  ChevronRight as ChevronRightLucide, 
  Loader2
} from "lucide-react";
import Link from "next/link";
import { getOrders, getSalesMetrics } from "../actions";
import { OrderReceipt } from "@/components/orders/OrderReceipt";
import { Printer } from "lucide-react";

interface Metrics {
  revenueToday: number;
  totalOrders: number;
  avgOrderValue: number;
  chartData: number[];
}

interface DashboardOrder {
  id: string;
  customer?: { name: string; phone: string };
  totalAmount: number;
  status: string;
  createdAt: string;
  channel: string;
  paymentMethod: string;
  snapUrl?: string;
  items?: any[];
}

export default function SalesDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const [mRes, oRes] = await Promise.all([
        getSalesMetrics(),
        getOrders()
      ]);

      if (mRes.success && mRes.metrics) setMetrics(mRes.metrics);
      if (oRes.success && oRes.data) setRecentOrders(oRes.data.slice(0, 5));
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "text-green-700 bg-green-100";
      case "PENDING": return "text-amber-600 bg-amber-100";
      case "CANCELLED": return "text-red-700 bg-red-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const exportToCSV = async () => {
    setLoading(true);
    const res = await getOrders();
    if (!res.success || !res.data) {
      alert("Failed to fetch full ledger for export.");
      setLoading(false);
      return;
    }
    
    const allOrders = res.data;
    const headers = ["Order ID", "Customer Name", "Phone", "Date", "Time", "Status", "Channel", "Payment Method", "Amount"];
    const rows = allOrders.map((o: any) => [
      `"${o.id}"`, 
      `"${o.customer?.name || "Unknown"}"`,
      `"${o.customer?.phone || "-"}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${new Date(o.createdAt).toLocaleTimeString()}"`,
      `"${o.status}"`,
      `"${o.channel}"`,
      `"${o.paymentMethod}"`,
      `"${parseFloat(o.totalAmount)}"`
    ]);
    
    // Add BOM for Excel UTF-8 compatibility
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map((e: any[]) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `yoyobolen_full_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-20 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p className="font-serif italic">Reviewing your ledger...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">
            Overview
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Current Ledger
          </h2>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={exportToCSV}
            className="h-10 px-4 py-2 rounded-lg text-sm font-medium border-stone-200"
          >
            <Receipt className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Link 
            href="/dashboard/orders/new"
            className="inline-flex items-center justify-center whitespace-nowrap outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 select-none bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 h-10 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Link>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-min">
        
        {/* Stats Row */}
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="relative overflow-hidden group border-none shadow-sm bg-stone-50/50">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Revenue</span>
                <div className="p-2 bg-white rounded-md text-orange-600 shadow-sm">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>
              <div className="font-serif text-2xl font-bold mb-1">Rp {metrics?.revenueToday?.toLocaleString() || "0"}</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Lifetime Settled Sales</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border-none shadow-sm bg-stone-50/50">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Volume Orders</span>
                <div className="p-2 bg-white rounded-md text-blue-600 shadow-sm">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="font-serif text-2xl font-bold mb-1">{metrics?.totalOrders || "0"}</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total Transaction Count</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border-none shadow-sm bg-stone-50/50">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avg Ticket</span>
                <div className="p-2 bg-white rounded-md text-stone-500 shadow-sm">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="font-serif text-2xl font-bold mb-1">Rp {Math.round(metrics?.avgOrderValue || 0).toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Average Value per Order</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border-none shadow-sm bg-stone-50/50">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Health</span>
                <div className="p-2 bg-white rounded-md text-green-600 shadow-sm">
                  <TrendingUpLucide className="w-5 h-5" />
                </div>
              </div>
              <div className="font-serif text-2xl font-bold mb-1">99.9%</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">System Operational</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart Area */}
        <Card className="col-span-1 md:col-span-12 xl:col-span-8 border-none shadow-sm bg-stone-50/50 flex flex-col min-h-[300px]">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="font-serif text-xl">Revenue Trend</CardTitle>
              <CardDescription>Visual summary of recent activity</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 relative w-full mt-4 flex items-end pt-10 px-6 pb-6 overflow-hidden">
             {/* Dynamic CSS Bar Chart */}
             <div className="w-full h-40 flex items-end justify-between gap-2 lg:gap-4">
                {metrics?.chartData?.map((value: number, i: number) => {
                   const max = Math.max(...metrics.chartData, 1);
                   const height = (value / max) * 100;
                   return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                         <div 
                            className="w-full bg-primary/20 rounded-t-lg transition-all duration-700 ease-out relative overflow-hidden"
                            style={{ height: `${Math.max(height, 5)}%` }}
                         >
                            <div 
                               className="absolute bottom-0 left-0 w-full bg-linear-to-t from-primary to-primary/40 rounded-t-lg transition-all group-hover:brightness-110" 
                               style={{ height: '100%' }}
                            ></div>
                            {/* Hover Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                               Rp {value.toLocaleString()}
                            </div>
                         </div>
                         <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                            {['S','M','T','W','T','F','S'][(new Date().getDay() - (6 - i) + 7) % 7]}
                         </span>
                      </div>
                   );
                })}
             </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-1 md:col-span-12 xl:col-span-4 border-none shadow-sm bg-stone-50/50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="font-serif text-xl">Catalogue Sneak</CardTitle>
            <Link href="/dashboard/products" className="text-sm font-medium text-primary hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-[10px] text-muted-foreground italic mb-2 uppercase tracking-widest font-bold">Populating Catalogue...</p>
            <div className="text-center py-10 opacity-30">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xs">Product stats coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="col-span-1 md:col-span-12 border-none shadow-sm bg-stone-50/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl">Recent Ledger Activity</CardTitle>
              <CardDescription>Latest entries in the transaction journal</CardDescription>
            </div>
            <Link href="/dashboard/orders" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Full Journal</Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground italic text-sm">No activity recorded yet. Time to bake!</div>
            ) : (
                <Table>
                <TableHeader className="bg-transparent">
                    <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="pl-6 uppercase text-[10px] font-bold tracking-widest">Entry ID</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-widest">Customer</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-widest">Total</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-widest">Status</TableHead>
                    <TableHead className="pr-6 text-right uppercase text-[10px] font-bold tracking-widest">Journal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentOrders.map((order) => (
                    <TableRow key={order.id} className="bg-white border-b-4 border-stone-50/50 hover:bg-stone-50 transition-colors group">
                        <TableCell className="pl-6 font-medium text-primary uppercase text-[10px]">#{order.id.slice(-6)}</TableCell>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-xs">{order.customer?.name}</span>
                        </div>
                        </TableCell>
                        <TableCell className="font-serif font-bold text-sm">Rp {order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                        <Badge variant="secondary" className={`${getStatusColor(order.status)} border-none text-[9px] font-bold uppercase tracking-widest px-2 py-0.5`}>
                            {order.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setSelectedOrder(order)}
                              title="Print Receipt" 
                              className="h-8 w-8 hover:bg-primary/10"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Link href={`/payment/${order.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                                  <ChevronRightLucide className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                      ))}
                  </TableBody>
                  </Table>
              )}
            </CardContent>
          </Card>
  
        </div>

        {/* Receipt Modal */}
        {selectedOrder && (
          <OrderReceipt 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        )}
    </div>
  );
}
