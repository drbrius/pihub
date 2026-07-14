import { prisma } from "./db";

export async function logAudit(entry: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  notes?: string | null;
}) {
  await prisma.auditLog.create({ data: entry });
}
