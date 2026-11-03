// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Satu instance PrismaClient dipakai bersama. Tanpa ini, setiap import file
// membuat koneksi baru, dan di dev (hot reload) / serverless koneksi cepat habis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
