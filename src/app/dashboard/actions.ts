"use server";

import prisma from "@/lib/prisma";

import { Order } from "@prisma/client";

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: true
      }
    });

    return { success: true, data: JSON.parse(JSON.stringify(orders)) };
  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, data: [], error: errorMessage };
  }
}

export async function getSalesMetrics() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'PAID' }
    });

    const totalRevenue = orders.reduce((acc: number, order: Order) => acc + parseFloat(order.totalAmount.toString()), 0);
    const totalOrders = await prisma.order.count();
    
    // Simple mock for chart for now, but based on real count
    // const chartData = [80, 65, 70, 45, 55, 30, 20]; // We can improve this with real daily grouping later

    return {
      success: true,
      metrics: {
        revenueToday: totalRevenue,
        totalOrders: totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      }
    };
  } catch (error: unknown) {
    console.error("Error fetching metrics:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      metrics: { revenueToday: 0, totalOrders: 0, avgOrderValue: 0 },
      error: errorMessage 
    };
  }
}
