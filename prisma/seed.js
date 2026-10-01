const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Resetting and seeding database...')

  // CREATE INSTITUTIONS (TZ Universities)
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
    createdUnis[uni.code] = await prisma.institution.create({
      data: { code: uni.code, name: uni.name }
    })
  }

  // CREATE REPORT TYPES
  const fyp = await prisma.reportType.create({
    data: {
      key: 'final_year_project',
      name: 'Final Year Project',
      description: 'Comprehensive academic project for graduating students.',
      basePrice: 50000.0,
    },
  })

  const field = await prisma.reportType.create({
    data: {
      key: 'field_report',
      name: 'Field Report',
      description: 'For field attachments, practical training (PT).',
      basePrice: 30000.0,
    },
  })

  // CREATE TEMPLATES (Bound directly to Universities to demonstrate unique schemas)

  // 1. UDSM Field Report uses "Logbook" structure
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

  // 2. SUA Field Report uses "Practical Training" structure
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

  // 3. Fallback generic field report for other universities simply using base template
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

  // CREATE INSTITUTION PROFILES (Controls DOCX/PDF exact formatting rules)
  // UDSM uses strictly Times New Roman, Double Spaced, 1.5inch left margin for binding
  await prisma.institutionProfile.create({
    data: {
      institutionId: createdUnis['UDSM'].id,
      faculty: 'General',
      version: '1.0',
      formattingJson: JSON.stringify({
        fontFamily: 'Times New Roman',
        fontSize: 12,
        lineSpacing: 2.0, // Double spaced
        margins: { top: 1, right: 1, bottom: 1, left: 1.5 }, // 1.5 inch left for binding
      })
    }
  })

  // SUA uses Arial, 1.5 line spacing, standard 1 inch margins all around
  await prisma.institutionProfile.create({
    data: {
      institutionId: createdUnis['SUA'].id,
      faculty: 'General',
      version: '1.0',
      formattingJson: JSON.stringify({
        fontFamily: 'Arial',
        fontSize: 12,
        lineSpacing: 1.5,
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
      })
    }
  })

  console.log('Seed fully applied with Tanzania University configurations!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
