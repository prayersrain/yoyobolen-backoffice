import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// @ts-ignore
import midtransClient from "midtrans-client";

// Initialize Midtrans Core API
const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerData, cartItems, totalAmount, paymentMethod, selectedBank } = body;

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

    // 3. Prepare Item Details
    const serviceFee = cartItems.length > 0 ? 5000 : 0;
    const midtransItems = [
      ...cartItems.map((item: any) => ({
        id: item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.substring(0, 50)
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

    // 4. Create Core API Charge based on payment method
    console.log(`Charging via Core API (${paymentMethod}) for order:`, newOrderId);
    
    let chargeParams: any = {
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
    };

    if (paymentMethod === "qris") {
      chargeParams.payment_type = "qris";
    } else if (selectedBank === "mandiri") {
      chargeParams.payment_type = "echannel";
      chargeParams.echannel = {
        bill_info1: "Payment for:",
        bill_info2: `Order ${newOrderId}`
      };
    } else {
      chargeParams.payment_type = "bank_transfer";
      chargeParams.bank_transfer = {
        bank: selectedBank || "bca"
      };
    }

    const transaction = await core.charge(chargeParams);
    console.log("Midtrans Core API Response:", transaction.transaction_status);

    // 5. Create Order in Database
    const order = await prisma.order.create({
      data: {
        id: newOrderId,
        customerId: customer.id,
        totalAmount: totalAmount,
        status: "PENDING",
        channel: body.channel || "Storefront",
        paymentMethod: paymentMethod === "qris" ? "QRIS" : "TRANSFER",
        paymentData: transaction as any, // Store full response for later use
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
      },
    });

    console.log("Order created in DB with Core API details:", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentType: paymentMethod,
      transactionStatus: transaction.transaction_status,
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
