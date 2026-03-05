import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const prefixes = [
  { name: "lk", color: "#A01020", sortOrder: 1 },
  { name: "UV", color: "#D8A0D8", sortOrder: 2 },
  { name: "UVCHY", color: "#40A0E0", sortOrder: 3 },
  { name: "cp", color: "#B0D840", sortOrder: 4 },
];

for (const p of prefixes) {
  await prisma.prefix.upsert({
    where: { name: p.name },
    update: { color: p.color, sortOrder: p.sortOrder },
    create: p,
  });
}

console.log("Seed completed: 4 prefixes created");
await prisma.$disconnect();
