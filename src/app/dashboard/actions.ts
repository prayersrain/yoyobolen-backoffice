"use server";

import prisma from "@/lib/prisma";

import { Order } from "@prisma/client";
// @ts-expect-error - midtrans-client missing type definitions
import midtransClient from "midtrans-client";

export async function getClosingSummary() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today },
        status: 'PAID'
      }
    });

    const totalRevenue = orders.reduce((acc: number, order) => acc + parseFloat(order.totalAmount.toString()), 0);
    const totalOrders = orders.length;

    return {
      success: true,
      summary: {
        totalOrders,
        totalRevenue,
        date: today
      }
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

export async function saveClosingSession(data: {
  totalOrders: number,
  totalRevenue: number,
  cashInHand: number,
  difference: number,
  notes?: string,
  staffName: string
}) {
  try {
    const session = await (prisma as any).closingSession.create({
      data: {
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
        cashInHand: data.cashInHand,
        difference: data.difference,
        notes: data.notes,
        staffName: data.staffName
      }
    });

    await createAuditLog("SALES_CLOSING", session.id, `Closed by ${data.staffName} with difference ${data.difference}`);

    return { success: true, data: JSON.parse(JSON.stringify(session)) };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

// Initialize Midtrans Snap API (same as in checkout route)
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function syncPaymentStatus(orderId: string) {
  try {
    console.log(`Manually syncing payment status for: ${orderId}`);
    
    // 1. Fetch status from Midtrans
    const statusResponse = await snap.transaction.status(orderId);
    const { transaction_status, status_code } = statusResponse;
    
    console.log(`Midtrans Status for ${orderId}: ${transaction_status}`);

    let finalStatus: "PAID" | "PENDING" | "CANCELLED" | "EXPIRED" = "PENDING";
    let isSuccess = false;

    if (status_code === "200") {
      if (transaction_status === "settlement" || transaction_status === "capture") {
        finalStatus = "PAID";
        isSuccess = true;
      } else if (transaction_status === "deny" || transaction_status === "cancel") {
        finalStatus = "CANCELLED";
      } else if (transaction_status === "expire") {
        finalStatus = "EXPIRED";
      }
    }

    // 2. Check current DB status to avoid double processing
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!currentOrder) throw new Error("Order not found in database");

    if (currentOrder.status !== finalStatus) {
      // 3. Update DB
      await prisma.order.update({
        where: { id: orderId },
        data: { status: finalStatus }
      });

      // Log the action
      await createAuditLog("MANUAL_SYNC", orderId, `Status updated from ${currentOrder.status} to ${finalStatus}`);

      // 4. Adjust stock if status changed to PAID for the first time
      if (isSuccess && currentOrder.status !== "PAID") {
        for (const item of currentOrder.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }
      
      return { success: true, status: finalStatus, updated: true };
    }

    return { success: true, status: currentOrder.status, updated: false };
  } catch (error: unknown) {
    console.error("Sync Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

export async function createAuditLog(action: string, targetId?: string, details?: string) {
  try {
    await (prisma as any).auditLog.create({
      data: { action, targetId, details }
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}

export async function getBakingList() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'PAID' },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group items by product
    const bakingMap: Record<string, { product: any, total: number, orders: any[] }> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!bakingMap[item.productId]) {
          bakingMap[item.productId] = {
            product: item.product,
            total: 0,
            orders: []
          };
        }
        bakingMap[item.productId].total += item.quantity;
        bakingMap[item.productId].orders.push({
          id: order.id,
          customerName: order.customerId, // Should join but for now ID
          quantity: item.quantity
        });
      });
    });

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(Object.values(bakingMap)))
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

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
    
    // Calculate real chart data for last 7 days
    const last7DaysData = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        const daySales = await prisma.order.findMany({
            where: {
                status: 'PAID',
                createdAt: { gte: d, lt: nextD }
            }
        });
        
        const dayRevenue = daySales.reduce((acc: number, order) => acc + parseFloat(order.totalAmount.toString()), 0);
        last7DaysData.push(dayRevenue);
    }

    const expenses = await (prisma as any).expense.findMany({
        where: {
            date: { gte: new Date(new Date().setHours(0,0,0,0)) }
        }
    });
    const totalExpenses = expenses.reduce((acc: number, exp: any) => acc + parseFloat(exp.amount.toString()), 0);

    return {
      success: true,
      metrics: {
        revenueToday: totalRevenue,
        totalOrders: totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        chartData: last7DaysData,
        netProfitEstimate: totalRevenue - totalExpenses
      }
    };
  } catch (error: unknown) {
    console.error("Error fetching metrics:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      metrics: { revenueToday: 0, totalOrders: 0, avgOrderValue: 0, chartData: [], netProfitEstimate: 0 },
      error: errorMessage 
    };
  }
}

export async function getExpenses() {
  try {
    const expenses = await (prisma as any).expense.findMany({
      orderBy: { date: 'desc' }
    });
    return { success: true, data: JSON.parse(JSON.stringify(expenses)) };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, data: [], error: errorMessage };
  }
}

export async function addExpense(data: { label: string, amount: number, category: string, notes?: string }) {
  try {
    const expense = await (prisma as any).expense.create({
      data: {
        label: data.label,
        amount: data.amount,
        category: data.category,
        notes: data.notes
      }
    });
    await createAuditLog("ADD_EXPENSE", expense.id, `Expense added: ${data.label} (Rp ${data.amount})`);
    return { success: true, data: JSON.parse(JSON.stringify(expense)) };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
