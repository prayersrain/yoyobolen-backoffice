import prisma from '../src/lib/prisma'

async function main() {
  console.log('Refreshing database with authentic Yoyo Bakery menu...')

  // Clear existing orders and items first to avoid foreign key issues
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.customer.deleteMany({})

  const products = [
    // --- KUE KERING ---
    { name: 'Nastar Classic', category: 'Kue Kering', price: 75000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1621236304195-03713094892c?q=80&w=300&auto=format&fit=crop' },
    { name: 'Nastar Keju', category: 'Kue Kering', price: 75000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1621236304195-03713094892c?q=80&w=300&auto=format&fit=crop' },
    { name: 'Sagu Keju', category: 'Kue Kering', price: 70000, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1558961359-1d99283f085c?q=80&w=300&auto=format&fit=crop' },
    { name: 'Putri Salju', category: 'Kue Kering', price: 65000, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1558961359-1d99283f085c?q=80&w=300&auto=format&fit=crop' },
    { name: 'Nutella Butter Cookies', category: 'Kue Kering', price: 75000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=300&auto=format&fit=crop' },
    { name: 'Choco Almond', category: 'Kue Kering', price: 70000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc2fe0a?q=80&w=300&auto=format&fit=crop' },
    { name: 'Semprit Susu', category: 'Kue Kering', price: 65000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1558961359-1d99283f085c?q=80&w=300&auto=format&fit=crop' },
    { name: 'Kastengel', category: 'Kue Kering', price: 70000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1558961359-1d99283f085c?q=80&w=300&auto=format&fit=crop' },
    { name: 'Skippy Cookies', category: 'Kue Kering', price: 65000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc2fe0a?q=80&w=300&auto=format&fit=crop' },
    { name: 'Stick Choco', category: 'Kue Kering', price: 70000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1582176604443-81b8312e08f5?q=80&w=300&auto=format&fit=crop' },
    { name: 'Lidah Kucing', category: 'Kue Kering', price: 65000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1558961359-1d99283f085c?q=80&w=300&auto=format&fit=crop' },
    { name: 'Thumbprint Choco', category: 'Kue Kering', price: 70000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=300&auto=format&fit=crop' },
    { name: 'Redvelvet Cookies', category: 'Kue Kering', price: 65000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=300&auto=format&fit=crop' },

    // --- ROTI & PASTRY ---
    { name: 'Roti Sisir Polos', category: 'Roti & Pastry', price: 28000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=300&auto=format&fit=crop' },
    { name: 'Roti Sisir Original', category: 'Roti & Pastry', price: 35000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=300&auto=format&fit=crop' },
    { name: 'Roti Sisir Full Coklat', category: 'Roti & Pastry', price: 52000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=300&auto=format&fit=crop' },
    { name: 'Roti Sisir Full Keju', category: 'Roti & Pastry', price: 56000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=300&auto=format&fit=crop' },
    { name: 'Roti Sisir Full Moca', category: 'Roti & Pastry', price: 55000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=300&auto=format&fit=crop' },
    { name: 'Roti Abon Ayam', category: 'Roti & Pastry', price: 58000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop' },
    { name: 'Roti Abon Sapi', category: 'Roti & Pastry', price: 58000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop' },
    { name: 'Roti Cream Cheese', category: 'Roti & Pastry', price: 75000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop' },
    { name: 'Bolen Coklat Keju', category: 'Roti & Pastry', price: 65000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1605807616944-6627bdc7b508?q=80&w=300&auto=format&fit=crop' },
    { name: 'Bolen Full Coklat', category: 'Roti & Pastry', price: 65000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1605807616944-6627bdc7b508?q=80&w=300&auto=format&fit=crop' },
    { name: 'Bolen Full Keju', category: 'Roti & Pastry', price: 65000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1605807616944-6627bdc7b508?q=80&w=300&auto=format&fit=crop' },
    { name: 'Choco Roll', category: 'Roti & Pastry', price: 60000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=300&auto=format&fit=crop' },
    { name: 'Cheese Roll', category: 'Roti & Pastry', price: 60000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=300&auto=format&fit=crop' },
    { name: 'Choco Cheese Roll', category: 'Roti & Pastry', price: 65000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=300&auto=format&fit=crop' },

    // --- CAKE & DESSERT ---
    { name: 'Brownies', category: 'Cake & Dessert', price: 70000, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=300&auto=format&fit=crop' },
    { name: 'Marmer Cake', category: 'Cake & Dessert', price: 155000, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=300&auto=format&fit=crop' },
    { name: 'Kue Soes', category: 'Cake & Dessert', price: 55000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1609355673499-24d1668853b0?q=80&w=300&auto=format&fit=crop' },
    { name: 'Bolu Potong', category: 'Cake & Dessert', price: 95000, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=300&auto=format&fit=crop' },
    { name: 'Nona Manis', category: 'Cake & Dessert', price: 40000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=300&auto=format&fit=crop' },
  ]

  for (const product of products) {
    const slug = product.name.toLowerCase().replace(/\s+/g, '-')
    await prisma.product.create({
      data: {
        id: slug,
        ...product
      }
    })
  }

  console.log('Authentic menu seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
