import ts from "typescript";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const ROOT = process.cwd();

export interface Scanned {
  file: string;
  identifiers: string[];
  /** String literals, template parts and JSX text (comments are never included). */
  strings: string[];
}

const isTest = (p: string) => /\.test\.|\/test\//.test(p);

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(p) && !isTest(p) && !p.endsWith(".d.ts")) yield p;
  }
}

export function scanSource(): Scanned[] {
  const out: Scanned[] = [];
  for (const path of walk(join(ROOT, "src"))) {
    const sf = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const identifiers: string[] = [];
    const strings: string[] = [];
    const visit = (n: ts.Node) => {
      if (ts.isIdentifier(n)) identifiers.push(n.text);
      else if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) strings.push(n.text);
      else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) strings.push(n.text);
      else if (ts.isJsxText(n)) strings.push(n.text);
      ts.forEachChild(n, visit);
    };
    visit(sf);
    out.push({ file: path.slice(ROOT.length + 1), identifiers, strings });
  }
  return out;
}
