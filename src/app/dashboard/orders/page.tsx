"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getOrders } from "../actions";
import { OrderReceipt } from "@/components/orders/OrderReceipt";
import { Printer } from "lucide-react";

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    async function fetchOrders() {
      const res = await getOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "text-green-700 bg-green-100";
      case "PENDING": return "text-amber-600 bg-amber-100";
      case "CANCELLED": return "text-red-700 bg-red-100";
      case "EXPIRED": return "text-stone-600 bg-stone-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  // Simple filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl text-foreground mb-1 font-bold">Order Management</h1>
          <p className="font-sans text-muted-foreground text-sm tracking-wide uppercase opacity-80">Track & Fulfill Artisanal Requests</p>
        </div>
        <Link 
          href="/dashboard/orders/new" 
          className="inline-flex items-center justify-center whitespace-nowrap outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 select-none bg-primary text-primary-foreground hover:bg-primary/90 text-white shadow-sm px-6 h-12 rounded-lg text-sm font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Order
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl p-6 flex flex-col lg:flex-row gap-6 items-end shadow-sm border border-stone-200/50">
        <div className="w-full lg:w-1/2">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Search Orders</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-stone-50 border-none" 
              placeholder="Order ID or Customer Name..." 
            />
          </div>
        </div>
        <div className="w-full lg:w-1/4">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="h-12 bg-stone-50 border-none">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full lg:w-auto">
          <Button variant="secondary" className="w-full h-12 px-6 bg-stone-100 text-primary hover:bg-stone-200">
            <Filter className="w-5 h-5 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200/50 overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Gathering ledger data...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-stone-50 border-b border-stone-200/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 px-6 text-sm font-medium text-muted-foreground">Order ID</TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-muted-foreground">Customer</TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-muted-foreground">Channel</TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-muted-foreground">Total</TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-muted-foreground">Created At</TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-stone-50 transition-colors group">
                    <TableCell className="py-4 px-6 font-medium text-primary uppercase text-xs">
                      #{order.id.slice(-8)}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 rounded-full border border-stone-200">
                          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                            {order.customer?.name?.substring(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{order.customer?.name}</span>
                          <span className="text-[10px] text-muted-foreground">{order.customer?.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="bg-stone-100 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-stone-200/50">
                        {order.channel}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 font-serif font-bold">
                      Rp {parseFloat(order.totalAmount).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge variant="secondary" className={`${getStatusColor(order.status)} border-none font-bold uppercase text-[9px] tracking-widest px-2 py-0.5`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <br/>
                      <span className="opacity-60">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedOrder(order)}
                          title="Print Receipt" 
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Link href={`/payment/${order.id}`}>
                          <Button variant="ghost" size="icon" title="View Payment Page" className="text-muted-foreground hover:text-primary">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Receipt Modal */}
            {selectedOrder && (
              <OrderReceipt 
                order={selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
              />
            )}

            {/* Simple footer count */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Showing {filteredOrders.length} entries in total ledger
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
