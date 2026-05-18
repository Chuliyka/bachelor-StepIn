import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const INTERESTS = [
  '☕️ Відпочинок та напої',
  '🍕 Їжа та смаколики',
  '🎾 Спорт та активність',
  '🚶‍♂️ Дозвілля та Lifestyle',
  '🎮 Розваги та хобі',
  '💻 Робота',
];

async function main() {
  console.log('Seeding interests...');

  for (const name of INTERESTS) {
    await prisma.interest.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✔ ${name}`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
