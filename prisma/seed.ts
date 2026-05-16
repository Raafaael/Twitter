import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash("123456", 10);

  const ana = await prisma.user.create({
    data: {
      email: "ana@x.dev",
      username: "ana",
      name: "Ana Silva",
      passwordHash: pw,
      bio: "Estudante de CC. Gosto de café e Next.js.",
    },
  });
  const bruno = await prisma.user.create({
    data: {
      email: "bruno@x.dev",
      username: "bruno",
      name: "Bruno Costa",
      passwordHash: pw,
      bio: "Dev backend. Falo demais sobre Postgres.",
    },
  });
  const carla = await prisma.user.create({
    data: {
      email: "carla@x.dev",
      username: "carla",
      name: "Carla Mendes",
      passwordHash: pw,
      bio: "Design + frontend. Tema escuro sempre.",
    },
  });

  await prisma.follow.createMany({
    data: [
      { followerId: ana.id, followingId: bruno.id },
      { followerId: ana.id, followingId: carla.id },
      { followerId: bruno.id, followingId: ana.id },
    ],
  });

  const p1 = await prisma.post.create({
    data: { authorId: ana.id, content: "Primeira postagem no clone! Funcionou 🎉" },
  });
  const p2 = await prisma.post.create({
    data: { authorId: bruno.id, content: "Acabei de mergulhar em Server Actions do Next 15. Mudou meu fluxo." },
  });
  await prisma.post.create({
    data: { authorId: carla.id, content: "Dark mode é o único mode." },
  });
  await prisma.post.create({
    data: { authorId: ana.id, parentId: p2.id, content: "Concordo! Acabou com metade dos meus endpoints." },
  });

  await prisma.like.create({ data: { userId: bruno.id, postId: p1.id } });
  await prisma.like.create({ data: { userId: carla.id, postId: p1.id } });

  await prisma.message.create({
    data: { senderId: ana.id, receiverId: bruno.id, content: "Oi! Tudo bem?" },
  });
  await prisma.message.create({
    data: { senderId: bruno.id, receiverId: ana.id, content: "Tudo. Vamos tomar um café qualquer hora?" },
  });

  console.log("Seed pronto.");
  console.log("Logins (senha 123456): ana@x.dev | bruno@x.dev | carla@x.dev");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
