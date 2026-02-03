export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "NEW":
      return "badge-new";
    case "IN_REVIEW":
      return "badge-new";
    case "QUOTED":
      return "badge-quoted";
    case "ACCEPTED":
      return "badge-accepted";
    case "IN_PROGRESS":
      return "badge-progress";
    case "COMPLETED":
      return "badge-completed";
    default:
      return "badge-new";
  }
}

export function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "APPLICATION_DOC":
      return "bg-blue-500/10 text-blue-700 border border-blue-200";
    case "COMPANY_DOC":
      return "bg-purple-500/10 text-purple-700 border border-purple-200";
    default:
      return "bg-navy-500/10 text-navy-600 border border-navy-200";
  }
}

export function formatFileType(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "JPEG";
  if (mime.includes("png")) return "PNG";
  if (mime.includes("wordprocessingml") || mime.includes("docx")) return "DOCX";
  return mime.split("/").pop()?.toUpperCase() || mime;
}
