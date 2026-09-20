import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { FavoriteButton } from "../FavoriteButton";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseAuth = vi.fn();
vi.mock("@/providers/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockToggleFavorite = vi.fn();
const mockFavoriteIds = new Set<number>();
vi.mock("../use-favorites", () => ({
  useFavorites: () => ({
    favoriteIds: mockFavoriteIds,
    toggleFavorite: mockToggleFavorite,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("FavoriteButton", () => {
  const dummyProduct = {
    id: 42,
    nombre: "Faja lumbar ortopedica",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFavoriteIds.clear();
  });

  it("redirects to login when unauthenticated user clicks favorite", () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(<FavoriteButton product={dummyProduct} />);

    const btn = screen.getByRole("button", {
      name: "Guardar Faja lumbar ortopedica en favoritos",
    });
    fireEvent.click(btn);

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(mockToggleFavorite).not.toHaveBeenCalled();
  });

  it("toggles favorite when authenticated user clicks", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, rol: "CLIENT" } });
    mockToggleFavorite.mockReturnValue(true);

    render(<FavoriteButton product={dummyProduct} showLabel={true} />);

    const btn = screen.getByRole("button", {
      name: "Guardar Faja lumbar ortopedica en favoritos",
    });
    expect(screen.getByText("Guardar")).toBeInTheDocument();

    fireEvent.click(btn);

    expect(mockToggleFavorite).toHaveBeenCalledWith(dummyProduct);
  });

  it("renders active state when product is already in favorites", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, rol: "CLIENT" } });
    mockFavoriteIds.add(42);

    render(<FavoriteButton product={dummyProduct} showLabel={true} />);

    const btn = screen.getByRole("button", {
      name: "Quitar Faja lumbar ortopedica de favoritos",
    });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Guardado")).toBeInTheDocument();
  });
});
