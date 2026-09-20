import { describe, expect, it } from "vitest";
import {
  compareSort,
  syntheticIdForName,
  getPaginationWindow,
  buildPaginationPageItems,
} from "../admin-list-utils";

describe("admin-list-utils", () => {
  describe("compareSort", () => {
    it("sorts numbers ascending and descending", () => {
      expect(compareSort(5, 10, "asc")).toBeLessThan(0);
      expect(compareSort(10, 5, "asc")).toBeGreaterThan(0);
      expect(compareSort(5, 5, "asc")).toBe(0);

      expect(compareSort(5, 10, "desc")).toBeGreaterThan(0);
      expect(compareSort(10, 5, "desc")).toBeLessThan(0);
    });

    it("sorts strings taking into account locale and numeric sensitivity", () => {
      expect(compareSort("item1", "item2", "asc")).toBeLessThan(0);
      expect(compareSort("item10", "item2", "asc")).toBeGreaterThan(0);
      expect(compareSort("Árbol", "barco", "asc")).toBeLessThan(0);
    });
  });

  describe("syntheticIdForName", () => {
    it("generates deterministic negative id for strings", () => {
      const id1 = syntheticIdForName("Categoria A");
      const id2 = syntheticIdForName("Categoria A");
      const id3 = syntheticIdForName("Categoria B");

      expect(id1).toBeLessThan(0);
      expect(id1).toBe(id2);
      expect(id1).not.toBe(id3);
    });
  });

  describe("getPaginationWindow", () => {
    it("returns correct page windows", () => {
      const window1 = getPaginationWindow(1, 10, 25);
      expect(window1).toEqual({
        totalPages: 3,
        resultStart: 1,
        resultEnd: 10,
      });

      const window2 = getPaginationWindow(3, 10, 25);
      expect(window2).toEqual({
        totalPages: 3,
        resultStart: 21,
        resultEnd: 25,
      });

      const emptyWindow = getPaginationWindow(1, 10, 0);
      expect(emptyWindow).toEqual({
        totalPages: 1,
        resultStart: 0,
        resultEnd: 0,
      });
    });
  });

  describe("buildPaginationPageItems", () => {
    it("returns empty array for 0 pages", () => {
      expect(buildPaginationPageItems(0, 1)).toEqual([]);
    });

    it("returns single page for 1 total page", () => {
      expect(buildPaginationPageItems(1, 1)).toEqual([1]);
    });

    it("returns continuous array if totalPages <= 10", () => {
      expect(buildPaginationPageItems(5, 2)).toEqual([1, 2, 3, 4, 5]);
    });

    it("inserts gaps when totalPages > 10", () => {
      const items = buildPaginationPageItems(20, 10);
      expect(items).toContain(1);
      expect(items).toContain(20);
      expect(items).toContain(10);
      expect(items).toContain("gap");
    });
  });
});
