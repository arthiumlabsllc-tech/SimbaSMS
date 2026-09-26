import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user with $50 USD balance
  const passwordHash = await bcrypt.hash('demo1234', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@simbasms.com' },
    update: {},
    create: {
      email: 'demo@simbasms.com',
      passwordHash,
      balanceCents: 5000, // $50.00 USD (5000 cents)
    },
  });

  console.log(`✅ Demo user created:`);
  console.log(`   Email: demo@simbasms.com`);
  console.log(`   Password: demo1234`);
  console.log(`   Balance: $${demoUser.balanceCents / 100} USD`);
  console.log(`   ID: ${demoUser.id}`);

  // Create a sample deposit transaction
  const depositTx = await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: 'DEPOSIT',
      amountCents: 5000,
      balanceAfter: 5000,
      paystackRef: 'DEMO_DEPOSIT_001',
      paystackStatus: 'success',
      originalAmount: 8000000, // ₦80,000 in kobo
      originalCurrency: 'NGN',
      exchangeRate: 1600,
    },
  });

  console.log(`✅ Sample deposit transaction created: $${depositTx.amountCents / 100} (from ₦${depositTx.originalAmount! / 100} NGN)`);

  // Create a second test user with $10 balance
  const testPasswordHash = await bcrypt.hash('test1234', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@simbasms.com' },
    update: {},
    create: {
      email: 'test@simbasms.com',
      passwordHash: testPasswordHash,
      balanceCents: 1000, // $10.00 USD
    },
  });

  console.log(`✅ Test user created:`);
  console.log(`   Email: test@simbasms.com`);
  console.log(`   Password: test1234`);
  console.log(`   Balance: $${testUser.balanceCents / 100} USD`);

  console.log('\n🎉 Seeding complete!');
  console.log('\nYou can now login with:');
  console.log('   demo@simbasms.com / demo1234 ($50.00 balance)');
  console.log('   test@simbasms.com / test1234 ($10.00 balance)');
  console.log('\n💱 Exchange rates:');
  console.log('   1 USD = 1600 NGN (Nigerian Naira)');
  console.log('   1 USD = 15 GHS (Ghanaian Cedi)');
  console.log('\n💡 All wallet balances and order costs are in USD.');
  console.log('   Users can deposit in NGN or GHS, which gets converted to USD.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
