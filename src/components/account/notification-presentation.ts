export function notificationTime(value: string, now = Date.now()) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "Recientemente";
  const minutes = Math.max(0, Math.floor((now - time) / 60000));
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  const months = Math.floor(days / 30);
  if (months < 12)
    return `Hace ${Math.max(1, months)} ${months <= 1 ? "mes" : "meses"}`;
  const years = Math.floor(days / 365);
  return `Hace ${Math.max(1, years)} ${years <= 1 ? "año" : "años"}`;
}

export function notificationAction(item: {
  category: string;
  destinationType: string;
}) {
  if (item.destinationType === "PRODUCT")
    return item.category === "OFFER" ? "Ver oferta" : "Ver producto";
  if (item.destinationType === "PROMOTION") return "Ver oferta";
  if (item.destinationType === "RENTAL") return "Ver renta";
  if (item.destinationType === "ACCOUNT") return "Revisar cuenta";
  return null;
}
