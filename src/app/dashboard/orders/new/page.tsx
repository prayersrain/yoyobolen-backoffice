"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, User, Phone, MapPin, Package, Search, Plus, Minus, X, 
  Store, MessageCircle, QrCode, CreditCard, Loader2, CheckCircle2, Copy, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getProducts, checkCustomerBlacklist } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: string | number;
  imageUrl: string;
}

interface OrderResult {
  success: boolean;
  orderId: string;
  snapUrl?: string;
  snapRedirectUrl?: string;
}

export default function NewOrder() {
  // State for products and UI
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for Form & Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [channel, setChannel] = useState("storefront");
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [blacklistInfo, setBlacklistInfo] = useState<{ isBlacklisted: boolean; note?: string | null; name?: string } | null>(null);

  // Check blacklist on phone change
  useEffect(() => {
    let active = true;
    
    if (customer.phone.length < 10) {
      // Defer reset to avoid synchronous setState in effect warning
      const resetTimer = setTimeout(() => {
        if (active && blacklistInfo !== null) {
          setBlacklistInfo(null);
        }
      }, 0);
      return () => {
        active = false;
        clearTimeout(resetTimer);
      };
    }

    const timer = setTimeout(async () => {
      const res = await checkCustomerBlacklist(customer.phone);
      if (active) {
        setBlacklistInfo(res.isBlacklisted ? res : null);
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customer.phone, blacklistInfo]);

  // Load products on mount
  useEffect(() => {
    async function loadData() {
      const res = await getProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      }
      setLoadingProducts(false);
    }
    loadData();
  }, []);

  const [activeCategory, setActiveCategory] = useState("All");
  
  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products based on search and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: Number(product.price), 
        quantity: 1, 
        imageUrl: product.imageUrl 
      }];
    });
    setSearchQuery("");
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const serviceFee = cart.length > 0 ? 5000 : 0;
  const total = subtotal + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerData: customer,
          cartItems: cart,
          totalAmount: total,
          channel,
          paymentMethod
        }),
      });

      const result = await response.json();
      if (result.success) {
        setOrderResult(result);
        setShowSuccessModal(true);
      } else {
        alert("Checkout Failed: " + result.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
      {/* Back link */}
      <div>
        <Link href="/dashboard/orders" className="text-muted-foreground hover:text-primary transition-colors flex items-center text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Orders
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">New Order</h2>
          <p className="text-muted-foreground mt-2 font-sans text-sm max-w-lg">
            Create a new customer order. Ensure all artisanal details are captured correctly.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Customer Details */}
          <Card className="border-none shadow-sm bg-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
            <CardHeader className="border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <CardTitle className="font-serif text-2xl">Customer Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {blacklistInfo?.isBlacklisted && (
                <div className="md:col-span-2">
                  <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 animate-in slide-in-from-top duration-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-serif font-bold">⚠️ Customer Blacklisted!</AlertTitle>
                    <AlertDescription className="text-xs">
                      Customer <span className="font-bold underline">{blacklistInfo.name || "this number"}</span> is flagged. 
                      Note: <span className="italic font-medium">{blacklistInfo.note || "No details provided."}</span>
                      <br/>
                      <span className="font-bold uppercase tracking-widest mt-1 block">Proceed with extreme caution.</span>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="customer_name" className="text-[11px] uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="customer_name" 
                    required
                    value={customer.name}
                    onChange={e => setCustomer({...customer, name: e.target.value})}
                    placeholder="e.g., Sarah Jenkins" 
                    className="pl-9 h-11 bg-stone-50 border-none" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone" className="text-[11px] uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="customer_phone" 
                    type="tel" 
                    required
                    value={customer.phone}
                    onChange={e => setCustomer({...customer, phone: e.target.value})}
                    placeholder="e.g., 08123456789" 
                    className="pl-9 h-11 bg-stone-50 border-none" 
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="customer_address" className="text-[11px] uppercase tracking-wider text-muted-foreground">Delivery Address (Optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea 
                    id="customer_address" 
                    value={customer.address}
                    onChange={e => setCustomer({...customer, address: e.target.value})}
                    placeholder="Enter full address if delivery is required..." 
                    className="pl-9 bg-stone-50 border-none min-h-[80px]" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-none shadow-sm bg-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
            <CardHeader className="border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="w-4 h-4" />
                </div>
                <CardTitle className="font-serif text-2xl">Order Items</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={loadingProducts ? "Loading products..." : "Search Yoyobolen items..."} 
                  className="pl-12 h-14 bg-stone-50 shadow-none border-stone-200 text-base" 
                />
              </div>

              {/* Category Filter Strip */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                      activeCategory === cat 
                        ? "bg-primary text-white border-primary shadow-sm" 
                        : "bg-white text-stone-500 border-stone-200 hover:border-primary/30"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Product Catalog (Always Visible) */}
              <div className="mb-8 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50/50 p-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">Katalog Yoyobolen</h3>
                  <span className="text-[10px] text-muted-foreground">{filteredProducts.length} items available</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => addToCart(p)}
                        className="group bg-white rounded-xl p-3 border border-stone-200 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-lg mb-1">
                          <Image 
                            src={p.imageUrl} 
                            alt={p.name} 
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                              <Plus className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-[13px] leading-tight line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-primary font-semibold mt-1">Rp {Number(p.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-sm text-muted-foreground italic">
                      Produk tidak ditemukan...
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Items List (The Cart) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">Keranjang</h3>
                  {cart.length > 0 && <Badge variant="secondary" className="text-[10px] h-4">{cart.length}</Badge>}
                </div>
                {cart.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-stone-100 rounded-2xl bg-stone-50/20">
                    <Package className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground italic font-sans text-[13px]">Belum ada pesanan yang dipilih</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                            <Image src={item.imageUrl || ""} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex items-center bg-stone-100 rounded-lg p-1">
                          <Button type="button" variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7"><Minus className="w-3 h-3" /></Button>
                          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7"><Plus className="w-3 h-3" /></Button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <span className="font-semibold">Rp {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-red-600 w-8 h-8">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <Card className="border-none shadow-sm bg-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-xl">Order Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Sales Channel</Label>
                <RadioGroup value={channel} onValueChange={setChannel} className="grid grid-cols-2 gap-3">
                  <div>
                    <RadioGroupItem value="storefront" id="ch-storefront" className="peer sr-only" />
                    <Label htmlFor="ch-storefront" className="flex items-center justify-center gap-2 p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:border-primary/40 peer-data-[state=checked]:text-primary">
                      <Store className="w-4 h-4" /> Storefront
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="whatsapp" id="ch-whatsapp" className="peer sr-only" />
                    <Label htmlFor="ch-whatsapp" className="flex items-center justify-center gap-2 p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:border-primary/40 peer-data-[state=checked]:text-primary">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                  <div className="flex items-center space-x-3 border border-stone-200 rounded-lg p-3 hover:bg-stone-50 has-[:checked]:bg-stone-100 has-[:checked]:border-stone-300 transition-colors">
                    <RadioGroupItem value="qris" id="pay-qris" />
                    <Label htmlFor="pay-qris" className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <QrCode className="w-4 h-4" /> QRIS / E-Wallet
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">Instant generation</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border border-stone-200 rounded-lg p-3 hover:bg-stone-50 has-[:checked]:bg-stone-100 has-[:checked]:border-stone-300 transition-colors">
                    <RadioGroupItem value="transfer" id="pay-transfer" />
                    <Label htmlFor="pay-transfer" className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Bank Transfer
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-stone-200 bg-white shadow-md shadow-stone-200/50">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-xl">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm mb-6 border-b border-stone-200 pb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Service / Packaging</span>
                  <span>Rp {serviceFee.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-6">
                <span className="font-serif text-xl font-bold">Total</span>
                <span className="font-serif text-2xl font-bold text-primary">Rp {total.toLocaleString()}</span>
              </div>
              
              <Button 
                type="submit" 
                disabled={cart.length === 0 || isSubmitting}
                className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <QrCode className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? "Processing..." : "Generate Order & QRIS"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0">
          <div className="bg-primary/5 py-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="font-serif text-2xl text-foreground">Order Successfully Created!</DialogTitle>
            <DialogDescription className="text-muted-foreground font-sans">
              Invoice #{orderResult?.orderId?.slice(-6).toUpperCase() || "YB-000"}
            </DialogDescription>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  const url = orderResult?.snapRedirectUrl || orderResult?.snapUrl || `${window.location.origin}/payment/${orderResult?.orderId}`;
                  navigator.clipboard.writeText(url);
                  alert("Link Pembayaran Berhasil Disalin!");
                }}
                className="w-full h-12 bg-stone-100 text-stone-800 hover:bg-stone-200 border-none shadow-none"
              >
                <Copy className="w-4 h-4 mr-2" /> Salin Link Pembayaran
              </Button>
              
              <a href={orderResult?.snapRedirectUrl || orderResult?.snapUrl || "#"} rel="noopener noreferrer" className="block w-full">
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                  <CreditCard className="w-4 h-4 mr-2" /> Bayar Sekarang (Snap)
                </Button>
              </a>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-center">
              <Button variant="ghost" onClick={() => window.location.reload()} className="text-muted-foreground hover:text-foreground">
                Create Another Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
