import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash the password
  const password = 'sumian01150202';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin@capitalcoa.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      username: 'admin@capitalcoa.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created/updated:', adminUser.username);

  // Create some sample assets
  const assets = [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      market: 'NASDAQ',
      info_url: 'https://finance.yahoo.com/quote/AAPL',
      logo_url: 'https://logo.clearbit.com/apple.com',
    },
    {
      ticker: 'TSLA',
      name: 'Tesla, Inc.',
      type: 'stock',
      market: 'NASDAQ',
      info_url: 'https://finance.yahoo.com/quote/TSLA',
      logo_url: 'https://logo.clearbit.com/tesla.com',
    },
    {
      ticker: 'BTCUSD',
      name: 'Bitcoin',
      type: 'crypto',
      market: 'CRYPTO',
      info_url: 'https://finance.yahoo.com/quote/BTC-USD',
      logo_url: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { ticker: asset.ticker },
      update: asset,
      create: asset,
    });
  }

  console.log('✅ Sample assets created');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
