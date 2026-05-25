import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed Categories
  const categories = [
    {
      name: 'Troubleshooting',
      slug: 'troubleshooting',
      icon: '🛠️',
      order: 1,
    },
    {
      name: 'Rakit & Upgrade',
      slug: 'rakit-upgrade',
      icon: '⚙️',
      order: 2,
    },
    {
      name: 'Diskusi Santai',
      slug: 'diskusi-santai',
      icon: '💬',
      order: 3,
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('Categories seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
