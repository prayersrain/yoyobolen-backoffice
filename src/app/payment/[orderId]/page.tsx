"use client";

import { useState, useEffect, use } from "react";
import { 
  Clock, Lock, CheckCircle2, MoreHorizontal, Loader2, AlertCircle, 
  ArrowLeft, CreditCard, Copy, Check, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderDetails, checkPaymentStatus } from "./actions";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

export default function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Unwrapping params using React.use()
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const handleCopyVA = (va: string) => {
    navigator.clipboard.writeText(va);
    setCopied(true);
    toast.success("VA Number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusRefresh = async () => {
    setIsChecking(true);
    const res = await checkPaymentStatus(orderId);
    if (res.success && res.status === "settlement") {
      setStatus("PAID");
    } else if (res.success) {
      toast.info(`Status: ${res.status.toUpperCase()}. Please complete the payment.`);
    } else {
      toast.error("Failed to check status. Please try again.");
    }
    setIsChecking(false);
  };

  useEffect(() => {
    async function loadOrder() {
      const res = await getOrderDetails(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
        setStatus(res.data.status);
      } else {
        setError(res.error || "Order not found");
      }
      setLoading(false);
    }
    loadOrder();

    // SETUP REALTIME LISTENER
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Order',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new.status === 'PAID') {
            setStatus('PAID');
            toast.success("Payment confirmed!");
          } else {
            setStatus(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="font-serif italic text-stone-400">Authenticating transaction...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] p-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-stone-500 max-w-xs mx-auto leading-relaxed">
          The artisanal ledger could not find this specific transaction record.
        </p>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()} 
          className="mt-8 border-stone-200 hover:bg-stone-50 rounded-xl px-8"
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  if (status === "PAID") {
    return (
      <div className="min-h-screen flex flex-col items-center py-12 px-4 md:px-8 bg-[#FAF9F6] animate-in fade-in duration-1000">
        <main className="w-full max-w-md mx-auto flex flex-col gap-8">
          <header className="text-center">
            <h1 className="font-serif font-black italic text-5xl text-primary mb-2">Yoyobolen</h1>
            <div className="h-1 w-12 bg-primary/20 mx-auto rounded-full"></div>
          </header>
          
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(85,67,54,0.08)] border border-stone-100 p-10 flex flex-col items-center gap-6 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-2 shadow-inner">
              <CheckCircle2 className="text-green-600 w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-4xl text-stone-900">Terbayar!</h3>
              <p className="text-stone-400 font-sans text-sm uppercase tracking-widest font-bold">Transaction Success</p>
            </div>
            
            <div className="w-full bg-stone-50 rounded-3xl p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Order ID</span>
                <span className="font-mono font-bold text-stone-900">#{orderId.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Total Paid</span>
                <span className="font-bold text-primary">Rp {parseFloat(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>
            
            <p className="text-stone-500 font-serif italic leading-relaxed">
              Resep tradisional kami sedang diproses untuk Anda. Harap tunggu konfirmasi dari tim kami.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // CORE API DATA EXTRACTION
  const paymentData = order.paymentData || {};
  const isQris = order.paymentMethod === "QRIS";
  
  // Get QR String for QRIS
  const qrAction = paymentData.actions?.find((a: any) => a.name === "generate-qr-code");
  const qrString = qrAction?.url;

  // Get VA Number for Transfer
  const isMandiri = paymentData.echannel || paymentData.bill_key;
  const vaNumber = isMandiri 
    ? `${paymentData.biller_code} - ${paymentData.bill_key}`
    : paymentData.va_numbers?.[0]?.va_number || "";
    
  const vaBank = isMandiri 
    ? "MANDIRI" 
    : paymentData.va_numbers?.[0]?.bank?.toUpperCase() || "BANK";

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 md:px-8 bg-[#FAF9F6]">
      <main className="w-full max-w-md mx-auto flex flex-col gap-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="font-serif font-black italic text-5xl text-primary mb-2">Yoyobolen</h1>
          <p className="font-sans text-xs text-stone-400 uppercase tracking-[0.3em] font-bold">The Artisanal Ledger</p>
        </header>

        {/* Main Payment Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(85,67,54,0.08)] border border-stone-100 p-8 flex flex-col items-center gap-8 relative overflow-hidden">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Menunggu Pembayaran
          </div>

          {/* Amount */}
          <div className="text-center w-full">
            <p className="font-sans text-xs text-stone-400 mb-2 uppercase tracking-widest font-bold">Total Tagihan</p>
            <h2 className="font-serif font-bold text-5xl text-stone-900 tracking-tighter">
              <span className="text-2xl mr-1 font-normal text-stone-400">Rp</span>
              {parseFloat(order.totalAmount).toLocaleString()}
            </h2>
          </div>

          {/* QRIS or VA DISPLAY */}
          <div className="w-full">
            {isQris ? (
              <div className="flex flex-col items-center gap-6">
                <div 
                  className="bg-white p-6 rounded-3xl border-2 border-stone-100 shadow-inner group transition-all cursor-help"
                  title="Click to copy QR String for Simulator"
                  onClick={() => {
                    if (qrString) {
                      navigator.clipboard.writeText(qrString);
                      console.log("QR String:", qrString);
                      toast.success("QR String copied! Use it in Midtrans Simulator.");
                    }
                  }}
                >
                  {qrString ? (
                    <div className="relative">
                       <QRCodeSVG value={qrString} size={220} level="H" includeMargin={false} />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-[2px]">
                          <div className="bg-primary text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg">Copy Raw QR</div>
                       </div>
                    </div>
                  ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                      <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
                    </div>
                  )}
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-stone-800">Scan QRIS</p>
                  <p className="text-xs text-stone-400">Bisa menggunakan GoPay, OVO, Dana, atau Mobile Banking</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-end px-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Virtual Account {vaBank}</p>
                    <div className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter">Official</div>
                  </div>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-stone-200 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative flex items-center justify-between p-6 bg-stone-50 rounded-2xl border border-stone-100">
                      <span className="font-mono text-2xl font-black text-stone-800 tracking-wider">
                        {vaNumber || "Generating..."}
                      </span>
                      <button 
                        onClick={() => handleCopyVA(vaNumber)}
                        className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all text-primary border border-stone-100"
                      >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full text-center space-y-3">
                   <div className="flex items-center gap-2 justify-center py-2 px-4 bg-stone-100 rounded-full w-fit mx-auto">
                      <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Bank Transfer via {vaBank}</span>
                   </div>
                   <p className="text-[11px] text-stone-400 leading-relaxed max-w-[200px] mx-auto italic">
                     Nomor rekening di atas bersifat unik dan akan terverifikasi secara otomatis.
                   </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="w-full space-y-4 pt-4 border-t border-stone-50">
            <Button 
              variant="outline" 
              onClick={handleStatusRefresh}
              disabled={isChecking}
              className="w-full h-14 border-stone-200 text-stone-600 hover:bg-stone-50 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-sm hover:shadow-md"
            >
              {isChecking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MoreHorizontal className="w-5 h-5" />
              )}
              {isChecking ? "Verifying..." : "Refresh Payment Status"}
            </Button>

            <div className="text-center">
              <p className="text-[10px] text-stone-300 uppercase font-black tracking-[0.3em]">
                Secure Transaction • {orderId}
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col items-center gap-4 text-stone-400">
           <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-stone-200"></div>
              <Lock className="w-4 h-4 opacity-50" />
              <div className="h-px w-8 bg-stone-200"></div>
           </div>
           <p className="font-sans text-[10px] uppercase tracking-widest font-black opacity-40">
             Yoyobolen Digital Presence • 2024
           </p>
        </div>
      </main>
    </div>
  );
}

