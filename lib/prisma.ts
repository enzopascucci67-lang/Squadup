import { PrismaClient } from "@prisma/client";
import * as LibSqlAdapter from "@prisma/adapter-libsql";

const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const PrismaLibSQL =
  (LibSqlAdapter as { PrismaLibSQL?: any }).PrismaLibSQL ??
  (LibSqlAdapter as { PrismaLibSql?: any }).PrismaLibSql;

if (!PrismaLibSQL) {
  throw new Error("Prisma LibSQL adapter not found");
}

const adapter = new PrismaLibSQL({ url: databaseUrl });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
