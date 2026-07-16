import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminSearchField } from "./admin-search-field";

function SearchHarness() {
  const [value, setValue] = useState("");
  return (
    <AdminSearchField
      value={value}
      onChange={setValue}
      placeholder="Buscar registros"
    />
  );
}

describe("AdminSearchField", () => {
  it("actualiza y limpia la búsqueda con un único control", () => {
    render(<SearchHarness />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "andadera" } });

    expect(input).toHaveValue("andadera");
    fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(input).toHaveValue("");
  });
});
