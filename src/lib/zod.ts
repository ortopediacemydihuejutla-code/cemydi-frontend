import { z } from "zod";

// Keep Zod compatible with the production CSP by disabling its optional
// runtime code generation before any application schema is created.
z.config({ jitless: true });

export { z };
