import { describe, expect, it } from "vitest";
import { canAccessDocument, canPostWorkflowRequest } from "@/lib/authorization";

describe("authorization helpers", () => {
  it("allows admins to access any document", () => {
    const user = { id: "admin-1", role: "ADMIN" };
    const doc = { userId: "user-1" };
    expect(canAccessDocument(user, doc)).toBe(true);
  });

  it("allows document owner", () => {
    const user = { id: "user-1", role: "CLIENT" };
    const doc = { userId: "user-1" };
    expect(canAccessDocument(user, doc)).toBe(true);
  });

  it("allows application owner", () => {
    const user = { id: "user-2", role: "CLIENT" };
    const doc = { userId: "user-1", application: { userId: "user-2" } };
    expect(canAccessDocument(user, doc)).toBe(true);
  });

  it("denies unrelated user", () => {
    const user = { id: "user-3", role: "CLIENT" };
    const doc = { userId: "user-1", application: { userId: "user-2" } };
    expect(canAccessDocument(user, doc)).toBe(false);
  });

  it("allows workflow request owner", () => {
    const user = { id: "user-4", role: "CLIENT" };
    const doc = { userId: "user-1", workflowRequest: { userId: "user-4" } };
    expect(canAccessDocument(user, doc)).toBe(true);
  });

  it("allows workflow application owner", () => {
    const user = { id: "user-5", role: "CLIENT" };
    const doc = {
      userId: "user-1",
      workflowRequest: { userId: "user-2", workflow: { application: { userId: "user-5" } } },
    };
    expect(canAccessDocument(user, doc)).toBe(true);
  });

  it("allows admin to post workflow request", () => {
    const user = { id: "admin-1", role: "ADMIN" };
    const workflow = { application: { userId: "user-1" } };
    expect(canPostWorkflowRequest(user, workflow)).toBe(true);
  });

  it("allows workflow owner to post workflow request", () => {
    const user = { id: "user-1", role: "CLIENT" };
    const workflow = { application: { userId: "user-1" } };
    expect(canPostWorkflowRequest(user, workflow)).toBe(true);
  });

  it("denies unrelated user to post workflow request", () => {
    const user = { id: "user-2", role: "CLIENT" };
    const workflow = { application: { userId: "user-1" } };
    expect(canPostWorkflowRequest(user, workflow)).toBe(false);
  });
});
