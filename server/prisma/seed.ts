import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@viny.app' },
    update: {},
    create: {
      email: 'test@viny.app',
      name: 'Test User',
      password: hashedPassword,
    },
  })

  console.log('Test user created:', testUser)
  
  // Create some sample notes for the test user
  const sampleNotes = [
    {
      title: 'Welcome to Viny',
      content: '# Welcome to Viny\n\nThis is your first note! Start writing your thoughts here.',
      preview: 'Welcome to Viny - This is your first note! Start writing your thoughts here.',
      notebook: 'Personal',
      status: 'draft',
      userId: testUser.id,
    },
    {
      title: 'Getting Started',
      content: '# Getting Started\n\n## Features\n- Multi-user support\n- Real-time sync\n- Beautiful UI\n\nEnjoy using Viny!',
      preview: 'Getting Started - Features: Multi-user support, Real-time sync, Beautiful UI',
      notebook: 'Personal', 
      status: 'draft',
      userId: testUser.id,
    }
  ]

  for (const note of sampleNotes) {
    await prisma.note.create({
      data: note,
    })
  }

  console.log('Sample notes created')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })