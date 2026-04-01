import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seed script is running...');
    
    const student = await prisma.user.upsert({
        where: { icNumber: '010203040506' },
        update: {},
        create: {
            studentId: 'S12345',
            icNumber: '010203040506',
            role: 'STUDENT',
            email: 'dummy@student.edu.my',
            password: 'not-used-for-students',
            name: 'Dummy Student'
        },
    });

    console.log('✅ Dummy student upserted:', student.studentId);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });