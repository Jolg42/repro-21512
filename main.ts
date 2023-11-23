import { Prisma, PrismaClient } from '@prisma/client';
import { setTimeout } from 'node:timers/promises';

function toMib(b: number): string {
  return (b / 1024 / 1024).toPrecision(4);
}

function printMemoryUsage() {
  const usage = process.memoryUsage();
  console.log(
    `${toMib(usage.rss)},${toMib(usage.heapTotal)},${toMib(
      usage.heapUsed
    )},${toMib(usage.external)},${toMib(usage.arrayBuffers)},`
  );
}

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();
  const PRISMA_EMPTY_STRING = Prisma.sql` `;

  console.log(
    "rss (MiB),heapTotal (MiB),heapUsed (MiB),external (MiB),arrayBuffers (MiB)"
  );
  printMemoryUsage();

  const f = async (elements: any[]) => {
    const els = elements.map((element) => Prisma.sql`${element} as "${element}"`);
    els.push(PRISMA_EMPTY_STRING);
    return await prisma.$queryRaw`SELECT ${els}`;
  };

  async function executeQueries() {
    for (let i = 0; i < 200; i++) {
      const args = Array.from({ length: 20 }, () => 0).map((_, index) =>
        index % 2 === 0 ? (Math.round(Math.random() * 100) + 36).toString(36) : index,
      );

      // console.log('going to query');
      // console.dir(
        await f(args)
      // );
      // console.log('queried');
      await setTimeout(10);
    }
  }

  for (let j = 0; j < 100; j++) {
    await executeQueries();
    printMemoryUsage();
  }

  await prisma.$disconnect();
}

main();
