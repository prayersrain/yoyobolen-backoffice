import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Midtrans uses order_id which corresponds to our database ID
    const { 
      order_id, 
      transaction_status, 
      status_code, 
      gross_amount, 
      signature_key 
    } = body;

    // 1. SECURITY: Verify Midtrans Signature
    // Signature Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const payload = order_id + status_code + gross_amount + serverKey;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(payload)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error(`Invalid signature for order ${order_id}! Potential spoofing attempt.`);
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    console.log(`Midtrans Webhook Verified: Order ${order_id} is now ${transaction_status}`);

    if (status_code === "200") {
      let finalStatus: "PAID" | "PENDING" | "CANCELLED" | "EXPIRED" = "PENDING";
      let isSuccess = false;

      if (transaction_status === "settlement" || transaction_status === "capture") {
        finalStatus = "PAID";
        isSuccess = true;
      } else if (transaction_status === "deny" || transaction_status === "cancel") {
        finalStatus = "CANCELLED";
      } else if (transaction_status === "expire") {
        finalStatus = "EXPIRED";
      } else if (transaction_status === "pending") {
        finalStatus = "PENDING";
      }

      // 2. Update Order Status in Prisma
      const updatedOrder = await prisma.order.update({
        where: { id: order_id },
        data: { status: finalStatus },
        include: { items: true }
      });

      // 3. BUSINESS LOGIC: Decrement Stock on Success
      if (isSuccess) {
        console.log(`Payment success for ${order_id}. Adjusting inventory...`);
        for (const item of updatedOrder.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
      }
    }

    return NextResponse.json({ message: "Webhook processed securely" });
    
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { message: "Error processing webhook", error: error.message },
      { status: 500 }
    );
  }
}
