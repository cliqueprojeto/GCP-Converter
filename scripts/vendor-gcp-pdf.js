// Empacota os motores de conversão do GCP-PDF (mesmo autor, GPL-3.0) para uso no GCP Converter.
// Uso: node scripts/vendor-gcp-pdf.js <caminho-do-repositório-GCP-PDF>
const path = require('path');
const fs = require('fs');
const src = path.resolve(process.argv[2] || '../GCP-PDF');
const out = path.join(__dirname, '..', 'electron', 'engines', 'gcp-pdf');
fs.mkdirSync(out, { recursive: true });
const entry = path.join(out, '_entry.ts');
fs.writeFileSync(entry, `
export { convertPdf, renderPdfPages, extractDocumentText, loadPdf } from ${JSON.stringify(path.join(src, 'src/main/conversion'))};
export { docxToHtml } from ${JSON.stringify(path.join(src, 'src/main/docx-html'))};
export { xlsxToHtml } from ${JSON.stringify(path.join(src, 'src/main/xlsx-html'))};
export { analyzeEpub, toEpub } from ${JSON.stringify(path.join(src, 'src/main/epub'))};
export { readInputDocument, INPUT_EXTENSIONS, libreOfficeCandidates } from ${JSON.stringify(path.join(src, 'src/main/system'))};
export { officeToPdf } from ${JSON.stringify(path.join(src, 'src/main/office'))};
export { readBook as readEpubBook } from ${JSON.stringify(path.join(src, 'src/main/epub-reader'))};
export { readComic, COMIC_EXTENSIONS } from ${JSON.stringify(path.join(src, 'src/main/comics'))};
export { fiscalXmlToPdf } from ${JSON.stringify(path.join(src, 'src/main/fiscal'))};
`);
require('esbuild').buildSync({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  outfile: path.join(out, 'index.js'),
  external: ['@napi-rs/canvas', 'pdfjs-dist', 'pdfjs-dist/*', 'docx', 'exceljs', 'pptxgenjs', 'pdf-lib', 'fflate', '@xmldom/xmldom', 'electron', 'jszip', '@pdf-lib/fontkit', 'libarchive-wasm', 'qrcode', 'bwip-js'],
  banner: { js: `// Gerado a partir do GCP-PDF (https://github.com/cliqueprojeto/GCP-PDF) — Bruno Albertini | Gestão Cultural Pro — GPL-3.0-or-later.\n// Não edite: rode scripts/vendor-gcp-pdf.js` },
  nodePaths: [path.join(__dirname, '..', 'node_modules')],
  logLevel: 'warning'
});
fs.rmSync(entry);
// Correção: fórmula sem valor calculado salvo no arquivo (planilhas geradas por outros
// programas) aparecia como "[object Object]"; agora a célula fica vazia, como no Excel sem recálculo.
const bundle = path.join(out, 'index.js');
let code = fs.readFileSync(bundle, 'utf8');
const anchor = '    if ("richText" in o) {';
if (code.includes(anchor) && !code.includes('"formula" in o && !("result" in o)')) {
  code = code.replace(anchor, '    if ("formula" in o || "sharedFormula" in o) return { text: "", number: false };\n' + anchor);
  fs.writeFileSync(bundle, code);
}
console.log('ok', fs.statSync(path.join(out, 'index.js')).size, 'bytes');
