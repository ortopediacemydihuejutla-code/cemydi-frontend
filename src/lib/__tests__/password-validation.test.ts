import { describe, expect, it } from "vitest";

import {
  getPasswordRulesStatus,
  isPasswordPolicyCompliant,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePasswordPolicy,
  validateRegistrationPassword,
} from "@/lib/password-validation";

describe("password-validation", () => {
  describe("getPasswordRulesStatus and isPasswordPolicyCompliant", () => {
    it("returns valid true for compliant password", () => {
      const valid = "Password123!";
      const status = getPasswordRulesStatus(valid);
      expect(status.minLength).toBe(true);
      expect(status.maxLength).toBe(true);
      expect(status.hasUpper).toBe(true);
      expect(status.hasDigit).toBe(true);
      expect(status.hasSymbol).toBe(true);
      expect(status.isValid).toBe(true);
      expect(isPasswordPolicyCompliant(valid)).toBe(true);
    });

    it("detects when password is shorter than minimum length", () => {
      const short = "Pass1!";
      const status = getPasswordRulesStatus(short);
      expect(status.minLength).toBe(false);
      expect(status.isValid).toBe(false);
      expect(isPasswordPolicyCompliant(short)).toBe(false);
    });

    it("detects when password exceeds max length", () => {
      const long = "A1!" + "a".repeat(PASSWORD_MAX_LENGTH + 1);
      const status = getPasswordRulesStatus(long);
      expect(status.maxLength).toBe(false);
      expect(status.isValid).toBe(false);
    });

    it("detects missing uppercase, digit, or symbol", () => {
      expect(getPasswordRulesStatus("password123!").hasUpper).toBe(false);
      expect(getPasswordRulesStatus("Password!!!!").hasDigit).toBe(false);
      expect(getPasswordRulesStatus("Password1234").hasSymbol).toBe(false);
    });
  });

  describe("validatePasswordPolicy", () => {
    it("returns empty string for valid passwords", () => {
      expect(validatePasswordPolicy("CorrectPass99#")).toBe("");
    });

    it("returns descriptive error messages based on priority", () => {
      expect(validatePasswordPolicy("")).toBe("Ingresa una contraseña");
      expect(validatePasswordPolicy("Short1!")).toBe(`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`);
      expect(validatePasswordPolicy("lowercase12345!")).toBe("Incluye al menos una letra mayúscula");
      expect(validatePasswordPolicy("NoNumbersHere!!")).toBe("Incluye al menos un número");
      expect(validatePasswordPolicy("NoSymbols123456")).toBe("Incluye al menos un símbolo");
    });

    it("deprecated alias delegates to validatePasswordPolicy", () => {
      expect(validateRegistrationPassword("CorrectPass99#")).toBe("");
      expect(validateRegistrationPassword("")).toBe("Ingresa una contraseña");
    });
  });
});
