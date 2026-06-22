/** Reglas alineadas con backend: src/modules/auth/dto/password-policy.ts */

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 72;

export type PasswordRulesStatus = {
  minLength: boolean;
  maxLength: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
};

export function isPasswordPolicyCompliant(password: string): boolean {
  return getPasswordRulesStatus(password).isValid;
}

export function getPasswordRulesStatus(password: string): PasswordRulesStatus & {
  isValid: boolean;
} {
  const rules = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    maxLength: password.length <= PASSWORD_MAX_LENGTH,
    hasUpper: /[A-Z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSymbol: /[\W_]/.test(password),
  };

  return {
    ...rules,
    isValid:
      rules.minLength &&
      rules.maxLength &&
      rules.hasUpper &&
      rules.hasDigit &&
      rules.hasSymbol,
  };
}

export function validatePasswordPolicy(value: string): string {
  if (!value) return "Ingresa una contraseña";
  const status = getPasswordRulesStatus(value);
  if (!status.minLength) return `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`;
  if (!status.maxLength) return `Máximo ${PASSWORD_MAX_LENGTH} caracteres`;
  if (!status.hasUpper) return "Incluye al menos una letra mayúscula";
  if (!status.hasDigit) return "Incluye al menos un número";
  if (!status.hasSymbol) return "Incluye al menos un símbolo";
  return "";
}

/** @deprecated Usa validatePasswordPolicy */
export function validateRegistrationPassword(value: string): string {
  return validatePasswordPolicy(value);
}
