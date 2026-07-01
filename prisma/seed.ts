import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database...')
  await prisma.interaction.deleteMany()
  await prisma.task.deleteMany()
  await prisma.application.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  console.log('Seeding default company and super admin...')

  const company = await prisma.company.create({
    data: {
      name: 'AbroadSync Demo Agency',
    }
  })

  await prisma.user.create({
    data: {
      email: 'admin@abroadsync.com',
      fullName: 'System Admin',
      role: 'Super Admin',
      password: 'password123', // Still required by schema, but Supabase will handle actual auth
      companyId: company.id
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
