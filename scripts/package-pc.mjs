import { cp, mkdir, readFile, writeFile, rm, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const { version } = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
if (!/^\d+\.\d+\.\d+$/.test(version))
  throw new Error("Invalid package version");
await access(path.join(root, "dist/index.html"));
const output = path.join(root, "artifacts", `PULS-PC-${version}`);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "dist"), path.join(output, "app"), {
  recursive: true,
});
for (const name of ["server.mjs", "START-PULS.cmd"])
  await cp(path.join(root, "scripts/pc", name), path.join(output, name));
const instructions = (
  await readFile(path.join(root, "scripts/pc/START-HIER.txt"), "utf8")
).replaceAll("{{VERSION}}", version);
await writeFile(path.join(output, "START-HIER.txt"), instructions);
await writeFile(
  path.join(output, "version.json"),
  JSON.stringify({ version }) + "\n",
);
console.log("PC-Paket:", output);
