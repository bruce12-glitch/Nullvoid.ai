import { describe, it, expect } from "vitest";
import { LiveMap, LiveObject } from "@liveblocks/client";

/**
 * Regression tests for two silent, compile-clean data bugs.
 *
 * Both survived typecheck and threw no errors at runtime — they just quietly
 * produced wrong results — so they are locked down here.
 */
describe("Liveblocks storage contract", () => {
  describe("reading a LiveMap via useStorage", () => {
    // `useStorage` hands back an immutably-serialized plain object for a
    // LiveMap, NOT a Map. The old code called `.values()` on it, which is
    // undefined, so the optional-chained expression collapsed to `[]` and
    // every AI spec was generated against an empty canvas.
    const immutableView = new LiveMap([
      ["n1", new LiveObject({ id: "n1", label: "API Gateway" })],
      ["n2", new LiveObject({ id: "n2", label: "Postgres" })],
    ]).toJSON() as Record<string, { id: string; label: string }>;

    it("is a plain object, not a Map", () => {
      expect(immutableView instanceof Map).toBe(false);
      expect((immutableView as { values?: unknown }).values).toBeUndefined();
    });

    it("the old `.values()` pattern silently yields an empty list", () => {
      const asAny = immutableView as unknown as { values?: () => Iterable<unknown> };
      const legacy = Array.from(asAny.values?.() ?? []);
      expect(legacy).toEqual([]);
    });

    it("Object.values() recovers every node", () => {
      const nodes = Object.values(immutableView);
      expect(nodes).toHaveLength(2);
      expect(nodes.map((n) => n.label)).toEqual(["API Gateway", "Postgres"]);
    });
  });

  describe("canvas graph location", () => {
    // @liveblocks/react-flow defaults to storage key "flow" and auto-creates
    // root.flow.{nodes,edges}. Writers that used flat root.nodes therefore
    // mutated an empty orphan map: node renames and edge labels silently
    // did nothing.
    it("lives under root.flow, so flat root.nodes finds nothing", () => {
      const root = new LiveObject({
        flow: new LiveObject({
          nodes: new LiveMap([["n1", new LiveObject({ id: "n1", label: "Cache" })]]),
          edges: new LiveMap(),
        }),
      });

      // Reading the old flat key finds nothing. The cast is required because
      // the corrected Storage type no longer even admits "nodes" at the root
      // — the compiler now rejects the original bug outright.
      const flatLookup = (root as unknown as { get(k: string): unknown }).get("nodes");
      expect(flatLookup).toBeUndefined();

      const flow = root.get("flow") as LiveObject<{ nodes: LiveMap<string, LiveObject<{ id: string; label: string }>> }>;
      const node = flow.get("nodes").get("n1");
      expect(node?.get("label")).toBe("Cache");
    });
  });
});
