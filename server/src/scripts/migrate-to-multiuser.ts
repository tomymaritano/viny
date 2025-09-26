import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function migrateToMultiUser() {
  console.log('🔄 Starting migration to multi-user system...')
  
  try {
    // 1. Check if we already have users
    const existingUsers = await prisma.user.findMany()
    if (existingUsers.length > 0) {
      console.log('✅ Users already exist, skipping migration')
      return
    }

    // 2. Create default user for existing data
    const defaultPassword = await bcrypt.hash('defaultuser123', 10)
    const defaultUser = await prisma.user.create({
      data: {
        email: 'user@viny.local',
        name: 'Default User',
        password: defaultPassword,
        emailVerified: new Date(),
      }
    })
    
    console.log(`✅ Created default user with ID: ${defaultUser.id}`)

    // 3. Get all existing data without users
    const notesWithoutUser = await prisma.note.findMany({
      where: { userId: null }
    })
    
    const tagsWithoutUser = await prisma.tag.findMany({
      where: { userId: null }
    })
    
    const notebooksWithoutUser = await prisma.notebook.findMany({
      where: { userId: null }
    })

    console.log(`📊 Found ${notesWithoutUser.length} notes, ${tagsWithoutUser.length} tags, ${notebooksWithoutUser.length} notebooks without users`)

    // 4. Assign all existing data to default user
    if (notesWithoutUser.length > 0) {
      await prisma.note.updateMany({
        where: { userId: null },
        data: { userId: defaultUser.id }
      })
      console.log(`✅ Assigned ${notesWithoutUser.length} notes to default user`)
    }

    if (tagsWithoutUser.length > 0) {
      await prisma.tag.updateMany({
        where: { userId: null },
        data: { userId: defaultUser.id }
      })
      console.log(`✅ Assigned ${tagsWithoutUser.length} tags to default user`)
    }

    if (notebooksWithoutUser.length > 0) {
      await prisma.notebook.updateMany({
        where: { userId: null },
        data: { userId: defaultUser.id }
      })
      console.log(`✅ Assigned ${notebooksWithoutUser.length} notebooks to default user`)
    }

    // 5. Verify migration
    const remainingOrphanedNotes = await prisma.note.count({
      where: { userId: null }
    })
    
    const remainingOrphanedTags = await prisma.tag.count({
      where: { userId: null }
    })
    
    const remainingOrphanedNotebooks = await prisma.notebook.count({
      where: { userId: null }
    })

    if (remainingOrphanedNotes === 0 && remainingOrphanedTags === 0 && remainingOrphanedNotebooks === 0) {
      console.log('✅ Migration completed successfully!')
      console.log('📝 All existing data has been assigned to the default user')
      console.log('🔑 Default user credentials:')
      console.log('   Email: user@viny.local')
      console.log('   Password: defaultuser123')
      console.log('⚠️  Please change these credentials after first login')
    } else {
      console.log('❌ Migration incomplete - some data remains unassigned')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToMultiUser()
    .catch(console.error)
    .finally(() => process.exit(0))
}

export default migrateToMultiUser