import {PrismaClient} from '@prisma/client';

declare global {
  // allow global `prisma` to be replaced during testing
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
};

const prismadb = globalThis.prisma || new PrismaClient();

if(process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismadb;
}

export default prismadb; 