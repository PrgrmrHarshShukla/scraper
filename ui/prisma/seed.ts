import { PrismaClient } from '@prisma/client';
 
const prisma = new PrismaClient();

async function main() {
    const author = await prisma.author.upsert({
        where: { id: 'd2c0ef68-b42c-46e3-bac2-fd616e263413' },
        update: {},
        create: {
            userid: 'itsharshag',
            name: 'Harsh Agrawal',
            description: "Hello world",
            org: "Devkit"
        }
    })
    console.log({ author });
    
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e: any) => {
        console.log(e);
        await prisma.$disconnect();
        process.exit(1);        
    })