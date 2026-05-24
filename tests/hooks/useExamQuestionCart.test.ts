import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExamQuestionCart } from "@/hooks/useExamQuestionCart";

describe("useExamQuestionCart", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("persists cart ids per exam in sessionStorage", () => {
    const { result } = renderHook(() => useExamQuestionCart(42));

    act(() => {
      result.current.add(1);
      result.current.add(2);
    });

    expect(result.current.count).toBe(2);
    expect(result.current.has(1)).toBe(true);

    const { result: result2 } = renderHook(() => useExamQuestionCart(42));
    expect(result2.current.ids).toEqual(expect.arrayContaining([1, 2]));
  });

  it("toggle removes id from cart", () => {
    const { result } = renderHook(() => useExamQuestionCart(7));

    act(() => {
      result.current.toggle(5);
    });
    expect(result.current.has(5)).toBe(true);

    act(() => {
      result.current.toggle(5);
    });
    expect(result.current.has(5)).toBe(false);
    expect(result.current.count).toBe(0);
  });
});
