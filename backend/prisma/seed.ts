import prisma from "../src/config/database";

async function main() {
  console.log("Seeding database...");

  const ticketTypes = [
    {
      name: "VIP",
      price: 100,
      quantity: 20,
      available: 20,
    },
    {
      name: "Front Row",
      price: 50,
      quantity: 30,
      available: 30,
    },
    {
      name: "General Admission",
      price: 10,
      quantity: 50,
      available: 50,
    },
  ];

  for (const t of ticketTypes) {
    // Check if the ticket type already exists to prevent duplicates.
    const existing = await prisma.ticketType.findFirst({
      where: { name: t.name },
    });

    if (!existing) {
      await prisma.ticketType.create({ data: t });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
