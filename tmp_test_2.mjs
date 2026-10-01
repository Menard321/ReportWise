import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  try {
    console.log("Connecting to DB...")
    const identifier = 'jmhema2002@gmail.com'
    const name = 'menard joseph'
    const accountType = 'Student'
    
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    })
    
    console.log("Found user:", !!user)

    if (!user) {
      const isEmail = identifier.includes('@')
      user = await prisma.user.create({
        data: {
          email: isEmail ? identifier : null,
          phone: !isEmail ? identifier : null,
          name: name || null,
          accountType: accountType || null
        },
      })
      console.log("Created user:", user.email)
    }
  } catch (err) {
    console.error("PRISMA ERROR IS:", err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
