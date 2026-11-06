// @vitest-environment edge-runtime
//
// Authorization contract for the Convex backend. These tests run the REAL
// functions against an in-memory Convex backend (convex-test) and prove:
//   - anonymous callers get nothing,
//   - one signed-in user cannot read, list, overwrite or delete another
//     user's workspaces,
//   - the owner can do all of those on their own data,
//   - accounts are keyed by the verified Google identity, never by a
//     client-supplied email or id.
import { test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../convex/schema.js";
import { api } from "../convex/_generated/api.js";

export const modules = import.meta.glob("../convex/**/*.js");

const alice = {
  subject: "alice-sub",
  issuer: "https://accounts.google.com",
  name: "Alice",
  email: "alice@example.com",
  pictureUrl: "https://img/alice.png",
};
const bob = {
  subject: "bob-sub",
  issuer: "https://accounts.google.com",
  name: "Bob",
  email: "bob@example.com",
  pictureUrl: "https://img/bob.png",
};

const messages = [{ role: "user", content: "build me a todo app" }];

async function setup() {
  const t = convexTest(schema, modules);
  const asAlice = t.withIdentity(alice);
  const asBob = t.withIdentity(bob);
  const aliceUser = await asAlice.mutation(api.users.CreateUser, {});
  const bobUser = await asBob.mutation(api.users.CreateUser, {});
  const wsId = await asAlice.mutation(api.workspace.createWorkspace, { messages });
  return { t, asAlice, asBob, aliceUser, bobUser, wsId };
}

test("anonymous callers are rejected by every function", async () => {
  const { t, wsId } = await setup();
  await expect(t.query(api.users.GetUser, {})).rejects.toThrow("Not authenticated");
  await expect(t.mutation(api.users.CreateUser, {})).rejects.toThrow("Not authenticated");
  await expect(t.mutation(api.workspace.createWorkspace, { messages })).rejects.toThrow("Not authenticated");
  await expect(t.query(api.workspace.GetAllWorkspace, {})).rejects.toThrow("Not authenticated");
  await expect(t.query(api.workspace.getWorkspace, { workspaceId: wsId })).rejects.toThrow("Not authenticated");
  await expect(
    t.mutation(api.workspace.updateWorkspace, { workspaceId: wsId, messages })
  ).rejects.toThrow("Not authenticated");
  await expect(
    t.mutation(api.workspace.updateFiles, { workspaceId: wsId, files: { "/App.js": { code: "x" } } })
  ).rejects.toThrow("Not authenticated");
});

test("accounts are keyed by the verified identity: sign-in twice returns the same row", async () => {
  const t = convexTest(schema, modules);
  const asAlice = t.withIdentity(alice);
  const first = await asAlice.mutation(api.users.CreateUser, {});
  const second = await asAlice.mutation(api.users.CreateUser, {});
  expect(second._id).toEqual(first._id);
  expect(second.email).toBe("alice@example.com");
});

test("GetUser returns only the caller's own record", async () => {
  const { asAlice, asBob, aliceUser, bobUser } = await setup();
  const a = await asAlice.query(api.users.GetUser, {});
  const b = await asBob.query(api.users.GetUser, {});
  expect(a._id).toEqual(aliceUser._id);
  expect(b._id).toEqual(bobUser._id);
  expect(a.email).toBe("alice@example.com");
  expect(b.email).toBe("bob@example.com");
});

test("the owner can read and update their own workspace", async () => {
  const { asAlice, wsId, aliceUser } = await setup();
  const ws = await asAlice.query(api.workspace.getWorkspace, { workspaceId: wsId });
  expect(ws.user).toEqual(aliceUser._id);
  expect(ws.messages).toEqual(messages);

  const newMessages = [...messages, { role: "ai", content: "done" }];
  await asAlice.mutation(api.workspace.updateWorkspace, { workspaceId: wsId, messages: newMessages });
  await asAlice.mutation(api.workspace.updateFiles, {
    workspaceId: wsId,
    files: { "/App.js": { code: "export default () => null" } },
  });

  const after = await asAlice.query(api.workspace.getWorkspace, { workspaceId: wsId });
  expect(after.messages).toEqual(newMessages);
  expect(after.fileData["/App.js"].code).toContain("export default");
});

test("another signed-in user cannot read, overwrite or list the owner's workspace", async () => {
  const { asBob, wsId } = await setup();
  await expect(asBob.query(api.workspace.getWorkspace, { workspaceId: wsId })).rejects.toThrow("Not authorized");
  await expect(
    asBob.mutation(api.workspace.updateWorkspace, { workspaceId: wsId, messages: [{ role: "user", content: "hijacked" }] })
  ).rejects.toThrow("Not authorized");
  await expect(
    asBob.mutation(api.workspace.updateFiles, { workspaceId: wsId, files: { "/App.js": { code: "hijack" } } })
  ).rejects.toThrow("Not authorized");

  // Listing shows Bob only his own (zero) workspaces, never Alice's.
  expect(await asBob.query(api.workspace.GetAllWorkspace, {})).toEqual([]);
});

test("GetAllWorkspace returns each user only their own workspaces", async () => {
  const { asAlice, asBob } = await setup();
  await asBob.mutation(api.workspace.createWorkspace, { messages: [{ role: "user", content: "bob project" }] });
  const aliceList = await asAlice.query(api.workspace.GetAllWorkspace, {});
  const bobList = await asBob.query(api.workspace.GetAllWorkspace, {});
  expect(aliceList).toHaveLength(1);
  expect(bobList).toHaveLength(1);
  expect(aliceList[0].messages[0].content).toBe("build me a todo app");
  expect(bobList[0].messages[0].content).toBe("bob project");
});

test("updateFiles still rejects an empty payload (existing validation preserved)", async () => {
  const { asAlice, wsId } = await setup();
  await expect(asAlice.mutation(api.workspace.updateFiles, { workspaceId: wsId, files: {} })).rejects.toThrow(
    "No files were provided"
  );
});

test("workspaces of a different deployment id shape are not readable", async () => {
  const { asAlice } = await setup();
  await expect(
    asAlice.query(api.workspace.getWorkspace, { workspaceId: "nonexistent" })
  ).rejects.toThrow();
});

test("legacy argument shapes are tolerated but never trusted", async () => {
  const { asAlice, asBob, aliceUser, bobUser } = await setup();

  // An authed stale client may still send the old fields. They must be
  // accepted by validation and have ZERO effect on whose data is touched.
  const got = await asAlice.query(api.users.GetUser, { email: "bob@example.com" });
  expect(got._id).toEqual(aliceUser._id);

  const created = await asAlice.mutation(api.users.CreateUser, {
    name: "Bob", email: "bob@example.com", picture: "https://img/bob.png", uid: "bob-sub",
  });
  expect(created._id).toEqual(aliceUser._id);
  expect(created.email).toBe("alice@example.com");

  const wsId = await asAlice.mutation(api.workspace.createWorkspace, {
    messages, user: bobUser._id,
  });
  const ws = await asAlice.query(api.workspace.getWorkspace, { workspaceId: wsId });
  expect(ws.user).toEqual(aliceUser._id);

  const list = await asAlice.query(api.workspace.GetAllWorkspace, { userId: bobUser._id });
  expect(list.every((w) => w.user === aliceUser._id)).toBe(true);
  expect(list.length).toBeGreaterThan(0);

  // Bob is unaffected by every one of those calls.
  expect(await asBob.query(api.workspace.GetAllWorkspace, {})).toEqual([]);
});

test("anonymous calls carrying legacy arguments still fail closed", async () => {
  const { t, bobUser } = await setup();
  await expect(
    t.mutation(api.users.CreateUser, {
      name: "Bob", email: "bob@example.com", picture: "https://img/bob.png", uid: "bob-sub",
    })
  ).rejects.toThrow("Not authenticated");
  await expect(
    t.query(api.users.GetUser, { email: "bob@example.com" })
  ).rejects.toThrow("Not authenticated");
  await expect(
    t.query(api.workspace.GetAllWorkspace, { userId: bobUser._id })
  ).rejects.toThrow("Not authenticated");
  await expect(
    t.mutation(api.workspace.createWorkspace, { messages, user: bobUser._id })
  ).rejects.toThrow("Not authenticated");
});
