import { PrismaClient, StaffRole, StaffStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  let email = '';
  let roleInput = 'REVIEWER';
  let displayName = '';

  for (const arg of args) {
    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1].trim().toLowerCase();
    } else if (arg.startsWith('--role=')) {
      roleInput = arg.split('=')[1].trim().toUpperCase();
    } else if (arg.startsWith('--name=')) {
      displayName = arg.split('=')[1].trim();
    }
  }

  if (!email) {
    console.error('❌ Vui lòng cung cấp email: pnpm --filter api staff:provision --email="staff@phumspace.vn" [--role=ADMIN|EDITOR|REVIEWER] [--name="Tên Staff"]');
    process.exit(1);
  }

  const role = StaffRole[roleInput as keyof typeof StaffRole] || StaffRole.REVIEWER;
  const externalSubject = `google-sub-${Date.now()}`;

  console.log(`🚀 Provisioning staff user: ${email} with role ${role}...`);

  const staff = await prisma.staffUser.upsert({
    where: { email },
    update: {
      status: StaffStatus.ACTIVE,
      displayName: displayName || undefined,
      roles: {
        upsert: {
          where: { staffUserId_role: { staffUserId: '', role } }, // fallback handled below
          update: {},
          create: { role },
        },
      },
    },
    create: {
      email,
      externalProvider: 'google',
      externalSubject,
      displayName: displayName || email.split('@')[0],
      status: StaffStatus.ACTIVE,
      roles: {
        create: [{ role }],
      },
    },
    include: {
      roles: true,
    },
  });

  // Ensure role is assigned
  const existingRole = await prisma.staffRoleAssignment.findUnique({
    where: { staffUserId_role: { staffUserId: staff.id, role } },
  });

  if (!existingRole) {
    await prisma.staffRoleAssignment.create({
      data: {
        staffUserId: staff.id,
        role,
      },
    });
  }

  console.log(`✅ Provisioned StaffUser ID: ${staff.id} (${staff.email}) successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Provisioning error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
