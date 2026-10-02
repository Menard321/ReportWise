import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial report types...')
  
  const reportTypes = [
    {
      key: 'field_report',
      name: 'Field Report',
      description: 'Used for student field attachments, internships, and practical training logs.',
      basePrice: 30000.0,
      minPages: 10,
      maxPages: 60
    },
    {
      key: 'final_year_project',
      name: 'Final Year Project',
      description: 'Comprehensive academic research project for graduating students.',
      basePrice: 45000.0,
      minPages: 30,
      maxPages: 100
    },
    {
      key: 'research_report',
      name: 'Research Report',
      description: 'Academic or independent research combining literature and data analysis.',
      basePrice: 40000.0,
      minPages: 15,
      maxPages: 80
    },
    {
      key: 'organizational_analysis',
      name: 'Organizational Analysis',
      description: 'Deep dive into company performance, KPIs, and corporate structure.',
      basePrice: 50000.0,
      minPages: 15,
      maxPages: 80
    }
  ]

  for (const rt of reportTypes) {
    await prisma.reportType.upsert({
      where: { key: rt.key },
      update: rt,
      create: rt
    })
  }
  
  console.log('Seed complete!')
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
