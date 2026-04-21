"use server";

import prisma from "@/lib/prisma";

export async function getOrderDetails(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) return { success: false, data: null, error: "Order not found" };

    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function checkPaymentStatus(orderId: string) {
  try {
    // @ts-ignore
    const midtransClient = require("midtrans-client");
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const statusResponse = await snap.transaction.status(orderId);
    console.log("Midtrans Status Check:", statusResponse.transaction_status);

    if (statusResponse.transaction_status === "settlement" || statusResponse.transaction_status === "capture") {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
        include: { items: true }
      });

      // Adjust stock if updated successfully
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return { success: true, status: "PAID" };
    }

    return { success: true, status: statusResponse.transaction_status };
  } catch (error: any) {
    console.error("Status check failed:", error);
    return { success: false, error: error.message };
  }
}
