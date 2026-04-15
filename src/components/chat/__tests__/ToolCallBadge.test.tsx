import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getLabel, ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getLabel (pure function) ---

test("str_replace_editor create", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "/components/Button.jsx" })).toBe("Creating Button.jsx");
});

test("str_replace_editor str_replace", () => {
  expect(getLabel("str_replace_editor", { command: "str_replace", path: "/App.tsx" })).toBe("Editing App.tsx");
});

test("str_replace_editor insert", () => {
  expect(getLabel("str_replace_editor", { command: "insert", path: "/App.tsx" })).toBe("Editing App.tsx");
});

test("str_replace_editor view", () => {
  expect(getLabel("str_replace_editor", { command: "view", path: "/utils/helpers.ts" })).toBe("Reading helpers.ts");
});

test("str_replace_editor undo_edit", () => {
  expect(getLabel("str_replace_editor", { command: "undo_edit", path: "/App.tsx" })).toBe("Reverting App.tsx");
});

test("str_replace_editor unknown command falls back to Updating", () => {
  expect(getLabel("str_replace_editor", { command: "other", path: "/App.tsx" })).toBe("Updating App.tsx");
});

test("file_manager delete", () => {
  expect(getLabel("file_manager", { command: "delete", path: "/OldFile.jsx" })).toBe("Deleting OldFile.jsx");
});

test("file_manager rename", () => {
  expect(getLabel("file_manager", { command: "rename", path: "/Foo.jsx", new_path: "/Bar.jsx" })).toBe("Renaming Foo.jsx → Bar.jsx");
});

test("unknown tool falls back to raw tool name", () => {
  expect(getLabel("some_tool", {})).toBe("some_tool");
});

test("missing path falls back to generic label", () => {
  expect(getLabel("str_replace_editor", { command: "create" })).toBe("Creating file");
});

// --- ToolCallBadge component (visual state) ---

test("shows spinner when state is 'call'", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="call" />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows spinner when state is 'partial-call'", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="partial-call" />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});

test("shows green dot when state is 'result'", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="result" />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("renders label text in the DOM", () => {
  render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="call" />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});
