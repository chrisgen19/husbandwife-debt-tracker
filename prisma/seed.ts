import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const husband = await prisma.user.upsert({
    where: { email: 'husband@example.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'husband@example.com',
      password: 'password123', // In production, use hashed passwords
      role: 'husband',
    },
  });

  const wife = await prisma.user.upsert({
    where: { email: 'wife@example.com' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'wife@example.com',
      password: 'password123', // In production, use hashed passwords
      role: 'wife',
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
