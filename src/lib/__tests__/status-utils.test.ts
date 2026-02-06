import { describe, expect, it } from "vitest";
import {
  formatFileType,
  getCategoryBadgeClass,
  getNotionStatusColor,
  getStatusBadgeClass,
} from "@/lib/status-utils";

describe("status-utils", () => {
  it("maps application statuses to badge classes", () => {
    expect(getStatusBadgeClass("NEW")).toBe("badge-new");
    expect(getStatusBadgeClass("IN_PROGRESS")).toBe("badge-progress");
    expect(getStatusBadgeClass("COMPLETED")).toBe("badge-completed");
  });

  it("maps document categories to badge classes", () => {
    expect(getCategoryBadgeClass("APPLICATION_DOC")).toContain("bg-blue-500");
    expect(getCategoryBadgeClass("COMPANY_DOC")).toContain("bg-purple-500");
    expect(getCategoryBadgeClass("OTHER")).toContain("bg-navy-500");
  });

  it("returns consistent notion status colors", () => {
    expect(getNotionStatusColor("NEW").dot).toBe("bg-blue-500");
    expect(getNotionStatusColor("COMPLETED").text).toBe("text-emerald-700");
  });

  it("formats file types", () => {
    expect(formatFileType("application/pdf")).toBe("PDF");
    expect(formatFileType("image/jpeg")).toBe("JPEG");
    expect(formatFileType("image/png")).toBe("PNG");
    expect(formatFileType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe("DOCX");
  });
});
