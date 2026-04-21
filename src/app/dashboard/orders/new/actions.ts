"use server";

import prisma from "@/lib/prisma";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return { success: false, data: [], error: error.message };
  }
}
