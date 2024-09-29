import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const admins = [
    {
      name: 'Admin One',
      email: 'admin1@example.com',
      password: 'adminpassword1',
    },
    {
      name: 'Admin Two',
      email: 'admin2@example.com',
      password: 'adminpassword2',
    },
  ];

  for (const admin of admins) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(admin.password, salt);

    await prisma.admin.create({
      data: {
        name: admin.name,
        email: admin.email,
        password_hash,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
