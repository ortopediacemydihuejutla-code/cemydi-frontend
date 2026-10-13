import http from "node:http";
import { spawn } from "node:child_process";
const products = Array.from({ length: 48 }, (_, index) => ({ id: index + 1, slug: `producto-${index + 1}`, nombre: `Producto ${String(index + 1).padStart(2, "0")}`, marca: index % 2 ? "Marca B" : "Marca A", modelo: "Modelo público", descripcion: "Equipo público de movilidad", clasificacion: "Movilidad", tipoAdquisicion: index % 2 ? "RENTA" : "VENTA", requiereReceta: index % 2 === 1, medidas: "20 cm", precio: 1350, stock: 7, proveedor: "Proveedor privado", activo: true, imageUrl: null, images: [], createdAt: "2026-10-11T00:00:00Z" }));
const about = { id: 1, heroTitle: "Quiénes somos", heroSubtitle: "Contenido institucional del servidor de prueba", missionTitle: "Misión", missionText: "Misión pública guardada", visionTitle: "Visión", visionText: "Visión pública", valuesTitle: "Valores", values: ["Confianza"], storyTitle: "Nuestra historia", storyText: "Historia pública", heroImageUrl: null, secondaryImageUrl: null };
let failure = false;
let withImages = false;
const backend = http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:4199");
  res.setHeader("Content-Type", "application/json");
  if ((url.pathname === "/users/me" || url.pathname === "/cart") && url.searchParams.get("fixture") === "1") {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.end('{"privateMarker":"PRIVATE_PWA_FIXTURE_DO_NOT_CACHE"}'); return;
  }
  if (url.pathname === "/__test/failure") { failure = url.searchParams.get("on") === "1"; res.end("{}"); return; }
  if (failure && (url.pathname.startsWith("/products") || url.pathname === "/about-page")) { res.statusCode = 503; res.end('{"message":"Servicio temporalmente no disponible"}'); return; }
  if (url.pathname === "/__test/images") { withImages = url.searchParams.get("on") === "1"; res.end("{}"); return; }
  if (url.pathname === "/products") {
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 24);
    const filtered = products.filter((product) => product.nombre.toLowerCase().includes((url.searchParams.get("search") || "").toLowerCase()));
    res.end(JSON.stringify({ products: filtered.slice((page - 1) * pageSize, page * pageSize).map((product) => withImages ? { ...product, imageUrl: `/icon-192.png?product=${product.id}` } : product), pagination: { page, pageSize, total: filtered.length, totalPages: Math.ceil(filtered.length / pageSize), hasPrevious: page > 1, hasNext: page * pageSize < filtered.length }, filters: { clasificaciones: ["Movilidad"], marcas: ["Marca A", "Marca B"] } })); return;
  }
  if (url.pathname === "/about-page") { res.end(JSON.stringify({ aboutPage: about })); return; }
  if (url.pathname === "/promotions") { res.end('{"promotions":[]}'); return; }
  if (/^\/products\/(?:slug\/)?/.test(url.pathname)) {
    const key = url.pathname.split("/").pop();
    const product = products.find((product) => String(product.id) === key || product.slug === key);
    if (product && product.id !== 48) { res.end(JSON.stringify({ product })); return; }
  }
  res.statusCode = 404; res.end('{"message":"No encontrado"}');
});
await new Promise((resolve) => backend.listen(4199, "127.0.0.1", resolve));
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3199"], { stdio: "inherit", env: { ...process.env, INTERNAL_API_URL: "http://127.0.0.1:4199" } });
function stop() { next.kill(); backend.close(); }
process.on("SIGINT", stop); process.on("SIGTERM", stop); process.on("exit", stop);
next.on("exit", () => { backend.close(); process.exit(); });
