import { PrismaClient, Role, DealStatus, ActivityType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for seeding.");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding for PipelineIQ...");

  // Clean up existing data in reverse dependency order
  await prisma.dealRiskAnalysis.deleteMany();
  await prisma.dealNote.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.account.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Acme RevOps Inc.",
      slug: "acme-revops",
    },
  });
  console.log(`✅ Created Organization: ${org.name}`);

  // 2. Create Users (hashed with bcrypt cost 12)
  const passwordHash = bcrypt.hashSync("admin1234", 12);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@admin.com",
      fullName: "Shreyansh Singh (Demo Admin)",
      passwordHash,
      role: Role.ADMIN,
      organizationId: org.id,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: "manager@demo.com",
      fullName: "Sarah Jenkins (VP Sales)",
      passwordHash,
      role: Role.MANAGER,
      organizationId: org.id,
    },
  });

  const repUser = await prisma.user.create({
    data: {
      email: "rep@demo.com",
      fullName: "Alex Rivera (Senior AE)",
      passwordHash,
      role: Role.REP,
      organizationId: org.id,
    },
  });

  console.log(`✅ Created 3 Demo Users: demo@demo.com, manager@demo.com, rep@demo.com`);

  // 3. Create Pipeline Stages
  const stagesData = [
    { name: "Lead", orderIndex: 1, defaultProbability: 10, colorToken: "slate" },
    { name: "Discovery", orderIndex: 2, defaultProbability: 30, colorToken: "blue" },
    { name: "Proposal", orderIndex: 3, defaultProbability: 50, colorToken: "indigo" },
    { name: "Negotiation", orderIndex: 4, defaultProbability: 80, colorToken: "amber" },
    { name: "Closed Won", orderIndex: 5, defaultProbability: 100, colorToken: "emerald" },
    { name: "Closed Lost", orderIndex: 6, defaultProbability: 0, colorToken: "rose" },
  ];

  const stages: Record<string, string> = {};
  for (const stage of stagesData) {
    const created = await prisma.pipelineStage.create({
      data: {
        ...stage,
        organizationId: org.id,
      },
    });
    stages[stage.name] = created.id;
  }
  console.log(`✅ Created ${stagesData.length} Pipeline Stages`);

  // 4. Create Accounts & Contacts
  const accountsData = [
    { name: "Stripe", industry: "Fintech", website: "https://stripe.com" },
    { name: "Vercel", industry: "Cloud Infrastructure", website: "https://vercel.com" },
    { name: "Notion", industry: "Productivity", website: "https://notion.so" },
    { name: "Linear", industry: "Developer Tools", website: "https://linear.app" },
    { name: "Figma", industry: "Design Software", website: "https://figma.com" },
    { name: "Shopify", industry: "E-Commerce", website: "https://shopify.com" },
    { name: "Datadog", industry: "Monitoring", website: "https://datadoghq.com" },
    { name: "Ramp", industry: "Corporate Cards", website: "https://ramp.com" },
  ];

  const accounts: Record<string, string> = {};
  const contacts: Record<string, string> = {};

  for (const acc of accountsData) {
    const createdAccount = await prisma.account.create({
      data: {
        ...acc,
        organizationId: org.id,
      },
    });
    accounts[acc.name] = createdAccount.id;

    // Create a key contact for each account
    const contact = await prisma.contact.create({
      data: {
        fullName: `${acc.name} Buyer`,
        email: `buyer@${acc.name.toLowerCase()}.com`,
        phone: "+1 (555) 019-2834",
        title: "VP of Engineering / Operations",
        accountId: createdAccount.id,
      },
    });
    contacts[acc.name] = contact.id;
  }
  console.log(`✅ Created ${accountsData.length} Accounts and Contacts`);

  // 5. Create 25 Realistic Deals across stages
  const dealsData = [
    // Lead
    { title: "Stripe - Global RevOps Expansion", account: "Stripe", stage: "Lead", value: 120000, prob: 10, owner: repUser.id, daysOffset: 45 },
    { title: "Notion - AI Agent Copilot Seats", account: "Notion", stage: "Lead", value: 45000, prob: 10, owner: repUser.id, daysOffset: 60 },
    { title: "Linear - Enterprise SLA Upgrade", account: "Linear", stage: "Lead", value: 35000, prob: 10, owner: managerUser.id, daysOffset: 30 },
    { title: "Shopify - Q4 Pipeline Automation", account: "Shopify", stage: "Lead", value: 180000, prob: 10, owner: adminUser.id, daysOffset: 50 },

    // Discovery
    { title: "Vercel - Multi-Region Deal Tracking", account: "Vercel", stage: "Discovery", value: 95000, prob: 30, owner: repUser.id, daysOffset: 25 },
    { title: "Figma - Collaborative Forecasting", account: "Figma", stage: "Discovery", value: 110000, prob: 30, owner: repUser.id, daysOffset: 40 },
    { title: "Datadog - Realtime Telemetry Sync", account: "Datadog", stage: "Discovery", value: 210000, prob: 30, owner: managerUser.id, daysOffset: 35 },
    { title: "Ramp - Expense to Revenue Bridge", account: "Ramp", stage: "Discovery", value: 85000, prob: 30, owner: adminUser.id, daysOffset: 20 },
    { title: "Stripe - Connect Partner Dashboard", account: "Stripe", stage: "Discovery", value: 150000, prob: 30, owner: repUser.id, daysOffset: 55 },

    // Proposal
    { title: "Notion - Enterprise Tier + SSO", account: "Notion", stage: "Proposal", value: 75000, prob: 50, owner: repUser.id, daysOffset: 15 },
    { title: "Linear - Custom Workflows Engine", account: "Linear", stage: "Proposal", value: 64000, prob: 50, owner: repUser.id, daysOffset: 18 },
    { title: "Figma - Design Systems Integration", account: "Figma", stage: "Proposal", value: 135000, prob: 50, owner: managerUser.id, daysOffset: 12 },
    { title: "Shopify - Merchant Success Pipeline", account: "Shopify", stage: "Proposal", value: 240000, prob: 50, owner: adminUser.id, daysOffset: 22 },
    { title: "Datadog - Observability Suite Renewal", account: "Datadog", stage: "Proposal", value: 310000, prob: 50, owner: managerUser.id, daysOffset: 10 },
    { title: "Vercel - Edge Config Rollout", account: "Vercel", stage: "Proposal", value: 52000, prob: 50, owner: repUser.id, daysOffset: 14 },

    // Negotiation
    { title: "Ramp - Annual Contract Expansion", account: "Ramp", stage: "Negotiation", value: 165000, prob: 80, owner: managerUser.id, daysOffset: 7 },
    { title: "Stripe - Billing Migration Project", account: "Stripe", stage: "Negotiation", value: 280000, prob: 80, owner: adminUser.id, daysOffset: 5 },
    { title: "Figma - Q3 Seat True-up", account: "Figma", stage: "Negotiation", value: 89000, prob: 80, owner: repUser.id, daysOffset: 8 },
    { title: "Notion - Custom Analytics Module", account: "Notion", stage: "Negotiation", value: 92000, prob: 80, owner: repUser.id, daysOffset: 6 },

    // Closed Won
    { title: "Shopify - Core E-Commerce Hub", account: "Shopify", stage: "Closed Won", value: 350000, prob: 100, status: DealStatus.WON, owner: adminUser.id, daysOffset: -10 },
    { title: "Linear - Team Seats Expansion", account: "Linear", stage: "Closed Won", value: 48000, prob: 100, status: DealStatus.WON, owner: repUser.id, daysOffset: -15 },
    { title: "Vercel - Frontend Cloud Renewal", account: "Vercel", stage: "Closed Won", value: 125000, prob: 100, status: DealStatus.WON, owner: managerUser.id, daysOffset: -5 },
    { title: "Ramp - Procurement Module", account: "Ramp", stage: "Closed Won", value: 140000, prob: 100, status: DealStatus.WON, owner: repUser.id, daysOffset: -20 },

    // Closed Lost
    { title: "Datadog - Legacy System Replacement", account: "Datadog", stage: "Closed Lost", value: 90000, prob: 0, status: DealStatus.LOST, owner: repUser.id, daysOffset: -12 },
    { title: "Stripe - One-off Consulting Spike", account: "Stripe", stage: "Closed Lost", value: 25000, prob: 0, status: DealStatus.LOST, owner: repUser.id, daysOffset: -25 },
  ];

  for (const d of dealsData) {
    const expectedClose = new Date();
    expectedClose.setDate(expectedClose.getDate() + d.daysOffset);

    const deal = await prisma.deal.create({
      data: {
        title: d.title,
        value: d.value,
        probability: d.prob,
        stageId: stages[d.stage],
        accountId: accounts[d.account],
        contactId: contacts[d.account],
        ownerId: d.owner,
        expectedCloseDate: expectedClose,
        status: d.status || DealStatus.OPEN,
      },
    });

    // Add activity log
    await prisma.activityLog.create({
      data: {
        dealId: deal.id,
        actorId: d.owner,
        actionType: ActivityType.CREATED,
        newValue: `Created deal in ${d.stage} stage ($${d.value.toLocaleString()})`,
      },
    });

    // Add sample notes for some deals
    if (d.stage === "Proposal" || d.stage === "Negotiation") {
      await prisma.dealNote.create({
        data: {
          dealId: deal.id,
          authorId: d.owner,
          content: `Discussed pricing proposal with ${d.account} stakeholder. They requested a 5% multi-year discount. Follow up scheduled for next Tuesday.`,
        },
      });
    }

    // Add pre-computed AI Risk Analysis to 3 specific stalled deals
    if (d.title.includes("Enterprise Tier + SSO") || d.title.includes("Observability Suite Renewal") || d.title.includes("AI Agent Copilot Seats")) {
      await prisma.dealRiskAnalysis.create({
        data: {
          dealId: deal.id,
          riskScore: d.title.includes("Observability") ? 85 : 65,
          riskLevel: d.title.includes("Observability") ? "HIGH" : "MEDIUM",
          stallDays: d.title.includes("Observability") ? 21 : 14,
          summary: `Deal has been inactive in ${d.stage} stage for over ${d.title.includes("Observability") ? 21 : 14} days. Stakeholder responsiveness has slowed following initial pricing delivery.`,
          recommendation: `Schedule an executive check-in with the key champion or offer a limited-time technical deep dive to unblock contract review.`,
        },
      });
    }
  }

  console.log(`✅ Successfully seeded 25 diverse Deals with notes, activities, and AI risk scores!`);
  console.log(`🎉 Seeding complete. You can sign in with demo@demo.com / demo1234`);
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
