"use client"

/**
 * SOLO collaboration engine.
 *
 * A drop-in local replacement for the Liveblocks room used when
 * NEXT_PUBLIC_COLLAB_ENABLED !== "true" (i.e. no LIVEBLOCKS_SECRET_KEY).
 * Canvas state lives in a module-level store with the same observable
 * semantics the Liveblocks hooks expose, so every component keeps working
 * unchanged — just without multiplayer.
 */

import { useCallback, useEffect, useSyncExternalStore } from "react"
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react"
import type { NodeChange, EdgeChange } from "@xyflow/react"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export interface FeedMessage {
  id: string
  createdAt: number
  data: Record<string, unknown>
}

interface SoloState {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  feeds: Record<string, FeedMessage[]>
  systemMetadata: { title: string; updatedAt: string }
}

interface Snapshot {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  feeds: Record<string, FeedMessage[]>
  /** Plain-JSON storage root, matching Liveblocks 3.x useStorage snapshots */
  root: {
    nodes: Record<string, CanvasNode>
    edges: Record<string, CanvasEdge>
    systemMetadata: { title: string; updatedAt: string }
  }
}

const state: SoloState = {
  nodes: [],
  edges: [],
  feeds: {},
  systemMetadata: { title: "New Architecture", updatedAt: new Date().toISOString() },
}

let snapshot: Snapshot = buildSnapshot()
const listeners = new Set<() => void>()

/* history for undo / redo */
const past: Array<{ nodes: CanvasNode[]; edges: CanvasEdge[] }> = []
const future: Array<{ nodes: CanvasNode[]; edges: CanvasEdge[] }> = []
const HISTORY_LIMIT = 50

function buildSnapshot(): Snapshot {
  const nodeMap: Record<string, CanvasNode> = {}
  for (const n of state.nodes) nodeMap[n.id] = n
  const edgeMap: Record<string, CanvasEdge> = {}
  for (const e of state.edges) edgeMap[e.id] = e
  return {
    nodes: state.nodes,
    edges: state.edges,
    feeds: state.feeds,
    root: { nodes: nodeMap, edges: edgeMap, systemMetadata: state.systemMetadata },
  }
}

function notify() {
  snapshot = buildSnapshot()
  listeners.forEach((l) => l())
}

export function soloSubscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function soloGetSnapshot(): Snapshot {
  return snapshot
}

function pushHistory() {
  past.push({ nodes: state.nodes, edges: state.edges })
  if (past.length > HISTORY_LIMIT) past.shift()
  future.length = 0
}

export function soloUndo() {
  const prev = past.pop()
  if (!prev) return
  future.push({ nodes: state.nodes, edges: state.edges })
  state.nodes = prev.nodes
  state.edges = prev.edges
  notify()
}

export function soloRedo() {
  const next = future.pop()
  if (!next) return
  past.push({ nodes: state.nodes, edges: state.edges })
  state.nodes = next.nodes
  state.edges = next.edges
  notify()
}

export function soloCanUndo() { return past.length > 0 }
export function soloCanRedo() { return future.length > 0 }

/* ------------------------------------------------------------------ */
/* Canvas operations                                                   */
/* ------------------------------------------------------------------ */

export function soloSetCanvas(nodes: CanvasNode[], edges: CanvasEdge[]) {
  pushHistory()
  state.nodes = nodes
  state.edges = edges
  notify()
}

export function soloApplyNodeChanges(changes: NodeChange<CanvasNode>[]) {
  const isStructural = changes.some((c) => c.type === "add" || c.type === "remove")
  const isDragEnd = changes.some((c) => c.type === "position" && c.dragging === false)
  if (isStructural || isDragEnd) pushHistory()
  state.nodes = applyNodeChanges(changes, state.nodes)
  notify()
}

export function soloApplyEdgeChanges(changes: EdgeChange<CanvasEdge>[]) {
  if (changes.some((c) => c.type === "add" || c.type === "remove")) pushHistory()
  state.edges = applyEdgeChanges(changes, state.edges)
  notify()
}

export function soloDeleteElements(payload: { nodes?: Array<{ id: string }>; edges?: Array<{ id: string }> }) {
  const nodeIds = new Set((payload.nodes ?? []).map((n) => n.id))
  const edgeIds = new Set((payload.edges ?? []).map((e) => e.id))
  if (nodeIds.size === 0 && edgeIds.size === 0) return
  pushHistory()
  state.nodes = state.nodes.filter((n) => !nodeIds.has(n.id))
  state.edges = state.edges.filter(
    (e) => !edgeIds.has(e.id) && !nodeIds.has(e.source) && !nodeIds.has(e.target)
  )
  notify()
}

/* ------------------------------------------------------------------ */
/* Mock Liveblocks storage (for useMutation callbacks)                 */
/* ------------------------------------------------------------------ */

type Kind = "nodes" | "edges"

function getItem(kind: Kind, id: string): Record<string, unknown> | undefined {
  const arr = kind === "nodes" ? (state.nodes as unknown as Record<string, unknown>[]) : (state.edges as unknown as Record<string, unknown>[])
  return arr.find((x) => x.id === id)
}

function replaceItem(kind: Kind, id: string, next: Record<string, unknown>) {
  if (kind === "nodes") {
    state.nodes = state.nodes.map((n) => (n.id === id ? (next as unknown as CanvasNode) : n))
  } else {
    state.edges = state.edges.map((e) => (e.id === id ? (next as unknown as CanvasEdge) : e))
  }
}

function setAtPath(kind: Kind, id: string, path: string[], key: string, value: unknown) {
  const item = getItem(kind, id)
  if (!item) return
  const clone = structuredClone(item)
  let target: Record<string, unknown> = clone
  for (const p of path) {
    const nextVal = target[p]
    if (typeof nextVal !== "object" || nextVal === null) target[p] = {}
    target = target[p] as Record<string, unknown>
  }
  target[key] = value
  replaceItem(kind, id, clone)
  notify()
}

function mergeAtPath(kind: Kind, id: string, path: string[], partial: Record<string, unknown>) {
  const item = getItem(kind, id)
  if (!item) return
  const clone = structuredClone(item)
  let target: Record<string, unknown> = clone
  for (const p of path) {
    const nextVal = target[p]
    if (typeof nextVal !== "object" || nextVal === null) target[p] = {}
    target = target[p] as Record<string, unknown>
  }
  Object.assign(target, structuredClone(partial))
  replaceItem(kind, id, clone)
  notify()
}

function resolvePath(kind: Kind, id: string, path: string[]): unknown {
  let cur: unknown = getItem(kind, id)
  for (const p of path) {
    if (typeof cur !== "object" || cur === null) return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}

/** Emulates a (nested) LiveObject rooted at `path` inside item `id`. */
function makeLiveObjectShim(kind: Kind, id: string, path: string[]): Record<string, unknown> {
  return {
    get(key: string) {
      const value = resolvePath(kind, id, [...path, key])
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return makeLiveObjectShim(kind, id, [...path, key])
      }
      return value
    },
    set(key: string, value: unknown) {
      setAtPath(kind, id, path, key, value)
    },
    update(partial: Record<string, unknown>) {
      mergeAtPath(kind, id, path, partial)
    },
    toObject() {
      return structuredClone(resolvePath(kind, id, path)) as Record<string, unknown>
    },
  }
}

function toPlain(value: unknown): Record<string, unknown> {
  if (value && typeof (value as { toObject?: () => unknown }).toObject === "function") {
    return (value as { toObject: () => Record<string, unknown> }).toObject()
  }
  return structuredClone(value) as Record<string, unknown>
}

function makeLiveMapShim(kind: Kind) {
  return {
    get(id: string) {
      return getItem(kind, id) ? makeLiveObjectShim(kind, id, []) : undefined
    },
    set(id: string, value: unknown) {
      const plain = toPlain(value)
      plain.id = id
      pushHistory()
      const exists = Boolean(getItem(kind, id))
      if (exists) {
        replaceItem(kind, id, plain)
      } else if (kind === "nodes") {
        state.nodes = [...state.nodes, plain as unknown as CanvasNode]
      } else {
        state.edges = [...state.edges, plain as unknown as CanvasEdge]
      }
      notify()
    },
    delete(id: string) {
      pushHistory()
      if (kind === "nodes") state.nodes = state.nodes.filter((n) => n.id !== id)
      else state.edges = state.edges.filter((e) => e.id !== id)
      notify()
      return true
    },
    forEach(cb: (value: unknown, key: string) => void) {
      const items = kind === "nodes" ? state.nodes : state.edges
      for (const item of [...items]) cb(makeLiveObjectShim(kind, item.id, []), item.id)
    },
    get size() {
      return (kind === "nodes" ? state.nodes : state.edges).length
    },
  }
}

export function makeStorageRoot() {
  const nodesShim = makeLiveMapShim("nodes")
  const edgesShim = makeLiveMapShim("edges")
  const metaShim = {
    get: (k: string) => (state.systemMetadata as Record<string, unknown>)[k],
    set: (k: string, v: unknown) => {
      ;(state.systemMetadata as Record<string, unknown>)[k] = v
      notify()
    },
    update: (partial: Record<string, unknown>) => {
      Object.assign(state.systemMetadata, partial)
      notify()
    },
    toObject: () => ({ ...state.systemMetadata }),
  }
  return {
    get(key: string) {
      if (key === "nodes") return nodesShim
      if (key === "edges") return edgesShim
      if (key === "systemMetadata") return metaShim
      return undefined
    },
  }
}

/* ------------------------------------------------------------------ */
/* Feeds (AI status + chat)                                            */
/* ------------------------------------------------------------------ */

let feedCounter = 0

export function soloCreateFeedMessage(feedId: string, data: Record<string, unknown>) {
  const msg: FeedMessage = {
    id: `solo-msg-${Date.now()}-${++feedCounter}`,
    createdAt: Date.now(),
    data,
  }
  state.feeds = { ...state.feeds, [feedId]: [...(state.feeds[feedId] ?? []), msg] }
  notify()
  return Promise.resolve(msg)
}

/* ------------------------------------------------------------------ */
/* Event bus (broadcast / room events)                                 */
/* ------------------------------------------------------------------ */

type BusEvent = Record<string, unknown>
type BusListener = (payload: { event: BusEvent; connectionId: number; user: null }) => void
const busListeners = new Set<BusListener>()

export function soloBroadcast(event: BusEvent) {
  busListeners.forEach((l) => l({ event, connectionId: -1, user: null }))
}

export function soloSubscribeBus(listener: BusListener): () => void {
  busListeners.add(listener)
  return () => busListeners.delete(listener)
}

/* ------------------------------------------------------------------ */
/* React hooks (Liveblocks-compatible signatures)                      */
/* ------------------------------------------------------------------ */

const EMPTY_OTHERS: never[] = []
const SOLO_PRESENCE = { cursor: null, selectedNodeId: null, isThinking: false, thinking: false }
const SOLO_SELF = {
  connectionId: 0,
  id: "solo-user",
  presence: SOLO_PRESENCE,
  info: { name: "You", avatar: "", color: "#3b82f6" },
}
const noop = () => {}

export function useSoloStore(): Snapshot {
  return useSyncExternalStore(soloSubscribe, soloGetSnapshot, soloGetSnapshot)
}

export function useOthers() {
  return EMPTY_OTHERS
}

export function useSelf() {
  return SOLO_SELF
}

export function useMyPresence(): [typeof SOLO_PRESENCE, (p: Partial<typeof SOLO_PRESENCE>) => void] {
  return [SOLO_PRESENCE, noop]
}

export function useUpdateMyPresence() {
  return noop as (p: Record<string, unknown>) => void
}

export function useBroadcastEvent() {
  return soloBroadcast
}

export function useEventListener(callback: BusListener) {
  useEffect(() => soloSubscribeBus(callback))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useStorage<T>(selector: (root: any) => T): T {
  const snap = useSoloStore()
  return selector(snap.root)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMutation<F extends (...args: any[]) => any>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (ctx: any, ...args: any[]) => void,
  deps: unknown[]
): F {
  // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any
  return useCallback(((...args: any[]) => {
    callback({ storage: makeStorageRoot(), self: SOLO_SELF, others: EMPTY_OTHERS, setMyPresence: noop }, ...args)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }) as unknown as F, deps as [])
}

export function useUndo() { return soloUndo }
export function useRedo() { return soloRedo }

export function useCanUndo() {
  const subscribe = useCallback((cb: () => void) => soloSubscribe(cb), [])
  return useSyncExternalStore(subscribe, soloCanUndo, soloCanUndo)
}

export function useCanRedo() {
  const subscribe = useCallback((cb: () => void) => soloSubscribe(cb), [])
  return useSyncExternalStore(subscribe, soloCanRedo, soloCanRedo)
}

export function useFeedMessages(feedId: string) {
  const snap = useSoloStore()
  return { messages: snap.feeds[feedId] ?? EMPTY_OTHERS, isLoading: false, error: undefined }
}

export function useCreateFeed() {
  return useCallback((_feedId: string) => Promise.resolve({ id: _feedId }), [])
}

export function useCreateFeedMessage() {
  return useCallback(
    (feedId: string, data: Record<string, unknown>) => soloCreateFeedMessage(feedId, data),
    []
  )
}

/** Solo replacement for @liveblocks/react-flow's useLiveblocksFlow. */
export function useLiveblocksFlow<N extends CanvasNode = CanvasNode, E extends CanvasEdge = CanvasEdge>(_opts?: unknown) {
  const snap = useSoloStore()
  const onNodesChange = useCallback((changes: NodeChange<N>[]) => {
    soloApplyNodeChanges(changes as unknown as NodeChange<CanvasNode>[])
  }, [])
  const onEdgesChange = useCallback((changes: EdgeChange<E>[]) => {
    soloApplyEdgeChanges(changes as unknown as EdgeChange<CanvasEdge>[])
  }, [])
  const onDelete = useCallback((payload: { nodes?: Array<{ id: string }>; edges?: Array<{ id: string }> }) => {
    soloDeleteElements(payload)
  }, [])
  return {
    nodes: snap.nodes as unknown as N[],
    edges: snap.edges as unknown as E[],
    onNodesChange,
    onEdgesChange,
    onDelete,
  }
}
