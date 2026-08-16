import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const BUDGET_CATEGORIES = [
  "Venue",
  "Catering",
  "Photography & Videography",
  "Decor & Florals",
  "Bridal Outfits",
  "Groom Outfits",
  "Jewelry",
  "Makeup & Hair",
  "Mehendi Artist",
  "Sangeet",
  "Invitations",
  "Gifts & Favors",
  "Transport & Stay",
  "Priest & Rituals",
  "Miscellaneous/Buffer",
];

const CHECKLIST: { phase: string; tasks: string[] }[] = [
  {
    phase: "5-4 Months Out",
    tasks: [
      "Finalize wedding date and lock the main venue",
      "Set the overall budget and rough allocation by category",
      "Book photographer & videographer",
      "Shortlist and book the caterer",
      "Send save-the-dates to close family",
      "Start a first draft of the guest list",
      "Choose bridal & groom outfit designers",
      "Book venues for Haldi/Mehendi/Sangeet if separate from the main venue",
    ],
  },
  {
    phase: "3 Months Out",
    tasks: [
      "Finalize guest list and collect addresses",
      "Send formal invitations",
      "Book the mehendi artist",
      "Book the makeup artist and schedule a trial",
      "Finalize decor theme and book the florist",
      "Book a choreographer for the Sangeet",
      "Order wedding invitations and stationery",
      "Start outfit fittings",
    ],
  },
  {
    phase: "2 Months Out",
    tasks: [
      "Follow up on RSVPs",
      "Finalize the menu with the caterer",
      "Book transport and guest accommodations",
      "Finalize jewelry",
      "Finalize the Sangeet performance lineup",
      "Order wedding favors / return gifts",
      "Confirm the priest/pandit and the rituals list",
      "Second round of outfit fittings",
    ],
  },
  {
    phase: "1 Month Out",
    tasks: [
      "Give final headcount to caterer and venue",
      "Confirm all vendor payments and advances",
      "Finalize seating arrangements",
      "Book pre-wedding beauty/spa appointments",
      "Rehearse rituals with the priest",
      "Confirm the final hair & makeup look",
      "Assign day-of coordinators for each event",
    ],
  },
  {
    phase: "Final Week",
    tasks: [
      "Pick up outfits and jewelry",
      "Confirm arrival times with every vendor",
      "Pack an emergency kit (safety pins, tailoring kit, meds)",
      "Distribute welcome hampers to out-of-town guests",
      "Final decor walkthrough at each venue",
      "Confirm the transport pickup schedule",
      "Rest, hydrate, and delegate!",
    ],
  },
  {
    phase: "Wedding Week",
    tasks: [
      "Haldi ceremony",
      "Mehendi ceremony",
      "Sangeet night",
      "Wedding ceremony",
      "Reception",
      "Send thank-you notes to family and helpers",
      "Return rented items",
    ],
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "The Couple";

  if (!adminEmail || !adminPassword) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { role: "COUPLE" },
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash,
      displayName: adminName,
      role: "COUPLE",
    },
  });
  console.log(`Bootstrap account ready: ${admin.email}`);

  const existingMeta = await prisma.weddingMeta.findFirst();
  if (!existingMeta) {
    const weddingDate = new Date();
    weddingDate.setDate(weddingDate.getDate() + 150);

    await prisma.weddingMeta.create({
      data: {
        partner1Name: "Partner One",
        partner2Name: "Partner Two",
        weddingDate,
        city: null,
      },
    });

    const dayOffset = (days: number) => {
      const d = new Date(weddingDate);
      d.setDate(d.getDate() + days);
      return d;
    };

    await prisma.eventItem.createMany({
      data: [
        { name: "Haldi", date: dayOffset(-2), sortOrder: 1 },
        { name: "Mehendi", date: dayOffset(-1), sortOrder: 2 },
        { name: "Sangeet", date: dayOffset(-1), sortOrder: 3 },
        { name: "Wedding", date: weddingDate, sortOrder: 4 },
        { name: "Reception", date: dayOffset(1), sortOrder: 5 },
      ],
    });
    console.log("Seeded wedding meta and default itinerary events.");
  } else {
    console.log("Wedding meta already exists — skipping meta/itinerary seed.");
  }

  const phaseCount = await prisma.checklistPhase.count();
  if (phaseCount === 0) {
    for (const [phaseIndex, { phase, tasks }] of CHECKLIST.entries()) {
      const createdPhase = await prisma.checklistPhase.create({
        data: { name: phase, sortOrder: phaseIndex + 1 },
      });
      await prisma.checklistTask.createMany({
        data: tasks.map((text, taskIndex) => ({
          phaseId: createdPhase.id,
          text,
          ownerId: admin.id,
          sortOrder: taskIndex + 1,
        })),
      });
    }
    console.log("Seeded phased checklist.");
  } else {
    console.log("Checklist already has phases — skipping checklist seed.");
  }

  const categoryCount = await prisma.budgetCategory.count();
  if (categoryCount === 0) {
    await prisma.budgetCategory.createMany({
      data: BUDGET_CATEGORIES.map((name, index) => ({
        name,
        estimatedAmount: 0,
        sortOrder: index + 1,
      })),
    });
    console.log("Seeded budget categories.");
  } else {
    console.log("Budget categories already exist — skipping.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
