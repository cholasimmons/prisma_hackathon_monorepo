// import db from "../src/utils/database/client";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create 2 vehicles
  const [v1, v2] = await db.vehicle.createManyAndReturn({
    data: [
      {
        plate: "GRZ 1 Z",
        make: "Toyota",
        model: "Corolla",
        color: "Silver",
        year: 2020,
        forSale: true,
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
      },
    ],
    select: { id: true, plate: true },
    skipDuplicates: true,
  });

  // Optional: Add photos to vehicles
  // await db.vehiclePhoto.createMany({
  //   data: [
  //     // Photos for GRZ 1 Z
  //     { photo: 'https://example.com/toyota-front.jpg', vehicleId: v1.id },
  //     { photo: 'https://example.com/toyota-side.jpg', vehicleId: v1.id },
  //     // Photos for ABC 123
  //     { photo: 'https://example.com/ford-front.jpg', vehicleId: v2.id },
  //   ],
  // });

  console.log(`✅ Created vehicles: ${v1.plate}, ${v2.plate}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
