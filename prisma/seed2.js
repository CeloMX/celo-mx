// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding merch items...");

  const merchBase = "https://tgjqcddmqtaceidmafyn.supabase.co/storage/v1/object/public/merch/";

  const items = [
    {
      id: "celo-shirt",
      name: "Celo T-Shirt",
      description: "Official Celo shirt. High-quality cotton.",
      price: 30,
      image: merchBase + "celoco_shirt.jpg",
      category: "clothing",
      sizes: ["S", "M", "L", "XL"],
      stock: 5,
    },
    {
      id: "celo-coffee",
      name: "Celo Coffee",
      description: "Premium ground coffee pouch.",
      price: 10,
      image: merchBase + "celoco_coffee.jpg",
      category: "accessories",
      sizes: [],
      stock: 25,
    },
    {
      id: "celo-pin",
      name: "Celo Pin",
      description: "Metal Celo lapel pin.",
      price: 5,
      image: merchBase + "celoco_pin.jpg",
      category: "accessories",
      sizes: [],
      stock: 15,
    },
    {
      id: "celo-key-toy",
      name: "Celo Keychain Toy",
      description: "Cute soft keychain toy with Celo branding.",
      price: 2,
      image: merchBase + "celoco_key_toy.jpg",
      category: "accessories",
      sizes: [],
      stock: 20,
    },
    {
      id: "celo-key-whistle",
      name: "Celo Whistle Keychain",
      description: "Whistle keychain with Celo lanyard.",
      price: 2,
      image: merchBase + "celoco_key_whistle.jpg",
      category: "accessories",
      sizes: [],
      stock: 15,
    },
    {
      id: "celo-hat",
      name: "Celo Hat",
      description: "High-quality Celo cap.",
      price: 5,
      image: merchBase + "celoco_cap.jpg",
      category: "clothing",
      sizes: [],
      stock: 5,
    },
    {
      id: "celo-chocolates",
      name: "Chocolates",
      description: "Celo-branded chocolates. For everyone.",
      price: 0,
      image: merchBase + "placeholder_chocolates.jpg",
      category: "accessories",
      sizes: [],
      stock: 110,
    },
    {
      id: "celo-power-bank",
      name: "Power Bank",
      description: "Premium Swag: high-capacity branded power bank.",
      price: 0,
      image: merchBase + "celola_power.jpg",
      category: "accessories",
      sizes: [],
      stock: 15,
    },
    {
      id: "celo-mate",
      name: "Mate",
      description: "Premium Swag: traditional Mate cup.",
      price: 0,
      image: merchBase + "celola_mate.jpg",
      category: "accessories",
      sizes: [],
      stock: 20,
    },
    {
      id: "celo-thermic-bottle",
      name: "Thermic Bottle",
      description: "Premium Swag: insulated thermic bottle.",
      price: 0,
      image: merchBase + "celola_thermic.jpg",
      category: "accessories",
      sizes: [],
      stock: 15,
    },
  ];

  for (const item of items) {
    await prisma.merchItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  console.log("✅ Merch items seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
