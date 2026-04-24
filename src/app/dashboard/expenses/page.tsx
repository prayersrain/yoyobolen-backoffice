"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    Receipt, 
    Plus, 
    Loader2, 
    Wallet,
    CheckCircle2
} from "lucide-react";
import { getExpenses, addExpense } from "../actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExpenseManagementPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newExpense, setNewExpense] = useState({
    label: "",
    amount: "",
    category: "Operational",
    notes: ""
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getExpenses();
    if (res.success) setExpenses(res.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.label || !newExpense.amount) return;
    
    setIsSubmitting(true);
    const res = await addExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount)
    });

    if (res.success) {
        toast.success("Expense recorded");
        setShowAddModal(false);
        setNewExpense({ label: "", amount: "", category: "Operational", notes: "" });
        load();
    } else {
        toast.error("Failed: " + res.error);
    }
    setIsSubmitting(false);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Accountability</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">Expense Ledger</h2>
          <p className="text-muted-foreground text-sm mt-2">Track business costs and operational spending.</p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger 
            render={
              <Button className="h-12 px-6 bg-primary text-white shadow-xl shadow-primary/20 rounded-xl" />
            }
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </DialogTrigger>
          <DialogContent className="bg-white border-0 shadow-2xl rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">New Expense Entry</DialogTitle>
              <DialogDescription>Record a new business expense.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Label / Item Name</Label>
                <Input 
                  required 
                  value={newExpense.label}
                  onChange={e => setNewExpense({...newExpense, label: e.target.value})}
                  placeholder="e.g., Listrik Maret, Tepung 50kg" 
                  className="h-11 bg-stone-50 border-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Amount (Rp)</Label>
                  <Input 
                    type="number" 
                    required 
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0" 
                    className="h-11 bg-stone-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Category</Label>
                  <Select value={newExpense.category} onValueChange={v => setNewExpense({...newExpense, category: v || "Operational"})}>
                    <SelectTrigger className="h-11 bg-stone-50 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operational">Operational</SelectItem>
                      <SelectItem value="Materials">Materials</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Notes (Optional)</Label>
                <Input 
                  value={newExpense.notes}
                  onChange={e => setNewExpense({...newExpense, notes: e.target.value})}
                  placeholder="..." 
                  className="h-11 bg-stone-50 border-none"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Save Expense
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-stone-50/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Wallet className="w-16 h-16" />
              </div>
              <CardContent className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Total Lifetime Expenses</span>
                  <div className="font-serif text-3xl font-black italic text-stone-900">Rp {totalExpenses.toLocaleString()}</div>
              </CardContent>
          </Card>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-stone-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">Label</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">Category</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary/20" />
                    </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center text-muted-foreground italic">
                        No expenses recorded yet.
                    </TableCell>
                </TableRow>
              ) : (
                expenses.map((exp) => (
                  <TableRow key={exp.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <TableCell className="py-4 px-6 text-xs text-muted-foreground font-medium">
                        {new Date(exp.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-stone-900">{exp.label}</span>
                            {exp.notes && <span className="text-[10px] text-muted-foreground italic">{exp.notes}</span>}
                        </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                        <span className="bg-stone-100 text-stone-500 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-stone-200">
                            {exp.category}
                        </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right font-serif font-bold text-red-600">
                        Rp {parseFloat(exp.amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex justify-center text-muted-foreground opacity-50 gap-2 items-center text-[10px] uppercase font-bold tracking-[0.2em] pt-4">
          <Receipt className="w-3 h-3" />
          <span>Legitimacy in every transaction</span>
      </div>
    </div>
  );
}
