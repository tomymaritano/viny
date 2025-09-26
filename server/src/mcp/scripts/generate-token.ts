#!/usr/bin/env tsx

import { MCPAuthService } from '../auth'
import { PrismaClient } from '@prisma/client'
import readline from 'readline'
import { promisify } from 'util'

const prisma = new PrismaClient()
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = promisify(rl.question).bind(rl)

async function main() {
  console.log('🔐 Viny MCP Token Generator\n')

  try {
    // Get credentials
    const email = await question('Email: ') as string
    const password = await question('Password: ') as string

    console.log('\nGenerating MCP token...')

    // Initialize auth service
    const jwtSecret = process.env.MCP_JWT_SECRET || 'development-secret'
    const authService = new MCPAuthService(jwtSecret)

    // Generate token
    const token = await authService.generateMCPToken(email.trim(), password)

    console.log('\n✅ Token generated successfully!\n')
    console.log('Token:')
    console.log('─'.repeat(80))
    console.log(token)
    console.log('─'.repeat(80))
    console.log('\n📋 Next steps:')
    console.log('1. Copy the token above')
    console.log('2. Add it to your Claude Desktop config')
    console.log('3. Restart Claude Desktop')
    console.log('\n⚠️  Keep this token secure and do not share it!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nCancelled.')
  process.exit(0)
})

main().catch(console.error)