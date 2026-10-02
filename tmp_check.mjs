import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const report = await prisma.report.findUnique({
    where: { id: 'cmuqkm5xs0001x1yk3p38f1rd' },
    include: { reportType: true }
  })
  console.log('Report:', report)

  const templates = await prisma.template.findMany()
  console.log('All Templates:', templates)

  const reportTypes = await prisma.reportType.findMany()
  console.log('All Report Types:', reportTypes)
  
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
