import type {
  AdminCoupon,
  CouponDiscountType,
  CreateCouponPayload,
} from "@/services/admin";

export type CouponStatus =
  | "Activo"
  | "Programado"
  | "Agotado"
  | "Vencido"
  | "Inactivo";

export type CouponStatusFilter = "ALL" | CouponStatus;

export type CouponFormState = {
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minimumPurchase: string;
  maximumDiscount: string;
  usageLimit: string;
  startAt: string;
  endAt: string;
  active: boolean;
};

export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function emptyCouponForm(today = localDateString()): CouponFormState {
  return {
    code: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "10",
    minimumPurchase: "0",
    maximumDiscount: "",
    usageLimit: "",
    startAt: today,
    endAt: today,
    active: true,
  };
}

export function couponToForm(coupon: AdminCoupon): CouponFormState {
  return {
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: String(coupon.discountValue),
    minimumPurchase: String(coupon.minimumPurchase),
    maximumDiscount:
      coupon.maximumDiscount === null ? "" : String(coupon.maximumDiscount),
    usageLimit: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
    startAt: localDateString(new Date(coupon.startAt)),
    endAt: localDateString(new Date(coupon.endAt)),
    active: coupon.active,
  };
}

export function validateCouponForm(form: CouponFormState) {
  if (!/^[A-Z0-9_-]{4,24}$/.test(form.code.trim().toUpperCase())) {
    return "El código debe tener entre 4 y 24 letras, números, guiones o guiones bajos.";
  }
  if (form.description.trim().length < 5 || form.description.trim().length > 160) {
    return "La descripción debe tener entre 5 y 160 caracteres.";
  }

  const discountValue = Number(form.discountValue);
  if (
    !Number.isFinite(discountValue) ||
    discountValue <= 0 ||
    (form.discountType === "PERCENT" && discountValue > 100)
  ) {
    return form.discountType === "PERCENT"
      ? "El porcentaje debe ser mayor a 0 y no superar 100%."
      : "El descuento fijo debe ser mayor a $0.";
  }

  const minimumPurchase = Number(form.minimumPurchase);
  if (!Number.isFinite(minimumPurchase) || minimumPurchase < 0) {
    return "La compra mínima no puede ser negativa.";
  }
  if (form.maximumDiscount && Number(form.maximumDiscount) <= 0) {
    return "El tope de descuento debe ser mayor a $0.";
  }
  if (
    form.usageLimit &&
    (!Number.isInteger(Number(form.usageLimit)) || Number(form.usageLimit) <= 0)
  ) {
    return "El límite de usos debe ser un número entero mayor a 0.";
  }
  if (!form.startAt || !form.endAt || form.endAt < form.startAt) {
    return "Selecciona una vigencia válida.";
  }
  return null;
}

export function couponFormToPayload(
  form: CouponFormState,
): CreateCouponPayload {
  return {
    code: form.code.trim().toUpperCase(),
    description: form.description.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minimumPurchase: Number(form.minimumPurchase),
    maximumDiscount: form.maximumDiscount
      ? Number(form.maximumDiscount)
      : null,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    startAt: new Date(`${form.startAt}T00:00:00`).toISOString(),
    endAt: new Date(`${form.endAt}T23:59:59.999`).toISOString(),
    active: form.active,
  };
}

export function getCouponStatus(coupon: AdminCoupon): CouponStatus {
  const now = Date.now();
  if (!coupon.active) return "Inactivo";
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return "Agotado";
  }
  if (now < new Date(coupon.startAt).getTime()) return "Programado";
  if (now > new Date(coupon.endAt).getTime()) return "Vencido";
  return "Activo";
}

export function formatCouponBenefit(coupon: AdminCoupon) {
  return coupon.discountType === "PERCENT"
    ? `${coupon.discountValue}% de descuento`
    : `$${coupon.discountValue.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} de descuento`;
}
