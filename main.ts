import { PrismaClient } from "@prisma/client";

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

  // feed the table a row with xMB data.
  const size = 1;
  const data = Buffer.alloc(1024 * 1024 * size);

  await prisma.data.upsert({
    where: {
      id: 1,
    },
    create: {
      json: data,
    },
    update: {
      json: data,
    },
  });

  console.log(
    "rss (MiB),heapTotal (MiB),heapUsed (MiB),external (MiB),arrayBuffers (MiB)"
  );
  printMemoryUsage();

  async function executeQueries() {
    for (let i = 0; i < 100; i++) {
      // await prisma.data.findFirst({
      //   where: {
      //     id: 1,
      //   },
      // });

      // await prisma.data.findMany({});

      await prisma.data.createMany({
        data: [
          {
            json: Buffer.alloc(1024 * 1024 * size),
          },
          {
            json: Buffer.alloc(1024 * 1024 * size),
          },
        ],
      });

      await prisma.data.update({
        where: {
          id: 1,
        },
        data: {
          json: Buffer.alloc(1024 * 1024 * size),
        },
      });

      await prisma.data.findMany({
        where: {
          id: 1,
        },
      });
    }
  }

  for (let j = 0; j < 100; j++) {
    await executeQueries();
    printMemoryUsage();
  }

  await prisma.$disconnect();
}

main();
