const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
async function main() {
  try {
    const count = await p.user.count();
    console.log('User count:', count);
    const active = await p.election.findFirst({ where: { status: 'ACTIVE' } });
    console.log('Active election:', JSON.stringify(active));
  } catch(e) {
    console.error('Error:', e.message);
  }
  await p.$disconnect();
}
main();
