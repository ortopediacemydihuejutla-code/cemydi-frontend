import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useClampPage, useResetPageOnChange } from "../use-admin-pagination";

describe("use-admin-pagination hooks", () => {
  it("clamps page when page exceeds totalPages", () => {
    const setPage = vi.fn();
    renderHook(() => useClampPage(5, setPage, 3));
    expect(setPage).toHaveBeenCalledWith(3);
  });

  it("does not clamp page when page is within totalPages", () => {
    const setPage = vi.fn();
    renderHook(() => useClampPage(2, setPage, 3));
    expect(setPage).not.toHaveBeenCalled();
  });

  it("resets page to 1 when dependency values change", () => {
    const setPage = vi.fn();
    let filterValue = "chairs";
    const { rerender } = renderHook(() =>
      useResetPageOnChange(setPage, [filterValue]),
    );

    expect(setPage).toHaveBeenCalledTimes(1);
    expect(setPage).toHaveBeenCalledWith(1);

    filterValue = "beds";
    rerender();

    expect(setPage).toHaveBeenCalledTimes(2);
  });
});
