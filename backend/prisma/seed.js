import prisma from '../lib/prisma.js'
import bcrypt from 'bcryptjs'

async function main() {
  const password = await bcrypt.hash('123456', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@anitracker.com' },
    update: {},
    create: {
      email: 'admin@anitracker.com',
      password,
      name: 'Admin',
      power: 'bankai',
      role: 'ADMIN',
      bio: 'Admin del sistema',
    },
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'aday@anitracker.com' },
    update: {},
    create: {
      email: 'aday@anitracker.com',
      password,
      name: 'Aday',
      power: 'cursed',
      role: 'USER',
      bio: 'Fan de Jujutsu Kaisen',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jarko@anitracker.com' },
    update: {},
    create: {
      email: 'jarko@anitracker.com',
      password,
      name: 'Jarko',
      power: 'haki',
      role: 'USER',
      bio: 'Fan de One Piece',
    },
  })

  await prisma.userAnime.upsert({
    where: { userId_animeId: { userId: user1.id, animeId: 21 } },
    update: {},
    create: {
      userId: user1.id,
      animeId: 21,
      animeTitle: 'One Piece',
      animeImage: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
      status: 'WATCHING',
      currentEpisode: 1100,
      totalEpisodes: 0,
      isPublic: true,
    },
  })

  await prisma.userAnime.upsert({
    where: { userId_animeId: { userId: user1.id, animeId: 1535 } },
    update: {},
    create: {
      userId: user1.id,
      animeId: 1535,
      animeTitle: 'Death Note',
      animeImage: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
      status: 'COMPLETED',
      currentEpisode: 37,
      totalEpisodes: 37,
      isPublic: true,
    },
  })

  await prisma.friendship.upsert({
    where: { requesterId_receiverId: { requesterId: user1.id, receiverId: user2.id } },
    update: {},
    create: {
      requesterId: user1.id,
      receiverId: user2.id,
      status: 'ACCEPTED',
      canSeeStatus: true,
    },
  })

  await prisma.message.create({
    data: {
      senderId: user1.id,
      receiverId: null,
      content: '¡Hola a todos! ¿Qué estáis viendo?',
    },
  })

  await prisma.message.create({
    data: {
      senderId: user2.id,
      receiverId: null,
      content: 'Yo estoy viendo One Piece, voy por el 1100',
    },
  })

  await prisma.recommendation.create({
    data: {
      userId: user1.id,
      animeTitle: 'Steins;Gate',
      animeImage: 'https://cdn.myanimelist.net/images/anime/5/73199.jpg',
      description: 'La mejor serie de viajes en el tiempo',
    },
  })

  console.log('Seed completado')
  console.log(`  Admin: admin@anitracker.com / 123456`)
  console.log(`  User1: aday@anitracker.com / 123456`)
  console.log(`  User2: jarko@anitracker.com / 123456`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
