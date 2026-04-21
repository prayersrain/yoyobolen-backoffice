"use client";

import { Search, Bell, History, Menu, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh(); // Clear middleware session
    } else {
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-md w-full top-0 sticky shadow-sm shadow-stone-200/50 z-10 transition-all">
      <div className="flex justify-between items-center w-full px-8 py-4 bg-stone-50">
        <div className="flex items-center gap-6">
          <h1 className="font-serif font-semibold text-stone-900 text-xl tracking-tight hidden md:block">
            The Artisanal Ledger
          </h1>
          {/* Search Bar */}
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              className="pl-9 pr-4 py-2 h-9 bg-white border-none shadow-[0_2px_10px_rgba(85,67,54,0.04)] focus-visible:ring-1 focus-visible:ring-primary/20" 
              placeholder="Search orders, products..." 
            />
          </div>
        </div>
        
        {/* Trailing Actions */}
        <div className="flex items-center gap-2">
          <button aria-label="Notifications" className="p-2 text-stone-500 hover:text-primary transition-colors rounded-full hover:bg-stone-200/50">
            <Bell className="w-5 h-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="ml-2 w-9 h-9 border-2 border-transparent cursor-pointer hover:border-primary transition-all">
                <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=AdminProfile" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <div className="px-1.5 py-2 font-sans">
                <div className="flex flex-col space-y-1">
                  <p className="font-bold text-sm leading-none">Master Baker</p>
                  <p className="text-xs text-muted-foreground leading-none">admin@yoyobolen.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push("/dashboard/settings")} 
                className="cursor-pointer"
              >
                <SettingsIcon className="mr-2 h-4 w-4 text-stone-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button aria-label="Menu" className="md:hidden p-2 ml-2 text-stone-500 hover:bg-stone-200/50 rounded-md">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
