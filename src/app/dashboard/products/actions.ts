"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return { success: false, data: [], error: error.message };
  }
}

export async function createProduct(formData: FormData) {
  try {
    const supabase = await createClient();
    
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const description = formData.get("description") as string;
    const imageFile = formData.get("imageFile") as File;
    let imageUrl = formData.get("imageUrl") as string;

    const id = name.toLowerCase().replace(/\s+/g, '-');

    // Handle Image Upload if file exists
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('img-bakery')
        .upload(filePath, imageFile);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('img-bakery')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;
    }

    const product = await prisma.product.create({
      data: {
        id,
        name,
        category,
        price,
        stock,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop',
        description
      }
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/orders/new");
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const supabase = await createClient();
    
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const description = formData.get("description") as string;
    const imageFile = formData.get("imageFile") as File;
    let imageUrl = formData.get("imageUrl") as string;

    // Handle Image Upload if a new file is provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('img-bakery')
        .upload(filePath, imageFile);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('img-bakery')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        category,
        price,
        stock,
        imageUrl,
        description
      }
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/orders/new");
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/orders/new");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }
}
