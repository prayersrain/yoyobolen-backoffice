"use client";

import { useState, useEffect, use } from "react";
import { Clock, Lock, CheckCircle2, MoreHorizontal, Loader2, AlertCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderDetails, checkPaymentStatus } from "./actions";
import { supabase } from "@/lib/supabase";

export default function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [isChecking, setIsChecking] = useState(false);

  // Unwrapping params using React.use() - required in Next.js 15+ 16+
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const handleStatusRefresh = async () => {
    setIsChecking(true);
    const res = await checkPaymentStatus(orderId);
    if (res.success && res.status === "PAID") {
      setStatus("PAID");
    } else if (res.success) {
      alert(`Status saat ini: ${res.status}. Silakan selesaikan pembayaran di Midtrans.`);
    } else {
      alert("Gagal mengecek status. Coba lagi nanti.");
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
    // This will trigger whenever the specific order ID is updated in the DB
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
          console.log('Realtime update received:', payload);
          if (payload.new.status === 'PAID') {
            setStatus('PAID');
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-serif font-bold italic mb-2">Order Not Found</h2>
        <p className="text-muted-foreground text-center">We couldn't find the pastry order you're looking for.</p>
        <Button onClick={() => window.location.reload()} className="mt-6 bg-stone-100 text-stone-800 hover:bg-stone-200">
          Try Again
        </Button>
      </div>
    );
  }

  if (status === "PAID") {
    return (
      <div className="min-h-screen flex flex-col items-center py-8 px-4 md:px-8 bg-background animate-in fade-in duration-700">
        <main className="w-full max-w-md mx-auto flex flex-col gap-6 mt-10">
          <header className="text-center mb-4">
            <h1 className="font-serif font-black italic text-4xl text-primary mb-1">Yoyobolen</h1>
            <p className="font-sans text-sm text-muted-foreground uppercase tracking-[0.05em]">Secure Checkout</p>
          </header>
          
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle2 className="text-green-600 w-12 h-12" />
            </div>
            <h3 className="font-serif font-bold text-3xl text-foreground">Terbayar!</h3>
            <p className="font-sans text-sm text-muted-foreground">
              Pembayaran senilai <span className="font-bold text-foreground">Rp {parseFloat(order.totalAmount).toLocaleString()}</span> untuk pesanan <span className="font-bold text-foreground">#{orderId.slice(-6).toUpperCase()}</span> telah berhasil kami terima.
            </p>
            <div className="w-full h-px bg-stone-100 my-2"></div>
            <p className="text-xs text-muted-foreground italic">Pastry kami sedang disiapkan spesial untuk Anda.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 md:px-8 bg-background">
      <main className="w-full max-w-md mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="font-serif font-black italic text-4xl text-primary mb-1">Yoyobolen</h1>
          <p className="font-sans text-sm text-muted-foreground uppercase tracking-[0.05em]">Secure Checkout</p>
        </header>

        {/* Main Payment Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-6 flex flex-col items-center gap-6 relative overflow-hidden mt-4">
          {/* decorative top bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          
          {/* Status Indicator (Pending) */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full text-sm font-medium text-amber-700">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>Menunggu Pembayaran</span>
          </div>

          {/* Order Summary */}
          <div className="text-center w-full pb-6 border-b border-stone-100">
            <p className="font-sans text-sm text-muted-foreground mb-1 uppercase tracking-widest">Total Tagihan</p>
            <h2 className="font-serif font-bold text-4xl text-foreground">Rp {parseFloat(order.totalAmount).toLocaleString()}</h2>
          </div>

          {/* Snap Payment Button */}
          <div className="flex flex-col items-center gap-6 w-full py-4">
            <p className="font-sans text-sm text-muted-foreground text-center px-4 leading-relaxed">
              Kami telah menyiapkan portal pembayaran aman melalui Midtrans. Silakan klik tombol di bawah untuk melanjutkan pembayaran.
            </p>
            
            <a 
              href={order.snapUrl || "#"} 
              rel="noopener noreferrer"
              className="w-full"
              onClick={(e) => {
                if (!order.snapUrl) {
                  e.preventDefault();
                  alert("Link pembayaran tidak ditemukan untuk pesanan ini. Pastikan integrasi Midtrans sudah benar.");
                }
              }}
            >
              <Button className="w-full h-16 text-lg font-bold bg-[#002855] hover:bg-[#001d3d] text-white shadow-xl shadow-blue-900/20 rounded-2xl flex items-center justify-center gap-3 group transition-all">
                <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
                BAYAR SEKARANG
                <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>

            <Button 
              variant="outline" 
              onClick={handleStatusRefresh}
              disabled={isChecking}
              className="w-full h-12 border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MoreHorizontal className="w-4 h-4" />
              )}
              {isChecking ? "Mengecek..." : "Saya Sudah Bayar / Muat Ulang Status"}
            </Button>

            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">
              <span>GoPay</span>
              <div className="w-1 h-1 rounded-full bg-stone-300"></div>
              <span>QRIS</span>
              <div className="w-1 h-1 rounded-full bg-stone-300"></div>
              <span>Bank Transfer</span>
            </div>
          </div>

          {/* Timer */}
          <div className="w-full bg-stone-50 border border-stone-100 py-3 px-6 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-sans text-xs uppercase tracking-wider">Berakhir dalam</span>
            </div>
            <span className="font-sans font-bold text-lg text-primary tracking-tighter">23:59:59</span>
          </div>

          {/* Helper info */}
          <div className="w-full text-center py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Automated system • Don't close this window
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-auto pt-8 pb-4 text-center">
        <p className="font-sans text-xs text-muted-foreground flex items-center justify-center gap-1 opacity-60">
          <Lock className="w-3 h-3" />
          Secured by Artisanal Ledger Payments
        </p>
      </footer>
    </div>
  );
}

function QrCode(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16V21H16" />
      <path d="M21 16H16V21" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M12 12v3" />
      <path d="M12 7v1" />
      <path d="M12 12h3" />
      <path d="M12 16h.01" />
      <path d="M16 16h.01" />
      <path d="M16 21h.01" />
    </svg>
  )
}
