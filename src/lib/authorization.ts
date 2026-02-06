export type SessionUser = {
  id: string;
  role: string;
};

export type DocumentAccessContext = {
  userId: string;
  application?: { userId: string | null } | null;
  workflowRequest?: {
    userId: string;
    workflow?: { application?: { userId: string | null } | null } | null;
  } | null;
};

export function canAccessDocument(
  user: SessionUser,
  document: DocumentAccessContext
): boolean {
  if (user.role === "ADMIN") return true;

  return (
    document.userId === user.id ||
    document.application?.userId === user.id ||
    document.workflowRequest?.userId === user.id ||
    document.workflowRequest?.workflow?.application?.userId === user.id
  );
}

export function canPostWorkflowRequest(
  user: SessionUser,
  workflow: { application?: { userId: string | null } | null }
): boolean {
  if (user.role === "ADMIN") return true;
  return workflow.application?.userId === user.id;
}
