"use client";

import React from "react";
import { Printer, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderReceiptProps {
  order: any;
  onClose: () => void;
}

export function OrderReceipt({ order, onClose }: OrderReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-full print:shadow-none print:rounded-none">
        {/* Actions - Hidden when printing */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 print:hidden bg-stone-50">
          <h3 className="font-serif font-bold text-lg">Pratinjau Struk</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" /> Cetak / PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="flex-1 overflow-y-auto p-8 print:p-4 bg-white font-mono text-xs leading-relaxed text-stone-800">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="font-serif text-2xl font-black italic text-primary mb-1">Yoyobolen</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1 italic">Artisanal Pastry & Bakery</p>
            <p className="text-[9px] opacity-60">Jl. Contoh No. 123, Indonesia</p>
            <p className="text-[9px] opacity-60">WhatsApp: 0812-XXXX-XXXX</p>
          </div>

          <div className="w-full h-px border-t border-dashed border-stone-300 my-4"></div>

          <div className="space-y-1 mb-4">
            <div className="flex justify-between">
              <span>ORDER ID:</span>
              <span className="font-bold">#{order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>TANGGAL:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>WAKTU:</span>
              <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span>PELANGGAN:</span>
              <span className="font-bold">{order.customer?.name}</span>
            </div>
          </div>

          <div className="w-full h-px border-t border-dashed border-stone-300 my-4"></div>

          <div className="space-y-4">
            <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-stone-100">
              <span className="w-1/2">ITEM</span>
              <span className="w-1/4 text-center">QTY</span>
              <span className="w-1/4 text-right">TOTAL</span>
            </div>
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="w-1/2 pr-2">
                  <p className="font-bold break-words uppercase text-[10px]">{item.product?.name}</p>
                  <p className="text-[8px] opacity-60 italic">@Rp {parseFloat(item.product?.price || 0).toLocaleString()}</p>
                </div>
                <span className="w-1/4 text-center">{item.quantity}</span>
                <span className="w-1/4 text-right font-bold">Rp {parseFloat(item.subtotal).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="w-full h-px border-t-2 border-stone-800 my-6"></div>

          <div className="space-y-1">
             <div className="flex justify-between text-stone-500">
              <span>SUBTOTAL</span>
              <span>Rp {(parseFloat(order.totalAmount) - 5000).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>BIAYA LAYANAN</span>
              <span>Rp 5,000</span>
            </div>
            <div className="flex justify-between text-base font-black border-t border-stone-100 pt-2 mt-2">
              <span>TOTAL</span>
              <span>Rp {parseFloat(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-dashed border-stone-300 text-center flex flex-col items-center gap-4">
             <div className="px-4 py-2 bg-stone-50 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-stone-100">
                Lunas via {order.paymentMethod || "Midtrans"}
             </div>
             
             <div className="space-y-1">
                <p className="text-[10px] font-bold italic">Terima kasih atas pesanan Anda!</p>
                <p className="text-[8px] opacity-60">"Cita rasa klasik dalam setiap gigitan"</p>
             </div>
             
             <div className="flex gap-4 opacity-30 mt-2">
                <span className="text-[7px] uppercase font-bold tracking-tighter">Hand-Made</span>
                <span className="text-[7px] uppercase font-bold tracking-tighter">Boutique Bakery</span>
                <span className="text-[7px] uppercase font-bold tracking-tighter">Premium Ingredients</span>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}
