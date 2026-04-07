import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seed script is running...');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    const roles = ['STUDENT', 'CANDIDATE', 'SUPERADMIN', 'ADMIN', 'MPP_ADVISOR'];

    for (const role of roles) {
        const icNumber = `01020304050${roles.indexOf(role)}`;

        const pass = ['SUPERADMIN', 'ADMIN', 'MPP_ADVISOR'].includes(role) ? hashedPassword : 'not-used-for-students';

        await prisma.user.upsert({
            where: { icNumber },
            update: { password: pass },
            create: {
                studentId: `S123${roles.indexOf(role)}`,
                icNumber,
                role: role as any,
                email: `dummy_${role.toLowerCase()}@system.edu.my`,
                password: pass,
                name: `Dummy ${role}`,
            },
        });
    }

    console.log('✅ Seed script successfully provisioned all 5 roles!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });