import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Header />
        <main className="p-6 md:p-8 lg:p-10 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
