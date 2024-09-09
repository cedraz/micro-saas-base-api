import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: 'user1@example.com',
      nickname: 'user1',
      password: 'hashedpassword1',
      email_verified_at: null,
      name: 'User One',
      phone: '1234567890',
      image: 'image1.png',
    },
    {
      email: 'user2@example.com',
      nickname: 'user2',
      password: 'hashedpassword2',
      email_verified_at: null,
      name: 'User Two',
      phone: '0987654321',
      image: 'image2.png',
    },
  ];

  for (const user of users) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(user.password, salt);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        phone: user.phone,
        image: user.image,
        email_verified_at: user.email_verified_at,
        password_hash,
      },
    });
  }

  const admins = [
    {
      name: 'Admin One',
      email: 'admin1@example.com',
      password: 'adminpassword1',
      role: Role.MASTER,
    },
    {
      name: 'Admin Two',
      email: 'admin2@example.com',
      password: 'adminpassword2',
      role: Role.COMMON,
    },
  ];

  for (const admin of admins) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(admin.password, salt);

    await prisma.admin.create({
      data: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
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
