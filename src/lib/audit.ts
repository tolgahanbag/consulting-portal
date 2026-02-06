import { prisma } from "./prisma";

interface AuditLogParams {
  userId?: string | null;
  userName?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";
  entity:
    | "APPLICATION"
    | "QUOTE"
    | "WORKFLOW"
    | "DOCUMENT"
    | "USER"
    | "COMPANY"
    | "NOTE"
    | "SETTING";
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    // Audit logging should never break the main operation
    console.error("Audit log error:", error);
  }
}
