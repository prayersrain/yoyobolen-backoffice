"use client";

import { useState, useEffect, useRef } from "react";
import { Filter, Plus, Search, MoreVertical, Loader2, PackageX, Edit, Trash, ExternalLink, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProducts, createProduct, updateProduct, deleteProduct } from "./actions";
import { toast } from "sonner";

const CATEGORIES = ["All Products", "Kue Kering", "Roti & Pastry", "Cake & Dessert"];

export default function ProductCatalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Products");
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Image Upload States
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form States
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    price: string;
    stock: string;
    imageUrl: string;
    description: string;
  }>({
    name: "",
    category: "Roti & Pastry",
    price: "",
    stock: "",
    imageUrl: "",
    description: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await getProducts();
    if (res.success && res.data) setProducts(res.data);
    setLoading(false);
  }

  const handleOpenDialog = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name ?? "",
        category: product.category ?? "",
        price: product.price?.toString() ?? "0",
        stock: product.stock?.toString() ?? "0",
        imageUrl: product.imageUrl ?? "",
        description: product.description ?? ""
      });
      setPreviewUrl(product.imageUrl || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "Roti & Pastry",
        price: "",
        stock: "10",
        imageUrl: "",
        description: ""
      });
      setPreviewUrl(null);
    }
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submissionData = new FormData();
    submissionData.append("name", formData.name);
    submissionData.append("category", formData.category);
    submissionData.append("price", formData.price);
    submissionData.append("stock", formData.stock);
    submissionData.append("description", formData.description);
    submissionData.append("imageUrl", formData.imageUrl);

    if (fileInputRef.current?.files?.[0]) {
      submissionData.append("imageFile", fileInputRef.current.files[0]);
    }

    let res;
    if (editingProduct) {
      res = await updateProduct(editingProduct.id, submissionData);
    } else {
      res = await createProduct(submissionData);
    }

    if (res.success) {
      toast.success(editingProduct ? "Product updated" : "Product created successfully");
      setIsDialogOpen(false);
      fetchProducts();
    } else {
      toast.error(res.error || "Operation failed");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success("Product deleted");
        fetchProducts();
      } else {
        toast.error(res.error);
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All Products" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-2 font-bold tracking-tight">Product Catalog</h2>
          <p className="font-sans text-muted-foreground uppercase tracking-[0.05em] text-sm">
            Managing {products.length} artisanal items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-stone-200"
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`font-sans text-sm px-4 py-1.5 rounded-full border transition-colors shadow-sm ${
              activeCategory === cat
                ? "bg-primary border-primary text-white font-medium"
                : "bg-white border-stone-200 text-muted-foreground hover:bg-stone-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p className="font-serif italic">Inventorying supplies...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-stone-200 rounded-3xl text-muted-foreground">
          <PackageX className="w-12 h-12 mb-4 opacity-20" />
          <p>No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <article 
              key={product.id} 
              className="bg-white rounded-xl overflow-hidden group shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-stone-100">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 z-20">
                  <Badge className="bg-white/90 backdrop-blur-sm text-primary hover:bg-white text-[10px] font-bold uppercase tracking-wider">
                    {product.category}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-sm border border-stone-100 outline-none">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(product.id)}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold leading-tight text-foreground group-hover:text-primary transition-colors mb-1">
                    {product.name}
                  </h3>
                  <p className="font-sans font-bold text-sm text-primary">
                    Rp {parseFloat(product.price).toLocaleString()}
                  </p>
                </div>
                
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    Stock: {product.stock}
                  </span>
                  {product.imageUrl && (
                    <a href={product.imageUrl} target="_blank" className="text-stone-300 hover:text-primary transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* CRUD Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription className="text-xs">
                Enter the details and upload a photo for your artisanal menu item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              
              {/* Image Upload Area */}
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Product Photo</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer border-2 border-dashed border-stone-200 rounded-xl aspect-video overflow-hidden bg-stone-50 hover:bg-stone-100/50 transition-all flex items-center justify-center"
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <div className="bg-white/20 backdrop-blur-md rounded-full p-2">
                           <ImagePlus className="w-5 h-5 text-white" />
                         </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                       <ImagePlus className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                       <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Click to upload photo</p>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest">Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Nastar Cheese" 
                  className="bg-stone-50 border-none h-11" 
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest">Category</Label>
                  <Select 
                    disabled={submitting}
                    value={formData.category || ""} 
                    onValueChange={(val) => setFormData({...formData, category: val ?? ""})}
                  >
                    <SelectTrigger className="bg-stone-50 border-none h-11 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.slice(1).map(cat => (
                        <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest">Price (IDR)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="75000" 
                    className="bg-stone-50 border-none h-11" 
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock" className="text-xs font-bold uppercase tracking-widest">Manual Stock</Label>
                  <Input 
                    id="stock" 
                    type="number"
                    value={formData.stock || ""}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="10" 
                    className="bg-stone-50 border-none h-11" 
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="grid gap-2 invisible md:visible">
                  <Label className="text-xs font-bold uppercase tracking-widest opacity-0">Spacer</Label>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">*Automated with sales</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest">Description</Label>
                <Input 
                  id="description" 
                  value={formData.description || ""}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. Freshly baked daily, no preservatives" 
                  className="bg-stone-50 border-none h-11" 
                  disabled={submitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-white h-12 shadow-lg shadow-primary/20">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Perfecting Catalogue...
                  </>
                ) : (
                  editingProduct ? "Update Product" : "Create Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
