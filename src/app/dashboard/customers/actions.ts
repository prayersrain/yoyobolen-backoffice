"use server";

import prisma from "@/lib/prisma";

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: true,
      },
      orderBy: { 
        name: 'asc' 
      }
    });

    // Calculate total spent for each customer
    const customersWithStats = customers.map(customer => {
      const totalSpent = customer.orders.reduce((sum, order) => {
        return sum + parseFloat(order.totalAmount.toString());
      }, 0);

      return {
        ...customer,
        orderCount: customer.orders.length,
        totalSpent: totalSpent
      };
    });

    return { success: true, data: JSON.parse(JSON.stringify(customersWithStats)) };
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return { success: false, data: [], error: error.message };
  }
}
