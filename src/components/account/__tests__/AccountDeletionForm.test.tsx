import { beforeEach, afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AccountDeletionForm } from "../AccountDeletionForm";
import {
  requestAccountDeletion,
  confirmAccountDeletion,
} from "@/services/account-deletion";
import { logoutUser } from "@/services/auth";

const { logout, session } = vi.hoisted(() => ({
  logout: vi.fn(),
  session: { correo: "fixture@example.test" },
}));
vi.mock("@/providers/AuthContext", () => ({
  useAuth: () => ({ user: { correo: session.correo }, logout }),
}));
vi.mock("@/services/account-deletion", () => ({
  requestAccountDeletion: vi.fn(),
  confirmAccountDeletion: vi.fn(),
}));
vi.mock("@/services/auth", () => ({ logoutUser: vi.fn() }));
beforeEach(() => {
  session.correo = "fixture@example.test";
  vi.clearAllMocks();
  vi.mocked(requestAccountDeletion).mockResolvedValue({
    message: "Enviado",
    resendAt: new Date(Date.now() + 60000).toISOString(),
    expiresAt: new Date(Date.now() + 600000).toISOString(),
  });
  vi.mocked(logoutUser).mockResolvedValue({ message: "Sesión cerrada" });
});

test("a late receipt does not close a different browser account", async () => {
  let finish!: (value: {
    id: string;
    status: "PROCESSING";
    message: string;
  }) => void;
  vi.mocked(confirmAccountDeletion).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const view = render(<AccountDeletionForm />);
  fireEvent.change(screen.getByLabelText("Correo de la cuenta"), {
    target: { value: "fixture@example.test" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enviar código de confirmación" }),
  );
  fireEvent.change(await screen.findByLabelText("Código de ocho dígitos"), {
    target: { value: "12345678" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmar eliminación definitiva" }),
  );
  session.correo = "another@example.test";
  view.rerender(<AccountDeletionForm />);
  finish({
    id: "0cb2c7f9-e344-41f7-a307-c3a6adbde419",
    status: "PROCESSING",
    message: "Solicitud registrada.",
  });
  await screen.findByRole("heading", { name: "Solicitud registrada" });
  expect(logout).not.toHaveBeenCalled();
  expect(logoutUser).not.toHaveBeenCalled();
});
afterEach(() => cleanup());
async function confirm(status: "WAITING_OBLIGATIONS" | "PROCESSING") {
  vi.mocked(confirmAccountDeletion).mockResolvedValue({
    id: "0cb2c7f9-e344-41f7-a307-c3a6adbde419",
    status,
    message: "Solicitud registrada.",
  });
  render(<AccountDeletionForm />);
  fireEvent.change(screen.getByLabelText("Correo de la cuenta"), {
    target: { value: "fixture@example.test" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enviar código de confirmación" }),
  );
  const code = await screen.findByLabelText("Código de ocho dígitos");
  fireEvent.change(code, { target: { value: "12345678" } });
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmar eliminación definitiva" }),
  );
  await screen.findByRole("heading", { name: "Solicitud registrada" });
}
test("pending obligations keep access and link to rental management", async () => {
  await confirm("WAITING_OBLIGATIONS");
  expect(logout).not.toHaveBeenCalled();
  expect(
    screen.getByRole("link", { name: "Consultar mis rentas" }),
  ).toHaveAttribute("href", "/mis-rentas");
});
test("cleanup closes the matching browser session and presents a receipt", async () => {
  await confirm("PROCESSING");
  await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  expect(screen.getByText(/Referencia:/)).toBeInTheDocument();
});
test("network failure stays in the form without reporting success", async () => {
  vi.mocked(requestAccountDeletion).mockRejectedValueOnce(new Error("offline"));
  render(<AccountDeletionForm />);
  fireEvent.change(screen.getByLabelText("Correo de la cuenta"), {
    target: { value: "fixture@example.test" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enviar código de confirmación" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "No pudimos completar",
  );
  expect(confirmAccountDeletion).not.toHaveBeenCalled();
});
