type ProfileCompletionFields = {
  nombre?: string | null;
  correo?: string | null;
  telefono?: string | null;
  direccion?: string | null;
};

export function isProfileComplete(profile: ProfileCompletionFields | null | undefined) {
  if (!profile) return false;

  return [
    profile.nombre,
    profile.correo,
    profile.telefono,
    profile.direccion,
  ].every((value) => Boolean(value?.trim()));
}
