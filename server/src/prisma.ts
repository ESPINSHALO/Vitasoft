/**
 * Typed Prisma client instance. We use require to avoid ESM/CJS issues;
 * the type matches the delegates we use (user, task).
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');

type PrismaClientInstance = InstanceType<typeof PrismaClient>;

export const prisma: PrismaClientInstance = new PrismaClient();
export default prisma;

