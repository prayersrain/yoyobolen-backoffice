import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, User, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 pb-20">
      <div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-1">Bakery Settings</h2>
        <p className="font-sans text-muted-foreground text-sm tracking-wide">Manage your shop profile, security, and notification preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full max-w-4xl">
        <TabsList className="bg-stone-100 flex p-1 h-auto mb-6">
          <TabsTrigger value="profile" className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
             <Store className="w-4 h-4 mr-2" />
             Shop Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
             <User className="w-4 h-4 mr-2" />
             Admin Account
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
             <Shield className="w-4 h-4 mr-2" />
             Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 sm:p-8">
          <h3 className="text-xl font-serif mb-6 border-b border-stone-100 pb-4">Shop Details</h3>
          <div className="space-y-6 max-w-2xl">
            <div className="grid gap-2">
              <Label>Shop Name</Label>
              <Input defaultValue="Yoyobolen Bakery" className="bg-stone-50" />
            </div>
            <div className="grid gap-2">
              <Label>Contact Email</Label>
              <Input defaultValue="hello@yoyobolen.com" className="bg-stone-50" />
            </div>
            <div className="grid gap-2">
              <Label>Store Address</Label>
              <Input defaultValue="Jl. Sudirman No 123, Jakarta" className="bg-stone-50" />
            </div>
            <Button className="bg-primary hover:bg-primary/90 mt-4">Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="account" className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 sm:p-8">
          <h3 className="text-xl font-serif mb-6 border-b border-stone-100 pb-4">Admin Account</h3>
          <div className="space-y-6 max-w-2xl">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input defaultValue="Master Baker" className="bg-stone-50" />
            </div>
            <div className="grid gap-2">
              <Label>Admin Email (Login ID)</Label>
              <Input defaultValue="admin@yoyobolen.com" disabled className="bg-stone-100 text-stone-500" />
              <p className="text-xs text-muted-foreground">To change your login email, please contact IT support.</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 mt-4">Update Account</Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 sm:p-8">
          <h3 className="text-xl font-serif mb-6 border-b border-stone-100 pb-4">Security & Password</h3>
          <div className="space-y-6 max-w-2xl">
            <div className="grid gap-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-stone-50" />
            </div>
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-stone-50" />
            </div>
            <div className="grid gap-2">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-stone-50" />
            </div>
            <Button className="bg-primary hover:bg-primary/90 mt-4">Update Password</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
