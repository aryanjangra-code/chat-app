import assert from "node:assert/strict";
import test from "node:test";
import { mergeMessages } from "./chatState.js";

test("history merge preserves live messages and live updates without duplicates", () => {
  const history = [
    { _id: "old", text: "old", createdAt: "2026-01-01T00:00:00.000Z" },
    { _id: "racing", text: "stale", createdAt: "2026-01-02T00:00:00.000Z" },
  ];
  const live = [
    { _id: "racing", text: "edited live", createdAt: "2026-01-02T00:00:00.000Z" },
    { _id: "new", text: "new live", createdAt: "2026-01-03T00:00:00.000Z" },
  ];

  assert.deepEqual(mergeMessages(history, live), [
    history[0],
    live[0],
    live[1],
  ]);
});