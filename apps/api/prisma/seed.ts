import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create 2 vehicles
  const vehicles = await db.vehicle.createManyAndReturn({
    data: [
      {
        plate: "GRZ 1 Z",
        make: "Toyota",
        model: "Corolla",
        color: "Silver",
        year: 2020,
        forSale: true,
        isActive: true
        // photos: {
        //   create: [
        //     { photo: 'https://example.com/toyota-front.jpg' },
        //     { photo: 'https://example.com/toyota-side.jpg' },
        //   ],
        // },
      },
      {
        plate: "ABC 123",
        make: "Ford",
        model: "Ranger",
        color: "Blue",
        year: 2022,
        forSale: false,
        isActive: true
      },
    ],
    select: { id: true, plate: true },
    skipDuplicates: true,
  });
  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Demo logos
  const logos = await db.logo.createManyAndReturn({
    data: [
      { name: 'Toyota', url: './public/logos/toyota.webp', submittedById: 'SYSTEM', uploadSizeKb: 0 },
      { name: 'Mazda', url: './public/logos/mazda.webp', submittedById: 'SYSTEM', uploadSizeKb: 0 },
      { name: 'Ford', url: './public/logos/ford.webp', submittedById: 'SYSTEM', uploadSizeKb: 0 },
      { name: 'Honda', url: './public/logos/honda.webp', submittedById: 'SYSTEM', uploadSizeKb: 0 }
    ],
    skipDuplicates: true
  });
  console.log(`✅ Created ${logos.length} test logos`);


}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
