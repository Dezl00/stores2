const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = 'admin@matjark.com'
  const existing = await prisma.platformUser.findUnique({ where: { email } })
  if (!existing) {
    await prisma.platformUser.create({
      data: {
        name: 'مدير المنصة',
        email,
        passwordHash: '$2b$10$nlpQ5F525mYZp3H424lQfu.AgTzaQnK6yBSdrTH9/rP.Bhi9X9eS.', // Admin@2026
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })
    console.log('Admin created!')
  } else {
    console.log('Admin already exists!')
  }
}

main().then(() => prisma.$disconnect()).catch(console.error)