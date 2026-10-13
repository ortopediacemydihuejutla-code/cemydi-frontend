import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import Header from "../../Header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/providers/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock("@/providers/CartContext", () => ({
  useCart: () => ({
    cart: { summary: { totalQuantity: 0 } },
    loading: false,
  }),
}));

describe("Header with TopBar integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollY = 0;
  });
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  it("renders both HeaderTopBar and main navigation", () => {
    render(<Header />);

    expect(
      screen.getByRole("complementary", { name: "Barra informativa superior" }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("CEMYDI")).toBeInTheDocument();
    expect(screen.getByText("Catálogo")).toBeInTheDocument();
  });

  it("toggles TopBar visibility on scroll down and scroll up", () => {
    vi.useFakeTimers();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => window.setTimeout(() => callback(0), 16));
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => window.clearTimeout(id));
    const { container } = render(<Header />);
    const topBar = container.querySelector("aside");

    expect(topBar).toHaveClass("grid-rows-[1fr]");

    // Simulate scrolling down
    window.scrollY = 120;
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(16));
    expect(topBar).toHaveAttribute("aria-hidden", "true");
    expect(topBar).toHaveClass("h-9");
    expect(container.querySelector("header")).toHaveClass("-top-9");
    // Small reversals caused by touch momentum must not reopen the top bar.
    window.scrollY = 110;
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(16));
    expect(topBar).toHaveAttribute("aria-hidden", "true");
    window.scrollY = 65;
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(16));
    expect(topBar).toHaveAttribute("aria-hidden", "false");
    expect(container.querySelector("header")).toHaveClass("top-0");
  });

  it("renders desktop navigation links with animated underline indicators", () => {
    render(<Header />);

    const catalogLink = screen.getByRole("link", { name: /catálogo/i });
    expect(catalogLink).toBeInTheDocument();
    expect(catalogLink).toHaveClass("group", "relative");

    const underline = catalogLink.querySelector("span[aria-hidden='true']");
    expect(underline).toBeInTheDocument();
    expect(underline).toHaveClass("bg-white", "origin-center");
  });
});
