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

export async function checkCustomerBlacklist(phone: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { phone },
      select: { isBlacklisted: true, blacklistNote: true, name: true }
    });
    
    if (customer && customer.isBlacklisted) {
      return { 
        isBlacklisted: true, 
        note: customer.blacklistNote,
        name: customer.name
      };
    }
    
    return { isBlacklisted: false };
  } catch (error) {
    console.error("Blacklist check error:", error);
    return { isBlacklisted: false };
  }
}
