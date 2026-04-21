import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// @ts-ignore
import midtransClient from "midtrans-client";

// Initialize Midtrans Snap API
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerData, cartItems, totalAmount } = body;

    // 1. Generate Order ID upfront
    const newOrderId = `YB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // 2. Create or Find Customer
    const customer = await prisma.customer.upsert({
      where: { phone: customerData.phone },
      update: { name: customerData.name, email: customerData.email },
      create: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      },
    });

    // 3. Create Snap Transaction with the generated ID
    console.log("Creating Midtrans Snap Transaction for order:", newOrderId);
    
    // Add Service Fee to item_details so gross_amount matches total
    const serviceFee = cartItems.length > 0 ? 5000 : 0;
    const midtransItems = [
      ...cartItems.map((item: any) => ({
        id: item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.substring(0, 50) // Midtrans has name length limits
      })),
    ];

    if (serviceFee > 0) {
      midtransItems.push({
        id: 'SERVICE_FEE',
        price: serviceFee,
        quantity: 1,
        name: 'Service & Packaging'
      });
    }

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: newOrderId,
        gross_amount: Math.round(totalAmount),
      },
      customer_details: {
        first_name: customer.name,
        email: customer.email && customer.email.includes('@') ? customer.email : undefined,
        phone: customer.phone,
      },
      item_details: midtransItems,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/${newOrderId}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/${newOrderId}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/${newOrderId}`
      }
    });

    console.log("Midtrans Response Success:", transaction.token);

    // 4. Create Order in Database with ALL details at once
    const order = await prisma.order.create({
      data: {
        id: newOrderId,
        customerId: customer.id,
        totalAmount: totalAmount,
        status: "PENDING",
        channel: body.channel || "WhatsApp",
        paymentMethod: body.paymentMethod || "QRIS",
        snapToken: transaction.token,
        snapUrl: transaction.redirect_url,
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
      },
    });

    console.log("Order created in DB with snap details:", order.id);

    // 5. Return Snap token and redirect URL
    return NextResponse.json({
      success: true,
      orderId: order.id,
      snapToken: transaction.token,
      snapRedirectUrl: transaction.redirect_url,
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
