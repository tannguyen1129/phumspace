import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function rebuildPassportPoints() {
  console.log('🔄 Rebuilding Passport total points from valid PassportActivity logs...');

  const passports = await prisma.passport.findMany({
    include: {
      activities: true,
    },
  });

  let totalUpdated = 0;

  for (const passport of passports) {
    const sumPoints = passport.activities.reduce((acc, act) => acc + act.pointsAwarded, 0);

    if (passport.totalPoints !== sumPoints) {
      console.log(`[Passport ${passport.id}] Total points mismatch! Old: ${passport.totalPoints}, Correct: ${sumPoints}`);
      await prisma.passport.update({
        where: { id: passport.id },
        data: { totalPoints: sumPoints },
      });
      totalUpdated++;
    }
  }

  console.log(`✅ Rebuild completed! Updated ${totalUpdated}/${passports.length} passports.`);
}

rebuildPassportPoints()
  .catch((e) => {
    console.error('❌ Error rebuilding passport points:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
