import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const post = await prisma.post.create({
    data: {
      title: 'Welcome to Our Newsletter!',
      content: 'This is our first newsletter post. Stay tuned for more exciting content!',
      slug: 'welcome-to-our-newsletter',
      published: true,
      publishedAt: new Date(),
    },
  })

  const subscriber = await prisma.subscriber.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })

  console.log('Created post:', post)
  console.log('Created subscriber:', subscriber)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })