"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Calculator, 
    Banknote, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    ShieldCheck,
    TrendingDown,
    TrendingUp
} from "lucide-react";
import { getClosingSummary, saveClosingSession } from "../../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ClosingSummary {
  totalOrders: number;
  totalRevenue: number;
  date: Date;
}

export default function DayEndClosingPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<ClosingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [cashInHand, setCashInHand] = useState<string>("");
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getClosingSummary();
      if (res.success) setSummary(res.summary || null);
      setLoading(false);
    }
    load();
  }, []);

  const totalRevenue = summary?.totalRevenue || 0;
  const cashValue = parseFloat(cashInHand) || 0;
  const difference = cashValue - totalRevenue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary) return;
    if (!staffName) {
        toast.error("Please enter staff name");
        return;
    }
    
    setIsSubmitting(true);
    const res = await saveClosingSession({
        totalOrders: summary?.totalOrders ?? 0,
        totalRevenue,
        cashInHand: cashValue,
        difference,
        notes,
        staffName
    });

    if (res.success) {
        toast.success("Day ended successfully. Record saved.");
        router.push("/dashboard/sales");
    } else {
        toast.error("Failed to save closing: " + res.error);
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-20 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p className="font-serif italic">Counting the dough...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Accountability</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">Day End Closing</h2>
        <p className="text-muted-foreground text-sm mt-2">Reconcile physical cash with system records before closing for the day.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left: System Summary */}
        <div className="space-y-6">
            <Card className="border-none shadow-sm bg-stone-50/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <CardTitle className="font-serif text-xl">System Ledger (Paid)</CardTitle>
                    </div>
                    <CardDescription>Today&apos;s settled transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-end pb-4 border-b border-stone-200/50">
                        <span className="text-sm text-stone-500 font-medium">Total Settled Orders</span>
                        <span className="text-2xl font-serif font-black italic">{summary?.totalOrders ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-end pb-4 border-b border-stone-200/50">
                        <span className="text-sm text-stone-500 font-medium">Total System Revenue</span>
                        <span className="text-2xl font-serif font-black italic text-primary">Rp {totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-stone-100 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <p className="text-[11px] text-stone-500 leading-relaxed font-medium uppercase tracking-tight">
                            Ensure all PENDING orders have been addressed before submitting the final closing for today.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right: Physical Verification */}
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-xl bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Banknote className="w-4 h-4" />
                        </div>
                        <CardTitle className="font-serif text-xl">Physical Cash Verification</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Total Cash in Drawer (Rp)</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-400">Rp</span>
                            <Input 
                                type="number"
                                required
                                value={cashInHand}
                                onChange={(e) => setCashInHand(e.target.value)}
                                className="pl-12 h-14 bg-stone-50 border-none font-serif text-2xl font-black italic"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Reconciliation Result */}
                    <div className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors ${difference === 0 ? "border-green-200 bg-green-50" : difference < 0 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Reconciliation Result</span>
                        <div className="flex items-center gap-2">
                            {difference === 0 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : difference < 0 ? (
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            ) : (
                                <TrendingUp className="w-5 h-5 text-amber-600" />
                            )}
                            <span className={`text-2xl font-serif font-black italic ${difference === 0 ? "text-green-700" : difference < 0 ? "text-red-700" : "text-amber-700"}`}>
                                {difference === 0 ? "Balanced" : `Rp ${difference.toLocaleString()}`}
                            </span>
                        </div>
                        <p className="text-xs font-medium opacity-70">
                            {difference === 0 ? "Ledger matches physical cash." : difference < 0 ? "Cash is missing from drawer." : "Extra cash found in drawer."}
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 text-right block">Signatory Staff</Label>
                            <Input 
                                required
                                value={staffName}
                                onChange={(e) => setStaffName(e.target.value)}
                                className="h-11 bg-stone-50 border-none" 
                                placeholder="Enter your full name" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 text-right block">Reconciliation Notes</Label>
                            <Textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="bg-stone-50 border-none min-h-[80px]" 
                                placeholder="Explain any differences if applicable..." 
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 rounded-2xl"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Calculator className="w-5 h-5 mr-2" />
                        )}
                        {isSubmitting ? "Submitting..." : "Submit Closing Session"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </div>
    </div>
  );
}
