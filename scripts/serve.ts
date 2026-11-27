// Serves dist/ the way GitHub Pages does: /path/ -> /path/index.html, unknown
// paths -> 404.html with status 404. Usage: bun scripts/serve.ts [port]
import { join, normalize } from "node:path";

const root = join(import.meta.dir, "..", "dist");
const port = Number(process.argv[2] ?? 4321);

export function startServer(p = port) {
  return Bun.serve({
    port: p,
    async fetch(req) {
      const url = new URL(req.url);
      let path = normalize(decodeURIComponent(url.pathname));
      if (path.includes("..")) return new Response("bad path", { status: 400 });
      const candidates = path.endsWith("/") ? [join(root, path, "index.html")] : [join(root, path), join(root, path, "index.html")];
      for (const c of candidates) {
        const f = Bun.file(c);
        if (await f.exists()) {
          if (!path.endsWith("/") && c.endsWith("index.html") && !path.endsWith("index.html"))
            return Response.redirect(`${url.pathname}/`, 301);
          return new Response(f);
        }
      }
      return new Response(Bun.file(join(root, "404.html")), { status: 404, headers: { "content-type": "text/html" } });
    },
  });
}

if (import.meta.main) {
  const s = startServer();
  console.log(`serving dist/ on http://localhost:${s.port}`);
}
