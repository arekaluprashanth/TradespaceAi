const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: '$2b$10$EDNnWvqPTxlPU4jqK8mXFeGYc.rwKE9MG7a3HN3g09evmq5V9.vkq',
      walletBalance: 100000.0,
      role: 'USER'
    }
  });
  console.log("Demo user seeded");
}

main().catch(console.error).finally(() => prisma.$disconnect());
