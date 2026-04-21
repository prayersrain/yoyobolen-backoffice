"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getCustomers } from "./actions";

export default function CustomerDatabase() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      const res = await getCustomers();
      if (res.success && res.data) {
        setCustomers(res.data);
      }
      setLoading(false);
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">Customer Ledger</h2>
          <p className="font-sans text-muted-foreground text-sm tracking-wide uppercase">Clientele & Relations</p>
        </div>
      </div>

      {/* Search Bar (Mobile + Desktop) */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customers by name or phone..." 
          className="pl-9 h-11 bg-white border-stone-200 shadow-sm"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-serif italic">Accessing clientele history...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-muted-foreground opacity-30">
            <UserRound className="w-12 h-12 mb-4" />
            <p>No customers recorded in database yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-stone-50/50">
              <TableRow className="hover:bg-transparent text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <TableHead className="py-4 px-6">Customer</TableHead>
                <TableHead className="py-4 px-6">Contact</TableHead>
                <TableHead className="py-4 px-6">History</TableHead>
                <TableHead className="py-4 px-6">Engagement</TableHead>
                <TableHead className="py-4 px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-stone-100">
              {filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="transition-colors group hover:bg-stone-50"
                >
                  <TableCell className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-stone-200 bg-primary/10 text-primary">
                        <AvatarFallback className="font-serif font-bold text-sm bg-transparent">
                          {customer.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-sans text-sm font-semibold text-foreground">{customer.name}</p>
                        </div>
                        <p className="font-sans text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Joined {new Date(customer.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 whitespace-nowrap">
                    <p className="font-sans text-sm text-foreground">{customer.phone}</p>
                  </TableCell>
                  <TableCell className="py-4 px-6 whitespace-nowrap">
                    <p className="font-sans text-xs font-bold text-foreground">
                      {customer.orderCount} Total Orders
                    </p>
                    <p className="font-sans text-[10px] text-muted-foreground">Settled Journal entries</p>
                  </TableCell>
                  <TableCell className="py-4 px-6 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <p className="font-serif font-bold text-sm">
                        Rp {customer.totalSpent.toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-none text-[8px] font-bold uppercase tracking-widest px-2 py-0">
                        Active
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm" className="text-primary font-bold uppercase text-[10px] tracking-widest">
                      Ledger History
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Legend Container */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <p className="font-sans text-xs text-muted-foreground uppercase font-bold tracking-widest">
          {filteredCustomers.length} unique patrons identified
        </p>
      </div>
    </div>
  );
}
