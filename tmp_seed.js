const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding templates (ignoring already created models)...')

  // Retrieve existing Unis
  const tzUnis = [
    { code: 'UDSM', name: 'University of Dar es Salaam' },
    { code: 'SUA', name: 'Sokoine University of Agriculture' },
    { code: 'UDOM', name: 'University of Dodoma' },
    { code: 'IFM', name: 'Institute of Finance Management' },
    { code: 'OUT', name: 'Open University of Tanzania' },
    { code: 'MUHAS', name: 'Muhimbili University of Health and Allied Sciences' },
    { code: 'MZUMBE', name: 'Mzumbe University' },
    { code: 'IAA', name: 'Institute of Accountancy Arusha' },
    { code: 'NIT', name: 'National Institute of Transport' },
    { code: 'CBE', name: 'College of Business Education' }
  ]

  const createdUnis = {}
  for (const uni of tzUnis) {
    createdUnis[uni.code] = await prisma.institution.upsert({
      where: { code: uni.code },
      update: {},
      create: { code: uni.code, name: uni.name }
    })
  }

  // CREATE REPORT TYPES
  await prisma.reportType.upsert({
    where: { key: 'final_year_project' },
    update: {},
    create: {
      key: 'final_year_project',
      name: 'Final Year Project',
      description: 'Comprehensive academic project for graduating students.',
      basePrice: 50000.0,
    },
  })

  await prisma.reportType.upsert({
    where: { key: 'field_report' },
    update: {},
    create: {
      key: 'field_report',
      name: 'Field Report',
      description: 'For field attachments, practical training (PT).',
      basePrice: 30000.0,
    },
  })

  await prisma.template.create({
    data: {
      reportTypeKey: 'field_report',
      institutionId: createdUnis['UDSM'].id,
      version: 1,
      schemaJson: JSON.stringify({
        sections: [
          { key: 'background', title: 'Background of Organization', required: true },
          { key: 'weekly_logs', title: 'Summary of Weekly Logs', required: true },
          { key: 'problem_analysis', title: 'Problem Analysis', required: true },
          { key: 'conclusion', title: 'Conclusion & Recommendations', required: true },
        ]
      })
    }
  })

  await prisma.template.create({
    data: {
      reportTypeKey: 'field_report',
      institutionId: createdUnis['SUA'].id,
      version: 1,
      schemaJson: JSON.stringify({
        sections: [
          { key: 'intro', title: 'Introduction', required: true },
          { key: 'objectives', title: 'PT Objectives', required: true },
          { key: 'activities', title: 'Activities Undertaken', required: true },
          { key: 'skills', title: 'New Skills Acquired', required: true },
          { key: 'challenges', title: 'Challenges Faced', required: true },
          { key: 'conclusion', title: 'Conclusion', required: true },
        ]
      })
    }
  })

  for (const uniCode of ['UDOM', 'IFM', 'OUT', 'MUHAS', 'MZUMBE', 'IAA', 'NIT', 'CBE']) {
    await prisma.template.create({
      data: {
        reportTypeKey: 'field_report',
        institutionId: createdUnis[uniCode].id,
        version: 1,
        schemaJson: JSON.stringify({
          sections: [
            { key: 'exec_summary', title: 'Executive Summary', required: true },
            { key: 'activities', title: 'Activities Done', required: true },
            { key: 'lessons', title: 'Lessons Learned', required: true },
            { key: 'recommendations', title: 'Recommendations', required: true },
          ]
        })
      }
    })
  }

  // Generic fallback template for custom universities (institutionId = NULL) so that the app doesn't crash on custom
  await prisma.template.create({
    data: {
      reportTypeKey: 'field_report',
      version: 1,
      schemaJson: JSON.stringify({
        sections: [
          { key: 'exec_summary', title: 'Executive Summary', required: true },
          { key: 'activities', title: 'Activities Done', required: true },
          { key: 'lessons', title: 'Lessons Learned', required: true },
          { key: 'recommendations', title: 'Recommendations', required: true },
        ]
      })
    }
  })

  console.log('Seed fully applied!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
