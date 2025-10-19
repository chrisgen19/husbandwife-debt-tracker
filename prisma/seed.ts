import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const husband = await prisma.user.upsert({
    where: { username: 'husband' },
    update: {},
    create: {
      name: 'Husband',
      username: 'husband',
      password: 'password123', // In production, use hashed passwords
    },
  });

  const wife = await prisma.user.upsert({
    where: { username: 'wife' },
    update: {},
    create: {
      name: 'Wife',
      username: 'wife',
      password: 'password123', // In production, use hashed passwords
    },
  });

  console.log('Created users:', { husband, wife });
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
