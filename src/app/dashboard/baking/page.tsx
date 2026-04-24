"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChefHat, CheckCircle2 } from "lucide-react";
import { getBakingList } from "../actions";
import Image from "next/image";

interface BakingItem {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    category: string;
  };
  total: number;
  orders: Array<{
    id: string;
    quantity: number;
  }>;
}

export default function BakingListPage() {
  const [bakingItems, setBakingItems] = useState<BakingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getBakingList();
      if (res.success) setBakingItems((res.data as BakingItem[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-20 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p className="font-serif italic">Heating up the ovens...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Production</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">Baking List</h2>
        <p className="text-muted-foreground text-sm mt-2">Daily production aggregate for paid orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bakingItems.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
             <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-4" />
             <p className="text-stone-400 font-serif italic">No paid orders scheduled for baking today.</p>
          </div>
        ) : (
          bakingItems.map((item) => (
            <Card key={item.product.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 relative">
                <div className="flex justify-between items-start">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-100 mb-2">
                    <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase text-[9px] tracking-widest">
                    {item.product.category}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-xl line-clamp-1">{item.product.name}</CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-tighter font-bold text-stone-400">Total Quantity to Bake</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center gap-4 py-4 border-y border-stone-50 mb-4">
                    <div className="flex-1">
                        <span className="text-4xl font-serif font-black text-primary italic">{item.total}</span>
                        <span className="ml-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">pcs</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Distribution</p>
                    {item.orders.map((order) => (
                        <div key={order.id} className="flex justify-between items-center py-1 px-2 hover:bg-stone-50 rounded transition-colors">
                            <span className="text-[11px] font-mono font-medium text-stone-500 uppercase tracking-tighter">#{order.id.slice(-6)}</span>
                            <span className="text-[11px] font-bold text-stone-900">{order.quantity} pcs</span>
                        </div>
                    ))}
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
