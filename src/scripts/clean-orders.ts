import prisma from "../lib/prisma";

async function main() {
  console.log("Cleaning up database...");
  try {
    const deletedItems = await prisma.orderItem.deleteMany();
    const deletedOrders = await prisma.order.deleteMany();
    console.log(`Successfully deleted ${deletedItems.count} order items and ${deletedOrders.count} orders.`);
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
