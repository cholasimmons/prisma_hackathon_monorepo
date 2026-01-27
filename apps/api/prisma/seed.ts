import { PrismaClient, VehicleSubmission, VehicleType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create 3 vehicles
  const vehicles = await db.vehicle.createManyAndReturn({
    data: [
      {
        plate: "GRZ 1 Z",
        make: "Toyota",
        model: "Corolla",
        color: "#342",
        year: 2020,
        forSale: true,
        isActive: true,
        submissionCount: 2,
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
        color: "#44F",
        year: 2022,
        forSale: false,
        isActive: true,
        submissionCount: 2,
      },
      {
        plate: "ALC 5355",
        make: "Land Rover",
        model: "Defender 110",
        color: "#FFF",
        year: 2001,
        forSale: false,
        isActive: true,
        submissionCount: 3,
      },
      {
        plate: "CAC 97",
        make: "Toyota",
        model: "Rav4",
        color: "#FFF",
        year: 2006,
        forSale: false,
        isActive: true,
        submissionCount: 3,
      },
    ],
    select: { id: true },
    skipDuplicates: true,
  });
  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create vehicle submissions
  const vehicleSubmissions: Partial<VehicleSubmission>[] | null = await db.vehicleSubmission.createManyAndReturn({
    data: [
      {
        plate: "GRZ 1 Z",
        make: "Toyota",
        model: "Corolla",
        type: VehicleType.hatchback,
        color: "#342",
        year: 2020,
        forSale: false,
        submittedById: '3w2Ke6bpmcx4jEXgWun3SI9luneIRAjD'
      }
    ],
    select: { id: true },
    skipDuplicates: true,
  });
  console.log(`✅ Created ${vehicleSubmissions?.length ?? 0} submissions`);

  // Demo logos
  const logos = await db.logo.createManyAndReturn({
    data: [
      {
        name: "Toyota",
        url: "/public/logos/toyota.webp",
        submittedById: "SYSTEM",
        uploadSizeKb: 0,
      },
      {
        name: "Mazda",
        url: "/public/logos/mazda.webp",
        submittedById: "SYSTEM",
        uploadSizeKb: 0,
      },
      {
        name: "Ford",
        url: "/public/logos/ford.webp",
        submittedById: "SYSTEM",
        uploadSizeKb: 0,
      },
      {
        name: "Honda",
        url: "/public/logos/honda.webp",
        submittedById: "SYSTEM",
        uploadSizeKb: 0,
      },
    ],
    skipDuplicates: true,
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
