import { prisma } from "@/lib/prisma";

/**
 * Generate a unique registration number in the format: REG-YYYYMMDD-XXXXX
 * Uses a database count of same-day registrations to ensure uniqueness.
 * Must be called within a Prisma transaction for race-condition safety.
 */
export async function generateRegistrationNumber(
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<string> {
  const client = tx ?? prisma;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Start of today (UTC)
  const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Count registrations created today
  const todayCount = await client.eventRegistration.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const sequence = String(todayCount + 1).padStart(5, "0");
  return `REG-${dateStr}-${sequence}`;
}
