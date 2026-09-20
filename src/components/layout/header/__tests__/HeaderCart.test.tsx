import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import HeaderCart from "../HeaderCart";

const mockUseAuth = vi.fn();
vi.mock("@/providers/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseCart = vi.fn();
vi.mock("@/providers/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

describe("HeaderCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeleton when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    mockUseCart.mockReturnValue({ cart: null, loading: false });

    const { container } = render(<HeaderCart />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("returns null for admin user", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, rol: "ADMIN" },
      loading: false,
    });
    mockUseCart.mockReturnValue({ cart: null, loading: false });

    const { container } = render(<HeaderCart />);
    expect(container.firstChild).toBeNull();
  });

  it("links to login when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    mockUseCart.mockReturnValue({
      cart: { summary: { totalQuantity: 0 } },
      loading: false,
    });

    render(<HeaderCart />);

    const link = screen.getByRole("link", {
      name: "Inicia sesión para usar el carrito",
    });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("shows item count badge when client user has items in cart", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, rol: "CLIENT" },
      loading: false,
    });
    mockUseCart.mockReturnValue({
      cart: { summary: { totalQuantity: 3 } },
      loading: false,
    });

    render(<HeaderCart />);

    const link = screen.getByRole("link", {
      name: "Abrir carrito con 3 productos",
    });
    expect(link).toHaveAttribute("href", "/carrito");
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
