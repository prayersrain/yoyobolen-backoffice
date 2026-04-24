"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Store, 
  Users, 
  Settings, 
  LifeBuoy,
  ChefHat,
  ClipboardCheck,
  Wallet,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard/sales", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Kitchen", href: "/dashboard/baking", icon: ChefHat },
    { name: "Closing", href: "/dashboard/sales/closing", icon: ClipboardCheck },
    { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
    { name: "Products", href: "/dashboard/products", icon: Store },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
  ];

  const footerLinks = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Support", href: "/support", icon: LifeBuoy },
  ];

  const LinkItem = ({ link }: { link: typeof navLinks[0] }) => {
    const isActive = pathname === link.href;
    const Icon = link.icon;

    return (
      <Link 
        href={link.href} 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-95 duration-200 ${
          isActive 
            ? "text-primary font-bold bg-primary/10 shadow-sm border border-primary/10" 
            : "text-stone-500 font-medium hover:bg-stone-100 hover:text-stone-900"
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-stone-400 group-hover:text-stone-900"}`} />
        <span className="font-sans text-sm">{link.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-stone-50 border-r border-stone-200/50 flex flex-col py-8 px-4 transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Header */}
        <div className="mb-10 px-4 flex justify-between items-start">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
               <span className="text-white font-serif italic text-2xl font-bold">Y</span>
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-lg leading-tight tracking-tight">Yoyobolen</h2>
              <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-primary italic">Back Office</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="md:hidden p-2 -mr-2 text-stone-400 hover:text-stone-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {navLinks.map((link) => (
            <div key={link.href} onClick={onClose}>
              <LinkItem link={link} />
            </div>
          ))}
        </nav>

        {/* Footer Links */}
        <div className="mt-auto flex flex-col gap-1.5 pt-4 border-t border-stone-200/50">
          {footerLinks.map((link) => (
            <div key={link.href} onClick={onClose}>
              <LinkItem link={link} />
            </div>
          ))}
          
          {/* Profile Summary in Sidebar */}
          <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-stone-100/50 rounded-xl border border-stone-200/30">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/10 border border-stone-200 shrink-0">
              <Image 
                  alt="Admin" 
                  fill
                  src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none">Master Baker</p>
              <p className="text-xs font-bold text-stone-900 truncate">Admin Yoyobolen</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
