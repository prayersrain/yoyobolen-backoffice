"use client";

import { useState } from "react";
import { Mail, Lock, EyeOff, Eye, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithBruteProtection } from "./actions";
import { toast } from "sonner";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginWithBruteProtection(formData);

    if (res.success) {
      toast.success("Welcome, Master Baker!");
      router.push("/dashboard/sales");
      router.refresh();
    } else {
      setError(res.error || "Login failed");
      toast.error(res.error || "Authentication Error", {
        icon: <ShieldAlert className="w-4 h-4 text-red-500" />
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative z-10">
      {/* Background Ambient Element */}
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-stone-100"></div>
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-orange-200 to-transparent opacity-30 blur-[100px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-blue-200 to-transparent opacity-30 blur-[100px]"></div>
      </div>

      <main className="flex-grow flex items-center justify-center p-6 pb-24">
        <div className="w-full max-w-md">
          {/* Logo Cluster */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif italic text-primary tracking-tight">Yoyobolen</h1>
            <p className="mt-2 text-muted-foreground font-sans text-sm uppercase tracking-[0.1em] opacity-80">Artisanal Ledger</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl p-8 sm:p-10 shadow-lg relative overflow-hidden group border border-stone-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-700 opacity-80"></div>
            
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl font-serif text-foreground mb-2">Security Portal</h2>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">Access restricted to authorized bakery administrators.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className={`px-4 py-3 rounded-lg text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300 ${
                  error.includes("Lockout") ? "bg-red-100 text-red-900 border border-red-200" : "bg-red-50 text-red-600 border border-red-100"
                }`}>
                  {error.includes("Lockout") ? <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-muted-foreground w-4 h-4" />
                  </div>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="admin@yoyobolen.com" 
                    required 
                    disabled={loading || !!(error?.includes("Lockout"))}
                    className="pl-10 h-12 bg-stone-50 border-none focus-visible:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Link href="#" className="text-[10px] uppercase font-bold tracking-widest text-primary hover:text-orange-700 transition-colors">
                    Trouble?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-muted-foreground w-4 h-4" />
                  </div>
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    disabled={loading || !!(error?.includes("Lockout"))}
                    className="pl-10 pr-10 h-12 bg-stone-50 border-none focus-visible:ring-primary/20 transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading || !!(error?.includes("Lockout"))}
                  className="w-full h-12 text-xs font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validating Entry...
                    </>
                  ) : (
                    "Authorize Session"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-stone-100/50 absolute bottom-0 w-full z-20">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-6 w-full max-w-7xl mx-auto">
          <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4 md:mb-0">
            © 2026 Yoyobolen Artisanal Ledger. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="font-sans text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary transition-colors">Security</Link>
            <Link href="#" className="font-sans text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
