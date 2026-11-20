// Gerado a partir do GCP-PDF (https://github.com/cliqueprojeto/GCP-PDF) — Bruno Albertini | Gestão Cultural Pro — GPL-3.0-or-later.
// Não edite: rode scripts/vendor-gcp-pdf.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../cliqueprojeto/gcp-pdf/src/main/docx-html.ts
var docx_html_exports = {};
__export(docx_html_exports, {
  docxToHtml: () => docxToHtml
});
function attr(node, name) {
  if (!node) return null;
  const value = node.getAttributeNS(W, name) || node.getAttribute("w:" + name) || node.getAttribute(name);
  return value === "" ? node.hasAttribute("w:" + name) || node.hasAttribute(name) ? "" : null : value;
}
function onOff(node) {
  if (!node) return void 0;
  const v = attr(node, "val");
  return v === null || !["0", "false", "off", "none"].includes(v.toLowerCase());
}
function resolvePath(dir, target) {
  const parts = (target.startsWith("/") ? target.slice(1) : dir + target).split("/"), out = [];
  for (const p of parts) {
    if (p === "..") out.pop();
    else if (p !== "." && p !== "") out.push(p);
  }
  return out.join("/");
}
function docxToHtml(bytes) {
  let pkg;
  try {
    pkg = new Package(bytes);
  } catch {
    throw new Error("O arquivo Word est\xE1 danificado ou n\xE3o \xE9 um documento .docx v\xE1lido.");
  }
  return new Renderer(pkg).render();
}
function pageField(instr) {
  const word = instr.trim().split(/\s+/)[0]?.toUpperCase();
  return word === "PAGE" ? "pageNumber" : word === "NUMPAGES" || word === "SECTIONPAGES" ? "totalPages" : void 0;
}
function roman(n) {
  const map = [[1e3, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"], [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) {
    out += s;
    n -= v;
  }
  return out;
}
function letters(n) {
  const ch = String.fromCharCode(97 + (n - 1) % 26);
  return ch.repeat(Math.floor((n - 1) / 26) + 1);
}
function formatNumber(n, format) {
  switch (format) {
    case "lowerLetter":
      return letters(n);
    case "upperLetter":
      return letters(n).toUpperCase();
    case "lowerRoman":
      return roman(n);
    case "upperRoman":
      return roman(n).toUpperCase();
    case "decimalZero":
      return String(n).padStart(2, "0");
    case "ordinal":
      return n + "\xBA";
    case "cardinalText":
    case "ordinalText":
      return String(n);
    default:
      return String(n);
  }
}
function bulletGlyph(text2, font) {
  const code = text2.codePointAt(0) ?? 8226;
  if (font && /symbol|wingdings/i.test(font) || code >= 61440) return symbolGlyph(code, font ?? "");
  return text2 || "\u2022";
}
function symbolGlyph(code, font) {
  const c = code >= 61440 ? code - 61440 : code;
  if (/wingdings/i.test(font)) return { 167: "\u25AA", 168: "\u25FB", 108: "\u25CF", 110: "\u25A0", 113: "\u2751", 117: "\u25C6", 118: "\u2756", 216: "\u27A2", 252: "\u2713", 251: "\u2717", 254: "\u2611", 161: "\u25CB", 159: "\u2022", 224: "\u2192", 232: "\u2794", 74: "\u263A", 111: "\u25A1", 119: "\u2B25", 162: "\u25EF" }[c] ?? "\u2022";
  if (/symbol/i.test(font)) return { 183: "\u2022", 168: "\u2666", 215: "\xB7", 45: "\u2212", 176: "\xB0", 174: "\u2192", 222: "\u21D2", 180: "\xD7", 184: "\xF7", 177: "\xB1", 165: "\u221E", 214: "\u221A", 97: "\u03B1", 98: "\u03B2", 112: "\u03C0", 83: "\u03A3", 87: "\u03A9", 109: "\u03BC" }[c] ?? String.fromCodePoint(c);
  return String.fromCodePoint(c);
}
var import_fflate, import_xmldom, W, R, A, WP, V, TAB, kids, local, child, children, num, escape, pt, twip2, emu2, hex2, HIGHLIGHT, SUBSTITUTES, LINE, lineFactor, Package, MIME, Renderer;
var init_docx_html = __esm({
  "../cliqueprojeto/gcp-pdf/src/main/docx-html.ts"() {
    "use strict";
    import_fflate = require("fflate");
    import_xmldom = require("@xmldom/xmldom");
    W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    A = "http://schemas.openxmlformats.org/drawingml/2006/main";
    WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";
    V = "urn:schemas-microsoft-com:vml";
    TAB = "";
    kids = (node) => {
      const list = [];
      if (!node) return list;
      for (let c = node.firstChild; c; c = c.nextSibling) if (c.nodeType === 1) list.push(c);
      return list;
    };
    local = (e) => e.localName || e.nodeName.replace(/^.*:/, "");
    child = (node, name) => kids(node).find((e) => local(e) === name) ?? null;
    children = (node, name) => kids(node).filter((e) => local(e) === name);
    num = (value, fallback = 0) => {
      const n = parseFloat(value ?? "");
      return Number.isFinite(n) ? n : fallback;
    };
    escape = (text2) => text2.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    pt = (value) => `${Math.round(value * 100) / 100}pt`;
    twip2 = (value) => num(value) / 20;
    emu2 = (value) => num(value) / 12700;
    hex2 = (value) => value && /^[0-9a-f]{6}$/i.test(value) ? "#" + value.toLowerCase() : void 0;
    HIGHLIGHT = { yellow: "#ffff00", green: "#00ff00", cyan: "#00ffff", magenta: "#ff00ff", blue: "#0000ff", red: "#ff0000", darkBlue: "#000080", darkCyan: "#008080", darkGreen: "#008000", darkMagenta: "#800080", darkRed: "#800000", darkYellow: "#808000", darkGray: "#808080", lightGray: "#c0c0c0", black: "#000000", white: "#ffffff" };
    SUBSTITUTES = {
      calibri: ["Carlito"],
      cambria: ["Caladea"],
      arial: ["Liberation Sans", "Arimo", "Helvetica"],
      helvetica: ["Arial", "Liberation Sans", "Arimo"],
      "times new roman": ["Liberation Serif", "Tinos", "Times"],
      "courier new": ["Liberation Mono", "Cousine", "Courier"],
      "arial narrow": ["Liberation Sans Narrow"],
      georgia: ["Gelasio"],
      "segoe ui": ["Selawik", "Noto Sans", "Open Sans"],
      tahoma: ["DejaVu Sans", "Verdana"],
      verdana: ["DejaVu Sans"],
      "symbol": ["OpenSymbol"],
      "century gothic": ["URW Gothic", "TeX Gyre Adventor"],
      "book antiqua": ["TeX Gyre Pagella", "Palatino"],
      "palatino linotype": ["TeX Gyre Pagella", "Palatino"],
      garamond: ["EB Garamond"]
    };
    LINE = { calibri: 1.22, carlito: 1.22, cambria: 1.172, caladea: 1.172, arial: 1.149, "liberation sans": 1.149, helvetica: 1.149, "times new roman": 1.15, "liberation serif": 1.15, "courier new": 1.133, "segoe ui": 1.33, georgia: 1.136, verdana: 1.215, tahoma: 1.207, "century gothic": 1.225, lato: 1.2, "open sans": 1.362, roboto: 1.172, inter: 1.21 };
    lineFactor = (font) => LINE[font.toLowerCase()] ?? 1.17;
    Package = class {
      files;
      constructor(bytes) {
        this.files = (0, import_fflate.unzipSync)(bytes);
      }
      text(path3) {
        const f = this.files[path3];
        return f ? (0, import_fflate.strFromU8)(f) : null;
      }
      xml(path3) {
        const t = this.text(path3);
        if (!t) return null;
        return new import_xmldom.DOMParser({ onError: () => {
        } }).parseFromString(t, "text/xml");
      }
      rels(part) {
        const slash = part.lastIndexOf("/"), dir = part.slice(0, slash + 1), relPath = dir + "_rels/" + part.slice(slash + 1) + ".rels", doc2 = this.xml(relPath), map = /* @__PURE__ */ new Map();
        if (!doc2) return map;
        for (const rel of Array.from(doc2.getElementsByTagName("Relationship"))) {
          const target = rel.getAttribute("Target") ?? "", external = rel.getAttribute("TargetMode") === "External";
          map.set(rel.getAttribute("Id"), { target: external ? target : resolvePath(dir, target), external, type: rel.getAttribute("Type") ?? "" });
        }
        return map;
      }
    };
    MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", bmp: "image/bmp", svg: "image/svg+xml", webp: "image/webp", tif: "image/tiff", tiff: "image/tiff" };
    Renderer = class {
      constructor(pkg) {
        this.pkg = pkg;
        const main = this.mainPart();
        this.part = main;
        const doc2 = pkg.xml(main);
        if (!doc2) throw new Error("O arquivo Word est\xE1 vazio ou danificado.");
        this.doc = doc2;
        this.rels = pkg.rels(main);
        const dir = main.slice(0, main.lastIndexOf("/") + 1);
        const byType = (suffix) => [...this.rels.values()].find((r) => r.type.endsWith("/" + suffix))?.target;
        this.loadTheme(byType("theme") ?? dir + "theme/theme1.xml");
        this.loadStyles(byType("styles") ?? dir + "styles.xml");
        this.loadNumbering(byType("numbering") ?? dir + "numbering.xml");
        this.loadSettings(byType("settings") ?? dir + "settings.xml");
        this.loadFonts(byType("fontTable") ?? dir + "fontTable.xml");
        this.loadNotes(byType("footnotes"), this.footnotes, "footnote");
        this.loadNotes(byType("endnotes"), this.endnotes, "endnote");
      }
      pkg;
      doc;
      styles = /* @__PURE__ */ new Map();
      defaultPara = "Normal";
      defaultTable;
      defaultChar;
      docRPr = null;
      docPPr = null;
      themeFonts = {};
      themeColors = {};
      numbering = /* @__PURE__ */ new Map();
      abstracts = /* @__PURE__ */ new Map();
      counters = /* @__PURE__ */ new Map();
      defaultTab = 36;
      rels;
      part = "word/document.xml";
      fontFaces = [];
      fontFamilies = /* @__PURE__ */ new Map();
      footnotes = /* @__PURE__ */ new Map();
      endnotes = /* @__PURE__ */ new Map();
      notes = [];
      noteCount = 0;
      pageRules = [];
      page = this.geometry(null);
      /** Sizes of the text runs of the paragraph being laid out. */
      sizes = [];
      /** Word version the document is laid out for (15 = Word 2013 and later). */
      compatMode = 15;
      mainPart() {
        const rels = this.pkg.xml("_rels/.rels");
        for (const rel of Array.from(rels?.getElementsByTagName("Relationship") ?? [])) if ((rel.getAttribute("Type") ?? "").endsWith("/officeDocument")) return resolvePath("", rel.getAttribute("Target") ?? "");
        return "word/document.xml";
      }
      loadTheme(path3) {
        const theme = this.pkg.xml(path3);
        if (!theme) return;
        const scheme = theme.getElementsByTagNameNS(A, "fontScheme")[0];
        for (const [kind2, key2] of [["majorFont", "major"], ["minorFont", "minor"]]) {
          const font = scheme && child(scheme, kind2);
          if (font) {
            this.themeFonts[key2 + "HAnsi"] = this.themeFonts[key2 + "Ascii"] = child(font, "latin")?.getAttribute("typeface") ?? "";
            this.themeFonts[key2 + "EastAsia"] = child(font, "ea")?.getAttribute("typeface") || this.themeFonts[key2 + "Ascii"];
            this.themeFonts[key2 + "Bidi"] = child(font, "cs")?.getAttribute("typeface") || this.themeFonts[key2 + "Ascii"];
          }
        }
        const colors = theme.getElementsByTagNameNS(A, "clrScheme")[0];
        for (const c of kids(colors)) {
          const value = child(c, "srgbClr")?.getAttribute("val") ?? child(c, "sysClr")?.getAttribute("lastClr");
          if (value) this.themeColors[local(c)] = value;
        }
      }
      loadStyles(path3) {
        const doc2 = this.pkg.xml(path3);
        if (!doc2) return;
        const root = doc2.documentElement, defaults = child(root, "docDefaults");
        this.docRPr = child(child(defaults, "rPrDefault"), "rPr");
        this.docPPr = child(child(defaults, "pPrDefault"), "pPr");
        for (const s of children(root, "style")) {
          const id = attr(s, "styleId") ?? "", type = attr(s, "type") ?? "paragraph", conditional = /* @__PURE__ */ new Map();
          for (const c of children(s, "tblStylePr")) conditional.set(attr(c, "type") ?? "", { ppr: child(c, "pPr"), rpr: child(c, "rPr"), tcPr: child(c, "tcPr"), tblPr: child(c, "tblPr") });
          this.styles.set(id, { type, basedOn: attr(child(s, "basedOn"), "val") ?? void 0, ppr: child(s, "pPr"), rpr: child(s, "rPr"), tblPr: child(s, "tblPr"), tcPr: child(s, "tcPr"), trPr: child(s, "trPr"), conditional, link: attr(child(s, "link"), "val") ?? void 0 });
          if (["1", "true", "on"].includes((attr(s, "default") ?? "").toLowerCase())) {
            if (type === "paragraph") this.defaultPara = id;
            else if (type === "table") this.defaultTable = id;
            else if (type === "character") this.defaultChar = id;
          }
        }
      }
      loadNumbering(path3) {
        const doc2 = this.pkg.xml(path3);
        if (!doc2) return;
        const root = doc2.documentElement;
        for (const a of children(root, "abstractNum")) this.abstracts.set(attr(a, "abstractNumId") ?? "", a);
        for (const n of children(root, "num")) {
          const overrides = /* @__PURE__ */ new Map();
          for (const o of children(n, "lvlOverride")) overrides.set(num(attr(o, "ilvl")), { start: child(o, "startOverride") ? num(attr(child(o, "startOverride"), "val")) : void 0, lvl: child(o, "lvl") ?? void 0 });
          let abstract = this.abstracts.get(attr(child(n, "abstractNumId"), "val") ?? "") ?? null;
          const link = attr(child(abstract, "numStyleLink"), "val");
          if (link) {
            const styleNum = attr(child(child(this.styles.get(link)?.ppr, "numPr"), "numId"), "val");
            const target = [...children(root, "num")].find((x) => attr(x, "numId") === styleNum);
            if (target) abstract = this.abstracts.get(attr(child(target, "abstractNumId"), "val") ?? "") ?? abstract;
          }
          this.numbering.set(attr(n, "numId") ?? "", { abstract, overrides });
        }
      }
      loadSettings(path3) {
        const doc2 = this.pkg.xml(path3);
        if (!doc2) return;
        const root = doc2.documentElement, tab = child(root, "defaultTabStop");
        if (tab) this.defaultTab = twip2(attr(tab, "val")) || 36;
        const mode = children(child(root, "compat"), "compatSetting").find((c) => attr(c, "name") === "compatibilityMode");
        this.compatMode = num(attr(mode, "val"), child(root, "compat") ? 12 : 15);
      }
      /** Fonts embedded in the document (obfuscated per ECMA-376 §17.8.1) become @font-face rules. */
      loadFonts(path3) {
        const doc2 = this.pkg.xml(path3);
        if (!doc2) return;
        const rels = this.pkg.rels(path3);
        for (const font of children(doc2.documentElement, "font")) {
          const name = attr(font, "name") ?? "";
          const family = attr(child(font, "family"), "val");
          if (family) this.fontFamilies.set(name.toLowerCase(), family);
          for (const [tag, weight, style] of [["embedRegular", 400, "normal"], ["embedBold", 700, "normal"], ["embedItalic", 400, "italic"], ["embedBoldItalic", 700, "italic"]]) {
            const e = child(font, tag);
            if (!e) continue;
            const rel = rels.get(e.getAttributeNS(R, "id") || e.getAttribute("r:id") || ""), data = rel && this.pkg.files[rel.target];
            if (!data) continue;
            const key2 = (attr(e, "fontKey") ?? "").replace(/[{}-]/g, "");
            if (key2.length !== 32) continue;
            const bytes = new Uint8Array(data), guid = Array.from({ length: 16 }, (_, i) => parseInt(key2.slice(30 - i * 2, 32 - i * 2), 16));
            for (let i = 0; i < 32; i++) bytes[i] ^= guid[i % 16];
            this.fontFaces.push(`@font-face{font-family:"${name.replace(/"/g, "")}";src:url(data:font/ttf;base64,${Buffer.from(bytes).toString("base64")});font-weight:${weight};font-style:${style}}`);
          }
        }
      }
      loadNotes(path3, into, tag) {
        const doc2 = path3 && this.pkg.xml(path3);
        if (!doc2) return;
        for (const n of children(doc2.documentElement, tag)) {
          const type = attr(n, "type");
          if (!type || type === "normal") into.set(attr(n, "id") ?? "", n);
        }
      }
      // ── Style resolution ────────────────────────────────────────────────────────────────────────────
      chain(id, seen = /* @__PURE__ */ new Set()) {
        if (!id || seen.has(id)) return [];
        seen.add(id);
        const s = this.styles.get(id);
        return s ? [...this.chain(s.basedOn, seen), s] : [];
      }
      runProps(base, rpr) {
        if (!rpr) return base;
        const p = { ...base };
        for (const e of kids(rpr)) {
          const name = local(e), val = attr(e, "val");
          switch (name) {
            case "rFonts": {
              const theme = attr(e, "asciiTheme") ?? attr(e, "hAnsiTheme");
              const font = theme && this.themeFonts[theme.replace(/^(major|minor)/, "$1")] || attr(e, "ascii") || attr(e, "hAnsi") || attr(e, "cs") || attr(e, "eastAsia");
              if (font) p.font = font;
              break;
            }
            case "sz":
              p.size = num(val, 22) / 2;
              break;
            case "b":
              p.bold = onOff(e);
              break;
            case "i":
              p.italic = onOff(e);
              break;
            case "u":
              p.underline = val ?? "single";
              break;
            case "strike":
              p.strike = onOff(e);
              break;
            case "dstrike":
              p.dstrike = onOff(e);
              break;
            case "color": {
              const theme = attr(e, "themeColor");
              const c = val && val !== "auto" ? hex2(val) : theme && this.themeColors[theme.replace(/^text1$/, "dk1").replace(/^text2$/, "dk2").replace(/^background1$/, "lt1").replace(/^background2$/, "lt2")] ? hex2(this.themeColors[theme.replace(/^text1$/, "dk1").replace(/^text2$/, "dk2").replace(/^background1$/, "lt1").replace(/^background2$/, "lt2")]) : void 0;
              p.color = val === "auto" ? void 0 : c ?? p.color;
              break;
            }
            case "highlight":
              p.highlight = val && val !== "none" ? HIGHLIGHT[val] : void 0;
              break;
            case "shd": {
              const fill = attr(e, "fill");
              p.shading = fill && fill !== "auto" ? hex2(fill) : void 0;
              break;
            }
            case "vertAlign":
              p.vertAlign = val ?? void 0;
              break;
            case "caps":
              p.caps = onOff(e);
              break;
            case "smallCaps":
              p.smallCaps = onOff(e);
              break;
            case "spacing":
              p.spacing = twip2(val);
              break;
            case "vanish":
              p.hidden = onOff(e);
              break;
            case "position":
              p.position = num(val) / 2;
              break;
            case "w":
              p.scale = num(val, 100) / 100;
              break;
            case "outline":
              p.outline = onOff(e);
              break;
            case "shadow":
              p.shadow = onOff(e);
              break;
            case "emboss":
            case "imprint":
              p.emboss = onOff(e);
              break;
          }
        }
        return p;
      }
      paraProps(base, ppr) {
        if (!ppr) return base;
        const p = { ...base, borders: { ...base.borders }, tabs: [...base.tabs] };
        for (const e of kids(ppr)) {
          const name = local(e), val = attr(e, "val");
          switch (name) {
            case "jc":
              p.align = val ?? void 0;
              break;
            case "spacing":
              if (attr(e, "before") !== null) p.before = twip2(attr(e, "before"));
              if (attr(e, "after") !== null) p.after = twip2(attr(e, "after"));
              if (attr(e, "beforeLines") !== null && attr(e, "before") === null) p.before = num(attr(e, "beforeLines")) / 100 * 12;
              if (attr(e, "afterLines") !== null && attr(e, "after") === null) p.after = num(attr(e, "afterLines")) / 100 * 12;
              if (attr(e, "beforeAutospacing") !== null) p.beforeAuto = !["0", "false", "off"].includes(attr(e, "beforeAutospacing"));
              if (attr(e, "afterAutospacing") !== null) p.afterAuto = !["0", "false", "off"].includes(attr(e, "afterAutospacing"));
              if (attr(e, "line") !== null) {
                p.line = num(attr(e, "line"));
                p.lineRule = attr(e, "lineRule") ?? "auto";
              }
              break;
            case "ind": {
              const left = attr(e, "left") ?? attr(e, "start"), right = attr(e, "right") ?? attr(e, "end");
              if (left !== null) p.left = twip2(left);
              if (right !== null) p.right = twip2(right);
              if (attr(e, "leftChars") !== null && left === null) p.left = num(attr(e, "leftChars")) / 100 * 12;
              if (attr(e, "hanging") !== null) {
                p.hanging = twip2(attr(e, "hanging"));
                p.firstLine = void 0;
              }
              if (attr(e, "firstLine") !== null) {
                p.firstLine = twip2(attr(e, "firstLine"));
                p.hanging = void 0;
              }
              break;
            }
            case "pBdr":
              for (const side of kids(e)) {
                const b = this.border(side);
                const key2 = local(side) === "start" ? "left" : local(side) === "end" ? "right" : local(side);
                if (["top", "bottom", "left", "right", "between"].includes(key2)) p.borders[key2] = b ?? void 0;
              }
              break;
            case "shd": {
              const fill = attr(e, "fill");
              p.shading = fill && fill !== "auto" ? hex2(fill) : void 0;
              break;
            }
            case "numPr": {
              const id = attr(child(e, "numId"), "val");
              if (id !== null) p.numId = id;
              const lvl = attr(child(e, "ilvl"), "val");
              if (lvl !== null) p.ilvl = num(lvl);
              break;
            }
            case "pageBreakBefore":
              p.pageBreakBefore = onOff(e);
              break;
            case "keepNext":
              p.keepNext = onOff(e);
              break;
            case "contextualSpacing":
              p.contextual = onOff(e);
              break;
            case "widowControl":
              p.widowControl = onOff(e);
              break;
            case "bidi":
              p.bidi = onOff(e);
              break;
            case "outlineLvl":
              p.outline = num(val);
              break;
            case "tabs":
              for (const t of children(e, "tab")) {
                const pos = twip2(attr(t, "pos")), align = attr(t, "val") ?? "left";
                p.tabs = p.tabs.filter((x) => Math.abs(x.pos - pos) > 0.5);
                if (align !== "clear") p.tabs.push({ pos, align, leader: attr(t, "leader") ?? void 0 });
              }
              p.tabs.sort((a, b) => a.pos - b.pos);
              break;
          }
        }
        return p;
      }
      border(e) {
        if (!e) return null;
        const style = attr(e, "val") ?? "single";
        if (["nil", "none"].includes(style)) return null;
        const color3 = attr(e, "color"), theme = attr(e, "themeColor");
        return { style, width: Math.max(num(attr(e, "sz"), 4) / 8, 0.25), color: (color3 && color3 !== "auto" ? hex2(color3) : theme && hex2(this.themeColors[theme])) ?? "#000000", space: num(attr(e, "space")) };
      }
      cssBorder(b) {
        if (!b) return "none";
        const style = /double|triple/i.test(b.style) ? "double" : /dot/i.test(b.style) && !/dash/i.test(b.style) ? "dotted" : /dash/i.test(b.style) ? "dashed" : /inset/.test(b.style) ? "inset" : /outset/.test(b.style) ? "outset" : "solid";
        const width = style === "double" ? Math.max(b.width * 3, 1.5) : /thick/i.test(b.style) ? Math.max(b.width, 1.5) : b.width;
        return `${pt(width)} ${style} ${b.color}`;
      }
      /** Run properties of a paragraph style (with its base styles), on top of the document defaults. */
      styleRun(styleId, base) {
        let p = base ?? this.runProps({ font: this.themeFonts.minorHAnsi || "Calibri", size: 10 }, this.docRPr);
        for (const s of this.chain(styleId)) p = this.runProps(p, s.rpr);
        return p;
      }
      stylePara(styleId) {
        let p = this.paraProps({ borders: {}, tabs: [] }, this.docPPr);
        for (const s of this.chain(styleId)) p = this.paraProps(p, s.ppr);
        return p;
      }
      // ── Text ────────────────────────────────────────────────────────────────────────────────────────
      fontStack(font) {
        if (!font) return "sans-serif";
        const subs = SUBSTITUTES[font.toLowerCase()] ?? [], family = this.fontFamilies.get(font.toLowerCase());
        const generic2 = family === "roman" ? "serif" : family === "modern" ? "monospace" : family === "script" ? "cursive" : /serif|times|roman|garamond|georgia|cambria|book|palatino|caladea/i.test(font) && !/sans/i.test(font) ? "serif" : /mono|courier|consol/i.test(font) ? "monospace" : "sans-serif";
        return [font, ...subs].map((f) => `'${f.replace(/["'<>&]/g, "")}'`).join(",") + "," + generic2;
      }
      runCss(p, paragraphRun) {
        const css = [];
        if (!paragraphRun || p.font !== paragraphRun.font) css.push(`font-family:${this.fontStack(p.font)}`);
        const size = p.size ?? 11, small = p.vertAlign === "superscript" || p.vertAlign === "subscript";
        if (!paragraphRun || size !== paragraphRun.size || small) css.push(`font-size:${pt(small ? size * 0.65 : size)}`);
        if (small) css.push(`vertical-align:${p.vertAlign === "superscript" ? "super" : "sub"};line-height:0`);
        if (!!p.bold !== !!paragraphRun?.bold || !paragraphRun) css.push(`font-weight:${p.bold ? 700 : 400}`);
        if (!!p.italic !== !!paragraphRun?.italic || !paragraphRun) css.push(`font-style:${p.italic ? "italic" : "normal"}`);
        if ((p.color ?? "#000000") !== (paragraphRun?.color ?? "#000000") || !paragraphRun) css.push(`color:${p.color ?? "#000000"}`);
        const lines2 = [];
        if (p.underline && p.underline !== "none") lines2.push("underline");
        if (p.strike || p.dstrike) lines2.push("line-through");
        if (lines2.length) {
          css.push(`text-decoration:${lines2.join(" ")}`);
          const u = p.underline ?? "";
          if (/double/.test(u) || p.dstrike) css.push("text-decoration-style:double");
          else if (/dot/.test(u)) css.push("text-decoration-style:dotted");
          else if (/dash/.test(u)) css.push("text-decoration-style:dashed");
          else if (/wave/.test(u)) css.push("text-decoration-style:wavy");
          if (/thick|heavy/.test(u)) css.push("text-decoration-thickness:2px");
        }
        if (p.highlight || p.shading) css.push(`background-color:${p.highlight ?? p.shading}`);
        if (p.caps) css.push("text-transform:uppercase");
        if (p.smallCaps) css.push("font-variant:small-caps");
        if (p.spacing) css.push(`letter-spacing:${pt(p.spacing)}`);
        if (p.position) css.push(`position:relative;top:${pt(-p.position)}`);
        if (p.scale && p.scale !== 1) css.push(`display:inline-block;transform:scaleX(${p.scale});transform-origin:left`);
        if (p.outline) css.push("-webkit-text-stroke:.5pt currentColor;color:transparent");
        if (p.shadow) css.push("text-shadow:1px 1px 0 rgba(0,0,0,.45)");
        if (p.emboss) css.push("text-shadow:-1px -1px 0 #fff,1px 1px 0 rgba(0,0,0,.4)");
        return css.join(";");
      }
      // ── Document ────────────────────────────────────────────────────────────────────────────────────
      render() {
        const body = child(this.doc.documentElement, "body");
        if (!body) throw new Error("O arquivo Word n\xE3o tem conte\xFAdo leg\xEDvel.");
        const sections = [];
        let current = [];
        for (const block of kids(body)) {
          if (local(block) === "sectPr") {
            sections.push({ blocks: current, sect: block });
            current = [];
            continue;
          }
          current.push(block);
          const inner = local(block) === "p" ? child(child(block, "pPr"), "sectPr") : null;
          if (inner) {
            sections.push({ blocks: current, sect: inner });
            current = [];
          }
        }
        if (current.length) sections.push({ blocks: current, sect: null });
        const last = sections.at(-1)?.sect ?? null;
        const parts = [];
        let header, footer, firstGeometry;
        let headerSect = null, footerSect = null;
        sections.forEach((section, index) => {
          const sect = section.sect ?? last, g = this.geometry(sect), name = `s${index}`;
          this.page = g;
          if (children(sect, "headerReference").length) headerSect = sect;
          if (children(sect, "footerReference").length) footerSect = sect;
          g.top = Math.max(g.top, g.header + this.partHeight(headerSect, "header"));
          g.bottom = Math.max(g.bottom, g.footer + this.partHeight(footerSect, "footer"));
          firstGeometry ??= g;
          this.pageRules.push(`@page ${name}{size:${pt(g.width)} ${pt(g.height)};margin:${pt(g.top)} ${pt(g.right)} ${pt(g.bottom)} ${pt(g.left)}}`);
          const type = attr(child(sect, "type"), "val");
          const breakBefore = index > 0 && type !== "continuous" ? "break-before:page;" : "";
          const cols = child(sect, "cols"), count = num(attr(cols, "num"), 1);
          const columns = count > 1 ? `column-count:${count};column-gap:${pt(twip2(attr(cols, "space") ?? "720"))};${attr(cols, "sep") && !["0", "false", "off"].includes(attr(cols, "sep")) ? "column-rule:.5pt solid #000;" : ""}` : "";
          const content = this.blocks(section.blocks, g.width - g.left - g.right);
          const notes = this.notes.length ? `<div class="notes">${this.notes.join("")}</div>` : "";
          this.notes = [];
          parts.push(`<section style="page:${name};${breakBefore}${columns}">${content}${notes}</section>`);
          if (index === 0) {
            header = this.headerFooter(headerSect, "header", g);
            footer = this.headerFooter(footerSect, "footer", g);
          }
        });
        const background = hex2(attr(child(this.doc.documentElement, "background"), "color"));
        const defaults = this.styleRun(this.defaultPara);
        const css = [
          ...this.fontFaces,
          ...this.pageRules,
          `@page{size:${pt(firstGeometry.width)} ${pt(firstGeometry.height)};margin:${pt(firstGeometry.top)} ${pt(firstGeometry.right)} ${pt(firstGeometry.bottom)} ${pt(firstGeometry.left)}}`,
          `html,body{margin:0;padding:0;${background ? `background:${background};` : ""}-webkit-print-color-adjust:exact;print-color-adjust:exact}`,
          `body{font-family:${this.fontStack(defaults.font)};font-size:${pt(defaults.size ?? 11)};color:#000;font-kerning:normal;text-rendering:geometricPrecision;orphans:2;widows:2}`,
          "p{margin:0;padding:0;overflow-wrap:break-word;white-space:pre-wrap;tab-size:36pt}",
          "table{border-collapse:collapse;border-spacing:0}td{padding:0;vertical-align:top;overflow-wrap:break-word}",
          ".tab{display:inline-block}.anchor{position:relative;height:0;width:0;display:inline}.anchored{position:absolute}",
          "img{display:inline-block}.notes{margin-top:12pt;border-top:.5pt solid #000;width:33%;padding-top:4pt}.notes p{font-size:9pt}",
          "a{color:inherit;text-decoration:inherit}tr{break-inside:avoid}",
          // Word lets a line end a hair past the margin (it lays out in twips); without this slack a justified
          // line that fits in Word would wrap one word earlier.
          "section{display:block;margin-right:-.75pt}"
        ].join("\n");
        return { html: `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css}</style></head><body>${parts.join("")}</body></html>`, headerTemplate: header, footerTemplate: footer };
      }
      geometry(sect) {
        const size = child(sect, "pgSz"), margin = child(sect, "pgMar");
        let width = twip2(attr(size, "w") ?? "11906"), height = twip2(attr(size, "h") ?? "16838");
        if (attr(size, "orient") === "landscape" && width < height) [width, height] = [height, width];
        const gutter = twip2(attr(margin, "gutter"));
        return { width, height, top: Math.abs(twip2(attr(margin, "top") ?? "1440")), bottom: Math.abs(twip2(attr(margin, "bottom") ?? "1440")), left: twip2(attr(margin, "left") ?? "1440") + gutter, right: twip2(attr(margin, "right") ?? "1440"), header: twip2(attr(margin, "header") ?? "720"), footer: twip2(attr(margin, "footer") ?? "720") };
      }
      /** Approximate height of a header or footer: its lines, pictures, spacing and borders. */
      partHeight(sect, kind2) {
        const refs = children(sect, kind2 + "Reference"), ref = refs.find((r) => attr(r, "type") === "default") ?? refs.find((r) => !attr(r, "type")) ?? (refs.length === 1 ? refs[0] : void 0);
        const rel = ref && this.rels.get(ref.getAttributeNS(R, "id") || ref.getAttribute("r:id") || ""), doc2 = rel && this.pkg.xml(rel.target);
        if (!doc2) return 0;
        const para = (p) => {
          const ppr = child(p, "pPr"), props = this.paraProps(this.stylePara(attr(child(ppr, "pStyle"), "val") ?? this.defaultPara), ppr), base = this.styleRun(attr(child(ppr, "pStyle"), "val") ?? this.defaultPara);
          let size = base.size ?? 11, picture = 0;
          for (const r of Array.from(p.getElementsByTagNameNS(W, "r"))) {
            const sz = child(child(r, "rPr"), "sz");
            if (sz) size = Math.max(size, num(attr(sz, "val")) / 2);
          }
          for (const e of Array.from(p.getElementsByTagNameNS(WP, "inline"))) picture = Math.max(picture, emu2(child(e, "extent")?.getAttribute("cy")));
          const line = props.line !== void 0 && props.lineRule === "exact" ? props.line / 20 : size * lineFactor(base.font ?? "") * (props.line !== void 0 && props.lineRule !== "atLeast" ? props.line / 240 : 1);
          const b = props.borders;
          return Math.max(line, picture) + (props.before ?? 0) + (props.after ?? 0) + (b.top ? b.top.space + b.top.width : 0) + (b.bottom ? b.bottom.space + b.bottom.width : 0);
        };
        const block = (e) => local(e) === "p" ? para(e) : local(e) === "tbl" ? children(e, "tr").reduce((t, tr) => t + Math.max(...children(tr, "tc").map((tc) => kids(tc).reduce((h, k) => h + block(k), 0)), 0), 0) : local(e) === "sdt" ? kids(child(e, "sdtContent")).reduce((h, k) => h + block(k), 0) : 0;
        return kids(doc2.documentElement).reduce((h, e) => h + block(e), 0);
      }
      /** Chromium prints header and footer templates inside the page margins; page fields become its counters. */
      headerFooter(sect, kind2, g) {
        const refs = children(sect, kind2 + "Reference"), ref = refs.find((r) => attr(r, "type") === "default") ?? refs.find((r) => !attr(r, "type")) ?? (refs.length === 1 ? refs[0] : void 0);
        if (!ref) return void 0;
        const rel = this.rels.get(ref.getAttributeNS(R, "id") || ref.getAttribute("r:id") || ""), doc2 = rel && this.pkg.xml(rel.target);
        if (!doc2) return void 0;
        const savedRels = this.rels, savedPart = this.part;
        this.rels = this.pkg.rels(rel.target);
        this.part = rel.target;
        const content = this.blocks(kids(doc2.documentElement), g.width - g.left - g.right, true);
        this.rels = savedRels;
        this.part = savedPart;
        if (!content.replace(/<[^>]+>/g, "").trim() && !/<img|<svg|class="pageNumber"/.test(content)) return void 0;
        const defaults = this.styleRun(this.defaultPara);
        const position = kind2 === "header" ? `top:${pt(g.header)}` : `bottom:${pt(g.footer)}`;
        return `<style>${this.fontFaces.join("")}p{margin:0;white-space:pre-wrap}table{border-collapse:collapse}td{padding:0;vertical-align:top}.tab{display:inline-block}img{display:inline-block}.anchor{position:relative;height:0;width:0;display:inline}.anchored{position:absolute}</style><div style="position:absolute;left:${pt(g.left)};right:${pt(g.right)};${position};font-family:${this.fontStack(defaults.font)};font-size:${pt(defaults.size ?? 11)};color:#000;-webkit-print-color-adjust:exact">${content}</div>`;
      }
      blocks(list, width, inHeader = false) {
        const out = [];
        let previous;
        for (const block of list) {
          const name = local(block);
          if (name === "p") {
            const r = this.paragraph(block, width, previous, inHeader);
            out.push(r.html);
            previous = r.info;
          } else if (name === "tbl") {
            out.push(this.table(block, width, inHeader));
            previous = void 0;
          } else if (name === "sdt") {
            out.push(this.blocks(kids(child(block, "sdtContent")), width, inHeader));
          } else if (["customXml", "ins", "moveTo"].includes(name)) out.push(this.blocks(kids(block), width, inHeader));
          else if (name === "AlternateContent") out.push(this.blocks(kids(child(block, "Choice") ?? child(block, "Fallback")), width, inHeader));
        }
        return out.join("");
      }
      // ── Paragraphs ──────────────────────────────────────────────────────────────────────────────────
      paragraph(p, width, previous, inHeader, tableStyle) {
        const ppr = child(p, "pPr"), styleId = attr(child(ppr, "pStyle"), "val") ?? this.defaultPara;
        let props = this.stylePara(styleId);
        if (tableStyle) for (const t of tableStyle) props = this.paraProps(props, t.ppr);
        props = this.paraProps(props, ppr);
        let runBase = this.styleRun(void 0);
        if (tableStyle) for (const t of tableStyle) runBase = this.runProps(runBase, t.rpr);
        runBase = this.styleRun(styleId, runBase);
        const markRun = this.runProps(runBase, child(ppr, "rPr"));
        let marker = "", markerCss = "";
        const numId = props.numId, ilvl = props.ilvl ?? 0;
        if (numId && numId !== "0") {
          const lvl = this.level(numId, ilvl);
          if (lvl) {
            const lvlProps = this.paraProps({ borders: {}, tabs: [] }, child(lvl, "pPr"));
            const direct = this.paraProps({ borders: {}, tabs: [] }, ppr), styleOnly = this.stylePara(styleId);
            if (direct.left === void 0) props.left = lvlProps.left ?? styleOnly.left;
            if (direct.hanging === void 0 && direct.firstLine === void 0) {
              props.hanging = lvlProps.hanging;
              props.firstLine = lvlProps.firstLine;
            }
            const text2 = this.markerText(numId, ilvl, lvl), mrun = this.runProps(markRun, child(lvl, "rPr"));
            const suffix = attr(child(lvl, "suff"), "val") ?? "tab", align2 = attr(child(lvl, "lvlJc"), "val") ?? "left";
            if (text2 !== null) {
              const hanging = props.hanging ?? 0;
              const boxWidth = suffix === "tab" ? Math.max(hanging, 0) : 0;
              markerCss = this.runCss({ ...mrun, underline: void 0, highlight: void 0, shading: void 0 });
              const content = escape(text2) + (suffix === "space" ? " " : "");
              marker = suffix === "tab" && boxWidth > 0 ? `<span style="display:inline-block;min-width:${pt(boxWidth)};${align2 === "right" ? `margin-left:${pt(-boxWidth)};text-align:right;padding-right:${pt(Math.min(boxWidth, 7))};box-sizing:border-box;` : align2 === "center" ? "text-align:center;" : ""}text-indent:0;${markerCss}">${content}</span>` : `<span style="${markerCss}">${content}${suffix === "tab" ? " " : ""}</span>`;
            }
          }
        }
        const left0 = props.left ?? 0, start = left0 + (props.hanging !== void 0 ? -props.hanging : props.firstLine ?? 0) + (marker ? Math.max(props.hanging ?? 0, 0) : 0);
        const savedSizes = this.sizes;
        this.sizes = [];
        const pieces2 = this.tabs(this.inlines(kids(p), markRun, runBase, props, width, inHeader), props, start, width);
        const smallest = this.sizes.reduce((a, b2) => !a || b2.size < a.size ? b2 : a, void 0);
        const blockSize = smallest?.size ?? markRun.size ?? 11, blockFont = smallest?.font ?? markRun.font;
        this.sizes = savedSizes;
        const empty = !pieces2.trim() || /^(<span[^>]*><\/span>)*$/.test(pieces2);
        const factor = lineFactor(blockFont ?? runBase.font ?? "");
        const css = [];
        const align = props.align === "both" || props.align === "distribute" || props.align === "thaiDistribute" || props.align === "lowKashida" || props.align === "mediumKashida" || props.align === "highKashida" ? "justify" : props.align === "center" ? "center" : props.align === "right" || props.align === "end" ? "right" : "left";
        if (align !== "left") css.push(`text-align:${align}`);
        if (props.align === "distribute") css.push("text-align-last:justify");
        if (align === "justify" && this.compatMode >= 15) css.push("word-spacing:-.05em");
        if (props.bidi) css.push("direction:rtl");
        if (props.line !== void 0) {
          if (props.lineRule === "exact") css.push(`line-height:${pt(props.line / 20)};max-height:none`);
          else if (props.lineRule === "atLeast") css.push(`line-height:${pt(Math.max(props.line / 20, blockSize * factor))}`);
          else css.push(`line-height:${Math.round(props.line / 240 * factor * 1e3) / 1e3}`);
        } else css.push(`line-height:${factor}`);
        let before = props.beforeAuto ? 14 : props.before ?? 0, after = props.afterAuto ? 14 : props.after ?? 0;
        if (previous && props.contextual && previous.contextual !== void 0 && previous.style === styleId) before = 0;
        const left = props.left ?? 0, right = props.right ?? 0, indent = props.hanging !== void 0 ? -props.hanging : props.firstLine ?? 0;
        const b = props.borders, shaded = !!props.shading;
        if (left || b.left) css.push(`margin-left:${pt(left - (b.left ? b.left.space + b.left.width : 0))}`);
        if (right || b.right) css.push(`margin-right:${pt(right - (b.right ? b.right.space + b.right.width : 0))}`);
        if (indent) css.push(`text-indent:${pt(indent)}`);
        if (b.top || shaded) {
          if (before) css.push(`margin-top:${pt(before)}`);
          css.push(`border-top:${this.cssBorder(b.top)};padding-top:${pt(b.top?.space ?? 0)}`);
        } else if (before) css.push(`padding-top:${pt(before)}`);
        if (b.bottom || shaded) {
          if (after) css.push(`margin-bottom:${pt(after)}`);
          css.push(`border-bottom:${this.cssBorder(b.bottom)};padding-bottom:${pt(b.bottom?.space ?? 0)}`);
        } else if (after) css.push(`padding-bottom:${pt(after)}`);
        if (b.left) css.push(`border-left:${this.cssBorder(b.left)};padding-left:${pt(b.left.space)}`);
        if (b.right) css.push(`border-right:${this.cssBorder(b.right)};padding-right:${pt(b.right.space)}`);
        if (shaded) css.push(`background-color:${props.shading}`);
        if (props.pageBreakBefore && !inHeader) css.push("break-before:page");
        if (props.keepNext) css.push("break-after:avoid");
        if (props.widowControl === false) css.push("orphans:1;widows:1");
        css.push(this.runCss({ ...markRun, size: blockSize, font: blockFont, vertAlign: void 0 }));
        const filler = empty ? `<span style="font-size:${pt(markRun.size ?? 11)}">\u200B</span>` : "";
        const tag = !inHeader && props.outline !== void 0 && props.outline < 6 ? `h${props.outline + 1}` : "p";
        const html = `<${tag} style="${css.filter(Boolean).join(";")}${tag !== "p" ? ";margin-block:0;font-weight:inherit;white-space:pre-wrap" : ""}">${marker}${pieces2}${filler}</${tag}>`;
        return { html, info: { style: styleId, contextual: props.contextual, after } };
      }
      level(numId, ilvl) {
        const n = this.numbering.get(numId);
        if (!n) return null;
        const override = n.overrides.get(ilvl)?.lvl;
        return override ?? children(n.abstract, "lvl").find((l) => num(attr(l, "ilvl")) === ilvl) ?? null;
      }
      markerText(numId, ilvl, lvl) {
        const n = this.numbering.get(numId), abstractId = attr(n.abstract, "abstractNumId") ?? numId;
        const key2 = abstractId + ":" + numId, counters = this.counters.get(key2) ?? [];
        const startOf = (level) => {
          const o = n.overrides.get(level);
          if (o?.start !== void 0) return o.start;
          const l = this.level(numId, level);
          return num(attr(child(l, "start"), "val"), 1);
        };
        counters[ilvl] = counters[ilvl] === void 0 ? startOf(ilvl) : counters[ilvl] + 1;
        for (let i = ilvl + 1; i < 9; i++) counters[i] = void 0;
        for (let i = 0; i < ilvl; i++) if (counters[i] === void 0) counters[i] = startOf(i);
        this.counters.set(key2, counters);
        const format = attr(child(lvl, "numFmt"), "val") ?? "decimal", text2 = attr(child(lvl, "lvlText"), "val");
        if (text2 === null) return null;
        if (format === "none") return text2.replace(/%\d/g, "");
        if (format === "bullet") return bulletGlyph(text2, attr(child(child(lvl, "rPr"), "rFonts"), "ascii"));
        return text2.replace(/%(\d)/g, (_, d) => {
          const i = Number(d) - 1, l = this.level(numId, i);
          const f = i === ilvl ? format : attr(child(l, "numFmt"), "val") ?? "decimal";
          const legal = onOff(child(lvl, "isLgl"));
          return formatNumber(counters[i] ?? startOf(i), legal ? "decimal" : f);
        });
      }
      /** Runs, links, fields, notes and drawings of one paragraph. */
      inlines(nodes, paraRun, runBase, props, width, inHeader) {
        const out = [];
        let field = null;
        const stack = [];
        const visit = (node, link) => {
          const name = local(node);
          if (name === "r") {
            const rpr = child(node, "rPr"), charStyle = attr(child(rpr, "rStyle"), "val");
            let run2 = runBase;
            if (charStyle) for (const s of this.chain(charStyle)) run2 = this.runProps(run2, s.rpr);
            run2 = this.runProps(run2, rpr);
            for (const c of kids(node)) {
              const cn = local(c);
              if (cn === "fldChar") {
                const type = attr(c, "fldCharType");
                if (type === "begin") {
                  if (field) stack.push(field);
                  field = { instr: "", phase: "instr" };
                } else if (type === "separate" && field) {
                  field.phase = "result";
                  const page2 = pageField(field.instr);
                  if (page2 && inHeader) {
                    out.push(`<span style="${this.runCss(run2, paraRun)}" class="${page2}"></span>`);
                    field.phase = "instr";
                    field.skip = true;
                  }
                } else if (type === "end") {
                  if (field && !field.skip && field.phase === "instr") {
                    const page2 = pageField(field.instr);
                    if (page2 && inHeader) out.push(`<span style="${this.runCss(run2, paraRun)}" class="${page2}"></span>`);
                  }
                  field = stack.pop() ?? null;
                }
                continue;
              }
              if (cn === "instrText") {
                if (field) field.instr += c.textContent ?? "";
                continue;
              }
              if (field && field.phase === "instr") continue;
              if (run2.hidden) continue;
              if (cn === "t" && c.textContent) this.sizes.push({ size: run2.vertAlign === "superscript" || run2.vertAlign === "subscript" ? (run2.size ?? 11) * 0.65 : run2.size ?? 11, font: run2.font });
              out.push(this.runContent(c, run2, void 0, props, width, link, inHeader));
            }
            return;
          }
          if (field && field.phase === "instr" && name !== "fldSimple") {
            if (["hyperlink", "smartTag", "ins", "customXml", "sdt", "sdtContent"].includes(name)) for (const k of kids(node)) visit(k, link);
            return;
          }
          if (name === "hyperlink") {
            const rel = this.rels.get(node.getAttributeNS(R, "id") || node.getAttribute("r:id") || ""), anchor = attr(node, "anchor");
            const href = rel?.external ? rel.target : anchor ? "#" + anchor : void 0;
            const inner = [];
            const saved = out.length;
            for (const k of kids(node)) visit(k, href);
            if (href && /^(https?:|mailto:|#)/i.test(href)) {
              inner.push(...out.splice(saved));
              out.push(`<a href="${escape(href)}">${inner.join("")}</a>`);
            }
            return;
          }
          if (name === "fldSimple") {
            const page2 = pageField(attr(node, "instr") ?? "");
            if (page2 && inHeader) {
              const r = child(node, "r");
              const run2 = this.runProps(runBase, child(r, "rPr"));
              out.push(`<span style="${this.runCss(run2, paraRun)}" class="${page2}"></span>`);
              return;
            }
            for (const k of kids(node)) visit(k, link);
            return;
          }
          if (["smartTag", "ins", "customXml", "moveTo", "dir", "bdo"].includes(name)) {
            for (const k of kids(node)) visit(k, link);
            return;
          }
          if (name === "sdt") {
            for (const k of kids(child(node, "sdtContent"))) visit(k, link);
            return;
          }
          if (name === "AlternateContent") {
            for (const k of kids(child(node, "Choice") ?? child(node, "Fallback"))) visit(k, link);
            return;
          }
          if (name === "oMath" || name === "oMathPara") {
            out.push(`<span style="font-family:'Cambria Math','STIX Two Math',serif;font-style:italic">${escape(node.textContent ?? "")}</span>`);
            return;
          }
        };
        for (const node of nodes) if (local(node) !== "pPr") visit(node);
        return out.join("");
      }
      runContent(c, run2, paraRun, props, width, link, inHeader) {
        const cn = local(c), css = this.runCss(run2, paraRun), wrap = (html) => css ? `<span style="${css}">${html}</span>` : html;
        switch (cn) {
          // A tab typed inside the text is a tab like <w:tab/>.
          case "t":
            return (c.textContent ?? "").split("	").map((part) => part ? wrap(escape(part)) : "").join(TAB);
          case "tab":
            return TAB;
          case "br": {
            const type = attr(c, "type");
            if (type === "page" && !inHeader) return '<span style="display:block;break-after:page"></span>';
            if (type === "column") return '<span style="display:block;break-after:column"></span>';
            return "<br>";
          }
          case "cr":
            return "<br>";
          case "noBreakHyphen":
            return wrap("\u2011");
          case "softHyphen":
            return "\xAD";
          case "sym": {
            const code = parseInt(attr(c, "char") ?? "", 16);
            const font = attr(c, "font") ?? "";
            if (!Number.isFinite(code)) return "";
            const ch = /symbol|wingdings/i.test(font) ? symbolGlyph(code, font) : String.fromCodePoint(code >= 61440 ? code - 61440 : code);
            return wrap(escape(ch));
          }
          case "footnoteReference":
          case "endnoteReference": {
            const id = attr(c, "id") ?? "", note = (cn === "footnoteReference" ? this.footnotes : this.endnotes).get(id);
            const n = ++this.noteCount;
            if (note) {
              const saved = this.rels, savedPart = this.part;
              const part = [...this.rels.values()].find((r) => r.type.endsWith(cn === "footnoteReference" ? "/footnotes" : "/endnotes"))?.target;
              if (part) this.rels = this.pkg.rels(part);
              this.notes.push(`<div id="note${n}">${this.blocks(kids(note), width).replace(/<span[^>]*class="noteRef"[^>]*><\/span>/, `<sup>${n}</sup> `)}</div>`);
              this.rels = saved;
              this.part = savedPart;
            }
            return `<sup style="font-size:${pt((run2.size ?? 11) * 0.65)}">${n}</sup>`;
          }
          case "footnoteRef":
          case "endnoteRef":
            return '<span class="noteRef"></span>';
          case "drawing":
            return this.drawing(c, width);
          case "pict":
          case "object":
            return this.vml(c, width);
          case "AlternateContent": {
            const choice = child(c, "Choice") ?? child(c, "Fallback");
            return kids(choice).map((k) => this.runContent(k, run2, paraRun, props, width, link, inHeader)).join("");
          }
          case "ptab":
            return wrap(`<span class="tab" style="width:${pt(this.defaultTab)}"></span>`);
        }
        return "";
      }
      /** Tabs, laid out without measuring text: each tab closes a box that reaches its stop. A left stop
       * pads the text before it up to the stop; a right, centre or decimal stop shares one box with the text
       * after it, pushed against the stop; leaders fill the gap with dots, dashes or a line. */
      tabs(html, props, start, width) {
        if (!html.includes(TAB)) return html;
        const segments = html.split(TAB);
        const balanced = segments.every((s) => (s.match(/<(span|a|sup|sub)\b/g)?.length ?? 0) === (s.match(/<\/(span|a|sup|sub)>/g)?.length ?? 0));
        if (!balanced) return html.replaceAll(TAB, `<span class="tab" style="min-width:${pt(this.defaultTab / 2)}"></span>`);
        const stops = props.tabs.filter((t) => t.align !== "bar" && t.align !== "num");
        const leaderCss = (leader) => !leader || leader === "none" ? "" : leader === "dot" || leader === "middleDot" ? `align-self:stretch;margin:0 1pt;background:radial-gradient(circle,currentColor .75pt,transparent .95pt) 0 ${leader === "dot" ? "80%" : "55%"}/4pt 4pt repeat-x;` : `border-bottom:${leader === "heavy" ? "1.5pt solid" : leader === "underscore" ? ".75pt solid" : ".75pt dashed"} currentColor;margin:0 2pt .25em;`;
        let position = start, out = segments[0];
        for (let i = 1; i < segments.length; i++) {
          let stop = stops.find((t) => t.pos > position + 0.5);
          if (!stop && props.hanging && (props.left ?? 0) > position + 0.5) stop = { pos: props.left, align: "left" };
          if (!stop) stop = { pos: (Math.floor(position / this.defaultTab + 1e-6) + 1) * this.defaultTab, align: "left" };
          const pos = stop.pos, span = Math.max(pos - start, 0);
          if (stop.align === "left" || stop.align === "start") {
            out = `<span style="display:inline-flex;align-items:baseline;min-width:${pt(span)};text-indent:0;white-space:pre">${out}<span style="flex:1;${leaderCss(stop.leader)}"></span></span>`;
          } else {
            const text2 = segments[i];
            segments[i] = "";
            const justify = `<span style="flex:1;${leaderCss(stop.leader)}"></span><span style="white-space:pre">${text2}</span>`;
            out = `<span style="display:inline-flex;align-items:baseline;min-width:${pt(span)};text-indent:0;white-space:pre">${out}${justify}</span>`;
          }
          position = pos;
          out += segments[i];
        }
        return out;
      }
      // ── Pictures and text boxes ─────────────────────────────────────────────────────────────────────
      image(id) {
        if (!id) return null;
        const rel = this.rels.get(id);
        if (!rel || rel.external) return null;
        const data = this.pkg.files[rel.target];
        if (!data) return null;
        const ext = rel.target.split(".").pop().toLowerCase(), mime = MIME[ext];
        if (!mime) return null;
        return `data:${mime};base64,${Buffer.from(data).toString("base64")}`;
      }
      drawing(d, width) {
        const holder = child(d, "inline") ?? child(d, "anchor");
        if (!holder) return "";
        const inline2 = local(holder) === "inline", extent = child(holder, "extent");
        let w = emu2(extent?.getAttribute("cx")), h = emu2(extent?.getAttribute("cy"));
        const graphic = holder.getElementsByTagNameNS(A, "graphicData")[0];
        let inner = "";
        const blip = holder.getElementsByTagNameNS(A, "blip")[0];
        const xfrm = holder.getElementsByTagNameNS(A, "xfrm")[0], rot = num(xfrm?.getAttribute("rot")) / 6e4, flipH = xfrm?.getAttribute("flipH") === "1", flipV = xfrm?.getAttribute("flipV") === "1";
        const transform = rot || flipH || flipV ? `transform:${rot ? `rotate(${rot}deg)` : ""}${flipH ? " scaleX(-1)" : ""}${flipV ? " scaleY(-1)" : ""};` : "";
        if (blip) {
          const src = this.image(blip.getAttributeNS(R, "embed") || blip.getAttribute("r:embed"));
          const crop = holder.getElementsByTagNameNS(A, "srcRect")[0];
          if (src) {
            const l = num(crop?.getAttribute("l")) / 1e5, t = num(crop?.getAttribute("t")) / 1e5, r = num(crop?.getAttribute("r")) / 1e5, b = num(crop?.getAttribute("b")) / 1e5;
            inner = l || t || r || b ? `<span style="display:inline-block;overflow:hidden;width:${pt(w)};height:${pt(h)};position:relative;${transform}"><img src="${src}" style="position:absolute;left:${pt(-w * l / (1 - l - r))};top:${pt(-h * t / (1 - t - b))};width:${pt(w / (1 - l - r))};height:${pt(h / (1 - t - b))}"></span>` : `<img src="${src}" style="width:${pt(w)};height:${pt(h)};${transform}">`;
          }
        } else if (graphic) {
          const shape = graphic.getElementsByTagNameNS("http://schemas.microsoft.com/office/word/2010/wordprocessingShape", "wsp")[0];
          if (shape) inner = this.shape(shape, w, h, transform);
          else {
            const group = graphic.getElementsByTagNameNS("http://schemas.microsoft.com/office/word/2010/wordprocessingGroup", "wgp")[0];
            if (group) inner = this.group(group, w, h);
          }
        }
        if (!inner) return "";
        if (inline2) return `<span style="display:inline-block;vertical-align:baseline;line-height:0">${inner}</span>`;
        const pos = (axis) => {
          const e = child(holder, axis), offset = child(e, "posOffset"), align = child(e, "align");
          return { from: e?.getAttribute("relativeFrom") ?? "", offset: offset ? emu2(offset.textContent) : void 0, align: align?.textContent?.trim() };
        };
        const ph = pos("positionH"), pv = pos("positionV");
        const behind = holder.getAttribute("behindDoc") === "1", wrapNone = !!child(holder, "wrapNone"), topBottom = !!child(holder, "wrapTopAndBottom"), square = child(holder, "wrapSquare") ?? child(holder, "wrapTight") ?? child(holder, "wrapThrough");
        const page2 = this.page;
        let left = ph.offset ?? 0;
        if (ph.from === "page" && ph.offset !== void 0) left -= page2.left;
        if (ph.align) left = ph.align === "center" ? (width - w) / 2 : ph.align === "right" || ph.align === "outside" ? width - w : 0;
        const top = pv.offset ?? 0;
        if (topBottom) return `<span style="display:block;margin-left:${pt(Math.max(left, 0))};line-height:0">${inner}</span>`;
        if (square && !wrapNone) {
          const side = ph.align === "right" || left > width / 2 ? "right" : "left";
          return `<span style="float:${side};margin:${pt(Math.max(top, 0))} ${side === "left" ? "9pt" : "0"} 4pt ${side === "right" ? "9pt" : pt(Math.max(left, 0))};line-height:0">${inner}</span>`;
        }
        const topCss = pv.from === "paragraph" || pv.from === "line" || pv.offset === void 0 ? pt(top) : pt(top - (pv.from === "page" ? page2.top : 0));
        return `<span class="anchor"><span class="anchored" style="left:${pt(left)};top:${pv.from === "paragraph" || pv.from === "line" ? topCss : pt(0)};z-index:${behind ? -1 : 1};line-height:0">${inner}</span></span>`;
      }
      fill(spPr) {
        if (!spPr) return "";
        const solid = child(spPr, "solidFill"), grad = child(spPr, "gradFill");
        if (child(spPr, "noFill")) return "background:transparent;";
        if (solid) return `background:${this.drawingColor(solid) ?? "transparent"};`;
        if (grad) {
          const stops = children(child(grad, "gsLst"), "gs").map((g) => `${this.drawingColor(g) ?? "#fff"} ${num(g.getAttribute("pos")) / 1e3}%`);
          const angle = num(child(grad, "lin")?.getAttribute("ang")) / 6e4;
          return stops.length ? `background:linear-gradient(${angle + 90}deg,${stops.join(",")});` : "";
        }
        return "";
      }
      drawingColor(holder) {
        const c = kids(holder).find((e) => ["srgbClr", "schemeClr", "sysClr", "prstClr"].includes(local(e)));
        if (!c) return void 0;
        let value = local(c) === "srgbClr" ? c.getAttribute("val") : local(c) === "sysClr" ? c.getAttribute("lastClr") : local(c) === "schemeClr" ? this.themeColors[{ tx1: "dk1", tx2: "dk2", bg1: "lt1", bg2: "lt2" }[c.getAttribute("val") ?? ""] ?? c.getAttribute("val") ?? ""] : { black: "000000", white: "ffffff", red: "ff0000", blue: "0000ff", green: "008000" }[c.getAttribute("val") ?? ""];
        if (!value) return void 0;
        let [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
        for (const m of kids(c)) {
          const v = num(m.getAttribute("val")) / 1e5;
          if (local(m) === "lumMod") [r, g, b] = [r * v, g * v, b * v];
          else if (local(m) === "lumOff") [r, g, b] = [r + 255 * v, g + 255 * v, b + 255 * v];
          else if (local(m) === "tint") [r, g, b] = [255 - (255 - r) * v, 255 - (255 - g) * v, 255 - (255 - b) * v];
          else if (local(m) === "shade") [r, g, b] = [r * v, g * v, b * v];
        }
        const alpha2 = child(c, "alpha"), clamp = (x) => Math.max(0, Math.min(255, Math.round(x)));
        return alpha2 ? `rgba(${clamp(r)},${clamp(g)},${clamp(b)},${num(alpha2.getAttribute("val")) / 1e5})` : "#" + [r, g, b].map((x) => clamp(x).toString(16).padStart(2, "0")).join("");
      }
      shape(wsp, w, h, transform) {
        const spPr = child(wsp, "spPr"), ln = child(spPr, "ln"), geom = child(spPr, "prstGeom")?.getAttribute("prst") ?? "rect";
        const line = ln && !child(ln, "noFill") ? `border:${pt(Math.max(num(ln.getAttribute("w"), 9525) / 12700, 0.25))} solid ${this.drawingColor(child(ln, "solidFill")) ?? "#000"};box-sizing:border-box;` : "";
        const radius = geom === "ellipse" ? "border-radius:50%;" : geom === "roundRect" ? "border-radius:12%;" : "";
        const body = child(wsp, "bodyPr"), inset = (n, d) => pt(body?.getAttribute(n) ? emu2(body.getAttribute(n)) : d);
        const anchor = body?.getAttribute("anchor"), box = child(child(wsp, "txbx"), "txbxContent");
        const text2 = box ? this.blocks(kids(box), w) : "";
        if (geom === "line" || geom === "straightConnector1") return `<span style="display:inline-block;width:${pt(w)};height:${pt(h)};border-top:${ln ? pt(Math.max(num(ln.getAttribute("w"), 9525) / 12700, 0.25)) : ".75pt"} solid ${this.drawingColor(child(ln, "solidFill")) ?? "#000"};${transform}"></span>`;
        return `<span style="display:inline-flex;flex-direction:column;justify-content:${anchor === "ctr" ? "center" : anchor === "b" ? "flex-end" : "flex-start"};width:${pt(w)};min-height:${pt(h)};padding:${inset("tIns", 3.6)} ${inset("rIns", 7.2)} ${inset("bIns", 3.6)} ${inset("lIns", 7.2)};box-sizing:border-box;line-height:normal;vertical-align:top;${this.fill(spPr)}${line}${radius}${transform}">${text2}</span>`;
      }
      group(wgp, w, h) {
        const xfrm = child(child(wgp, "grpSpPr"), "xfrm"), chOff = child(xfrm, "chOff"), chExt = child(xfrm, "chExt");
        const ox = num(chOff?.getAttribute("x")), oy = num(chOff?.getAttribute("y")), sx = w / (emu2(chExt?.getAttribute("cx")) || w || 1), sy = h / (emu2(chExt?.getAttribute("cy")) || h || 1);
        const items = kids(wgp).filter((e) => ["wsp", "pic", "grpSp"].includes(local(e))).map((e) => {
          const x = e.getElementsByTagNameNS(A, "xfrm")[0], off = child(x, "off"), ext = child(x, "ext");
          const iw = emu2(ext?.getAttribute("cx")) * sx, ih = emu2(ext?.getAttribute("cy")) * sy, il = (num(off?.getAttribute("x")) - ox) / 12700 * sx, it = (num(off?.getAttribute("y")) - oy) / 12700 * sy;
          let html = "";
          if (local(e) === "wsp") html = this.shape(e, iw, ih, "");
          else {
            const blip = e.getElementsByTagNameNS(A, "blip")[0];
            const src = blip && this.image(blip.getAttributeNS(R, "embed") || blip.getAttribute("r:embed"));
            if (src) html = `<img src="${src}" style="width:${pt(iw)};height:${pt(ih)}">`;
          }
          return `<span style="position:absolute;left:${pt(il)};top:${pt(it)}">${html}</span>`;
        });
        return `<span style="display:inline-block;position:relative;width:${pt(w)};height:${pt(h)}">${items.join("")}</span>`;
      }
      vml(node, width) {
        const data = node.getElementsByTagNameNS(V, "imagedata")[0], shape = node.getElementsByTagNameNS(V, "shape")[0];
        const style = shape?.getAttribute("style") ?? "", dim = (k) => {
          const m = new RegExp(k + ":\\s*([\\d.]+)(pt|in|px|cm|mm)?").exec(style);
          if (!m) return void 0;
          const v = parseFloat(m[1]);
          return m[2] === "in" ? v * 72 : m[2] === "cm" ? v * 72 / 2.54 : m[2] === "mm" ? v * 72 / 25.4 : m[2] === "px" ? v * 0.75 : v;
        };
        if (data) {
          const src = this.image(data.getAttributeNS(R, "id") || data.getAttribute("r:id"));
          if (src) return `<img src="${src}" style="${dim("width") ? `width:${pt(dim("width"))};` : ""}${dim("height") ? `height:${pt(dim("height"))};` : ""}">`;
        }
        const box = node.getElementsByTagNameNS(W, "txbxContent")[0];
        if (box) return `<span style="display:inline-block;width:${pt(dim("width") ?? width)};vertical-align:top">${this.blocks(kids(box), dim("width") ?? width)}</span>`;
        const rule = node.getElementsByTagNameNS(V, "rect")[0];
        if (rule?.getAttribute("o:hr") === "t" || rule?.getAttributeNS("urn:schemas-microsoft-com:office:office", "hr") === "t") return `<span style="display:block;border-top:1pt solid ${rule.getAttribute("fillcolor") ?? "#a0a0a0"};margin:2pt 0"></span>`;
        return "";
      }
      // ── Tables ──────────────────────────────────────────────────────────────────────────────────────
      table(tbl, available, inHeader) {
        const tblPr = child(tbl, "tblPr"), styleId = attr(child(tblPr, "tblStyle"), "val") ?? this.defaultTable;
        const chain = this.chain(styleId);
        const prop = (name) => {
          const direct = child(tblPr, name);
          if (direct) return direct;
          for (const s of [...chain].reverse()) {
            const e = child(s.tblPr, name);
            if (e) return e;
          }
          return null;
        };
        const grid = children(child(tbl, "tblGrid"), "gridCol").map((c) => twip2(attr(c, "w")));
        const tblW = child(tblPr, "tblW"), wType = attr(tblW, "type");
        let total = wType === "dxa" ? twip2(attr(tblW, "w")) : wType === "pct" ? (String(attr(tblW, "w")).endsWith("%") ? parseFloat(attr(tblW, "w")) / 100 : num(attr(tblW, "w")) / 5e3) * available : 0;
        const gridTotal = grid.reduce((a, b) => a + b, 0);
        if (!total) total = gridTotal || available;
        const scale = gridTotal && Math.abs(gridTotal - total) > 1 && wType !== "auto" ? total / gridTotal : 1;
        const cols = grid.length ? grid.map((g) => g * scale) : [];
        const borders = {};
        for (const side of ["top", "left", "bottom", "right", "insideH", "insideV", "start", "end"]) {
          let b;
          for (const s of chain) {
            const e2 = child(child(s.tblPr, "tblBorders"), side);
            if (e2) b = this.border(e2);
          }
          const e = child(child(tblPr, "tblBorders"), side);
          if (e) b = this.border(e);
          borders[side === "start" ? "left" : side === "end" ? "right" : side] ??= b ?? null;
        }
        const marginOf = (holder, side) => {
          const e = child(holder, side) ?? child(holder, side === "left" ? "start" : side === "right" ? "end" : side);
          return e ? twip2(attr(e, "w")) : void 0;
        };
        const cellMargins = { top: 0, bottom: 0, left: 5.4, right: 5.4 };
        for (const holder of [...chain.map((s) => child(s.tblPr, "tblCellMar")), child(tblPr, "tblCellMar")]) for (const side of ["top", "bottom", "left", "right"]) {
          const v = marginOf(holder, side);
          if (v !== void 0) cellMargins[side] = v;
        }
        const indent = twip2(attr(prop("tblInd"), "w")), jc = attr(prop("jc"), "val"), layout = attr(prop("tblLayout"), "type") === "fixed";
        const look = child(tblPr, "tblLook"), lookVal = parseInt(attr(look, "val") ?? "0", 16) || 0;
        const flag = (name, bit) => {
          const v = attr(look, name);
          return v !== null ? v === "1" || v === "true" : !!(lookVal & bit);
        };
        const lookFlags = { firstRow: flag("firstRow", 32), lastRow: flag("lastRow", 64), firstColumn: flag("firstColumn", 128), lastColumn: flag("lastColumn", 256), noHBand: flag("noHBand", 512), noVBand: flag("noVBand", 1024) };
        const rows = children(tbl, "tr").concat(...children(tbl, "sdt").map((s) => children(child(s, "sdtContent"), "tr")));
        const layoutRows = rows.map((tr) => {
          let col = num(attr(child(child(tr, "trPr"), "gridBefore"), "val"));
          return children(tr, "tc").concat(...children(tr, "sdt").map((s) => children(child(s, "sdtContent"), "tc"))).map((tc) => {
            const span = num(attr(child(child(tc, "tcPr"), "gridSpan"), "val"), 1);
            const cell = { tc, col, span, rowspan: 1, skip: false };
            col += span;
            return cell;
          });
        });
        layoutRows.forEach((row, r) => row.forEach((cell) => {
          const merge = child(child(cell.tc, "tcPr"), "vMerge");
          if (!merge) return;
          if ((attr(merge, "val") ?? "continue") === "continue") {
            cell.skip = true;
            for (let up = r - 1; up >= 0; up--) {
              const above = layoutRows[up].find((c) => c.col === cell.col);
              if (!above) break;
              if (!above.skip) {
                above.rowspan++;
                break;
              }
            }
          }
        }));
        const tableCss = [`width:${pt(total)}`];
        if (layout || cols.length) tableCss.push("table-layout:fixed");
        if (jc === "center") tableCss.push("margin-left:auto;margin-right:auto");
        else if (jc === "right" || jc === "end") tableCss.push("margin-left:auto");
        else if (indent) tableCss.push(`margin-left:${pt(indent)}`);
        const floating = child(tblPr, "tblpPr");
        if (floating) tableCss.push(`margin-top:${pt(twip2(attr(floating, "topFromText")))};margin-bottom:${pt(twip2(attr(floating, "bottomFromText")))}`);
        const shd = child(prop("shd") ? tblPr : null, "shd");
        const tableFill = shd && attr(shd, "fill") !== "auto" ? hex2(attr(shd, "fill")) : void 0;
        if (tableFill) tableCss.push(`background-color:${tableFill}`);
        const banded = (index, size, noBand, name) => noBand ? void 0 : Math.floor(index / Math.max(size, 1)) % 2 === 0 ? name + "1" : name + "2";
        const rowBand = num(attr(prop("tblStyleRowBandSize"), "val"), 1), colBand = num(attr(prop("tblStyleColBandSize"), "val"), 1);
        const headerRows = lookFlags.firstRow ? 1 : 0;
        const body = [];
        const colCount = Math.max(cols.length, ...layoutRows.map((r) => r.reduce((a, c) => Math.max(a, c.col + c.span), 0)));
        layoutRows.forEach((row, r) => {
          const tr = rows[r], trPr = child(tr, "trPr"), height = child(trPr, "trHeight"), hRule = attr(height, "hRule");
          const trCss = [];
          if (height) trCss.push(`${hRule === "exact" ? "height" : "height"}:${pt(twip2(attr(height, "val")))}`);
          if (onOff(child(trPr, "cantSplit")) === false) trCss.push("break-inside:auto");
          const cells = [];
          const before = num(attr(child(trPr, "gridBefore"), "val"));
          if (before) cells.push(`<td colspan="${before}" style="border:none"></td>`);
          const dataRows = rows.length - headerRows - (lookFlags.lastRow ? 1 : 0);
          row.forEach((cell) => {
            if (cell.skip) return;
            const tcPr = child(cell.tc, "tcPr");
            const kinds = ["wholeTable"];
            const hBand = r >= headerRows && (!lookFlags.lastRow || r < rows.length - 1) ? banded(r - headerRows, rowBand, lookFlags.noHBand, "band") : void 0;
            if (hBand) kinds.push(hBand + "Horz");
            const vBand = banded(cell.col - (lookFlags.firstColumn ? 1 : 0), colBand, lookFlags.noVBand, "band");
            if (vBand && !(lookFlags.firstColumn && cell.col === 0)) kinds.push(vBand + "Vert");
            if (lookFlags.firstColumn && cell.col === 0) kinds.push("firstCol");
            if (lookFlags.lastColumn && cell.col + cell.span >= colCount) kinds.push("lastCol");
            if (lookFlags.firstRow && r < headerRows) kinds.push("firstRow");
            if (lookFlags.lastRow && r === rows.length - 1 && dataRows >= 0) kinds.push("lastRow");
            if (lookFlags.firstRow && r === 0 && lookFlags.firstColumn && cell.col === 0) kinds.push("nwCell");
            if (lookFlags.firstRow && r === 0 && lookFlags.lastColumn && cell.col + cell.span >= colCount) kinds.push("neCell");
            const conditional = chain.flatMap((s) => kinds.map((k) => s.conditional.get(k)).filter((x) => !!x));
            const styleTc = [...chain.map((s) => ({ tcPr: s.tcPr })), ...conditional];
            const pick = (name) => {
              let found = null;
              for (const s of styleTc) {
                const e = child(s.tcPr, name);
                if (e) found = e;
              }
              return child(tcPr, name) ?? found;
            };
            const css = [];
            const lastCol = cell.col + cell.span >= colCount, lastRow = r + cell.rowspan >= rows.length;
            const edge = (side) => {
              let b;
              for (const s of styleTc) {
                const e = child(child(s.tcPr, "tcBorders"), side) ?? child(child(s.tcPr, "tcBorders"), side === "left" ? "start" : side === "right" ? "end" : side);
                if (e) b = this.border(e);
              }
              for (const s of conditional) {
                const e = child(child(s.tblPr, "tblBorders"), side);
                if (e) b = this.border(e);
              }
              const direct = child(child(tcPr, "tcBorders"), side) ?? child(child(tcPr, "tcBorders"), side === "left" ? "start" : side === "right" ? "end" : side);
              if (direct) return this.border(direct);
              if (b !== void 0) return b;
              const outer = side === "top" ? r === 0 : side === "bottom" ? lastRow : side === "left" ? cell.col === 0 : lastCol;
              return outer ? borders[side] : borders[side === "top" || side === "bottom" ? "insideH" : "insideV"];
            };
            for (const side of ["top", "right", "bottom", "left"]) {
              const b = edge(side);
              if (b) css.push(`border-${side}:${this.cssBorder(b)}`);
            }
            const fillEl = pick("shd"), fill = fillEl && attr(fillEl, "fill") !== "auto" ? hex2(attr(fillEl, "fill")) : void 0;
            if (fill) css.push(`background-color:${fill}`);
            const mar = child(tcPr, "tcMar"), margins = { ...cellMargins };
            for (const side of ["top", "bottom", "left", "right"]) {
              const v = marginOf(mar, side);
              if (v !== void 0) margins[side] = v;
            }
            css.push(`padding:${pt(margins.top)} ${pt(margins.right)} ${pt(margins.bottom)} ${pt(margins.left)}`);
            const valign = attr(pick("vAlign"), "val");
            if (valign === "center") css.push("vertical-align:middle");
            else if (valign === "bottom") css.push("vertical-align:bottom");
            const dir = attr(pick("textDirection"), "val");
            if (dir === "btLr") css.push("writing-mode:vertical-rl;transform:rotate(180deg)");
            else if (dir === "tbRl" || dir === "tbRlV") css.push("writing-mode:vertical-rl");
            if (onOff(pick("noWrap"))) css.push("white-space:nowrap");
            const cellWidth = cols.length ? cols.slice(cell.col, cell.col + cell.span).reduce((a, b) => a + b, 0) : (() => {
              const w = child(tcPr, "tcW");
              return attr(w, "type") === "dxa" ? twip2(attr(w, "w")) : total / Math.max(row.length, 1);
            })();
            const inner = Math.max(cellWidth - margins.left - margins.right, 1);
            const content = [];
            let previous;
            const styleParts = [...chain.map((s) => ({ ppr: s.ppr, rpr: s.rpr })), ...conditional.map((c) => ({ ppr: c.ppr, rpr: c.rpr }))];
            for (const block of kids(cell.tc)) {
              const name = local(block);
              if (name === "p") {
                const res = this.paragraph(block, inner, previous, inHeader, styleParts);
                content.push(res.html);
                previous = res.info;
              } else if (name === "tbl") {
                content.push(this.table(block, inner, inHeader));
                previous = void 0;
              } else if (name === "sdt") content.push(this.blocks(kids(child(block, "sdtContent")), inner, inHeader));
            }
            cells.push(`<td${cell.span > 1 ? ` colspan="${cell.span}"` : ""}${cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : ""} style="${css.join(";")}">${content.join("")}</td>`);
          });
          const tag = onOff(child(trPr, "tblHeader")) ? ' data-header="1"' : "";
          body.push(`<tr${tag}${trCss.length ? ` style="${trCss.join(";")}"` : ""}>${cells.join("")}</tr>`);
        });
        let headCount = 0;
        while (headCount < body.length && body[headCount].includes('data-header="1"')) headCount++;
        const colgroup = cols.length ? `<colgroup>${cols.map((c) => `<col style="width:${pt(c)}">`).join("")}</colgroup>` : "";
        const head = headCount ? `<thead>${body.slice(0, headCount).join("")}</thead>` : "";
        return `<table style="${tableCss.join(";")}">${colgroup}${head}<tbody>${body.slice(headCount).join("")}</tbody></table>`;
      }
    };
  }
});

// ../cliqueprojeto/gcp-pdf/src/main/xlsx-html.ts
var xlsx_html_exports = {};
__export(xlsx_html_exports, {
  formatValue: () => formatValue,
  xlsxToHtml: () => xlsxToHtml
});
function color2(c) {
  if (!c) return void 0;
  let hex3 = c.argb ? c.argb.slice(-6) : c.indexed !== void 0 ? INDEXED[c.indexed] : c.theme !== void 0 ? THEME[c.theme] : void 0;
  if (!hex3) return void 0;
  if (c.argb && c.argb.length === 8 && c.argb.slice(0, 2) === "00" && c.argb !== "00000000") {
  }
  const tint = c.tint ?? 0;
  if (tint) {
    const ch = [0, 2, 4].map((i) => parseInt(hex3.slice(i, i + 2), 16)).map((v) => tint < 0 ? v * (1 + tint) : v + (255 - v) * tint);
    hex3 = ch.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
  }
  return "#" + hex3.toLowerCase();
}
function formatValue(value, format) {
  const fmt = (format ?? "General").trim();
  if (value instanceof Date) return { text: formatDate(value, /[dmyhs]/i.test(fmt) && fmt !== "General" ? fmt : "dd/mm/yyyy") };
  if (!fmt || /^general$/i.test(fmt)) return { text: general(value) };
  const sections = splitSections(fmt);
  let section = sections[0], v = value;
  if (sections.length > 1 && value < 0) {
    section = sections[1];
    v = -value;
  } else if (sections.length > 2 && value === 0) section = sections[2];
  const colorMatch = /\[(Red|Blue|Green|Black|White|Yellow|Magenta|Cyan|Vermelho|Azul|Verde|Preto)\]/i.exec(section);
  const named = { red: "#ff0000", vermelho: "#ff0000", blue: "#0000ff", azul: "#0000ff", green: "#008000", verde: "#008000", black: "#000000", preto: "#000000", white: "#ffffff", yellow: "#ffff00", magenta: "#ff00ff", cyan: "#00ffff" };
  section = section.replace(/\[[^\]]*\]/g, (m) => /^\[\$/.test(m) ? m.slice(2, -1).split("-")[0] : "");
  if (/[dmyhs]/i.test(section.replace(/"[^"]*"/g, "")) && !/[0#]/.test(section)) return { text: formatDate(serialToDate(v), section) };
  if (section.trim() === "@") return { text: general(value) };
  const percent = section.includes("%");
  if (percent) v *= 100;
  const exp = /E\+/i.test(section);
  const parts = [];
  let pattern = "", i = 0;
  while (i < section.length) {
    const ch = section[i];
    if (ch === '"') {
      const end = section.indexOf('"', i + 1);
      parts.push(section.slice(i + 1, end < 0 ? void 0 : end));
      i = end < 0 ? section.length : end + 1;
      continue;
    }
    if (ch === "\\") {
      parts.push(section[i + 1] ?? "");
      i += 2;
      continue;
    }
    if (ch === "_") {
      parts.push(" ");
      i += 2;
      continue;
    }
    if (ch === "*") {
      parts.push(" ");
      i += 2;
      continue;
    }
    if ("0#?,.".includes(ch) || ch === "E" && exp || (ch === "+" || ch === "-") && exp && /E$/i.test(pattern)) {
      if (!pattern) parts.push("\0");
      pattern += ch;
      i++;
      continue;
    }
    parts.push(ch === "%" ? "%" : ch);
    i++;
  }
  if (!pattern) return { text: parts.join("").replace("\0", ""), color: colorMatch ? named[colorMatch[1].toLowerCase()] : void 0 };
  let text2;
  if (exp) {
    const decimals = (pattern.split(".")[1] ?? "").replace(/E.*/i, "").length;
    text2 = v.toExponential(decimals).replace(".", ",").replace(/e([+-])(\d)$/, "E$10$2").replace("e", "E");
  } else {
    const [intPattern, decPattern = ""] = pattern.split(".");
    let scaled = v;
    let trailingCommas = /,+$/.exec(intPattern)?.[0].length ?? 0;
    while (trailingCommas-- > 0) scaled /= 1e3;
    const decimals = decPattern.replace(/[^0#?]/g, "").length, minDecimals = decPattern.replace(/[^0]/g, "").length;
    let [whole, frac = ""] = Math.abs(scaled).toFixed(decimals).split(".");
    frac = frac.replace(/0+$/, "");
    if (frac.length < minDecimals) frac = frac.padEnd(minDecimals, "0");
    const minInt = intPattern.replace(/[^0]/g, "").length;
    if (whole === "0" && minInt === 0) whole = "";
    whole = whole.padStart(minInt, "0");
    if (/0,0|#,#|#,0/.test(intPattern)) whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    text2 = (scaled < 0 && sections.length < 2 ? "-" : "") + whole + (frac || decPattern.includes("0") ? "," + frac : "");
  }
  return { text: parts.join("").replace("\0", text2).replace(/^\s+$/, ""), color: colorMatch ? named[colorMatch[1].toLowerCase()] : void 0 };
}
function splitSections(fmt) {
  const out = [];
  let cur = "", quoted = false;
  for (const ch of fmt) {
    if (ch === '"') quoted = !quoted;
    if (ch === ";" && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}
function general(v) {
  if (Number.isInteger(v) && Math.abs(v) < 1e11) return String(v);
  const s = Math.abs(v) >= 1e11 || Math.abs(v) < 1e-9 && v !== 0 ? v.toExponential(5).replace(/\.?0+e/, "e").replace("e+", "E+").replace("e-", "E-") : String(Number(v.toPrecision(10)));
  return s.replace(".", ",");
}
function formatDate(d, fmt) {
  const f = fmt.replace(/"([^"]*)"/g, "$1").replace(/\\(.)/g, "$1");
  const y = d.getUTCFullYear(), mo = d.getUTCMonth(), day = d.getUTCDate(), h = d.getUTCHours(), mi = d.getUTCMinutes(), s = d.getUTCSeconds();
  const ampm = /AM\/PM|A\/P/i.test(f), hh = ampm ? h % 12 || 12 : h;
  let out = "";
  let i = 0;
  let lastWasHour = false;
  while (i < f.length) {
    const rest = f.slice(i), m = /^(yyyy|yy|mmmmm|mmmm|mmm|mm|m|dddd|ddd|dd|d|hh|h|ss|s|AM\/PM|A\/P|\u0001[^\u0001]*\u0001)/i.exec(rest);
    if (!m) {
      out += f[i];
      i++;
      continue;
    }
    const t = m[1], k = t.toLowerCase();
    if (t.startsWith("")) out += t.slice(1, -1);
    else if (k === "yyyy") out += y;
    else if (k === "yy") out += String(y).slice(-2);
    else if (k.startsWith("m") && (lastWasHour || /^:?s/i.test(f.slice(i + t.length).replace(/^[^a-z]*/i, (m2) => m2.includes(":") ? ":" : "")) && k.length <= 2)) out += k === "mm" ? String(mi).padStart(2, "0") : mi;
    else if (k === "mmmmm") out += MONTHS_LONG[mo][0];
    else if (k === "mmmm") out += MONTHS_LONG[mo];
    else if (k === "mmm") out += MONTHS[mo];
    else if (k === "mm") out += String(mo + 1).padStart(2, "0");
    else if (k === "m") out += mo + 1;
    else if (k === "dddd") out += WEEKDAYS[d.getUTCDay()];
    else if (k === "ddd") out += WEEKDAYS[d.getUTCDay()].slice(0, 3);
    else if (k === "dd") out += String(day).padStart(2, "0");
    else if (k === "d") out += day;
    else if (k === "hh") out += String(hh).padStart(2, "0");
    else if (k === "h") out += hh;
    else if (k === "ss") out += String(s).padStart(2, "0");
    else if (k === "s") out += s;
    else if (k === "am/pm") out += h < 12 ? "AM" : "PM";
    else if (k === "a/p") out += h < 12 ? "A" : "P";
    lastWasHour = k === "hh" || k === "h";
    i += t.length;
  }
  return out;
}
function cellText2(cell) {
  const v = cell.value;
  if (v === null || v === void 0) return { text: "", number: false };
  if (typeof v === "number") {
    const f = formatValue(v, cell.numFmt);
    return { ...f, number: true };
  }
  if (v instanceof Date) return { text: formatValue(v, cell.numFmt).text, number: true };
  if (typeof v === "boolean") return { text: v ? "VERDADEIRO" : "FALSO", number: false };
  if (typeof v === "object") {
    const o = v;
    if ("result" in o) {
      const r = o.result;
      if (typeof r === "number" || r instanceof Date) {
        const f = formatValue(r, cell.numFmt);
        return { ...f, number: true };
      }
      if (r && typeof r === "object" && "error" in r) return { text: String(r.error), number: false };
      return { text: r === void 0 || r === null ? "" : String(r), number: false };
    }
    if ("formula" in o || "sharedFormula" in o) return { text: "", number: false };
    if ("richText" in o) {
      const runs = o.richText;
      return { text: runs.map((r) => r.text).join(""), number: false, html: runs.map((r) => `<span style="${fontCss(r.font)}">${escape2(r.text)}</span>`).join("") };
    }
    if ("text" in o) return { text: String(o.text), number: false };
    if ("error" in o) return { text: String(o.error), number: false };
  }
  return { text: String(v), number: false };
}
function fontCss(font) {
  if (!font) return "";
  const css = [];
  if (font.name) css.push(`font-family:${fontStack(font.name)}`);
  if (font.size) css.push(`font-size:${pt2(font.size)}`);
  if (font.bold) css.push("font-weight:700");
  if (font.italic) css.push("font-style:italic");
  const lines2 = [font.underline && font.underline !== "none" ? "underline" : "", font.strike ? "line-through" : ""].filter(Boolean);
  if (lines2.length) css.push(`text-decoration:${lines2.join(" ")}${font.underline === "double" || font.underline === "doubleAccounting" ? " double" : ""}`);
  const c = color2(font.color);
  if (c) css.push(`color:${c}`);
  if (font.vertAlign === "superscript") css.push("vertical-align:super;font-size:smaller");
  else if (font.vertAlign === "subscript") css.push("vertical-align:sub;font-size:smaller");
  return css.join(";");
}
function range(ref) {
  const m = /^\$?([A-Z]+)\$?(\d+)(?::\$?([A-Z]+)\$?(\d+))?$/i.exec((ref ?? "").replace(/^.*!/, "").replace(/'/g, "").split(",")[0].trim());
  if (!m) return void 0;
  const col = (s) => [...s.toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
  return { left: col(m[1]), top: Number(m[2]), right: col(m[3] ?? m[1]), bottom: Number(m[4] ?? m[2]) };
}
function sheetHtml(sheet, workbook, index) {
  if (sheet.state === "hidden" || sheet.state === "veryHidden") return null;
  const setup = sheet.pageSetup ?? {};
  let maxRow = 0, maxCol = 0;
  sheet.eachRow({ includeEmpty: false }, (row, r) => row.eachCell({ includeEmpty: false }, (cell, c) => {
    const has = cell.value !== null && cell.value !== void 0 && cell.value !== "" || !!cell.fill?.fgColor || !!cell.border?.top || !!cell.border?.bottom || !!cell.border?.left || !!cell.border?.right;
    if (has) {
      maxRow = Math.max(maxRow, r);
      maxCol = Math.max(maxCol, c);
    }
  }));
  const images = sheet.getImages();
  for (const img of images) {
    const br = img.range.br, tl = img.range.tl;
    maxRow = Math.max(maxRow, (br?.nativeRow ?? tl.nativeRow + 5) + 1);
    maxCol = Math.max(maxCol, (br?.nativeCol ?? tl.nativeCol + 3) + 1);
  }
  const area = range(setup.printArea);
  const top = area?.top ?? 1, left = area?.left ?? 1, bottom = area?.bottom ?? maxRow, right = area?.right ?? maxCol;
  if (bottom < top || right < left) return null;
  const defaultWidth = sheet.properties.defaultColWidth ?? 8.43, defaultHeight = sheet.properties.defaultRowHeight ?? 15;
  const widths = [];
  for (let c = left; c <= right; c++) {
    const col = sheet.getColumn(c);
    widths.push(col.hidden ? 0 : Math.round((col.width ?? defaultWidth) * 7 + 5) * 0.75);
  }
  const merges = /* @__PURE__ */ new Map(), covered = /* @__PURE__ */ new Set();
  const mergeList = sheet.model.merges ?? [];
  for (const ref of mergeList) {
    const b = range(ref);
    if (!b) continue;
    merges.set(`${b.top}:${b.left}`, { rows: b.bottom - b.top + 1, cols: b.right - b.left + 1 });
    for (let r = b.top; r <= b.bottom; r++) for (let c = b.left; c <= b.right; c++) if (r !== b.top || c !== b.left) covered.add(`${r}:${c}`);
  }
  const gridlines = !!setup.showGridLines || !!sheet.pageSetup?.printOptions?.gridLines;
  const rows = [];
  const rowTops = [];
  let y = 0;
  for (let r = top; r <= bottom; r++) {
    const row = sheet.getRow(r);
    rowTops[r] = y;
    if (row.hidden) {
      continue;
    }
    const height = row.height ?? defaultHeight;
    y += height;
    const cells = [];
    for (let c = left; c <= right; c++) {
      if (covered.has(`${r}:${c}`)) continue;
      const cell = row.getCell(c), merge = merges.get(`${r}:${c}`), info = cellText2(cell), style = cell.style ?? {};
      const css2 = [];
      const font = fontCss(style.font);
      if (font) css2.push(font);
      const fill = style.fill;
      const bg = fill?.type === "pattern" && fill.pattern && fill.pattern !== "none" ? color2(fill.fgColor) ?? color2(fill.bgColor) : fill?.type === "gradient" ? color2(fill.stops?.[0]?.color) : void 0;
      if (bg) css2.push(`background-color:${bg}`);
      for (const side of ["top", "right", "bottom", "left"]) {
        const b = border(style.border?.[side]);
        if (b) css2.push(`border-${side}:${b}`);
        else if (gridlines) css2.push(`border-${side}:.5pt solid #d0d0d0`);
      }
      const a = style.alignment ?? {};
      const h = a.horizontal ?? (info.number ? "right" : typeof cell.value === "boolean" ? "center" : "left");
      css2.push(`text-align:${h === "centerContinuous" ? "center" : h === "distributed" ? "justify" : h === "fill" ? "left" : h}`);
      css2.push(`vertical-align:${a.vertical === "middle" ? "middle" : a.vertical === "top" ? "top" : a.vertical === "distributed" || a.vertical === "justify" ? "middle" : "bottom"}`);
      if (a.wrapText || a.horizontal === "justify" || a.vertical === "justify") css2.push("white-space:pre-wrap");
      else css2.push("white-space:pre");
      if (a.indent) css2.push(`padding-${h === "right" ? "right" : "left"}:${pt2(a.indent * 9 + 2)}`);
      if (info.color) css2.push(`color:${info.color}`);
      const rotation = typeof a.textRotation === "number" ? a.textRotation > 90 ? -(a.textRotation - 90) : a.textRotation : a.textRotation === "vertical" ? "vertical" : 0;
      let content = info.html ?? escape2(info.text);
      if (rotation === "vertical") content = `<span style="writing-mode:vertical-rl;text-orientation:upright">${content}</span>`;
      else if (rotation) content = `<span style="display:inline-block;transform:rotate(${-rotation}deg);white-space:pre">${content}</span>`;
      const next = c < right ? row.getCell(c + 1).value : "end", nextEmpty = next === null || next === void 0 || next === "";
      const spill = !a.wrapText && !merge && !info.number && info.text && h === "left" && nextEmpty ? `<div class="spill">${content}</div>` : content;
      const link = cell.value?.hyperlink;
      const body = link && /^(https?:|mailto:)/i.test(link) ? `<a href="${escape2(link)}">${spill}</a>` : spill;
      cells.push(`<td${merge && merge.cols > 1 ? ` colspan="${merge.cols}"` : ""}${merge && merge.rows > 1 ? ` rowspan="${merge.rows}"` : ""} style="${css2.join(";")}">${body}</td>`);
    }
    rows.push(`<tr style="height:${pt2(height)}">${cells.join("")}</tr>`);
  }
  rowTops[bottom + 1] = y;
  const tableWidth = widths.reduce((a, b) => a + b, 0);
  let [pw, ph] = PAPER[setup.paperSize] ?? PAPER[9];
  if (setup.orientation === "landscape") [pw, ph] = [ph, pw];
  const m = setup.margins ?? { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
  const ml = (m.left ?? 0.7) * 72, mr = (m.right ?? 0.7) * 72, mt = (m.top ?? 0.75) * 72, mb = (m.bottom ?? 0.75) * 72;
  const usable = pw - ml - mr, usableH = ph - mt - mb;
  let zoom = (setup.scale && !setup.fitToPage ? setup.scale : 100) / 100;
  if (setup.fitToPage) {
    const wide = setup.fitToWidth ?? 1, tall = setup.fitToHeight ?? 1;
    const zw = wide ? usable * wide / tableWidth : Infinity, zh = tall ? usableH * tall / y : Infinity;
    zoom = Math.min(1, zw, zh);
  }
  const pictures = images.map((img) => {
    const data = workbook.getImage(Number(img.imageId));
    if (!data) return "";
    const base64 = data.base64?.replace(/^data:[^,]+,/, "") ?? (data.buffer ? Buffer.from(data.buffer).toString("base64") : "");
    if (!base64) return "";
    const tl = img.range.tl, br = img.range.br;
    const ext = img.range.ext;
    const xAt = (col, off = 0) => widths.slice(0, Math.max(col + 1 - left, 0)).reduce((a, b) => a + b, 0) + off / 12700;
    const yAt = (row, off = 0) => (rowTops[row + 1] ?? y) + off / 12700;
    const x0 = xAt(tl.nativeCol, tl.nativeColOff), y0 = yAt(tl.nativeRow, tl.nativeRowOff);
    const w = br ? xAt(br.nativeCol, br.nativeColOff) - x0 : (ext?.width ?? 96) * 0.75, hgt = br ? yAt(br.nativeRow, br.nativeRowOff) - y0 : (ext?.height ?? 96) * 0.75;
    return `<img src="data:image/${data.extension === "jpg" ? "jpeg" : data.extension ?? "png"};base64,${base64}" style="position:absolute;left:${pt2(x0)};top:${pt2(y0)};width:${pt2(w)};height:${pt2(hgt)}">`;
  }).join("");
  const name = `x${index}`;
  const css = `@page ${name}{size:${pt2(pw)} ${pt2(ph)};margin:${pt2(mt)} ${pt2(mr)} ${pt2(mb)} ${pt2(ml)}}`;
  const centered = setup.horizontalCentered ? "margin-left:auto;margin-right:auto;" : "";
  const html = `<section style="page:${name};break-before:${index ? "page" : "auto"}"><div style="zoom:${Math.round(zoom * 1e3) / 1e3};width:${pt2(tableWidth)};${centered}position:relative"><table style="width:${pt2(tableWidth)}"><colgroup>${widths.map((w) => `<col style="width:${pt2(w)}">`).join("")}</colgroup>${rows.join("")}</table>${pictures}</div></section>`;
  return { css, html };
}
async function xlsxToHtml(bytes) {
  const ExcelJS2 = (await import("exceljs")).default, workbook = new ExcelJS2.Workbook();
  try {
    await workbook.xlsx.load(Buffer.from(bytes));
  } catch {
    throw new Error("A planilha est\xE1 danificada ou n\xE3o \xE9 um arquivo .xlsx v\xE1lido.");
  }
  const sheets = workbook.worksheets.map((s, i) => sheetHtml(s, workbook, i)).filter((s) => !!s);
  if (!sheets.length) throw new Error("A planilha est\xE1 vazia: n\xE3o h\xE1 nada para converter.");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${sheets.map((s) => s.css).join("")}
@page{margin:0}html,body{margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Calibri','Carlito',sans-serif;font-size:11pt;color:#000}
table{border-collapse:collapse;table-layout:fixed;border-spacing:0}td{padding:0 2.25pt;overflow:hidden;line-height:1.2}
td:has(.spill){overflow:visible}.spill{width:0;overflow:visible;white-space:pre}tr{break-inside:avoid}a{color:inherit}</style></head><body>${sheets.map((s) => s.html).join("")}</body></html>`;
}
var escape2, pt2, PAPER, INDEXED, THEME, BORDER, border, MONTHS, MONTHS_LONG, WEEKDAYS, serialToDate, SUBS, fontStack;
var init_xlsx_html = __esm({
  "../cliqueprojeto/gcp-pdf/src/main/xlsx-html.ts"() {
    "use strict";
    escape2 = (text2) => text2.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    pt2 = (v) => `${Math.round(v * 100) / 100}pt`;
    PAPER = { 1: [612, 792], 5: [612, 1008], 8: [841.89, 1190.55], 9: [595.28, 841.89], 11: [419.53, 595.28], 13: [515.91, 728.5] };
    INDEXED = ["000000", "FFFFFF", "FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF", "000000", "FFFFFF", "FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF", "800000", "008000", "000080", "808000", "800080", "008080", "C0C0C0", "808080", "9999FF", "993366", "FFFFCC", "CCFFFF", "660066", "FF8080", "0066CC", "CCCCFF", "000080", "FF00FF", "FFFF00", "00FFFF", "800080", "800000", "008080", "0000FF", "00CCFF", "CCFFFF", "CCFFCC", "FFFF99", "99CCFF", "FF99CC", "CC99FF", "FFCC99", "3366FF", "33CCCC", "99CC00", "FFCC00", "FF9900", "FF6600", "666699", "969696", "003366", "339966", "003300", "333300", "993300", "993366", "333399", "333333"];
    THEME = ["FFFFFF", "000000", "E7E6E6", "44546A", "4472C4", "ED7D31", "A5A5A5", "FFC000", "5B9BD5", "70AD47"];
    BORDER = { thin: ".75pt solid", hair: ".5pt solid", dotted: ".75pt dotted", dashDot: ".75pt dashed", dashDotDot: ".75pt dashed", dashed: ".75pt dashed", medium: "1.5pt solid", mediumDashed: "1.5pt dashed", mediumDashDot: "1.5pt dashed", mediumDashDotDot: "1.5pt dashed", slantDashDot: "1.5pt dashed", thick: "2.25pt solid", double: "2.25pt double" };
    border = (b) => b?.style ? `${BORDER[b.style] ?? ".75pt solid"} ${color2(b.color) ?? "#000"}` : void 0;
    MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    MONTHS_LONG = ["janeiro", "fevereiro", "mar\xE7o", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    WEEKDAYS = ["domingo", "segunda-feira", "ter\xE7a-feira", "quarta-feira", "quinta-feira", "sexta-feira", "s\xE1bado"];
    serialToDate = (n) => new Date(Math.round((n - 25569) * 864e5));
    SUBS = { calibri: "Carlito", cambria: "Caladea", arial: "Liberation Sans", "times new roman": "Liberation Serif", "courier new": "Liberation Mono" };
    fontStack = (name) => `'${name.replace(/['"<>&]/g, "")}'${SUBS[name.toLowerCase()] ? `,'${SUBS[name.toLowerCase()]}'` : ""},sans-serif`;
  }
});

// electron/engines/gcp-pdf/_entry.ts
var entry_exports = {};
__export(entry_exports, {
  COMIC_EXTENSIONS: () => COMIC_EXTENSIONS,
  INPUT_EXTENSIONS: () => INPUT_EXTENSIONS,
  analyzeEpub: () => analyzeEpub,
  convertPdf: () => convertPdf,
  docxToHtml: () => docxToHtml,
  extractDocumentText: () => extractDocumentText,
  fiscalXmlToPdf: () => fiscalXmlToPdf,
  libreOfficeCandidates: () => libreOfficeCandidates,
  loadPdf: () => loadPdf,
  officeToPdf: () => officeToPdf,
  readComic: () => readComic,
  readEpubBook: () => readBook2,
  readInputDocument: () => readInputDocument,
  renderPdfPages: () => renderPdfPages,
  toEpub: () => toEpub,
  xlsxToHtml: () => xlsxToHtml
});
module.exports = __toCommonJS(entry_exports);

// ../cliqueprojeto/gcp-pdf/src/main/conversion.ts
var import_node_module = require("node:module");
var import_node_path2 = require("node:path");
var import_node_url = require("node:url");
var import_canvas2 = require("@napi-rs/canvas");
var import_pdf_lib3 = require("pdf-lib");
var import_docx3 = require("docx");
var import_exceljs = __toESM(require("exceljs"));

// ../cliqueprojeto/gcp-pdf/src/main/word-layout.ts
var import_canvas = require("@napi-rs/canvas");
var import_pdf_lib2 = require("pdf-lib");
var import_docx2 = require("docx");

// ../cliqueprojeto/gcp-pdf/src/main/docx-shapes.ts
var EMU = 12700;
var emu = (pt3) => Math.round(pt3 * EMU);
var color = (hex3) => hex3.replace("#", "").toUpperCase();
var alpha = (value) => value < 0.999 ? `<a:alpha val="${Math.max(0, Math.round(value * 1e5))}"/>` : "";
function geometry(shape, w, h) {
  const at = (x, y) => `<a:pt x="${emu(x - shape.box.x)}" y="${emu(y - shape.box.y)}"/>`;
  const parts = shape.segments.map((s) => s.op === "M" ? `<a:moveTo>${at(s.x, s.y)}</a:moveTo>` : s.op === "L" ? `<a:lnTo>${at(s.x, s.y)}</a:lnTo>` : s.op === "C" ? `<a:cubicBezTo>${at(s.x1, s.y1)}${at(s.x2, s.y2)}${at(s.x, s.y)}</a:cubicBezTo>` : "<a:close/>").join("");
  return `<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="r" b="b"/><a:pathLst><a:path w="${w}" h="${h}"${shape.fill ? "" : ' fill="none"'}>${parts}</a:path></a:pathLst></a:custGeom>`;
}
function shapeRun(shape, id, order) {
  const pad = shape.stroke ? shape.stroke.width / 2 : 0, w = Math.max(1, emu(shape.box.width)), h = Math.max(1, emu(shape.box.height));
  const fill = shape.fill ? `<a:solidFill><a:srgbClr val="${color(shape.fill.color)}">${alpha(shape.fill.alpha)}</a:srgbClr></a:solidFill>` : "<a:noFill/>";
  const line = shape.stroke ? `<a:ln w="${Math.max(1, emu(shape.stroke.width))}"><a:solidFill><a:srgbClr val="${color(shape.stroke.color)}">${alpha(shape.stroke.alpha)}</a:srgbClr></a:solidFill>${shape.stroke.dash ? '<a:prstDash val="dash"/>' : ""}</a:ln>` : "<a:ln><a:noFill/></a:ln>";
  return `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="${1e3 + order}" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1"><wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:posOffset>${emu(shape.box.x)}</wp:posOffset></wp:positionH><wp:positionV relativeFrom="page"><wp:posOffset>${emu(shape.box.y)}</wp:posOffset></wp:positionV><wp:extent cx="${w}" cy="${h}"/><wp:effectExtent l="${emu(pad)}" t="${emu(pad)}" r="${emu(pad)}" b="${emu(pad)}"/><wp:wrapNone/><wp:docPr id="${id}" name="Forma ${id}"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"><wps:wsp xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"><wps:cNvSpPr/><wps:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${w}" cy="${h}"/></a:xfrm>${geometry(shape, w, h)}${fill}${line}</wps:spPr><wps:bodyPr/></wps:wsp></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r>`;
}
var shapeMarker = (key2) => `\u27E6GCPVEC${key2}\u27E7`;
async function injectShapes(docx, runs) {
  if (!runs.size) return docx;
  const JSZip = (await import("jszip")).default, zip = await JSZip.loadAsync(docx), file = zip.file("word/document.xml");
  if (!file) return docx;
  let xml = await file.async("string");
  for (const [key2, content] of runs) {
    const marker = shapeMarker(key2), at = xml.indexOf(marker);
    if (at < 0) continue;
    const start = Math.max(xml.lastIndexOf("<w:r>", at), xml.lastIndexOf("<w:r ", at)), end = xml.indexOf("</w:r>", at) + "</w:r>".length;
    xml = xml.slice(0, start) + content + xml.slice(end);
  }
  zip.file("word/document.xml", xml);
  return new Uint8Array(await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

// ../cliqueprojeto/gcp-pdf/src/main/fonts.ts
var import_promises = require("node:fs/promises");
var import_node_os = require("node:os");
var import_node_path = __toESM(require("node:path"));
var EXTENSIONS = /* @__PURE__ */ new Set([".ttf", ".otf", ".ttc", ".otc"]);
function fontFolders(platform = process.platform, env = process.env, home = (0, import_node_os.homedir)()) {
  const join4 = platform === "win32" ? import_node_path.default.win32.join : import_node_path.default.posix.join;
  if (platform === "win32") {
    const local3 = env.LOCALAPPDATA ?? join4(home, "AppData", "Local");
    return [join4(env.WINDIR ?? "C:\\Windows", "Fonts"), join4(local3, "Microsoft", "Windows", "Fonts"), join4(local3, "Microsoft", "FontCache", "4", "CloudFonts")];
  }
  if (platform === "darwin") return [
    "/System/Library/Fonts",
    "/Library/Fonts",
    "/Network/Library/Fonts",
    join4(home, "Library", "Fonts"),
    ...["Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint"].map((app) => `/Applications/${app}.app/Contents/Resources/DFonts`),
    "/System/Library/AssetsV2/com_apple_MobileAsset_Font7",
    "/System/Library/AssetsV2/com_apple_MobileAsset_Font8"
  ];
  const data = [env.XDG_DATA_HOME || join4(home, ".local", "share"), ...(env.XDG_DATA_DIRS || "/usr/local/share:/usr/share").split(":").filter(Boolean), "/usr/share", "/usr/local/share", "/var/lib/flatpak/exports/share", join4(home, ".local", "share", "flatpak", "exports", "share"), join4(home, ".nix-profile", "share"), "/run/current-system/sw/share"];
  return [.../* @__PURE__ */ new Set([...data.map((folder) => join4(folder, "fonts")), join4(home, ".fonts")])];
}
async function walk(folder, depth = 0, seen = /* @__PURE__ */ new Set()) {
  const real = await (0, import_promises.realpath)(folder).catch(() => null);
  if (!real || seen.has(real)) return [];
  seen.add(real);
  const entries = await (0, import_promises.readdir)(folder, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const full = import_node_path.default.join(folder, entry.name);
    let directory = entry.isDirectory(), file = entry.isFile();
    if (entry.isSymbolicLink()) {
      const target = await (0, import_promises.stat)(full).catch(() => null);
      directory = !!target?.isDirectory();
      file = !!target?.isFile();
    }
    if (directory && depth < 6) files.push(...await walk(full, depth + 1, seen));
    else if (file && EXTENSIONS.has(import_node_path.default.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}
function decodeName(bytes, platform) {
  if (platform === 0 || platform === 3) {
    let out = "";
    for (let i = 0; i + 1 < bytes.length; i += 2) out += String.fromCharCode(bytes.readUInt16BE(i));
    return out;
  }
  return bytes.toString("latin1");
}
async function readFace(handle, offset) {
  const head = Buffer.alloc(12);
  await handle.read(head, 0, 12, offset);
  const tables = head.readUInt16BE(4);
  if (tables > 200) return null;
  const directory = Buffer.alloc(16 * tables);
  await handle.read(directory, 0, directory.length, offset + 12);
  const find2 = (tag) => {
    for (let i = 0; i < tables; i++) if (directory.toString("latin1", i * 16, i * 16 + 4) === tag) return { at: directory.readUInt32BE(i * 16 + 8), length: directory.readUInt32BE(i * 16 + 12) };
    return null;
  };
  const nameTable = find2("name"), os2 = find2("OS/2");
  if (!nameTable || nameTable.length > 2e6) return null;
  const names = Buffer.alloc(nameTable.length);
  await handle.read(names, 0, names.length, nameTable.at);
  const count = names.readUInt16BE(2), storage = names.readUInt16BE(4), found = {};
  for (let i = 0; i < count; i++) {
    const record = 6 + i * 12, platform = names.readUInt16BE(record), language = names.readUInt16BE(record + 4), id = names.readUInt16BE(record + 6);
    if (![1, 2, 4, 6, 16, 17].includes(id)) continue;
    const length = names.readUInt16BE(record + 8), start = storage + names.readUInt16BE(record + 10);
    if (start + length > names.length) continue;
    const rank = platform === 3 && language === 1033 ? 3 : platform === 3 ? 2 : platform === 1 && language === 0 ? 1 : 0;
    if (!found[id] || found[id].rank < rank) found[id] = { text: decodeName(names.subarray(start, start + length), platform), rank };
  }
  let weight = 400, italic = false, embeddable = true;
  if (os2 && os2.length >= 64) {
    const table = Buffer.alloc(64);
    await handle.read(table, 0, 64, os2.at);
    weight = table.readUInt16BE(4) || 400;
    italic = (table.readUInt16BE(62) & 1) === 1;
    const fsType = table.readUInt16BE(8);
    embeddable = !(fsType & 2 && !(fsType & 12));
  }
  const family = (found[16] ?? found[1])?.text.trim(), style = (found[17] ?? found[2])?.text.trim() ?? "Regular";
  if (!family) return null;
  return { family, style, legacy: found[1]?.text.trim() || family, legacyStyle: found[2]?.text.trim() || style, postscript: found[6]?.text.trim() ?? family.replace(/\s/g, ""), weight, embeddable, italic: italic || /italic|oblique/i.test(style) };
}
async function readFile_(file) {
  const handle = await (0, import_promises.open)(file, "r");
  try {
    const tag = Buffer.alloc(16);
    await handle.read(tag, 0, 16, 0);
    if (tag.toString("latin1", 0, 4) === "ttcf") {
      const count = Math.min(tag.readUInt32BE(8), 64), offsets = Buffer.alloc(4 * count);
      await handle.read(offsets, 0, offsets.length, 12);
      const faces = [];
      for (let i = 0; i < count; i++) {
        const offset = offsets.readUInt32BE(i * 4), face2 = await readFace(handle, offset);
        if (face2) faces.push({ ...face2, file, collection: true, offset });
      }
      return faces;
    }
    const face = await readFace(handle, 0);
    return face ? [{ ...face, file, collection: false }] : [];
  } finally {
    await handle.close();
  }
}
var catalog;
function systemFonts(cacheFile) {
  catalog ??= (async () => {
    const files = [...new Set((await Promise.all(fontFolders().map((folder) => walk(folder)))).flat())];
    let cache = {};
    if (cacheFile) try {
      cache = JSON.parse(await (0, import_promises.readFile)(cacheFile, "utf8"));
    } catch {
    }
    const next = {}, faces = [];
    await Promise.all(files.map(async (file) => {
      try {
        const info = await (0, import_promises.stat)(file), key2 = `${info.size}:${info.mtimeMs}`;
        const entry = cache[file]?.key === key2 && cache[file].faces.every((f) => f.legacy && f.embeddable !== void 0 && (!f.collection || f.offset !== void 0)) ? cache[file] : { key: key2, faces: await readFile_(file) };
        next[file] = entry;
        faces.push(...entry.faces);
      } catch {
      }
    }));
    if (cacheFile) await (0, import_promises.writeFile)(cacheFile, JSON.stringify(next)).catch(() => {
    });
    return faces.sort((a, b) => a.family.localeCompare(b.family, "pt-BR") || a.weight - b.weight);
  })();
  catalog.catch(() => {
    catalog = void 0;
  });
  return catalog;
}
async function fontFamilies(cacheFile) {
  return [...new Set((await systemFonts(cacheFile)).filter((f) => !/^\./.test(f.family)).map((f) => f.family))];
}
var normal = (value) => value.replace(/^[A-Z]{6}\+/, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
async function faceForPostscript(raw, cacheFile) {
  const wanted = normal(raw.split(",")[0].replace(/-/g, ""));
  if (!wanted) return void 0;
  const faces = await systemFonts(cacheFile);
  return faces.find((f) => normal(f.postscript) === wanted) ?? faces.find((f) => normal(f.family + f.style) === wanted || normal(f.family) === wanted && /regular|normal|book/i.test(f.style));
}
function faceFromCollection(bytes, offset) {
  const source = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (offset + 12 > source.length) throw new Error("Arquivo de fontes inv\xE1lido.");
  const tables = source.readUInt16BE(offset + 4);
  if (tables > 200 || offset + 12 + tables * 16 > source.length) throw new Error("Arquivo de fontes inv\xE1lido.");
  const records = Array.from({ length: tables }, (_, i) => {
    const at2 = offset + 12 + i * 16;
    return { tag: source.subarray(at2, at2 + 4), checksum: source.readUInt32BE(at2 + 4), from: source.readUInt32BE(at2 + 8), length: source.readUInt32BE(at2 + 12) };
  });
  if (records.some((r) => r.from + r.length > source.length)) throw new Error("Arquivo de fontes inv\xE1lido.");
  const header = 12 + tables * 16, out = Buffer.alloc(header + records.reduce((n, r) => n + (r.length + 3 & ~3), 0));
  source.copy(out, 0, offset, offset + 12);
  let at = header;
  records.forEach((r, i) => {
    const entry = 12 + i * 16;
    r.tag.copy(out, entry);
    out.writeUInt32BE(r.checksum, entry + 4);
    out.writeUInt32BE(at, entry + 8);
    out.writeUInt32BE(r.length, entry + 12);
    source.copy(out, at, r.from, r.from + r.length);
    at += r.length + 3 & ~3;
  });
  return new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
}
async function faceBytes(face) {
  const bytes = new Uint8Array(await (0, import_promises.readFile)(face.file));
  return face.collection ? faceFromCollection(bytes, face.offset ?? 0) : bytes;
}
async function faceFor(family, bold, italic, cacheFile) {
  const options = (await systemFonts(cacheFile)).filter((f) => (f.family.toLowerCase() === family.toLowerCase() || f.legacy.toLowerCase() === family.toLowerCase()) && (!f.collection || f.offset !== void 0) && f.embeddable);
  if (!options.length) return void 0;
  const target = bold ? 700 : 400;
  return [...options].sort((a, b) => (a.italic === italic ? 0 : 1e3) - (b.italic === italic ? 0 : 1e3) + Math.abs(a.weight - target) - Math.abs(b.weight - target))[0];
}

// ../cliqueprojeto/gcp-pdf/src/main/text-spacing.ts
async function pageGlyphs(page2) {
  const OPS = (await pdfjs()).OPS, ops = await page2.getOperatorList(), out = { chars: [], colors: [], advance: [], spaceBefore: [] };
  let fill = "#000000", space = 0;
  const stack = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i], args = ops.argsArray[i];
    if (fn === OPS.save) stack.push(fill);
    else if (fn === OPS.restore) fill = stack.pop() ?? fill;
    else if (fn === OPS.setFillRGBColor && typeof args?.[0] === "string") fill = args[0];
    else if (fn === OPS.setFillGray && typeof args?.[0] === "string") fill = args[0];
    else if (fn === OPS.showText || fn === OPS.showSpacedText) {
      for (const glyph of args?.[0] ?? []) {
        if (!glyph || typeof glyph !== "object" || typeof glyph.unicode !== "string") continue;
        const width = Number.isFinite(glyph.width) ? glyph.width / 1e3 : 0;
        if (!glyph.unicode.trim()) {
          space += width;
          continue;
        }
        let first = true;
        for (const c of glyph.unicode) if (c.trim()) {
          out.chars.push(c);
          out.colors.push(fill);
          out.advance.push(first ? width : 0);
          out.spaceBefore.push(space);
          space = 0;
          first = false;
        }
      }
    }
  }
  return out;
}
function locateGlyphs(glyphs, needle, cursor) {
  const fits = (at) => needle.every((c, i) => glyphs.chars[at + i] === c);
  for (let at = cursor; at <= glyphs.chars.length - needle.length && at < cursor + 2e3; at++) if (fits(at)) return at;
  for (let at = 0; at <= glyphs.chars.length - needle.length; at++) if (fits(at)) return at;
  return -1;
}
function letterSpacing(glyphs, at, count, str, width, size, scale = 1) {
  if (at < 0 || count < 2 || !(size > 0) || !(width > 0)) return;
  let natural = 0, gaps = 0, real = 0, text2 = "";
  for (let i = at; i < at + count; i++) {
    const space = i > at ? glyphs.spaceBefore[i] ?? 0 : 0;
    natural += (glyphs.advance[i] ?? 0) + space;
    if (i > at) gaps += space > 0 ? 2 : 1;
    if (space > 0) {
      real++;
      text2 += " ";
    }
    text2 += glyphs.chars[i];
  }
  const invented = (str.match(/\s/g)?.length ?? 0) - real;
  if ((real > 0 || invented > 0) && invented < (count - real) * 0.5) return;
  const tracking = (width / (size * scale) - natural) / gaps;
  if (!Number.isFinite(tracking) || natural <= 0 || Math.abs(tracking) < 0.03 || tracking < -0.2 || tracking > 1.5) return;
  return { tracking: tracking * size * scale, text: text2 };
}

// ../cliqueprojeto/gcp-pdf/src/main/embedded-fonts.ts
var import_pdf_lib = require("pdf-lib");
var SUBSET = /^[A-Z]{6}\+/;
function sfntTables(b) {
  const tables = /* @__PURE__ */ new Map();
  if (b.length < 12) return tables;
  const count = b.readUInt16BE(4);
  for (let i = 0; i < count && 12 + 16 * i + 16 <= b.length; i++) {
    const at = 12 + 16 * i, tag = b.toString("latin1", at, at + 4), offset = b.readUInt32BE(at + 8), length = b.readUInt32BE(at + 12);
    if (offset + length <= b.length) tables.set(tag, { offset, length });
  }
  return tables;
}
function sfntNames(b, table) {
  const base = table.offset, count = b.readUInt16BE(base + 2), strings = base + b.readUInt16BE(base + 4);
  const found = /* @__PURE__ */ new Map();
  for (let i = 0; i < count; i++) {
    const at = base + 6 + 12 * i;
    if (at + 12 > base + table.length) break;
    const platform = b.readUInt16BE(at), encoding = b.readUInt16BE(at + 2), language = b.readUInt16BE(at + 4), id = b.readUInt16BE(at + 6), length = b.readUInt16BE(at + 8), offset = b.readUInt16BE(at + 10);
    if (![1, 2, 4, 16, 17].includes(id) || strings + offset + length > b.length) continue;
    const raw = b.subarray(strings + offset, strings + offset + length);
    let value, rank;
    if (platform === 3 || platform === 0) {
      value = Buffer.from(raw).swap16().toString("utf16le");
      rank = platform === 3 && encoding === 1 && language === 1033 ? 0 : 1;
    } else if (platform === 1 && encoding === 0) {
      value = raw.toString("latin1");
      rank = 2;
    } else continue;
    value = value.replace(/\0/g, "").trim();
    if (value && (!found.has(id) || found.get(id).rank > rank)) found.set(id, { rank, value });
  }
  const get = (id) => found.get(id)?.value;
  return { family: get(16) ?? get(1), style: get(17) ?? get(2) ?? "", full: get(4) ?? "" };
}
function describeSfnt(data) {
  const tag = data.toString("latin1", 0, 4);
  if (!["\0\0\0", "OTTO", "true"].includes(tag)) return null;
  const tables = sfntTables(data), name = tables.get("name"), os2 = tables.get("OS/2");
  if (!name) return null;
  const names = sfntNames(data, name);
  if (!names.family) return null;
  let weight = 400, selection = 0, fsType = 0;
  if (os2 && os2.length >= 64) {
    weight = data.readUInt16BE(os2.offset + 4);
    fsType = data.readUInt16BE(os2.offset + 8);
    selection = data.readUInt16BE(os2.offset + 62);
  }
  const style = `${names.style} ${names.full}`;
  const editable = (fsType & 2) === 0 && (fsType & 512) === 0 && (fsType & 4) === 0;
  return { family: names.family, bold: weight >= 600 || (selection & 32) !== 0 || /\bbold\b/i.test(style), italic: (selection & 1) !== 0 || /italic|oblique/i.test(style), editable, data };
}
async function embeddedFaces(bytes) {
  const faces = /* @__PURE__ */ new Map();
  let doc2;
  try {
    doc2 = await import_pdf_lib.PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true, parseSpeed: import_pdf_lib.ParseSpeeds.Fastest });
  } catch {
    return faces;
  }
  for (const [, object] of doc2.context.enumerateIndirectObjects()) {
    if (!(object instanceof import_pdf_lib.PDFDict) || object.get(import_pdf_lib.PDFName.of("Type"))?.toString() !== "/Font") continue;
    const base = object.get(import_pdf_lib.PDFName.of("BaseFont"))?.toString().slice(1);
    if (!base || faces.has(base)) continue;
    try {
      const descendant = object.lookupMaybe(import_pdf_lib.PDFName.of("DescendantFonts"), import_pdf_lib.PDFArray)?.lookup(0, import_pdf_lib.PDFDict) ?? object;
      const descriptor = descendant.lookupMaybe(import_pdf_lib.PDFName.of("FontDescriptor"), import_pdf_lib.PDFDict);
      if (!descriptor) continue;
      const program = [descriptor.lookup(import_pdf_lib.PDFName.of("FontFile2")), descriptor.lookup(import_pdf_lib.PDFName.of("FontFile3"))].find((v) => v instanceof import_pdf_lib.PDFRawStream);
      const data = program ? Buffer.from((0, import_pdf_lib.decodePDFRawStream)(program).decode()) : null;
      const described = data ? describeSfnt(data) : null;
      if (described) {
        const glyphs = sfntTables(data).get("maxp") ? data.readUInt16BE(sfntTables(data).get("maxp").offset + 4) : 0;
        faces.set(base, { ...described, complete: !SUBSET.test(base) && glyphs > 200 });
        continue;
      }
      const flags = descriptor.lookupMaybe(import_pdf_lib.PDFName.of("Flags"), import_pdf_lib.PDFNumber)?.asNumber() ?? 0;
      const weight = descriptor.lookupMaybe(import_pdf_lib.PDFName.of("FontWeight"), import_pdf_lib.PDFNumber)?.asNumber() ?? 0, stem = descriptor.lookupMaybe(import_pdf_lib.PDFName.of("StemV"), import_pdf_lib.PDFNumber)?.asNumber() ?? 0;
      const angle = descriptor.lookupMaybe(import_pdf_lib.PDFName.of("ItalicAngle"), import_pdf_lib.PDFNumber)?.asNumber() ?? 0;
      const family = descriptor.get(import_pdf_lib.PDFName.of("FontFamily"))?.toString().replace(/^\(|\)$/g, "");
      if (family) faces.set(base, { family, bold: (flags & 262144) !== 0 || weight >= 600 || stem >= 120, italic: (flags & 64) !== 0 || angle !== 0, complete: false, editable: false });
    } catch {
    }
  }
  return faces;
}

// ../cliqueprojeto/gcp-pdf/src/main/table-geometry.ts
var TOL = 2.5;
var white = (c) => /^#f[a-f0-9]f[a-f0-9]f[a-f0-9]$/i.test(c);
function cluster(values) {
  const out = [];
  for (const v of [...values].sort((a, b) => a - b)) if (!out.length || v - out.at(-1) > TOL) out.push(v);
  else out[out.length - 1] = (out.at(-1) + v) / 2;
  return out;
}
function pieces(shape) {
  const boxes = [];
  let xs = [], ys = [];
  const flush = () => {
    if (xs.length) boxes.push({ x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) });
    xs = [];
    ys = [];
  };
  for (const s of shape.segments) {
    if (s.op === "M") flush();
    if (s.op === "Z") continue;
    xs.push(s.x);
    ys.push(s.y);
    if (s.op === "C") {
      xs.push(s.x1, s.x2);
      ys.push(s.y1, s.y2);
    }
  }
  flush();
  return boxes;
}
function strokes(shapes) {
  const segments = [], shades = [];
  let decorative = 0;
  for (const shape of shapes) {
    const curved = shape.segments.some((s) => s.op === "C");
    const parts = pieces(shape);
    const contains2 = (o, i) => i !== o && i.x >= o.x - 0.1 && i.y >= o.y - 0.1 && i.x + i.width <= o.x + o.width + 0.1 && i.y + i.height <= o.y + o.height + 0.1 && i.width * i.height < o.width * o.height;
    const outer2 = shape.fill && shape.fill.alpha > 0.5 && !white(shape.fill.color) ? parts.find((o) => parts.some((i) => contains2(o, i) && i.width > 4 && i.height > 4)) : void 0;
    if (outer2) {
      const inner = parts.filter((i) => contains2(outer2, i)).sort((a, b) => b.width * b.height - a.width * a.height)[0], color3 = shape.fill.color, w = Math.max(0.25, Math.min(inner.x - outer2.x, inner.y - outer2.y, 3));
      segments.push(
        { horizontal: true, at: outer2.y + w / 2, from: outer2.x, to: outer2.x + outer2.width, color: color3, width: w },
        { horizontal: true, at: outer2.y + outer2.height - w / 2, from: outer2.x, to: outer2.x + outer2.width, color: color3, width: w },
        { horizontal: false, at: outer2.x + w / 2, from: outer2.y, to: outer2.y + outer2.height, color: color3, width: w },
        { horizontal: false, at: outer2.x + outer2.width - w / 2, from: outer2.y, to: outer2.y + outer2.height, color: color3, width: w }
      );
      continue;
    }
    for (const b of parts) {
      const thin = Math.min(b.width, b.height), long = Math.max(b.width, b.height);
      if (shape.fill && shape.fill.alpha > 0.5) {
        if (white(shape.fill.color)) continue;
        if (thin <= TOL && long > 4 || thin <= 3.5 && long >= thin * 30) segments.push(b.height <= b.width ? { horizontal: true, at: b.y + b.height / 2, from: b.x, to: b.x + b.width, color: shape.fill.color, width: Math.max(0.25, b.height) } : { horizontal: false, at: b.x + b.width / 2, from: b.y, to: b.y + b.height, color: shape.fill.color, width: Math.max(0.25, b.width) });
        else if (long > 4) {
          shades.push({ box: b, color: shape.fill.color });
          if (curved) decorative++;
        }
      }
      if (shape.stroke && shape.stroke.alpha > 0.5 && !curved) {
        const { color: color3, width } = shape.stroke;
        if (b.height <= TOL && b.width > 4) segments.push({ horizontal: true, at: b.y + b.height / 2, from: b.x, to: b.x + b.width, color: color3, width });
        else if (b.width <= TOL && b.height > 4) segments.push({ horizontal: false, at: b.x + b.width / 2, from: b.y, to: b.y + b.height, color: color3, width });
        else if (b.width > 4 && b.height > 4) segments.push({ horizontal: true, at: b.y, from: b.x, to: b.x + b.width, color: color3, width }, { horizontal: true, at: b.y + b.height, from: b.x, to: b.x + b.width, color: color3, width }, { horizontal: false, at: b.x, from: b.y, to: b.y + b.height, color: color3, width }, { horizontal: false, at: b.x + b.width, from: b.y, to: b.y + b.height, color: color3, width });
      } else if (shape.stroke && curved) decorative++;
    }
  }
  const contains = (o, i) => i !== o && i.x >= o.x - TOL && i.y >= o.y - TOL && i.x + i.width <= o.x + o.width + TOL && i.y + i.height <= o.y + o.height + TOL;
  const outer = shades.filter((s) => !shades.some((o) => o !== s && contains(o.box, s.box) && o.box.width * o.box.height > s.box.width * s.box.height));
  for (const { box: b } of outer) segments.push(
    { horizontal: true, at: b.y, from: b.x, to: b.x + b.width, color: "#000000", width: 0, invisible: true },
    { horizontal: true, at: b.y + b.height, from: b.x, to: b.x + b.width, color: "#000000", width: 0, invisible: true },
    { horizontal: false, at: b.x, from: b.y, to: b.y + b.height, color: "#000000", width: 0, invisible: true },
    { horizontal: false, at: b.x + b.width, from: b.y, to: b.y + b.height, color: "#000000", width: 0, invisible: true }
  );
  segments.sort((a, b) => Number(!!a.invisible) - Number(!!b.invisible));
  return { segments, shades, decorative };
}
function frames(segments) {
  const parent = segments.map((_, i) => i), find2 = (i) => parent[i] === i ? i : parent[i] = find2(parent[i]);
  const touch = (a, b) => a.horizontal === b.horizontal ? Math.abs(a.at - b.at) <= TOL && a.from <= b.to + TOL && b.from <= a.to + TOL : (() => {
    const h = a.horizontal ? a : b, v = a.horizontal ? b : a;
    return v.at >= h.from - TOL && v.at <= h.to + TOL && h.at >= v.from - TOL && h.at <= v.to + TOL;
  })();
  for (let i = 0; i < segments.length; i++) for (let j = i + 1; j < segments.length; j++) if (touch(segments[i], segments[j])) parent[find2(i)] = find2(j);
  const groups = /* @__PURE__ */ new Map();
  segments.forEach((s, i) => {
    const g = groups.get(find2(i)) ?? [];
    g.push(s);
    groups.set(find2(i), g);
  });
  return [...groups.values()];
}
function joined(list) {
  const out = [];
  for (const s of [...list].sort((a, b) => Number(!!a.invisible) - Number(!!b.invisible) || a.at - b.at || a.from - b.from)) {
    const last = out.find((o) => !!o.invisible === !!s.invisible && Math.abs(o.at - s.at) <= TOL && s.from <= o.to + TOL && s.to >= o.from - TOL);
    if (last) {
      last.from = Math.min(last.from, s.from);
      last.to = Math.max(last.to, s.to);
      last.width = Math.max(last.width, s.width);
    } else out.push({ ...s });
  }
  return out;
}
function frameTable(frame, shades, runs, allowEmpty = false) {
  const hs = joined(frame.filter((s) => s.horizontal)), vs = joined(frame.filter((s) => !s.horizontal));
  if (hs.length < 2 || vs.length < 2 || frame.filter((s) => !s.invisible).length < 3) return null;
  const xs = cluster(vs.map((s) => s.at)), ys = cluster(hs.map((s) => s.at));
  if (xs.length < 2 || ys.length < 2) return null;
  const R2 = ys.length - 1, C = xs.length - 1;
  const line = (list, at, from, to) => list.find((s) => Math.abs(s.at - at) <= TOL && s.from <= from + TOL && s.to >= to - TOL);
  const wallRight = (r, c) => !!line(vs, xs[c + 1], ys[r], ys[r + 1]), wallBelow = (r, c) => !!line(hs, ys[r + 1], xs[c], xs[c + 1]);
  const taken = Array.from({ length: R2 }, () => Array(C).fill(false)), cells = [];
  const inside2 = (run2, b) => {
    const cx = run2.x + Math.min(run2.width, run2.size) / 2, cy = run2.baseline - run2.size * 0.35;
    return cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height;
  };
  const insets = [], tops = [];
  for (let r = 0; r < R2; r++) for (let c = 0; c < C; c++) {
    if (taken[r][c]) continue;
    let cols = 1, rows = 1;
    while (c + cols < C && !taken[r][c + cols] && !wallRight(r, c + cols - 1)) cols++;
    grow: while (r + rows < R2) {
      for (let k = 0; k < cols; k++) if (taken[r + rows][c + k] || wallBelow(r + rows - 1, c + k) || k < cols - 1 && wallRight(r + rows, c + k)) break grow;
      if (c + cols < C && !wallRight(r + rows, c + cols - 1)) break;
      if (c > 0 && !wallRight(r + rows, c - 1)) break;
      rows++;
    }
    for (let i = 0; i < rows; i++) for (let k = 0; k < cols; k++) taken[r + i][c + k] = true;
    const box = { x: xs[c], y: ys[r], width: xs[c + cols] - xs[c], height: ys[r + rows] - ys[r] };
    const edge = (s) => s && !s.invisible ? { color: s.color, width: s.width } : void 0;
    const borders = { top: edge(line(hs, box.y, box.x, box.x + box.width)), bottom: edge(line(hs, box.y + box.height, box.x, box.x + box.width)), left: edge(line(vs, box.x, box.y, box.y + box.height)), right: edge(line(vs, box.x + box.width, box.y, box.y + box.height)) };
    const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const within = (s) => s.x >= xs[0] - TOL && s.y >= ys[0] - TOL && s.x + s.width <= xs.at(-1) + TOL && s.y + s.height <= ys.at(-1) + TOL;
    const shade = [...shades].reverse().find((s) => centre.x >= s.box.x && centre.x <= s.box.x + s.box.width && centre.y >= s.box.y && centre.y <= s.box.y + s.box.height && (within(s.box) || s.box.width * s.box.height < box.width * box.height * 4));
    const text2 = cellText(runs.filter((run2) => inside2(run2, box)), box, true);
    if (text2?.inset !== void 0 && text2.align !== "center") insets.push(text2.inset);
    const inCell = runs.filter((run2) => inside2(run2, box));
    if (inCell.length && text2?.valign === "top") tops.push(Math.min(...inCell.map((run2) => run2.baseline - run2.size * 0.95)) - box.y);
    cells.push({ row: r, col: c, rows, cols, borders, fill: shade?.color, text: text2 });
  }
  if (!allowEmpty && !cells.some((c) => c.text)) return null;
  insets.sort((a, b) => a - b);
  const padding = Math.max(0, Math.min(14, insets[Math.floor(insets.length / 2)] ?? 5.4));
  tops.sort((a, b) => a - b);
  const paddingTop = Math.max(0, Math.min(14, tops[Math.floor(tops.length / 2)] ?? 0));
  return { paddingTop, table: { x: xs[0], y: ys[0], width: xs.at(-1) - xs[0], height: ys.at(-1) - ys[0], colW: xs.slice(1).map((x, i) => x - xs[i]), rowH: ys.slice(1).map((y, i) => y - ys[i]), cells }, padding };
}

// ../cliqueprojeto/gcp-pdf/src/main/docx-flow.ts
var import_docx = require("docx");
var MARKER = /^(\d{1,3}[.)]|[a-z][.)]|[ivx]{1,4}[.)]|[•▪●◦‣\-–—*✓✔])$/i;
function listOf(block) {
  const first = block.lines[0], runs = first.runs, head = runs[0].text.trim().split(/\s+/)[0];
  if (!MARKER.test(head)) return void 0;
  const rest = runs[0].text.trim().slice(head.length).trim() ? void 0 : runs[1];
  const textX = rest ? rest.x : runs[0].x + runs[0].width * (head.length + 1) / Math.max(1, runs[0].text.trim().length);
  return { marker: head, textX };
}
async function flowPage(page2, fonts, images, number = page2.pageNumber) {
  const viewport = page2.getViewport({ scale: 1 }), width = viewport.width, height = viewport.height, area = width * height;
  const [{ shapes, painted, reason }, printed] = await Promise.all([vectorShapes(page2), pageRuns(page2, fonts)]);
  const turned = await turnedText(page2).catch(() => []);
  if (turned.reduce((n, t) => n + t.text.length, 0) > printed.reduce((n, r) => n + r.text.length, 0) * 0.3) return null;
  if (!printed.length || reason === "m\xE1scara suave" || reason === "formas demais" || painted.reduce((n, b) => n + Math.max(0, b.width) * Math.max(0, b.height), 0) > area * 0.08) return null;
  const light = (c) => {
    const v = parseInt(c.slice(1), 16);
    return (v >> 16 & 255) * 0.299 + (v >> 8 & 255) * 0.587 + (v & 255) * 0.114 > 200;
  };
  if (printed.filter((r) => light(r.color)).reduce((n, r) => n + r.text.length, 0) > printed.reduce((n, r) => n + r.text.length, 0) * 0.05) return null;
  if (images.some((m) => m.width * m.height > area * 0.3)) return null;
  const parsed = strokes(shapes), { shades, decorative } = parsed;
  const { runs, segments } = decorate(printed, parsed.segments);
  const coloured = shades.filter((s) => s.box.width * s.box.height > area * 0.02);
  if (decorative > 6 || shades.some((s) => s.box.width * s.box.height > area * 0.6)) return null;
  const items = [];
  const tables = [];
  for (const frame of frames(segments)) {
    const built = frameTable(frame, shades, runs);
    if (built) {
      tables.push(built.table);
      items.push({ kind: "table", top: built.table.y, bottom: built.table.y + built.table.height, table: built.table, padding: built.padding, paddingTop: built.paddingTop });
      continue;
    }
    for (const s of frame) if (s.horizontal && !s.invisible && s.to - s.from > width * 0.2) items.push({ kind: "rule", top: s.at - s.width / 2, bottom: s.at + s.width / 2, x: s.from, width: s.to - s.from, color: s.color, thickness: s.width });
  }
  const inTable = (b) => tables.some((t) => b.x >= t.x - TOL && b.y >= t.y - TOL && b.x + b.width <= t.x + t.width + TOL && b.y + b.height <= t.y + t.height + TOL);
  if (coloured.some((s) => !inTable(s.box))) return null;
  let free = runs.filter((r) => !inTable({ x: r.x, y: r.baseline - r.size * 0.7, width: Math.min(r.width, 1), height: r.size * 0.6 }));
  for (const table of looseTables(free, shades)) {
    tables.push(table);
    items.push({ kind: "table", top: table.y, bottom: table.y + table.height, table, padding: 0, paddingTop: 0 });
  }
  free = free.filter((r) => !inTable({ x: r.x, y: r.baseline - r.size * 0.7, width: Math.min(r.width, 1), height: r.size * 0.6 }));
  const blocks = buildBlocks(buildLines(free)).flatMap((block) => {
    const parts = [];
    for (const line of block.lines) {
      const head = line.runs[0].text.trim().split(/\s+/)[0];
      if (!parts.length || MARKER.test(head)) parts.push({ ...block, lines: [line], x: line.x, right: line.right });
      else {
        const p = parts.at(-1);
        p.lines.push(line);
        p.x = Math.min(p.x, line.x);
        p.right = Math.max(p.right, line.right);
      }
    }
    return parts.length > 1 ? parts : [block];
  });
  const merged = [];
  for (const block of blocks.sort((a, b) => a.lines[0].baseline - b.lines[0].baseline)) {
    const last = merged.at(-1), list = last && listOf(last);
    const pitch = last ? block.lines[0].baseline - last.lines.at(-1).baseline : 0;
    if (last && list && !listOf(block) && Math.abs(block.x - list.textX) < 3 && pitch > 0 && pitch < last.size * 1.6 && Math.abs(block.size - last.size) < 0.5) {
      last.lines.push(...block.lines);
      last.right = Math.max(last.right, block.right);
      continue;
    }
    merged.push(block);
  }
  for (const block of merged) {
    const first = block.lines[0], lastLine = block.lines.at(-1);
    const list = listOf(block);
    if (list && block.lines.length >= 2 && block.align === "left") {
      const body = block.lines.slice(0, -1);
      if (body.every((l) => block.right - l.right < Math.max(1.5, block.size * 0.15))) block.align = "justify";
    }
    items.push({ kind: "paragraph", top: first.baseline - first.size * 0.95, bottom: lastLine.baseline + lastLine.size * 0.27, block, ...list ? { list } : {} });
  }
  for (const image of images) if (!inTable(image)) items.push({ kind: "image", top: image.y, bottom: image.y + image.height, image });
  const stamp = turnedImage(turned);
  if (stamp) items.push({ kind: "stamp", top: stamp.y, bottom: stamp.y + stamp.height, image: stamp });
  items.sort((a, b) => a.top - b.top);
  const laid = sideBySide(items);
  if (laid.filter((i) => i.kind === "rule").length > 3 || laid.some((i) => i.kind === "columns")) return null;
  return { width, height, items: laid, runs, number };
}
function decorate(runs, segments) {
  const vertical = segments.filter((s) => !s.horizontal && !s.invisible), used = /* @__PURE__ */ new Set();
  let out = runs;
  for (const s of segments) {
    if (!s.horizontal || s.invisible || s.to - s.from < 2) continue;
    if (vertical.some((v) => v.at >= s.from - TOL && v.at <= s.to + TOL && s.at >= v.from - TOL && s.at <= v.to + TOL)) continue;
    const kind2 = (r) => {
      const below = s.at - r.baseline;
      return s.width > Math.max(1.5, r.size * 0.14) ? null : below >= r.size * 0.02 && below <= r.size * 0.3 ? "underline" : below <= -r.size * 0.17 && below >= -r.size * 0.5 ? "strike" : null;
    };
    const over = out.filter((r) => kind2(r) && r.x < s.to - 0.5 && r.x + r.width > s.from + 0.5);
    if (!over.length) continue;
    const size = Math.max(...over.map((r) => r.size)), row = out.filter((r) => Math.abs(r.baseline - over[0].baseline) < size * 0.3);
    if (s.from < Math.min(...row.map((r) => r.x)) - size * 0.6 || s.to > Math.max(...row.map((r) => r.x + r.width)) + size * 0.6) continue;
    used.add(s);
    out = out.flatMap((r) => {
      const mark = over.includes(r) ? kind2(r) : null;
      if (!mark) return [r];
      return splitRun(r, [s.from, s.to]).map((piece) => {
        const centre = piece.x + piece.width / 2;
        return centre >= s.from - 0.5 && centre <= s.to + 0.5 ? { ...piece, [mark]: true } : piece;
      });
    });
  }
  return { runs: out, segments: segments.filter((s) => !used.has(s)) };
}
function looseTables(runs, shades = []) {
  const box = (r) => ({ top: r.baseline - r.size * 0.8, bottom: r.baseline + r.size * 0.22 });
  const rows = [];
  for (const run2 of [...runs].sort((a, b) => a.baseline - b.baseline)) {
    const b = box(run2), row = rows.at(-1);
    if (row && Math.min(row.bottom, b.bottom) - Math.max(row.top, b.top) > Math.min(row.bottom - row.top, b.bottom - b.top) * 0.25) {
      row.runs.push(run2);
      row.top = Math.min(row.top, b.top);
      row.bottom = Math.max(row.bottom, b.bottom);
    } else rows.push({ runs: [run2], ...b });
  }
  const spans = (row, reach) => {
    const out2 = [];
    for (const r of [...row.runs].sort((a, b) => a.x - b.x)) {
      const last = out2.at(-1);
      if (last && r.x < last.right + r.size * reach) last.right = Math.max(last.right, r.x + r.width);
      else out2.push({ x: r.x, right: r.x + r.width });
    }
    return out2;
  };
  const listed = (row) => MARKER.test([...row.runs].sort((a, b) => a.x - b.x)[0].text.trim().split(/\s+/)[0]);
  const tabular = new Map(rows.map((row) => [row, !listed(row) && spans(row, 0.45).length >= 2])), atoms = new Map(rows.map((row) => [row, spans(row, 0.12)]));
  const pieces2 = (row) => tabular.get(row) ? atoms.get(row) : [];
  const out = [];
  for (let start = 0; start < rows.length; ) {
    if (pieces2(rows[start]).length < 2) {
      start++;
      continue;
    }
    let end = start + 1;
    const size = Math.max(...rows[start].runs.map((r) => r.size));
    while (end < rows.length && pieces2(rows[end]).length >= 2 && rows[end].top - rows[end - 1].bottom < size * 2.2) end++;
    const group = rows.slice(start, end), left = Math.min(...group.flatMap((r) => r.runs.map((l) => l.x))), right = Math.max(...group.flatMap((r) => r.runs.map((l) => l.x + l.width)));
    const marks = [...new Set(group.flatMap((r) => pieces2(r).flatMap((p) => [p.x, p.right])))].sort((a, b) => a - b), gaps = [];
    for (let i = 0; i < marks.length - 1; i++) {
      const from = marks[i], to = marks[i + 1], middle = (from + to) / 2;
      if (to - from < 2.5 || middle <= left || middle >= right) continue;
      const free = group.filter((r) => !pieces2(r).some((p) => p.x < middle && p.right > middle)).length;
      if (free < group.length * 0.7) continue;
      const last = gaps.at(-1);
      if (last && Math.abs(last.to - from) < 0.5) {
        last.to = to;
        if (free > last.free) {
          last.free = free;
          last.at = middle;
        }
      } else gaps.push({ from, to, at: middle, free });
    }
    for (let i = gaps.length - 1; i >= 0; i--) {
      const at = gaps[i].at, side = (pick) => group.filter((r) => pieces2(r).some(pick)).length;
      if (side((p) => p.x >= at) < 2 || side((p) => p.right <= at) < 2) gaps.splice(i, 1);
    }
    const wrapped = group.some((r) => new Set(r.runs.map((l) => Math.round(l.baseline))).size > 1);
    const shaded = shades.some((s) => s.box.x >= left - 6 && s.box.x + s.box.width <= right + 40 && s.box.y >= group[0].top - 6 && s.box.y + s.box.height <= group.at(-1).bottom + 6);
    if (!gaps.length || group.length < 3 || group.length < 4 && !wrapped && !shaded) {
      start = end;
      continue;
    }
    const xs = [left - 2, ...gaps.map((g) => g.at), right + 2];
    const within = shades.filter((s) => s.box.y >= group[0].top - 8 && s.box.y + s.box.height <= group.at(-1).bottom + 8 && s.box.x >= left - 12 && s.box.x <= right);
    if (within.length) xs[xs.length - 1] = Math.max(xs.at(-1), ...within.map((s) => s.box.x + s.box.width));
    const ys = [group[0].top - 1, ...group.slice(1).map((r, i) => (group[i].bottom + r.top) / 2), group.at(-1).bottom + 1];
    const cells = [];
    group.forEach((row, r) => {
      let c = 0;
      while (c < xs.length - 1) {
        let cols = 1;
        const crosses = () => pieces2(row).some((p) => p.x < xs[c + cols] - 1 && p.right > xs[c + cols] + 1 && p.x >= xs[c] - 1);
        while (c + cols < xs.length - 1 && crosses()) cols++;
        const area = { x: xs[c], y: ys[r], width: xs[c + cols] - xs[c], height: ys[r + 1] - ys[r] };
        const inside2 = row.runs.filter((l) => l.x + l.width / 2 >= area.x && l.x + l.width / 2 < area.x + area.width);
        const centre = { x: area.x + area.width / 2, y: area.y + area.height / 2 }, shade = [...shades].reverse().find((s) => centre.x >= s.box.x && centre.x <= s.box.x + s.box.width && centre.y >= s.box.y && centre.y <= s.box.y + s.box.height);
        const text2 = cellText(inside2, area, true, cols > 1);
        cells.push({ row: r, col: c, rows: 1, cols, ...shade ? { fill: shade.color } : {}, ...text2 ? { text: { ...text2, valign: "middle" } } : {} });
        c += cols;
      }
    });
    out.push({ x: xs[0], y: ys[0], width: xs.at(-1) - xs[0], height: ys.at(-1) - ys[0], colW: xs.slice(1).map((x, i) => x - xs[i]), rowH: ys.slice(1).map((y, i) => y - ys[i]), cells });
    start = end;
  }
  return out;
}
function sideBySide(items) {
  const out = [];
  const overlaps = (a, b) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > Math.min(a.bottom - a.top, b.bottom - b.top) * 0.5;
  for (const item of items) {
    if (item.kind !== "paragraph" || item.list) {
      out.push(item);
      continue;
    }
    const row = out.find((o) => (o.kind === "paragraph" && !o.list || o.kind === "line") && overlaps(o, item));
    if (!row) {
      out.push(item);
      continue;
    }
    const blocks = row.kind === "line" ? row.blocks : [row.block];
    if (blocks.some((b) => item.block.x < b.right + 2 && item.block.right > b.x - 2)) {
      out.push(item);
      continue;
    }
    const next = { kind: "line", top: Math.min(row.top, item.top), bottom: Math.max(row.bottom, item.bottom), blocks: [...blocks, item.block].sort((a, b) => a.x - b.x) };
    out[out.indexOf(row)] = next;
  }
  return out.map((item) => {
    if (item.kind !== "line" || item.blocks.every((b) => b.lines.length === 1)) return item;
    const xs = [...item.blocks.map((b) => b.x), Math.max(...item.blocks.map((b) => b.right)) + 2];
    const box = (i) => ({ x: xs[i], y: item.top, width: xs[i + 1] - xs[i], height: item.bottom - item.top });
    const cells = item.blocks.map((b, i) => ({ row: 0, col: i, rows: 1, cols: 1, text: cellText(b.lines.flatMap((l) => l.runs), box(i), true) }));
    return { kind: "columns", top: item.top, bottom: item.bottom, table: { x: xs[0], y: item.top, width: xs.at(-1) - xs[0], height: item.bottom - item.top, colW: xs.slice(1).map((x, i) => x - xs[i]), rowH: [item.bottom - item.top], cells } };
  });
}
function bodyStyle(pages) {
  const weight = /* @__PURE__ */ new Map();
  for (const run2 of pages.flatMap((p) => p.runs)) {
    const k = `${run2.font}|${Math.round(run2.size * 2)}`;
    weight.set(k, (weight.get(k) ?? 0) + run2.text.length);
  }
  const [font, half] = ([...weight].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Calibri|22").split("|");
  return { font, size: Number(half) };
}
var twip = (pt3) => Math.max(0, Math.round(pt3 * 20));
var textOf = (b) => b.lines.map((l) => l.runs.map((r) => r.text).join(" ")).join("/").replace(/\d+/g, "#");
var key = (item) => item.kind === "paragraph" ? `p:${textOf(item.block)}:${Math.round(item.block.x / 4)}` : item.kind === "line" ? `l:${item.blocks.map((b) => textOf(b) + "@" + Math.round(b.x / 4)).join("|")}` : item.kind === "image" || item.kind === "stamp" ? `${item.kind[0]}:${Math.round(item.image.x / 4)}:${Math.round(item.image.width / 4)}x${Math.round(item.image.height / 4)}` : item.kind === "rule" ? `r:${Math.round(item.x / 4)}:${Math.round(item.width / 4)}` : "t";
var numberOf = (item) => item.kind === "paragraph" && item.block.lines.length === 1 ? /^\s*(?:p[áa]gina\s*)?(\d{1,4})(?:\s*(?:de|\/|of)\s*\d{1,4})?\s*$/i.exec(item.block.lines[0].runs.map((r) => r.text).join(" "))?.[1] : void 0;
function splitRepeats(pages) {
  const header = /* @__PURE__ */ new Set(), footer = /* @__PURE__ */ new Set();
  let pageNumber;
  if (pages.length >= 2) {
    const zone = (p, i) => i.bottom < p.height * 0.18 ? "top" : i.top > p.height * 0.82 ? "bottom" : null;
    const counts = /* @__PURE__ */ new Map();
    for (const p of pages) for (const k of new Set(p.items.filter((i) => zone(p, i)).map((i) => zone(p, i) + key(i)))) counts.set(k, (counts.get(k) ?? 0) + 1);
    for (const [k, n] of counts) if (n === pages.length) (k.startsWith("top") ? header : footer).add(k.replace(/^(top|bottom)/, ""));
    const numbers = pages.map((p) => p.items.find((item) => item.top > p.height * 0.82 && numberOf(item) === String(p.number)));
    if (numbers.every(Boolean)) pageNumber = numbers[0];
  }
  return {
    header: pages[0]?.items.filter((i) => i.bottom < pages[0].height * 0.18 && header.has(key(i))) ?? [],
    footer: pages[0]?.items.filter((i) => i.top > pages[0].height * 0.82 && footer.has(key(i))) ?? [],
    pageNumber,
    body: pages.map((p) => p.items.filter((i) => !(i.bottom < p.height * 0.18 && header.has(key(i))) && !(i.top > p.height * 0.82 && footer.has(key(i))) && !(pageNumber && i.top > p.height * 0.82 && numberOf(i) === String(p.number))))
  };
}
function flowSection(pages, totalPages = pages.length, markers = []) {
  const { header, footer, pageNumber, body } = splitRepeats(pages);
  const all2 = body.flat(), width = pages[0].width, height = pages[0].height;
  const lefts = all2.map((i) => i.kind === "paragraph" ? i.block.x : i.kind === "line" ? i.blocks[0].x : i.kind === "table" || i.kind === "columns" ? i.table.x : i.kind === "image" ? i.image.x : i.kind === "stamp" ? Infinity : i.x);
  const left = Math.max(18, lefts.length ? Math.min(...lefts) : width * 0.1);
  const rightEdge = Math.max(...all2.map((i) => i.kind === "paragraph" ? i.block.align === "justify" || i.block.flow ? i.block.right : 0 : i.kind === "table" || i.kind === "columns" ? i.table.x + i.table.width : i.kind === "line" ? i.blocks.at(-1).right : 0), width - left);
  const right = Math.max(18, width - rightEdge);
  const contentWidth = width - left - right;
  const inText = body.map((items) => items.filter((i) => i.kind !== "stamp"));
  const firsts = inText.map((items) => items[0]?.top).filter((t) => t !== void 0);
  const headerBottom = header.length ? Math.max(...header.map((i) => i.bottom)) + 3 : 0;
  const top = Math.max(18, headerBottom, firsts.length ? Math.min(...firsts) : height * 0.1);
  const bottom = Math.max(18, height - Math.max(...inText.map((items) => items.at(-1)?.bottom ?? 0)) - 2);
  const headerTop = header.length ? Math.max(0, Math.min(...header.map((i) => i.top))) : void 0;
  const footerItems = [...footer, ...pageNumber ? [pageNumber] : []];
  const footerTop = footerItems.length ? Math.min(...footerItems.map((i) => i.top)) : void 0, footerBottom = footerItems.length ? Math.max(...footerItems.map((i) => i.bottom)) : void 0;
  const paragraph = (item, before, pageBreak, fields2) => {
    const b = item.block, pitch = b.lines.length > 1 ? (b.lines.at(-1).baseline - b.lines[0].baseline) / (b.lines.length - 1) : b.size * 1.22;
    const centred = b.align === "center" && Math.abs((b.x + b.right) / 2 - (left + contentWidth / 2)) < 8;
    const atRight = !item.list && b.align === "left" && b.lines.length === 1 && left + contentWidth - b.right < 3 && b.x > left + contentWidth * 0.4;
    const indentLeft = item.list ? item.list.textX - left : centred || atRight ? 0 : b.x - left;
    const children3 = [];
    const rewrap = b.flow || b.align === "justify" || !!item.list;
    b.lines.forEach((line, i) => {
      if (i > 0 && !rewrap) children3.push(new import_docx.TextRun({ break: 1 }));
      let runs = line;
      if (i === 0 && item.list) {
        const [head, ...tail] = line.runs, words = head.text.trim(), afterMarker = words.slice(item.list.marker.length).trim();
        children3.push(new import_docx.TextRun({ text: item.list.marker, font: { ascii: head.font, hAnsi: head.font, cs: head.font }, size: Math.round(head.size * 2), bold: head.bold, color: hex6(head.color) }), new import_docx.TextRun({ text: "	", size: Math.round(head.size * 2) }));
        runs = { ...line, runs: afterMarker ? [{ ...head, text: afterMarker }, ...tail] : tail };
      }
      children3.push(...lineRuns(runs, i > 0 && rewrap, fields2));
    });
    return new import_docx.Paragraph({
      alignment: centred || b.align === "center" ? import_docx.AlignmentType.CENTER : atRight || b.align === "right" ? import_docx.AlignmentType.RIGHT : b.align === "justify" ? import_docx.AlignmentType.JUSTIFIED : import_docx.AlignmentType.LEFT,
      indent: { left: twip(indentLeft), ...item.list ? { hanging: twip(item.list.textX - b.x) } : {} },
      ...item.list ? { tabStops: [{ type: import_docx.TabStopType.LEFT, position: twip(indentLeft) }] } : {},
      spacing: { before: twip(before), after: 0, line: Math.round(pitch * 20), lineRule: import_docx.LineRuleType.EXACT },
      pageBreakBefore: pageBreak,
      children: children3
    });
  };
  const picture = (item, before, pageBreak) => {
    const m = item.image, centred = Math.abs(m.x + m.width / 2 - (left + contentWidth / 2)) < 8;
    return new import_docx.Paragraph({ alignment: centred ? import_docx.AlignmentType.CENTER : import_docx.AlignmentType.LEFT, indent: centred ? void 0 : { left: twip(m.x - left) }, spacing: { before: twip(before), after: 0 }, pageBreakBefore: pageBreak, children: [new import_docx.ImageRun({ type: "png", data: m.bytes, transformation: { width: m.width * 96 / 72, height: m.height * 96 / 72 } })] });
  };
  const rule = (item, before, pageBreak) => new import_docx.Paragraph({
    indent: { left: twip(item.x - left), right: twip(left + contentWidth - (item.x + item.width)) },
    pageBreakBefore: pageBreak,
    spacing: { before: twip(Math.max(0, before - 1)), after: 0, line: 20, lineRule: import_docx.LineRuleType.EXACT },
    border: { bottom: { style: import_docx.BorderStyle.SINGLE, size: Math.max(2, Math.min(96, Math.round(item.thickness * 8))), color: hex6(item.color), space: 0 } },
    children: [new import_docx.TextRun({ text: "", size: 2 })]
  });
  const tabbed = (item, before, pageBreak, fields2) => {
    const [first, ...rest] = item.blocks, size = Math.max(...item.blocks.map((b) => b.size));
    const atRight = (b) => left + contentWidth - b.right < 6 && b.x > left + contentWidth / 2;
    const tabStops = rest.map((b) => atRight(b) ? { type: import_docx.TabStopType.RIGHT, position: twip(contentWidth) } : { type: import_docx.TabStopType.LEFT, position: twip(b.x - left) });
    const children3 = [...lineRuns(first.lines[0], false, fields2)];
    for (const b of rest) children3.push(new import_docx.TextRun({ text: "	", size: Math.round(b.size * 2) }), ...lineRuns(b.lines[0], false, fields2));
    return new import_docx.Paragraph({ indent: { left: twip(first.x - left) }, tabStops, spacing: { before: twip(before), after: 0, line: Math.round(size * 1.22 * 20), lineRule: import_docx.LineRuleType.EXACT }, pageBreakBefore: pageBreak, children: children3 });
  };
  const render = (items, start, pageBreak, fields2, marker, last = true) => {
    const out = [];
    let previous = start, breakNext = pageBreak;
    if (marker) {
      out.push(new import_docx.Paragraph({ pageBreakBefore: breakNext, spacing: { before: 0, after: 0, line: 20, lineRule: import_docx.LineRuleType.EXACT }, children: [new import_docx.TextRun({ text: marker, size: 2 })] }));
      breakNext = false;
      previous += 1;
    }
    for (const item of items) {
      if (item.kind === "stamp") {
        const m = item.image;
        out.push(new import_docx.Paragraph({ pageBreakBefore: breakNext, spacing: { before: 0, after: 0, line: 20, lineRule: import_docx.LineRuleType.EXACT }, children: [new import_docx.ImageRun({ type: "png", data: m.bytes, transformation: { width: m.width * 96 / 72, height: m.height * 96 / 72 }, floating: { horizontalPosition: { relative: import_docx.HorizontalPositionRelativeFrom.PAGE, offset: Math.round(m.x * 12700) }, verticalPosition: { relative: import_docx.VerticalPositionRelativeFrom.PAGE, offset: Math.round(m.y * 12700) }, allowOverlap: true, wrap: { type: import_docx.TextWrappingType.NONE } } })] }));
        breakNext = false;
        continue;
      }
      const before = Math.max(0, item.top - previous);
      if (item.kind === "paragraph") out.push(paragraph(item, before, breakNext, fields2));
      else if (item.kind === "image") out.push(picture(item, before, breakNext));
      else if (item.kind === "rule") out.push(rule(item, before, breakNext));
      else if (item.kind === "line") out.push(tabbed(item, before, breakNext, fields2));
      else if (item.kind === "columns") {
        if (breakNext || before > 1) out.push(new import_docx.Paragraph({ pageBreakBefore: breakNext, spacing: { before: 0, after: 0, line: Math.max(20, twip(before)), lineRule: import_docx.LineRuleType.EXACT }, children: [new import_docx.TextRun({ text: "", size: 2 })] }));
        out.push(wordTable(item.table, { indent: item.table.x - left, padding: 0 }));
      } else {
        if (breakNext || before > 1) out.push(new import_docx.Paragraph({ pageBreakBefore: breakNext, spacing: { before: 0, after: 0, line: Math.max(20, twip(before)), lineRule: import_docx.LineRuleType.EXACT }, children: [new import_docx.TextRun({ text: "", size: 2 })] }));
        out.push(wordTable(item.table, { indent: item.table.x - left, padding: item.padding, paddingTop: item.paddingTop }));
      }
      breakNext = false;
      previous = Math.max(previous, item.bottom);
    }
    if (last && out.at(-1) && !(out.at(-1) instanceof import_docx.Paragraph)) out.push(new import_docx.Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: import_docx.LineRuleType.EXACT }, children: [new import_docx.TextRun({ text: "", size: 2 })] }));
    return out;
  };
  const children2 = body.flatMap((items, i) => render(items, top, i > 0, void 0, markers[i], i === body.length - 1));
  const fields = { page: String(pages[0].number), total: String(totalPages) };
  const headerChildren = header.length ? render(header, headerTop, false, fields) : [];
  const footerChildren = footerItems.length ? render(footerItems.filter((i) => i !== pageNumber), footerTop, false, fields) : [];
  if (pageNumber && pageNumber.kind === "paragraph") {
    const b = pageNumber.block, run2 = b.lines[0].runs[0], nearRight = b.right > width - right - 12;
    const previousBottom = footer.length ? Math.max(...footer.map((i) => i.bottom)) : footerTop;
    footerChildren.push(new import_docx.Paragraph({ alignment: nearRight ? import_docx.AlignmentType.RIGHT : b.align === "center" ? import_docx.AlignmentType.CENTER : import_docx.AlignmentType.LEFT, indent: nearRight ? { right: twip(width - right - b.right) } : { left: twip(b.x - left) }, spacing: { before: twip(Math.max(0, pageNumber.top - previousBottom)), after: 0 }, children: [new import_docx.TextRun({ children: [import_docx.PageNumber.CURRENT], font: { ascii: run2.font, hAnsi: run2.font, cs: run2.font }, size: Math.round(run2.size * 2), bold: run2.bold, color: hex6(run2.color) })] }));
  }
  return {
    properties: {
      page: {
        size: { width: twip(width), height: twip(height) },
        margin: {
          top: twip(top),
          // Word keeps the body clear of a taller footer by itself; the margin only needs the PDF's text area.
          bottom: twip(Math.max(18, bottom - 8)),
          left: twip(left),
          right: twip(right),
          header: twip(headerTop ?? 36),
          footer: twip(footerBottom !== void 0 ? Math.max(0, height - footerBottom - 2) : 36)
        }
      }
    },
    ...headerChildren.length ? { headers: { default: new import_docx.Header({ children: headerChildren }) } } : {},
    ...footerChildren.length ? { footers: { default: new import_docx.Footer({ children: footerChildren }) } } : {},
    children: children2
  };
}

// ../cliqueprojeto/gcp-pdf/src/main/word-layout.ts
var multiply = (c, m) => [c[0] * m[0] + c[2] * m[1], c[1] * m[0] + c[3] * m[1], c[0] * m[2] + c[2] * m[3], c[1] * m[2] + c[3] * m[3], c[0] * m[4] + c[2] * m[5] + c[4], c[1] * m[4] + c[3] * m[5] + c[5]];
var apply = (c, x, y) => ({ x: c[0] * x + c[2] * y + c[4], y: c[1] * x + c[3] * y + c[5] });
var hex = (value) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
var OP = { setLineWidth: 2, setDash: 6, setGState: 9, save: 10, restore: 11, transform: 12, stroke: 20, closeStroke: 21, fill: 22, eoFill: 23, fillStroke: 24, eoFillStroke: 25, closeFillStroke: 26, closeEOFillStroke: 27, endPath: 28, clip: 29, eoClip: 30, setStrokeColorN: 53, setFillColorN: 55, setStrokeRGBColor: 58, setFillRGBColor: 59, shadingFill: 62, paintFormXObjectBegin: 74, paintFormXObjectEnd: 75, beginGroup: 76, endGroup: 77, constructPath: 91 };
var MAX_SHAPES = 800;
var EMU_PT = 12700;
var intersect = (a, b) => {
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  return { x, y, width: Math.min(a.x + a.width, b.x + b.width) - x, height: Math.min(a.y + a.height, b.y + b.height) - y };
};
var inside = (a, b) => a.x >= b.x - 0.5 && a.y >= b.y - 0.5 && a.x + a.width <= b.x + b.width + 0.5 && a.y + a.height <= b.y + b.height + 0.5;
function rectangle(path3) {
  const near = (a, c) => Math.abs(a - c) < 0.6, points = path3.segments.filter((s) => s.op !== "Z"), b = path3.box;
  return points.length >= 4 && points.length <= 5 && points.every((p) => p.op !== "C" && (near(p.x, b.x) || near(p.x, b.x + b.width)) && (near(p.y, b.y) || near(p.y, b.y + b.height)));
}
async function vectorShapes(page2) {
  const list = await page2.getOperatorList(), viewport = page2.getViewport({ scale: 1 }), area = viewport.width * viewport.height;
  let state = { ctm: [...viewport.transform], fill: "#000000", stroke: "#000000", fillAlpha: 1, strokeAlpha: 1, width: 1, dash: false, clip: null, clipComplex: false, pattern: false, masked: false, blended: false };
  const stack = [], shapes = [], painted = [];
  let unsupportedReason, firstRaster = Infinity, lastRaster = -1;
  let pending = null, clipNext = false;
  for (let i = 0; i < list.fnArray.length; i++) {
    const fn = list.fnArray[i], args = list.argsArray[i];
    switch (fn) {
      case OP.save:
        stack.push({ ...state });
        break;
      case OP.beginGroup:
        stack.push({ ...state });
        if (args[0]?.smask) {
          state = { ...state, masked: true };
          unsupportedReason ??= "m\xE1scara suave";
        }
        break;
      case OP.restore:
      case OP.endGroup:
        state = stack.pop() ?? state;
        break;
      case OP.transform:
        state.ctm = multiply(state.ctm, args);
        break;
      case OP.paintFormXObjectBegin:
        stack.push({ ...state });
        if (Array.isArray(args[0]) || ArrayBuffer.isView(args[0])) state.ctm = multiply(state.ctm, Array.from(args[0]));
        break;
      case OP.paintFormXObjectEnd:
        state = stack.pop() ?? state;
        break;
      case OP.setLineWidth:
        state.width = Number(args[0]) || 0;
        break;
      case OP.setDash:
        state.dash = Array.isArray(args[0]) && args[0].length > 0;
        break;
      case OP.setFillRGBColor:
        state.fill = hex(args[0]) ?? state.fill;
        state.pattern = false;
        break;
      case OP.setStrokeRGBColor:
        state.stroke = hex(args[0]) ?? state.stroke;
        break;
      case OP.setFillColorN:
      case OP.setStrokeColorN:
        state.pattern = true;
        break;
      case OP.setGState:
        for (const [key2, value] of args[0] ?? []) {
          if (key2 === "ca") state.fillAlpha = Number(value);
          else if (key2 === "CA") state.strokeAlpha = Number(value);
          else if (key2 === "SMask") {
            state.masked = !!value;
            if (value) unsupportedReason ??= "m\xE1scara suave";
          } else if (key2 === "BM") {
            state.blended = value !== "source-over" && value !== "Normal";
            if (state.blended) unsupportedReason ??= "mistura de cores";
          }
        }
        break;
      case OP.shadingFill:
        unsupportedReason ??= "degrad\xEA";
        firstRaster = Math.min(firstRaster, i);
        lastRaster = i;
        painted.push(state.clip ?? { x: 0, y: 0, width: viewport.width, height: viewport.height });
        break;
      case OP.constructPath: {
        const paint = args[0], data = Array.isArray(args[1]) ? args[1][0] : args[1];
        const segments = [];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const add = (x, y) => {
          const p = apply(state.ctm, x, y);
          minX = Math.min(minX, p.x);
          maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y);
          maxY = Math.max(maxY, p.y);
          return p;
        };
        for (let k = 0; data && k < data.length; ) {
          const code = data[k++];
          if (code === 0 || code === 1) {
            const p = add(data[k++], data[k++]);
            const previous = segments.at(-1);
            if (!(code === 0 && previous?.op === "M" && previous.x === p.x && previous.y === p.y)) segments.push({ op: code === 0 ? "M" : "L", ...p });
          } else if (code === 2) {
            const a = add(data[k++], data[k++]), b = add(data[k++], data[k++]), p = add(data[k++], data[k++]);
            segments.push({ op: "C", x1: a.x, y1: a.y, x2: b.x, y2: b.y, x: p.x, y: p.y });
          } else if (code === 3) {
            const a = add(data[k++], data[k++]), p = add(data[k++], data[k++]);
            segments.push({ op: "C", x1: a.x, y1: a.y, x2: a.x, y2: a.y, x: p.x, y: p.y });
          } else if (code === 4) segments.push({ op: "Z" });
          else {
            unsupportedReason ??= "caminho desconhecido";
            firstRaster = Math.min(firstRaster, i);
            lastRaster = i;
            segments.length = 0;
            break;
          }
        }
        pending = segments.length ? { segments, box: { x: minX, y: minY, width: maxX - minX, height: maxY - minY } } : null;
        if (clipNext) {
          clipNext = false;
          if (pending && !rectangle(pending)) state.clipComplex = true;
          if (pending && pending.box.width * pending.box.height < area * 0.97) state.clip = state.clip ? intersect(state.clip, pending.box) : pending.box;
        }
        const filled = [OP.fill, OP.eoFill, OP.fillStroke, OP.eoFillStroke, OP.closeFillStroke, OP.closeEOFillStroke].includes(paint);
        const stroked = [OP.stroke, OP.closeStroke, OP.fillStroke, OP.eoFillStroke, OP.closeFillStroke, OP.closeEOFillStroke].includes(paint);
        if ((filled || stroked) && pending) {
          if (state.masked || state.blended || state.clipComplex) {
            if (state.clipComplex) unsupportedReason ??= "recorte";
            firstRaster = Math.min(firstRaster, i);
            lastRaster = i;
            pending = null;
            break;
          }
          if (state.pattern && filled) {
            unsupportedReason ??= "padr\xE3o";
            firstRaster = Math.min(firstRaster, i);
            lastRaster = i;
            painted.push(state.clip ? intersect(pending.box, state.clip) : pending.box);
            pending = null;
            break;
          }
          if (state.clip && !inside(pending.box, state.clip)) {
            if (!rectangle(pending) || stroked) {
              unsupportedReason ??= "recorte";
              firstRaster = Math.min(firstRaster, i);
              lastRaster = i;
              pending = null;
              break;
            }
            const b = intersect(pending.box, state.clip);
            if (b.width <= 0 || b.height <= 0) {
              pending = null;
              break;
            }
            pending = { box: b, segments: [{ op: "M", x: b.x, y: b.y }, { op: "L", x: b.x + b.width, y: b.y }, { op: "L", x: b.x + b.width, y: b.y + b.height }, { op: "L", x: b.x, y: b.y + b.height }, { op: "Z" }] };
          }
          if ([OP.closeStroke, OP.closeFillStroke, OP.closeEOFillStroke].includes(paint)) pending.segments.push({ op: "Z" });
          const scale = Math.sqrt(Math.abs(state.ctm[0] * state.ctm[3] - state.ctm[1] * state.ctm[2]));
          shapes.push({ ...pending, operation: i, ...filled ? { fill: { color: state.fill, alpha: state.fillAlpha } } : {}, ...stroked ? { stroke: { color: state.stroke, alpha: state.strokeAlpha, width: Math.max(0.25, state.width * scale), dash: state.dash } } : {} });
          if (shapes.length > MAX_SHAPES) return { supported: false, shapes: shapes.slice(0, MAX_SHAPES), reason: "formas demais", painted };
          pending = null;
        }
        break;
      }
      case OP.clip:
      case OP.eoClip:
        clipNext = true;
        break;
      case OP.endPath:
        pending = null;
        break;
    }
  }
  return { supported: !unsupportedReason, shapes, painted, firstRaster, lastRaster, ...unsupportedReason ? { reason: unsupportedReason } : {} };
}
function stripPaths(content) {
  const text2 = Buffer.from(content).toString("latin1"), out = [];
  const PAINT = /* @__PURE__ */ new Set(["f", "F", "f*", "S", "s", "B", "B*", "b", "b*"]), DELIM = /[\s()<>[\]{}/%]/;
  let i = 0, start = 0;
  while (i < text2.length) {
    const c = text2[i];
    if (c === "(") {
      let depth = 0;
      for (; i < text2.length; i++) {
        const d = text2[i];
        if (d === "\\") {
          i++;
          continue;
        }
        if (d === "(") depth++;
        else if (d === ")" && --depth === 0) {
          i++;
          break;
        }
      }
      continue;
    }
    if (c === "%") {
      while (i < text2.length && text2[i] !== "\n" && text2[i] !== "\r") i++;
      continue;
    }
    if (c === "<" && text2[i + 1] !== "<") {
      const end = text2.indexOf(">", i);
      i = end < 0 ? text2.length : end + 1;
      continue;
    }
    if (DELIM.test(c)) {
      i++;
      continue;
    }
    let j = i;
    while (j < text2.length && !DELIM.test(text2[j])) j++;
    const token = text2.slice(i, j);
    if (token === "ID") {
      const end = text2.indexOf("EI", j);
      i = end < 0 ? text2.length : end + 2;
      continue;
    }
    if (PAINT.has(token)) {
      out.push(text2.slice(start, i), "n");
      start = j;
    }
    i = j;
  }
  out.push(text2.slice(start));
  return Buffer.from(out.join(""), "latin1");
}
function imageNames(context, resources) {
  const names = /* @__PURE__ */ new Set(), objects = resources?.lookupMaybe(import_pdf_lib2.PDFName.of("XObject"), import_pdf_lib2.PDFDict);
  if (!objects) return names;
  for (const [name, value] of objects.entries()) {
    const target = value instanceof import_pdf_lib2.PDFRef ? context.lookup(value) : value;
    if (target instanceof import_pdf_lib2.PDFRawStream && target.dict.get(import_pdf_lib2.PDFName.of("Subtype"))?.toString() === "/Image") names.add(name.asString().slice(1));
  }
  return names;
}
function hideContent(content, images, paths = false) {
  const text2 = Buffer.from(paths ? stripPaths(content) : content).toString("latin1");
  let hidden = text2.replace(/(^|[\s\]>)}])BT(?=[\s/[<(])/g, "$1BT 3 Tr").replace(/(^|[\s\]>)}])[0-7](?=\s+Tr(?=[\s/[<(]|$))/g, "$13");
  if (images.size) hidden = hidden.replace(/\/([^\s/[\]<>(){}%]+)\s+Do(?=[\s/[<(]|$)/g, (all2, name) => images.has(name) ? "" : all2);
  return Buffer.from(hidden, "latin1");
}
function rewriteStream(context, ref, seen, inherited, withImages, paths = false) {
  const key2 = ref.toString();
  if (seen.has(key2)) return;
  seen.add(key2);
  const stream = context.lookup(ref);
  if (!(stream instanceof import_pdf_lib2.PDFRawStream)) return;
  const decoded = (0, import_pdf_lib2.decodePDFRawStream)(stream).decode();
  const dict = stream.dict.clone(context), resources = dict.lookupMaybe(import_pdf_lib2.PDFName.of("Resources"), import_pdf_lib2.PDFDict) ?? inherited;
  dict.delete(import_pdf_lib2.PDFName.of("Filter"));
  dict.delete(import_pdf_lib2.PDFName.of("DecodeParms"));
  dict.delete(import_pdf_lib2.PDFName.of("Length"));
  context.assign(ref, context.flateStream(hideContent(decoded, withImages ? /* @__PURE__ */ new Set() : imageNames(context, resources), paths), Object.fromEntries([...dict.entries()].map(([name, value]) => [name.asString().slice(1), value]))));
  if (resources) rewriteForms(context, resources, seen, withImages, paths);
}
function rewriteForms(context, resources, seen, withImages, paths = false) {
  const objects = resources.lookupMaybe(import_pdf_lib2.PDFName.of("XObject"), import_pdf_lib2.PDFDict);
  if (!objects) return;
  for (const [, value] of objects.entries()) {
    if (!(value instanceof import_pdf_lib2.PDFRef)) continue;
    const target = context.lookup(value);
    if (target instanceof import_pdf_lib2.PDFRawStream && target.dict.get(import_pdf_lib2.PDFName.of("Subtype"))?.toString() === "/Form") rewriteStream(context, value, seen, resources, withImages, paths);
  }
}
async function artworkOnly(bytes, withImages = true, withoutPaths = /* @__PURE__ */ new Set()) {
  const doc2 = await import_pdf_lib2.PDFDocument.load(bytes, { updateMetadata: false, parseSpeed: import_pdf_lib2.ParseSpeeds.Fastest }), seen = /* @__PURE__ */ new Set();
  for (const [index, page2] of doc2.getPages().entries()) {
    const paths = withoutPaths.has(index);
    const contents = page2.node.get(import_pdf_lib2.PDFName.of("Contents")), resources = page2.node.Resources();
    const refs = contents instanceof import_pdf_lib2.PDFRef ? [contents] : contents instanceof import_pdf_lib2.PDFArray ? contents.asArray().filter((v) => v instanceof import_pdf_lib2.PDFRef) : [];
    for (const ref of refs) rewriteStream(doc2.context, ref, seen, resources, withImages, paths);
    if (resources) rewriteForms(doc2.context, resources, seen, withImages, paths);
  }
  return doc2.save({ useObjectStreams: false, objectsPerTick: Infinity });
}
var SEGOE = /^SegoeUI(Black|Semibold|Semilight|Light|Emoji|Symbol|Historic)?/i;
function wordFont(raw) {
  const name = raw.replace(/^[A-Z]{6}\+/, "").replace(/,/, "-");
  const italic = /italic|oblique/i.test(name);
  const segoe = SEGOE.exec(name.replace(/[-\s]/g, ""));
  if (segoe) {
    const variant = segoe[1] ? segoe[1][0].toUpperCase() + segoe[1].slice(1).toLowerCase() : "";
    return { family: variant ? `Segoe UI ${variant}` : "Segoe UI", bold: /-?bold/i.test(name) && !variant, italic };
  }
  const bold = /bold|black|heavy|semibold|demibold|extrabold/i.test(name);
  const base = name.split("-")[0].replace(/(PSMT|PS|MT)$/, "");
  const known = { Arial: "Arial", Helvetica: "Arial", TimesNewRoman: "Times New Roman", Times: "Times New Roman", CourierNew: "Courier New", Courier: "Courier New", Calibri: "Calibri", Cambria: "Cambria", Verdana: "Verdana", Tahoma: "Tahoma", Georgia: "Georgia", Consolas: "Consolas" };
  const family = known[base] ?? base.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/(Bold|Regular|Medium|Light|Black|Semibold|Italic)$/i, "").trim();
  return { family: family || "Arial", bold, italic };
}
var METRIC_TWINS = {
  calibri: ["Carlito"],
  cambria: ["Caladea"],
  arial: ["Liberation Sans", "Arimo", "Helvetica"],
  helvetica: ["Arial", "Liberation Sans", "Arimo"],
  "times new roman": ["Liberation Serif", "Tinos", "Times"],
  times: ["Times New Roman", "Liberation Serif", "Tinos"],
  "courier new": ["Liberation Mono", "Cousine", "Courier"],
  courier: ["Courier New", "Liberation Mono"],
  carlito: ["Calibri"],
  caladea: ["Cambria"],
  "liberation sans": ["Arial"],
  "liberation serif": ["Times New Roman"],
  "liberation mono": ["Courier New"]
};
var OFFICE_FONTS = /* @__PURE__ */ new Set(["arial", "arial narrow", "arial black", "calibri", "calibri light", "cambria", "candara", "comic sans ms", "consolas", "constantia", "corbel", "courier new", "georgia", "segoe ui", "symbol", "tahoma", "times new roman", "trebuchet ms", "verdana", "wingdings"]);
var FontContext = class _FontContext {
  constructor(faces = /* @__PURE__ */ new Map(), canEmbed = false) {
    this.faces = faces;
    this.canEmbed = canEmbed;
  }
  faces;
  canEmbed;
  missing = /* @__PURE__ */ new Map();
  embedded = /* @__PURE__ */ new Map();
  static async of(bytes, canEmbed) {
    return new _FontContext(await embeddedFaces(bytes).catch(() => /* @__PURE__ */ new Map()), canEmbed);
  }
  /** Embedded faces in the shape the docx writer takes; a family with only a bold face uses it as regular too. */
  docxFonts() {
    return [...this.embedded].flatMap(([name, f]) => {
      const data = f.regular ?? f.bold ?? f.italic ?? f.boldItalic;
      return data ? [{ name, data, ...f.bold ? { bold: f.bold } : {}, ...f.italic ? { italic: f.italic } : {}, ...f.boldItalic ? { boldItalic: f.boldItalic } : {} }] : [];
    });
  }
  /** The family Office should use. Installed fonts are used as they are. A missing font the PDF carries
   * complete, whose licence allows editing, travels inside the document; otherwise a font with the same
   * widths is preferred, then a close family, so lines do not overflow. */
  async family(family, generic2, face) {
    const installed = new Set((await fontFamilies().catch(() => [])).map((f) => f.toLowerCase()));
    if (!installed.size || installed.has(family.toLowerCase()) || OFFICE_FONTS.has(family.toLowerCase())) return family;
    if (this.canEmbed && face?.data && face.complete && face.editable) {
      const slot = face.bold ? face.italic ? "boldItalic" : "bold" : face.italic ? "italic" : "regular", entry = this.embedded.get(family) ?? {};
      entry[slot] ??= face.data;
      this.embedded.set(family, entry);
      return family;
    }
    const twin = METRIC_TWINS[family.toLowerCase()]?.find((f) => installed.has(f.toLowerCase()));
    const serif = /serif/i.test(generic2 ?? "") && !/sans/i.test(generic2 ?? "") || /slab|serif|times|garamond|georgia|book|roman|minion|merriweather|lora|playfair|caslon|cambria|caladea/i.test(family);
    const mono = /mono/i.test(generic2 ?? "") || /mono|courier|code|consol/i.test(family);
    const substitute = twin ?? [mono ? "Consolas" : serif ? "Cambria" : "Segoe UI", mono ? "Liberation Mono" : serif ? "Liberation Serif" : "Liberation Sans", "Arial"].find((f) => installed.has(f.toLowerCase())) ?? "Arial";
    this.missing.set(family, substitute);
    return substitute;
  }
};
var metrics = /* @__PURE__ */ new Map();
async function fitTracking(family, bold, italic, text2, width, size) {
  const key2 = `${family}|${bold}|${italic}`;
  let font = metrics.get(key2);
  if (!font) {
    font = faceFor(family, bold, italic).then(async (face) => face ? (await import("@pdf-lib/fontkit")).default.create(Buffer.from(await faceBytes(face))) : null).catch(() => null);
    metrics.set(key2, font);
  }
  const loaded = await font, gaps = [...text2].length - 1;
  if (!loaded || gaps < 1 || !(width > 0)) return void 0;
  const natural = loaded.layout(text2).advanceWidth / loaded.unitsPerEm * size, tracking = (width - natural) / gaps;
  return Math.abs(tracking) < size * 4e-3 || Math.abs(tracking) > size * 0.25 ? void 0 : tracking;
}
async function turnedText(page2) {
  const engine = await pdfjs(), viewport = page2.getViewport({ scale: 1 });
  const palette = await pageGlyphs(page2), content = await page2.getTextContent(), out = [];
  let cursor = 0;
  for (const item of content.items) {
    if (!("str" in item) || !item.str.trim()) continue;
    const t = engine.Util.transform(viewport.transform, item.transform), size = Math.hypot(t[2], t[3]);
    const visible = [...item.str].filter((c) => c.trim()), at = locateGlyphs(palette, visible.slice(0, 8), cursor);
    if (at >= 0) cursor = at + visible.length;
    if (!Number.isFinite(size) || size < 1 || Math.abs(t[1]) <= 0.01 * size) continue;
    let raw = "";
    try {
      raw = page2.commonObjs.get(item.fontName)?.name ?? "";
    } catch {
    }
    const style = wordFont(raw || content.styles[item.fontName]?.fontFamily || "Arial");
    out.push({ text: item.str, x: t[4], y: t[5], angle: Math.atan2(t[1], t[0]) * 180 / Math.PI, width: Math.max(item.width, 1), size, font: style.family, bold: style.bold, italic: style.italic, color: at >= 0 ? palette.colors[at] : "#000000" });
  }
  return out;
}
function turnedBox(t) {
  const a = t.angle * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a);
  const corners = [[0, t.size * 0.3], [t.width, t.size * 0.3], [0, -t.size], [t.width, -t.size]].map(([along, up]) => ({ x: t.x + cos * along - sin * up, y: t.y + sin * along + cos * up }));
  const x = Math.min(...corners.map((c) => c.x)), y = Math.min(...corners.map((c) => c.y));
  return { x, y, width: Math.max(...corners.map((c) => c.x)) - x, height: Math.max(...corners.map((c) => c.y)) - y };
}
function drawTurned(context, items, k, ox = 0, oy = 0) {
  for (const t of items) {
    context.save();
    context.translate((t.x - ox) * k, (t.y - oy) * k);
    context.rotate(t.angle * Math.PI / 180);
    context.font = `${t.italic ? "italic " : ""}${t.bold ? "bold " : ""}${t.size * k}px "${t.font}", Arial, sans-serif`;
    context.fillStyle = t.color;
    context.textBaseline = "alphabetic";
    context.fillText(t.text, 0, 0, t.width * k);
    context.restore();
  }
}
function turnedImage(items, dpi = 200) {
  if (!items.length) return null;
  const boxes = items.map(turnedBox), x = Math.min(...boxes.map((b) => b.x)) - 1, y = Math.min(...boxes.map((b) => b.y)) - 1;
  const width = Math.max(...boxes.map((b) => b.x + b.width)) + 1 - x, height = Math.max(...boxes.map((b) => b.y + b.height)) + 1 - y, k = dpi / 72;
  if (width * height * k * k > 4e7) return null;
  const canvas = (0, import_canvas.createCanvas)(Math.max(1, Math.ceil(width * k)), Math.max(1, Math.ceil(height * k)));
  drawTurned(canvas.getContext("2d"), items, k, x, y);
  return { bytes: canvas.toBuffer("image/png"), x, y, width, height };
}
async function pageRuns(page2, fonts = new FontContext()) {
  const engine = await pdfjs(), viewport = page2.getViewport({ scale: 1 });
  const palette = await pageGlyphs(page2), content = await page2.getTextContent();
  const runs = [];
  let cursor = 0, pendingSpace = false;
  for (const item of content.items) {
    if (!("str" in item)) continue;
    if (!item.str.trim()) {
      if (item.str.length) pendingSpace = true;
      continue;
    }
    const t = engine.Util.transform(viewport.transform, item.transform), size = Math.hypot(t[2], t[3]);
    if (!Number.isFinite(size) || size < 1 || Math.abs(t[1]) > 0.01 * size) continue;
    let raw = "";
    try {
      const font = page2.commonObjs.get(item.fontName);
      raw = font?.name ?? "";
    } catch {
    }
    const face = raw ? await faceForPostscript(raw) : void 0, own = raw ? fonts.faces.get(raw) : void 0;
    const style = face ? { family: face.legacy, bold: /bold/i.test(face.legacyStyle), italic: face.italic } : own ? { family: own.family, bold: own.bold, italic: own.italic } : wordFont(raw || content.styles[item.fontName]?.fontFamily || "Arial");
    const wanted = style.family;
    if (!face) style.family = await fonts.family(style.family, content.styles[item.fontName]?.fontFamily, own);
    if (/^(symbol|wingdings( \d)?|webdings|zapf ?dingbats|dingbats)$/i.test(style.family) && !/[\uE000-\uF8FF]/.test(item.str)) style.family = "Arial";
    const substituted = !face && style.family !== wanted && fonts.missing.get(wanted) === style.family;
    const visible = [...item.str].filter((c) => c.trim()), at = locateGlyphs(palette, visible.slice(0, 8), cursor);
    const color3 = at >= 0 ? palette.colors[at] : palette.colors[cursor] ?? "#000000";
    if (at >= 0) cursor = at + visible.length;
    const scale = Math.hypot(t[0], t[1]) / size || 1, spaced = letterSpacing(palette, at, visible.length, item.str, item.width, size, scale);
    const fitted = !spaced && substituted ? await fitTracking(style.family, style.bold, style.italic, item.str, item.width, size * scale) : void 0;
    runs.push({ text: spaced?.text ?? item.str, x: t[4], baseline: t[5], width: Math.max(item.width, 0.5), size, font: style.family, bold: style.bold, italic: style.italic, color: color3, space: pendingSpace, ...spaced ? { tracking: spaced.tracking } : fitted ? { tracking: fitted } : {}, ...Math.abs(scale - 1) > 0.02 ? { scale } : {} });
    pendingSpace = false;
  }
  return markScripts(await linkRuns(page2, runs));
}
var charWeight = (c) => /[iljtfrI.,;:!|'’ ]/.test(c) ? 0.5 : /[mwMW@—]/.test(c) ? 1.5 : /[A-Z0-9]/.test(c) ? 1.15 : 1;
function splitRun(run2, cuts) {
  const chars = [...run2.text], total = chars.reduce((n, c) => n + charWeight(c), 0) || 1, edges = [];
  for (const cut of [...cuts].sort((a, b) => a - b)) {
    if (cut <= run2.x + run2.size * 0.2 || cut >= run2.x + run2.width - run2.size * 0.2) continue;
    let sum = 0, at = 0;
    const target = (cut - run2.x) / run2.width * total;
    while (at < chars.length && sum + charWeight(chars[at]) / 2 < target) sum += charWeight(chars[at++]);
    if (at > (edges.at(-1) ?? 0) && at < chars.length) edges.push(at);
  }
  if (!edges.length) return [run2];
  const out = [];
  let start = 0, x = run2.x;
  for (const end of [...edges, chars.length]) {
    const piece = chars.slice(start, end), width = run2.width * piece.reduce((n, c) => n + charWeight(c), 0) / total;
    out.push({ ...run2, text: piece.join(""), x, width, space: start === 0 && run2.space });
    x += width;
    start = end;
  }
  return out;
}
async function linkRuns(page2, runs) {
  const viewport = page2.getViewport({ scale: 1 }), annotations = await page2.getAnnotations().catch(() => []);
  const links = annotations.flatMap((a) => {
    if (a?.subtype !== "Link" || typeof a.url !== "string" || !/^(https?:|mailto:)/i.test(a.url) || !Array.isArray(a.rect)) return [];
    const [x1, y1] = viewport.convertToViewportPoint(a.rect[0], a.rect[1]), [x2, y2] = viewport.convertToViewportPoint(a.rect[2], a.rect[3]);
    return [{ url: a.url, x: Math.min(x1, x2), right: Math.max(x1, x2), y: Math.min(y1, y2), bottom: Math.max(y1, y2) }];
  });
  if (!links.length) return runs;
  return runs.flatMap((run2) => {
    const middle = run2.baseline - run2.size * 0.3, over = links.filter((l) => middle >= l.y && middle <= l.bottom && l.x < run2.x + run2.width && l.right > run2.x);
    if (!over.length) return [run2];
    return splitRun(run2, over.flatMap((l) => [l.x, l.right])).map((piece) => {
      const centre = piece.x + piece.width / 2, link = over.find((l) => centre >= l.x && centre <= l.right);
      return link ? { ...piece, link: link.url } : piece;
    });
  });
}
function markScripts(runs) {
  const out = runs.map((r) => ({ ...r }));
  for (const [i, run2] of runs.entries()) {
    const base = runs.find((b) => {
      if (b === run2 || b.size < run2.size * 1.2) return false;
      const gap = Math.max(run2.x - (b.x + b.width), b.x - (run2.x + run2.width));
      if (gap < -b.size * 0.15 || gap > b.size * 0.6) return false;
      const raised = b.baseline - run2.baseline;
      return raised > b.size * 0.18 && raised < b.size * 0.75 || raised < -b.size * 0.05 && raised > -b.size * 0.45;
    });
    if (!base) continue;
    out[i] = { ...run2, script: base.baseline > run2.baseline ? "super" : "sub", baseline: base.baseline, size: base.size, color: run2.color };
  }
  return out;
}
function buildLines(runs) {
  const rows = [];
  for (const run2 of [...runs].sort((a, b) => a.baseline - b.baseline || a.x - b.x)) {
    const row = rows.find((r) => Math.abs(r[0].baseline - run2.baseline) <= Math.max(1.5, Math.min(r[0].size, run2.size) * 0.3));
    if (row) row.push(run2);
    else rows.push([run2]);
  }
  const lines2 = [];
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    let current = [];
    const flush = () => {
      if (current.length) lines2.push({ runs: current, x: current[0].x, right: Math.max(...current.map((r) => r.x + r.width)), baseline: Math.max(...current.map((r) => r.baseline)), size: Math.max(...current.map((r) => r.size)) });
      current = [];
    };
    for (const run2 of row) {
      const last = current.at(-1), gap = last ? run2.x - (last.x + last.width) : 0;
      const resized = last && Math.abs(last.size - run2.size) > last.size * 0.15, recoloured = last && last.color !== run2.color;
      if (last && (gap > Math.max(10, last.size * 1.6) || resized && gap > last.size * 0.45 || recoloured && gap > last.size * 0.9)) flush();
      current.push(run2);
    }
    flush();
  }
  return lines2.sort((a, b) => a.baseline - b.baseline || a.x - b.x);
}
function buildBlocks(lines2) {
  const blocks = [];
  for (const line of lines2) {
    const center = (line.x + line.right) / 2;
    const block = blocks.find((b) => {
      const last2 = b.lines.at(-1), gap = line.baseline - last2.baseline;
      if (gap <= 0 || gap > Math.max(last2.size, line.size) * 1.75 || Math.abs(line.size - last2.size) > last2.size * 0.12) return false;
      const sameLeft = Math.abs(line.x - last2.x) < 2.5, sameCenter = Math.abs(center - (last2.x + last2.right) / 2) < 2.5 && b.align !== "left";
      const overlaps = line.x < b.right + 2 && line.right > b.x - 2;
      return overlaps && (sameLeft || sameCenter);
    });
    if (!block) {
      blocks.push({ lines: [line], x: line.x, right: line.right, size: line.size, align: "left", flow: false });
      continue;
    }
    const last = block.lines.at(-1);
    if (block.lines.length === 1 && Math.abs(line.x - last.x) >= 2.5) block.align = "center";
    block.lines.push(line);
    block.x = Math.min(block.x, line.x);
    block.right = Math.max(block.right, line.right);
  }
  const parts = blocks.flatMap((b) => {
    if (b.align !== "left" || b.lines.length < 3) return [b];
    const tolerance = Math.max(1.5, b.size * 0.15), full = b.lines.filter((l) => b.right - l.right < tolerance).length;
    if (full < b.lines.length / 2) return [b];
    const out = [];
    let current = [];
    for (const [i, line] of b.lines.entries()) {
      current.push(line);
      if (i < b.lines.length - 1 && b.right - line.right > b.size * 2) {
        out.push({ ...b, lines: current });
        current = [];
      }
    }
    if (current.length) out.push({ ...b, lines: current });
    return out.map((p) => ({ ...p, x: Math.min(...p.lines.map((l) => l.x)), right: b.right }));
  });
  const words = (l) => l.runs.reduce((n, r) => n + r.text.trim().split(/\s+/).length, 0);
  for (const b of parts) {
    const width = b.right - b.x, body = b.lines.slice(0, -1);
    b.flow = b.align === "left" && b.lines.length > 2 && body.every((l) => l.right - l.x > width * 0.82) && !b.lines.some((l) => /^[•\-–·\d]+[.)]?\s/.test(l.runs[0].text));
    if (b.align === "left" && body.length >= 2 && body.every((l) => b.right - l.right < Math.max(1.2, b.size * 0.12)) && body.some((l) => words(l) > 3)) b.align = "justify";
  }
  return parts;
}
function spacesIn(gap, unit) {
  return gap > unit * 2.4 ? Math.min(60, Math.round(gap / unit)) : 1;
}
function runSpacing(run2) {
  return { ...run2.tracking ? { characterSpacing: Math.round(run2.tracking * 20) } : {}, ...run2.scale ? { scale: Math.round(run2.scale * 100) } : {} };
}
function runMarks(run2) {
  return { ...run2.script === "super" ? { superScript: true } : run2.script === "sub" ? { subScript: true } : {}, ...run2.underline || run2.link ? { underline: { type: import_docx2.UnderlineType.SINGLE } } : {}, ...run2.strike ? { strike: true } : {} };
}
function lineRuns(line, leadingSpace, fields) {
  const gaps = line.runs.slice(1).map((run2, i) => run2.x - (line.runs[i].x + line.runs[i].width)).filter((g) => g > 0.5);
  const size = line.size, unit = Math.min(size * 0.4, Math.max(size * 0.2, gaps.length >= 4 ? Math.min(...gaps) : size * 0.25));
  return line.runs.flatMap((run2, index) => {
    const previous = line.runs[index - 1], gap = previous ? run2.x - (previous.x + previous.width) : 0;
    const space = index === 0 && leadingSpace || index > 0 && run2.space || gap > Math.max(0.8, run2.size * 0.15) && !/^\s/.test(run2.text) && !/\s$/.test(previous?.text ?? "");
    const style = { font: { ascii: run2.font, hAnsi: run2.font, cs: run2.font, eastAsia: run2.font }, size: Math.max(2, Math.round(run2.size * 2)), bold: run2.bold, italics: run2.italic, color: run2.color.replace("#", "").toUpperCase(), ...runSpacing(run2), ...runMarks(run2) };
    const text2 = (space ? " ".repeat(index > 0 ? spacesIn(gap, unit) : 1) : "") + run2.text;
    if (run2.link) return [new import_docx2.ExternalHyperlink({ link: run2.link, children: [new import_docx2.TextRun({ text: text2, ...style })] })];
    if (!fields) return [new import_docx2.TextRun({ text: text2, ...style })];
    return text2.split(/(\d+)/).filter(Boolean).map((piece) => piece === fields.page ? new import_docx2.TextRun({ children: [import_docx2.PageNumber.CURRENT], ...style }) : piece === fields.total ? new import_docx2.TextRun({ children: [import_docx2.PageNumber.TOTAL_PAGES], ...style }) : new import_docx2.TextRun({ text: piece, ...style }));
  });
}
function blockParagraph(block, pageWidth) {
  const pitch = block.lines.length > 1 ? (block.lines.at(-1).baseline - block.lines[0].baseline) / (block.lines.length - 1) : block.size * 1.22;
  const lineHeight = Math.max(pitch, block.size * 1.05), top = block.lines[0].baseline - lineHeight * 0.8;
  const slack = block.align === "justify" ? 0.6 : block.flow ? block.size * 0.4 : block.lines.length === 1 ? block.size * 3 + (block.right - block.x) * 0.3 : block.size * 1.2 + (block.right - block.x) * 0.04;
  const width = Math.min(pageWidth - block.x, block.right - block.x + slack);
  const x = block.align === "center" ? Math.max(0, (block.x + block.right) / 2 - width / 2) : block.x;
  const children2 = [];
  block.lines.forEach((line, index) => {
    if (index > 0 && !block.flow) children2.push(new import_docx2.TextRun({ break: 1 }));
    children2.push(...lineRuns(line, index > 0 && block.flow));
  });
  return new import_docx2.Paragraph({
    frame: { type: "absolute", position: { x: Math.round(x * 20), y: Math.max(0, Math.round(top * 20)) }, width: Math.max(40, Math.round(width * 20)), height: Math.round(lineHeight * block.lines.length * 20), anchor: { horizontal: import_docx2.FrameAnchorType.PAGE, vertical: import_docx2.FrameAnchorType.PAGE }, rule: import_docx2.HeightRule.ATLEAST, wrap: import_docx2.FrameWrap.NONE, space: { horizontal: 0, vertical: 0 } },
    alignment: block.align === "center" ? import_docx2.AlignmentType.CENTER : block.align === "right" ? import_docx2.AlignmentType.RIGHT : block.align === "justify" ? import_docx2.AlignmentType.JUSTIFIED : import_docx2.AlignmentType.LEFT,
    spacing: { before: 0, after: 0, line: Math.round(lineHeight * 20), lineRule: import_docx2.LineRuleType.EXACT },
    children: children2
  });
}
async function artwork(page2, dpi, erase = [], omit = /* @__PURE__ */ new Set(), transparent = false, turned = []) {
  const viewport = page2.getViewport({ scale: dpi / 72 }), canvas = (0, import_canvas.createCanvas)(Math.ceil(viewport.width), Math.ceil(viewport.height)), context = canvas.getContext("2d");
  await page2.render({ canvas, canvasContext: context, viewport, background: transparent ? "rgba(0,0,0,0)" : "white", operationsFilter: (index) => !omit.has(index) }).promise;
  const k = dpi / 72;
  for (const run2 of erase) {
    const x = Math.max(0, Math.floor((run2.x - 1) * k)), y = Math.max(0, Math.floor((run2.baseline - run2.size * 0.95) * k));
    const w = Math.min(canvas.width - x, Math.ceil((run2.width + 2) * k)), h = Math.min(canvas.height - y, Math.ceil(run2.size * 1.25 * k));
    if (w <= 0 || h <= 0) continue;
    const ring = [context.getImageData(x, Math.max(0, y - 2), w, 1).data, context.getImageData(x, Math.min(canvas.height - 1, y + h + 1), w, 1).data];
    const samples = [];
    for (const row of ring) for (let i = 0; i < row.length; i += 4) samples.push([row[i], row[i + 1], row[i + 2]]);
    samples.sort((a, b) => b[0] + b[1] + b[2] - (a[0] + a[1] + a[2]));
    const paper = samples[Math.floor(samples.length * 0.25)] ?? [255, 255, 255];
    context.fillStyle = `rgb(${paper[0]},${paper[1]},${paper[2]})`;
    context.fillRect(x, y, w, h);
  }
  drawTurned(context, turned, k);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let ink = false;
  for (let i = 0; i < data.length && !ink; i += 4) if (transparent ? data[i + 3] > 0 : data[i] < 248 || data[i + 1] < 248 || data[i + 2] < 248) ink = true;
  return ink ? transparent ? canvas.toBuffer("image/png") : canvas.toBuffer("image/jpeg", 88) : null;
}
async function toDocxLayout(bytes, dpi, warnings, onProgress, ocr = /* @__PURE__ */ new Map()) {
  onProgress?.("Preparando as formas e o fundo das p\xE1ginas\u2026");
  const [source, fonts] = await Promise.all([loadPdf(bytes), FontContext.of(bytes, true)]), missing = fonts.missing;
  const vectors = [];
  for (let i = 1; i <= source.numPages; i++) {
    const page2 = await source.getPage(i);
    vectors.push(await vectorShapes(page2).catch(() => ({ supported: false, shapes: [], painted: [] })));
    page2.cleanup();
  }
  const editable = new Set(vectors.flatMap((v, i) => v.supported && v.shapes.length ? [i] : []));
  const [art, pictures] = await Promise.all([artworkOnly(bytes, false, editable).then(loadPdf), artworkOnly(bytes, true).then(loadPdf)]);
  const shapeRuns = /* @__PURE__ */ new Map();
  let shapeId = 5e3, shapeCount = 0;
  try {
    const sections = [];
    let tables = 0, flowed = 0, laidOut = 0, flowPages = [], flowMarkers = [];
    const allFlow = [];
    const closeFlow = () => {
      if (!flowPages.length) return;
      const section = flowSection(flowPages, source.numPages, flowMarkers);
      sections.push({ ...section, properties: { ...section.properties, type: import_docx2.SectionType.NEXT_PAGE } });
      flowed += flowPages.length;
      flowPages = [];
      flowMarkers = [];
    };
    for (let i = 1; i <= source.numPages; i++) {
      onProgress?.(`Convertendo p\xE1gina ${i} de ${source.numPages}\u2026`);
      const page2 = await source.getPage(i), viewport = page2.getViewport({ scale: 1 });
      const scanned = ocr.get(i - 1);
      if (!scanned) {
        const flow = await flowPage(page2, fonts, (await inspectPage(page2, true)).images);
        if (flow) {
          if (flowPages.length && (Math.abs(flowPages[0].width - flow.width) > 1 || Math.abs(flowPages[0].height - flow.height) > 1)) closeFlow();
          flowPages.push(flow);
          allFlow.push(flow);
          tables += flow.items.filter((item) => item.kind === "table").length;
          const rebuilt = flow.items.filter((item) => item.kind === "table" || item.kind === "columns" || item.kind === "rule");
          const covered = (b) => rebuilt.some((item) => b.y + b.height > item.top - 2 && b.y < item.bottom + 2);
          const decor = editable.has(i - 1) ? vectors[i - 1].shapes.filter((v) => !covered(v.box)) : [];
          if (decor.length) {
            shapeRuns.set(i, decor.map((v, n) => shapeRun(v, shapeId++, n * 2)).join(""));
            shapeCount += decor.length;
            flowMarkers.push(shapeMarker(i));
          } else flowMarkers.push(void 0);
          page2.cleanup();
          continue;
        }
      }
      closeFlow();
      laidOut++;
      const artPage = await art.getPage(i);
      const turned = scanned ? [] : await turnedText(page2).catch(() => []);
      if (turned.length) warnings.push("Textos girados ou verticais foram mantidos na imagem de fundo da p\xE1gina, na posi\xE7\xE3o original; no Word com layout preservado eles n\xE3o s\xE3o edit\xE1veis.");
      const partial = !editable.has(i - 1) && !scanned ? await vectorShapes(artPage) : void 0;
      const promoted = partial && partial.reason !== "formas demais" ? partial.shapes.filter((v) => v.operation !== void 0 && (v.operation < (partial.firstRaster ?? Infinity) || v.operation > (partial.lastRaster ?? -1))) : [];
      const omit = new Set(promoted.map((v) => v.operation));
      const [allRuns, background, images, grid] = await Promise.all([scanned ?? pageRuns(page2, fonts), artwork(artPage, dpi, scanned, omit, !!partial, turned), scanned ? { images: [] } : inspectPage(page2, true), scanned ? null : pageGrid(page2, fonts).catch(() => null)]);
      const candidate = grid ? tableOf(grid) : null, table = candidate && realTable(candidate) ? candidate : null;
      const runs = table ? allRuns.filter((r) => !insideTable(table, { x: r.x, y: r.baseline - r.size * 0.7, width: Math.min(r.width, 1), height: r.size * 0.6 })) : allRuns;
      const shapes = (editable.has(i - 1) ? vectors[i - 1].shapes : promoted).filter((v) => !table || !insideTable(table, v.box));
      const children2 = [];
      if (shapes.length) {
        const key2 = i;
        shapeRuns.set(key2, shapes.map((v, n) => shapeRun(v, shapeId++, n * 2)).join(""));
        shapeCount += shapes.length;
        children2.push(new import_docx2.Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: import_docx2.LineRuleType.EXACT }, children: [new import_docx2.TextRun({ text: shapeMarker(key2), size: 2 })] }));
      }
      const after = partial ? shapes.findIndex((v) => v.operation > (partial.lastRaster ?? -1)) : 0, rasterZ = 999 + 2 * (after < 0 ? shapes.length : after);
      if (background) children2.push(new import_docx2.Paragraph({ spacing: { before: 0, after: 0 }, children: [new import_docx2.ImageRun({ type: partial ? "png" : "jpg", data: background, transformation: { width: viewport.width * 96 / 72, height: viewport.height * 96 / 72 }, floating: { horizontalPosition: { relative: import_docx2.HorizontalPositionRelativeFrom.PAGE, offset: 0 }, verticalPosition: { relative: import_docx2.VerticalPositionRelativeFrom.PAGE, offset: 0 }, behindDocument: true, allowOverlap: true, lockAnchor: true, wrap: { type: import_docx2.TextWrappingType.NONE }, zIndex: rasterZ } })] }));
      if (images.images.length) {
        const picturePage = await pictures.getPage(i), scale = Math.min(dpi, 200) / 72, view = picturePage.getViewport({ scale }), canvas = (0, import_canvas.createCanvas)(Math.ceil(view.width), Math.ceil(view.height));
        await picturePage.render({ canvas, canvasContext: canvas.getContext("2d"), viewport: view, background: "white" }).promise;
        for (const image of images.images) {
          const x = Math.max(0, image.x), y = Math.max(0, image.y), w = Math.min(viewport.width - x, image.width), h = Math.min(viewport.height - y, image.height);
          if (w < 2 || h < 2) continue;
          const crop = (0, import_canvas.createCanvas)(Math.ceil(w * scale), Math.ceil(h * scale));
          crop.getContext("2d").drawImage(canvas, x * scale, y * scale, w * scale, h * scale, 0, 0, crop.width, crop.height);
          children2.push(new import_docx2.Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: import_docx2.LineRuleType.EXACT }, children: [new import_docx2.ImageRun({ type: "jpg", data: crop.toBuffer("image/jpeg", 90), transformation: { width: w * 96 / 72, height: h * 96 / 72 }, floating: { horizontalPosition: { relative: import_docx2.HorizontalPositionRelativeFrom.PAGE, offset: Math.round(x * EMU_PT) }, verticalPosition: { relative: import_docx2.VerticalPositionRelativeFrom.PAGE, offset: Math.round(y * EMU_PT) }, wrap: { type: import_docx2.TextWrappingType.NONE }, behindDocument: true, allowOverlap: true, zIndex: 3e3 } })] }));
        }
        picturePage.cleanup();
      }
      if (table) {
        children2.push(wordTable(table));
        tables++;
      }
      if (!allRuns.length) warnings.push(`A p\xE1gina ${i} n\xE3o tem texto extra\xEDvel; ela foi mantida como imagem. Execute o OCR para gerar texto edit\xE1vel.`);
      for (const block of buildBlocks(buildLines(runs))) children2.push(blockParagraph(block, viewport.width));
      children2.push(new import_docx2.Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: import_docx2.LineRuleType.EXACT }, children: [new import_docx2.TextRun({ text: "", size: 2 })] }));
      sections.push({ properties: { type: import_docx2.SectionType.NEXT_PAGE, page: { size: { width: Math.round(viewport.width * 20), height: Math.round(viewport.height * 20) }, margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 } } }, children: children2 });
      page2.cleanup();
      artPage.cleanup();
    }
    closeFlow();
    if (missing.size) warnings.push(`Fontes do PDF n\xE3o instaladas neste computador foram trocadas por equivalentes: ${[...missing].map(([a, b]) => `${a} \u2192 ${b}`).join(", ")}. Instale-as para fidelidade total.`);
    if (fonts.embedded.size) warnings.push(`Fontes incorporadas ao Word para abrir igual em qualquer computador: ${[...fonts.embedded.keys()].join(", ")}.`);
    if (tables) warnings.push(`${tables} tabela${tables > 1 ? "s" : ""} reconstru\xEDda${tables > 1 ? "s" : ""} como tabela real do Word (c\xE9lulas mescladas, cores e bordas).`);
    if (flowed) warnings.push(`${flowed === source.numPages ? "Documento convertido" : `${flowed} p\xE1gina${flowed > 1 ? "s convertidas" : " convertida"}`} como texto corrido: margens, par\xE1grafos, listas, tabelas, cabe\xE7alho e rodap\xE9 edit\xE1veis, que se reorganizam ao editar.`);
    if (laidOut) warnings.push(`${flowed ? `${laidOut} p\xE1gina${laidOut > 1 ? "s" : ""} com arte (cartaz, slide ou digitaliza\xE7\xE3o) mantida${laidOut > 1 ? "s" : ""} com layout preservado: ` : "Word com layout preservado: "}fundos, tabelas e imagens ficam atr\xE1s do texto, e os textos s\xE3o edit\xE1veis com as fontes originais quando instaladas no computador.`);
    const document = new import_docx2.Document({ creator: "Bruno Albertini | Gest\xE3o Cultural Pro", title: "Documento convertido pelo GCP-PDF", description: "Convers\xE3o local de PDF", sections, fonts: fonts.docxFonts(), styles: { default: { document: { run: allFlow.length ? { font: bodyStyle(allFlow).font, size: bodyStyle(allFlow).size, language: { value: "pt-BR" } } : { font: "Segoe UI", language: { value: "pt-BR" } } } } } });
    if (shapeCount) warnings.push(`${shapeCount} elemento${shapeCount > 1 ? "s gr\xE1ficos viraram formas edit\xE1veis" : " gr\xE1fico virou forma edit\xE1vel"} no Word (linhas, caixas, fundos e contornos): selecione para mover, recolorir ou redimensionar.`);
    return { bytes: await injectShapes(new Uint8Array(await import_docx2.Packer.toBuffer(document)), shapeRuns), extension: "docx", warnings: [...new Set(warnings)] };
  } finally {
    await source.loadingTask.destroy();
    await art.loadingTask.destroy();
    await pictures.loadingTask.destroy();
  }
}
var hex6 = (c) => c.replace("#", "").toUpperCase();
function slideMarks(run2) {
  return { ...run2.script === "super" ? { superscript: true } : run2.script === "sub" ? { subscript: true } : {}, ...run2.strike ? { strike: "sngStrike" } : {}, ...run2.link ? { hyperlink: { url: run2.link } } : {} };
}
function addSlideTable(slide, t, sx, sy) {
  const inch = (pt3) => pt3 / 72, rows = t.rowH.map(() => []);
  const edge = (e) => e ? { type: "solid", pt: e.width, color: hex6(e.color) } : { type: "none" };
  for (const cell of [...t.cells].sort((a, b) => a.row - b.row || a.col - b.col)) {
    const text2 = cell.text, options = {
      colspan: cell.cols > 1 ? cell.cols : void 0,
      rowspan: cell.rows > 1 ? cell.rows : void 0,
      // The text sits where the PDF shows it inside the cell: its measured left and top insets become the cell margins.
      fill: cell.fill ? { color: hex6(cell.fill) } : void 0,
      margin: text2 && text2.valign === "top" ? [Math.min(40, text2.insetTop ?? 1), Math.min(40, Math.max(2, text2.inset ?? 2)), 1, Math.min(40, Math.max(2, text2.inset ?? 2))] : [1, Math.min(40, Math.max(2, text2?.inset ?? 2)), 1, Math.min(40, Math.max(2, text2?.inset ?? 2))],
      border: [edge(cell.borders?.top), edge(cell.borders?.right), edge(cell.borders?.bottom), edge(cell.borders?.left)],
      align: text2?.align ?? "left",
      valign: text2?.valign ?? "top",
      fontFace: text2?.font,
      fontSize: text2 ? Math.max(1, text2.size * sy) : 10,
      color: text2 ? hex6(text2.color) : void 0
    };
    const content = text2 ? text2.parts.flatMap((part) => part.text.split("\n").map((piece, k, all2) => ({ text: piece, options: { bold: part.bold, italic: part.italic, color: hex6(part.color), fontSize: Math.max(1, part.size * sy), fontFace: part.font || text2.font, ...slideMarks(part), breakLine: k < all2.length - 1 } }))) : "";
    rows[cell.row].push({ text: content, options });
  }
  slide.addTable(rows, { x: inch(t.x * sx), y: inch(t.y * sy), w: inch(t.width * sx), colW: t.colW.map((w) => inch(w * sx)), rowH: t.rowH.map((h) => inch(h * sy)), autoPage: false });
}
function realTable(t) {
  const perRow = /* @__PURE__ */ new Map();
  for (const cell of t.cells) if (cell.text?.text.trim()) perRow.set(cell.row, (perRow.get(cell.row) ?? 0) + 1);
  return [...perRow.values()].filter((n) => n >= 2).length >= 2;
}
function wordTable(t, inline2) {
  const twip3 = (pt3) => Math.round(pt3 * 20);
  const edge = (e) => e ? { style: import_docx2.BorderStyle.SINGLE, size: Math.max(2, Math.round(e.width * 8)), color: hex6(e.color) } : { style: import_docx2.BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const rows = t.rowH.map((height, r) => new import_docx2.TableRow({
    // On a laid-out page the rows keep the PDF's heights exactly: Word would otherwise grow them to its own
    // font metrics and push the table (and the page background) onto an extra page.
    height: { value: twip3(height), rule: inline2 ? import_docx2.HeightRule.ATLEAST : import_docx2.HeightRule.EXACT },
    children: t.cells.filter((c) => c.row === r).sort((a, b) => a.col - b.col).map((cell) => {
      const text2 = cell.text, align = text2?.align === "center" ? import_docx2.AlignmentType.CENTER : text2?.align === "right" ? import_docx2.AlignmentType.RIGHT : text2?.align === "justify" ? import_docx2.AlignmentType.JUSTIFIED : import_docx2.AlignmentType.LEFT;
      const paragraphs = [];
      let current = [];
      const before = () => !paragraphs.length ? inline2 ? twip3(inline2.paddingTop ?? 0) : text2 && text2.valign === "top" ? twip3(Math.max(0, (text2.insetTop ?? 0) - text2.size * 0.25)) : 0 : 0;
      const pitch = !inline2 && text2 ? { line: Math.max(40, Math.round(text2.size * 1.2 * 20)), lineRule: import_docx2.LineRuleType.EXACT } : {};
      for (const part of text2?.parts ?? []) part.text.split("\n").forEach((piece, k) => {
        if (k > 0) {
          paragraphs.push(new import_docx2.Paragraph({ alignment: align, spacing: { before: before(), after: 0, ...pitch }, children: current }));
          current = [];
        }
        if (piece) {
          const run2 = new import_docx2.TextRun({ text: piece, bold: part.bold, italics: part.italic, color: hex6(part.color), size: Math.max(2, Math.round(part.size * 2)), font: part.font || text2.font, ...runMarks(part) });
          current.push(part.link ? new import_docx2.ExternalHyperlink({ link: part.link, children: [run2] }) : run2);
        }
      });
      paragraphs.push(new import_docx2.Paragraph({ alignment: align, spacing: { before: before(), after: 0, ...pitch }, children: current }));
      return new import_docx2.TableCell({
        columnSpan: cell.cols > 1 ? cell.cols : void 0,
        rowSpan: cell.rows > 1 ? cell.rows : void 0,
        width: { size: twip3(t.colW.slice(cell.col, cell.col + cell.cols).reduce((a, b) => a + b, 0)), type: import_docx2.WidthType.DXA },
        shading: cell.fill ? { type: import_docx2.ShadingType.CLEAR, color: "auto", fill: hex6(cell.fill) } : void 0,
        verticalAlign: text2?.valign === "middle" ? import_docx2.VerticalAlign.CENTER : text2?.valign === "bottom" ? import_docx2.VerticalAlign.BOTTOM : import_docx2.VerticalAlign.TOP,
        margins: inline2 ? { top: 0, bottom: 0, left: twip3(inline2.padding), right: twip3(inline2.padding) } : { top: 0, bottom: 0, left: twip3(Math.max(0.5, Math.min(30, text2?.align === "left" || text2?.align === "justify" ? text2.inset ?? 2 : 2))), right: twip3(1) },
        borders: { top: edge(cell.borders?.top), bottom: edge(cell.borders?.bottom), left: edge(cell.borders?.left), right: edge(cell.borders?.right) },
        children: paragraphs
      });
    })
  }));
  return new import_docx2.Table({
    rows,
    layout: import_docx2.TableLayoutType.FIXED,
    columnWidths: t.colW.map(twip3),
    width: { size: twip3(t.width), type: import_docx2.WidthType.DXA },
    ...inline2 ? { indent: { size: twip3(inline2.indent), type: import_docx2.WidthType.DXA } } : {},
    float: inline2 ? void 0 : { horizontalAnchor: import_docx2.TableAnchorType.PAGE, verticalAnchor: import_docx2.TableAnchorType.PAGE, absoluteHorizontalPosition: twip3(t.x), absoluteVerticalPosition: twip3(t.y), overlap: import_docx2.OverlapType.OVERLAP }
  });
}
async function singleParagraphProperties(buffer) {
  const JSZip = (await import("jszip")).default, zip = await JSZip.loadAsync(buffer);
  for (const name of Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const xml = await zip.file(name).async("string");
    zip.file(name, xml.replace(/<a:p>([\s\S]*?)<\/a:p>/g, (_all, body) => {
      let first = true;
      return "<a:p>" + body.replace(/<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g, (pPr) => first ? (first = false, pPr) : "") + "</a:p>";
    }));
  }
  return new Uint8Array(await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}
function addVector(pptx, slide, shape, sx, sy) {
  const inch = (pt3) => pt3 / 72, b = shape.box, x = b.x * sx, y = b.y * sy, w = Math.max(b.width * sx, 0.01), h = Math.max(b.height * sy, 0.01);
  const fill = shape.fill ? { color: shape.fill.color.slice(1).toUpperCase(), transparency: Math.round((1 - shape.fill.alpha) * 100) } : { type: "none" };
  const line = shape.stroke ? { color: shape.stroke.color.slice(1).toUpperCase(), width: shape.stroke.width * Math.min(sx, sy), transparency: Math.round((1 - shape.stroke.alpha) * 100), dashType: shape.stroke.dash ? "dash" : "solid" } : { type: "none" };
  const points = shape.segments.filter((s) => s.op !== "Z"), closed = shape.segments.some((s) => s.op === "Z");
  if (rectangle(shape) && points[0].op === "M") {
    slide.addShape(pptx.ShapeType.rect, { x: inch(x), y: inch(y), w: inch(w), h: inch(h), fill, line });
    return;
  }
  if (points.length === 2 && points[1].op === "L" && !shape.fill) {
    const a = points[0], c = points[1];
    slide.addShape(pptx.ShapeType.line, { x: inch(x), y: inch(y), w: inch(w), h: inch(h), line, ...(c.x - a.x) * (c.y - a.y) < 0 ? { flipV: true } : {} });
    return;
  }
  const rel = (px, py) => ({ x: inch(px * sx - x), y: inch(py * sy - y) });
  const geometry2 = shape.segments.map((s, n) => s.op === "Z" ? { close: true } : s.op === "C" ? { ...rel(s.x, s.y), curve: { type: "cubic", x1: inch(s.x1 * sx - x), y1: inch(s.y1 * sy - y), x2: inch(s.x2 * sx - x), y2: inch(s.y2 * sy - y) } } : { ...rel(s.x, s.y), ...s.op === "M" || n === 0 ? { moveTo: true } : {} });
  slide.addShape(pptx.ShapeType.custGeom, { x: inch(x), y: inch(y), w: inch(w), h: inch(h), points: geometry2, fill, line: closed || shape.stroke ? line : { type: "none" } });
}
async function toPptxLayout(bytes, dpi, warnings, onProgress, ocr = /* @__PURE__ */ new Map()) {
  onProgress?.("Preparando os slides\u2026");
  const PptxGenJS2 = (await import("pptxgenjs")).default;
  const source = await loadPdf(bytes);
  const vectors = [];
  for (let i = 1; i <= source.numPages; i++) {
    onProgress?.(`Lendo formas vetoriais ${i} de ${source.numPages}\u2026`);
    const page2 = await source.getPage(i);
    vectors.push(await vectorShapes(page2).catch(() => ({ supported: false, shapes: [], painted: [] })));
    page2.cleanup();
  }
  const editable = new Set(vectors.flatMap((v, i) => v.supported && v.shapes.length ? [i] : []));
  const [art, pictures] = await Promise.all([artworkOnly(bytes, false, editable).then(loadPdf), artworkOnly(bytes, true).then(loadPdf)]);
  let shapeCount = 0;
  const fonts = await FontContext.of(bytes, false), missing = fonts.missing;
  try {
    const first = (await source.getPage(1)).getViewport({ scale: 1 }), pptx = new PptxGenJS2();
    pptx.defineLayout({ name: "PDF", width: first.width / 72, height: first.height / 72 });
    pptx.layout = "PDF";
    pptx.author = "GCP-PDF";
    pptx.company = "Gest\xE3o Cultural Pro";
    const inch = (pt3) => pt3 / 72;
    for (let i = 1; i <= source.numPages; i++) {
      onProgress?.(`Convertendo slide ${i} de ${source.numPages}\u2026`);
      const page2 = await source.getPage(i), viewport = page2.getViewport({ scale: 1 }), artPage = await art.getPage(i), slide = pptx.addSlide();
      const sx = first.width / viewport.width, sy = first.height / viewport.height;
      const scanned = ocr.get(i - 1);
      const partial = !editable.has(i - 1) && !scanned ? await vectorShapes(artPage) : void 0;
      const promoted = partial && partial.reason !== "formas demais" ? partial.shapes.filter((s) => s.operation !== void 0 && (s.operation < (partial.firstRaster ?? Infinity) || s.operation > (partial.lastRaster ?? -1))) : [];
      const omit = new Set(promoted.map((s) => s.operation));
      const [allRuns, background, images, grid] = await Promise.all([scanned ?? pageRuns(page2, fonts), artwork(artPage, dpi, scanned, omit, !!partial), scanned ? { images: [] } : inspectPage(page2, true), scanned || partial ? null : pageGrid(page2, fonts).catch(() => null)]);
      const table = grid ? tableOf(grid) : null;
      const runs = table ? allRuns.filter((r) => !insideTable(table, { x: r.x, y: r.baseline - r.size * 0.7, width: Math.min(r.width, 1), height: r.size * 0.6 })) : allRuns;
      const vector = (editable.has(i - 1) ? vectors[i - 1].shapes : promoted).filter((v) => !table || !insideTable(table, v.box));
      let pageFills = 0;
      while (!partial && pageFills < vector.length && vector[pageFills].fill && !vector[pageFills].stroke && vector[pageFills].fill.alpha > 0.99 && vector[pageFills].box.width * vector[pageFills].box.height >= viewport.width * viewport.height * 0.95) pageFills++;
      if (background && !partial) slide.background = { data: "image/jpeg;base64," + background.toString("base64") };
      else if (pageFills) slide.background = { color: vector[pageFills - 1].fill.color.slice(1).toUpperCase() };
      if (partial) {
        for (const shape of vector.filter((s) => s.operation < (partial.firstRaster ?? Infinity))) {
          addVector(pptx, slide, shape, sx, sy);
          shapeCount++;
        }
        if (background) slide.addImage({ data: "image/png;base64," + background.toString("base64"), x: 0, y: 0, w: inch(first.width), h: inch(first.height) });
        for (const shape of vector.filter((s) => s.operation >= (partial.firstRaster ?? Infinity))) {
          addVector(pptx, slide, shape, sx, sy);
          shapeCount++;
        }
      } else for (const shape of vector.slice(pageFills)) {
        addVector(pptx, slide, shape, sx, sy);
        shapeCount++;
      }
      if (table) {
        addSlideTable(slide, table, sx, sy);
        shapeCount++;
      }
      if (images.images.length) {
        const picturePage = await pictures.getPage(i), scale = Math.min(dpi, 200) / 72, view = picturePage.getViewport({ scale }), canvas = (0, import_canvas.createCanvas)(Math.ceil(view.width), Math.ceil(view.height));
        await picturePage.render({ canvas, canvasContext: canvas.getContext("2d"), viewport: view, background: "white" }).promise;
        for (const image of images.images) {
          const x = Math.max(0, image.x), y = Math.max(0, image.y), w = Math.min(viewport.width - x, image.width), h = Math.min(viewport.height - y, image.height);
          if (w < 2 || h < 2) continue;
          const crop = (0, import_canvas.createCanvas)(Math.ceil(w * scale), Math.ceil(h * scale));
          crop.getContext("2d").drawImage(canvas, x * scale, y * scale, w * scale, h * scale, 0, 0, crop.width, crop.height);
          slide.addImage({ data: "image/jpeg;base64," + crop.toBuffer("image/jpeg", 90).toString("base64"), x: inch(x * sx), y: inch(y * sy), w: inch(w * sx), h: inch(h * sy) });
        }
        picturePage.cleanup();
      }
      for (const block of buildBlocks(buildLines(runs))) {
        const pitch = block.lines.length > 1 ? (block.lines.at(-1).baseline - block.lines[0].baseline) / (block.lines.length - 1) : block.size * 1.2;
        if (block.flow && vector.some((v) => v.box.height < 1.5 && v.box.width > 2 && v.box.x >= block.x - 2 && v.box.x + v.box.width <= block.right + 2 && v.box.y > block.lines[0].baseline - block.size && v.box.y < block.lines.at(-1).baseline + block.size * 0.4)) block.flow = false;
        const top = block.lines[0].baseline - block.size * 0.95, width = block.right - block.x + block.size * (block.flow ? 0.6 : 1.4), height = pitch * (block.lines.length - 1) + block.size * 1.35;
        const text2 = block.lines.flatMap((line, index) => line.runs.map((run2, r) => {
          const previous = line.runs[r - 1], gap = previous ? run2.x - (previous.x + previous.width) : 0, space = r > 0 && run2.space || gap > run2.size * 0.15 && !/^\s/.test(run2.text) || r === 0 && index > 0 && block.flow;
          return { text: (space ? " " : "") + run2.text, options: { fontFace: run2.font, fontSize: Math.max(1, run2.size * sy), color: run2.color.replace("#", "").toUpperCase(), bold: run2.bold, italic: run2.italic, ...run2.tracking ? { charSpacing: run2.tracking * sx } : {}, ...slideMarks(run2), breakLine: !block.flow && r === line.runs.length - 1 && index < block.lines.length - 1 } };
        }));
        slide.addText(text2, { x: inch(Math.max(0, (block.align === "center" ? (block.x + block.right) / 2 - width / 2 : block.x) * sx)), y: inch(Math.max(0, top * sy)), w: inch(width * sx), h: inch(height * sy), align: block.align, valign: "top", margin: 0, lineSpacing: Math.max(1, pitch * sy), fit: "none", wrap: true });
      }
      for (const t of scanned ? [] : await turnedText(page2).catch(() => [])) {
        const a = t.angle * Math.PI / 180, w = t.width + t.size * 0.6, h = t.size * 1.3;
        const cx = t.x + Math.cos(a) * t.width / 2 + Math.sin(a) * t.size * 0.35, cy = t.y + Math.sin(a) * t.width / 2 - Math.cos(a) * t.size * 0.35;
        slide.addText([{ text: t.text, options: { fontFace: await fonts.family(t.font, void 0), fontSize: Math.max(1, t.size * sy), color: hex6(t.color), bold: t.bold, italic: t.italic } }], { x: inch((cx - w / 2) * sx), y: inch((cy - h / 2) * sy), w: inch(w * sx), h: inch(h * sy), rotate: (Math.round(t.angle) % 360 + 360) % 360, align: "center", valign: "middle", margin: 0, fit: "none", wrap: false });
      }
      page2.cleanup();
      artPage.cleanup();
    }
    if (missing.size) warnings.push(`Fontes do PDF n\xE3o instaladas neste computador foram trocadas por equivalentes: ${[...missing].map(([a, b]) => `${a} \u2192 ${b}`).join(", ")}. Instale-as para fidelidade total.`);
    warnings.push(shapeCount ? `PowerPoint com layout preservado: ${shapeCount} forma${shapeCount > 1 ? "s vetoriais viraram formas edit\xE1veis" : " vetorial virou forma edit\xE1vel"}; imagens e textos tamb\xE9m s\xE3o objetos edit\xE1veis.` : "PowerPoint com layout preservado: imagens e textos s\xE3o objetos edit\xE1veis.");
    const flat2 = vectors.filter((v) => !v.supported).length;
    if (flat2) warnings.push(`${flat2} slide${flat2 > 1 ? "s t\xEAm" : " tem"} efeitos que exigem imagem. As formas compat\xEDveis antes e depois desses efeitos continuam edit\xE1veis; a composi\xE7\xE3o intermedi\xE1ria permanece como imagem transparente para preservar a ordem das camadas.`);
    return { bytes: await singleParagraphProperties(await pptx.write({ outputType: "nodebuffer" })), extension: "pptx", warnings: [...new Set(warnings)] };
  } finally {
    await source.loadingTask.destroy();
    await art.loadingTask.destroy();
    await pictures.loadingTask.destroy();
  }
}

// ../cliqueprojeto/gcp-pdf/src/main/tables.ts
var TOLERANCE = 3;
function cluster2(values) {
  const sorted = [...values].sort((a, b) => a - b), out = [];
  for (const v of sorted) if (!out.length || v - out[out.length - 1] > TOLERANCE) out.push(v);
  else out[out.length - 1] = (out[out.length - 1] + v) / 2;
  return out;
}
var snap = (edges, v) => edges.reduce((best, e, i) => Math.abs(e - v) < Math.abs(edges[best] - v) ? i : best, 0);
function cellText(runs, box, flow = false, keepLines = false) {
  if (!runs.length) return void 0;
  const sorted = [...runs].sort((a, b) => a.baseline - b.baseline || a.x - b.x), lines2 = [];
  for (const run2 of sorted) {
    const line = lines2.find((l) => Math.abs(l[0].baseline - run2.baseline) < run2.size * 0.4);
    if (line) line.push(run2);
    else lines2.push([run2]);
  }
  const parts = [], push = (text3, run2) => {
    const last = parts.at(-1);
    if (last && last.bold === run2.bold && last.italic === run2.italic && last.color === run2.color && last.size === run2.size && last.script === run2.script && last.link === run2.link && !last.underline === !run2.underline && !last.strike === !run2.strike && last.font === run2.font) last.text += text3;
    else parts.push({ text: text3, bold: run2.bold, italic: run2.italic, color: run2.color, size: run2.size, font: run2.font, ...run2.script ? { script: run2.script } : {}, ...run2.link ? { link: run2.link } : {}, ...run2.underline ? { underline: true } : {}, ...run2.strike ? { strike: true } : {} });
  };
  const texts = [];
  const lineEnd = (line) => Math.max(...line.map((r) => r.x + r.width)), widest = Math.max(...lines2.map(lineEnd)), textLeft = Math.min(...runs.map((r) => r.x));
  lines2.forEach((line, li) => {
    line.sort((a, b) => a.x - b.x);
    if (li) {
      const gap = line[0].baseline - lines2[li - 1][0].baseline, size2 = lines2[li - 1][0].size, first = line.map((r) => r.text).join("").trim();
      const head = line[0], firstWord = head.width * (head.text.trim().split(/\s+/)[0].length / Math.max(1, head.text.trim().length));
      const room = box.x + box.width - (textLeft - box.x) - lineEnd(lines2[li - 1]);
      const breakLine = keepLines || /^[✓✔•▪●◦‣\-–—*]/.test(first) || gap > size2 * 1.75 || Math.abs(line[0].size - size2) > Math.max(line[0].size, size2) * 0.3 || /[:;]$/.test(texts[li - 1]) || flow && (lineEnd(lines2[li - 1]) < widest - size2 * 4 || room > firstWord + size2 * 0.3);
      const blanks = flow && gap > size2 * 1.75 ? Math.min(3, Math.max(1, Math.round(gap / (size2 * 1.22)) - 1)) : 0;
      {
        const last = parts.at(-1), plain = { ...line[0], script: void 0, link: void 0, underline: void 0, strike: void 0 };
        push(breakLine ? "\n".repeat(1 + blanks) : " ", last ? { ...plain, bold: last.bold, italic: last.italic, color: last.color, size: last.size, font: last.font, script: last.script, link: last.link, underline: last.underline, strike: last.strike } : plain);
      }
    }
    let lineText = "";
    line.forEach((run2, i) => {
      const prev = line[i - 1], gap = prev ? run2.x - (prev.x + prev.width) : 0, piece = ((i && (run2.space || gap > run2.size * 0.15) && !/^\s/.test(run2.text) ? " ".repeat(flow ? spacesIn(gap, run2.size * 0.25) : 1) : "") + run2.text).replace(i ? /$^/ : /^\s+/, "");
      lineText += piece;
      push(i === line.length - 1 ? piece.trimEnd() : piece, run2);
    });
    texts.push(lineText.trim());
  });
  const text2 = parts.map((p) => p.text).join("");
  const left = Math.min(...runs.map((r) => r.x)), right = Math.max(...runs.map((r) => r.x + r.width));
  const top = Math.min(...runs.map((r) => r.baseline - r.size * 0.8)), bottom = Math.max(...runs.map((r) => r.baseline + r.size * 0.2));
  const gapL = left - box.x, gapR = box.x + box.width - right, gapT = top - box.y, gapB = box.y + box.height - bottom;
  const narrow = right - left < box.width * 0.75;
  const align = narrow && Math.abs(gapL - gapR) < Math.max(4, box.width * 0.08) && gapL > 6 ? "center" : narrow && gapR < gapL * 0.5 && gapL > 12 ? "right" : "left";
  const ends = lines2.map((line) => Math.max(...line.map((r) => r.x + r.width))), wrapped = ends.filter((_, i) => i < lines2.length - 1 && !!texts[i] && !/[:;.]$/.test(texts[i]));
  const justified = flow && align === "left" && wrapped.length >= 2 && wrapped.filter((e) => right - e < Math.max(1.5, runs[0].size * 0.15)).length >= wrapped.length * 0.8;
  const valign = Math.abs(gapT - gapB) < Math.max(4, box.height * 0.15) ? "middle" : gapB < gapT * 0.5 ? "bottom" : "top";
  const weight = /* @__PURE__ */ new Map(), symbol = /wingdings|webdings|symbol|dingbat|zapf/i;
  for (const r of runs) if (!symbol.test(r.font) && r.text.trim().length > 1) weight.set(r.font, (weight.get(r.font) ?? 0) + r.text.length);
  const main = runs.find((r) => r.font === [...weight].sort((a, b) => b[1] - a[1])[0]?.[0]) ?? runs.find((r) => !symbol.test(r.font)) ?? sorted[0];
  const size = Math.max(...runs.filter((r) => r.font === main.font).map((r) => r.size));
  const chars = (pick) => runs.filter(pick).reduce((n, r) => n + r.text.length, 0);
  return { parts, text: text2, font: main.font, size, bold: chars((r) => r.bold) > chars(() => true) / 2, italic: main.italic, color: main.color, align: justified ? "justify" : align, valign, inset: gapL, insetTop: Math.max(0, gapT), ...lines2.length === 1 && right > box.x + box.width + 1 ? { overflow: true } : {} };
}
async function pageGrid(page2, fonts) {
  const viewport = page2.getViewport({ scale: 1 }), width = viewport.width, height = viewport.height, area = width * height;
  const [{ shapes }, runs] = await Promise.all([vectorShapes(page2), pageRuns(page2, fonts)]);
  const parsed = strokes(shapes);
  const fills = parsed.shades.map((s) => ({ ...s, page: s.box.width * s.box.height > area * 0.9 }));
  const rules = parsed.segments.filter((s) => !s.invisible).map((s) => ({ segments: [], box: s.horizontal ? { x: s.from, y: s.at, width: s.to - s.from, height: 0 } : { x: s.at, y: s.from, width: 0, height: s.to - s.from }, stroke: { color: s.color, alpha: 1, width: s.width, dash: false } }));
  const cells = fills.filter((f) => !f.page && f.box.width >= 2.5 && f.box.height >= 2.5);
  if (cells.length + rules.length < 3) return null;
  const xs = cluster2([0, width, ...cells.flatMap((f) => [f.box.x, f.box.x + f.box.width]), ...rules.filter((r) => r.box.width < 1.5).map((r) => r.box.x)]).filter((x) => x >= -1 && x <= width + 1);
  const ys = cluster2([0, height, ...cells.flatMap((f) => [f.box.y, f.box.y + f.box.height]), ...rules.filter((r) => r.box.height < 1.5).map((r) => r.box.y)]).filter((y) => y >= -1 && y <= height + 1);
  if (xs.length < 4 || ys.length < 4) return null;
  const drawnY = [...cells.flatMap((f) => [f.box.y, f.box.y + f.box.height]), ...rules.flatMap((r) => [r.box.y, r.box.y + r.box.height])], drawnTop = Math.min(...drawnY), drawnBottom = Math.max(...drawnY);
  const loose = /* @__PURE__ */ new Set(), bands = [];
  for (const run2 of [...runs].filter((r) => r.text.trim() && (r.baseline < drawnTop - 1 || r.baseline - r.size * 0.7 > drawnBottom + 1)).sort((a, b) => a.baseline - b.baseline)) {
    const top = run2.baseline - run2.size * 0.8, bottom = run2.baseline + run2.size * 0.22, last = bands.at(-1);
    if (last && top < last.bottom - run2.size * 0.3) last.bottom = Math.max(last.bottom, bottom);
    else bands.push({ top, bottom });
  }
  for (const [i, band] of bands.entries()) {
    const previous2 = bands[i - 1], edge = previous2 && band.top - previous2.bottom < 40 ? (previous2.bottom + band.top) / 2 : band.top - 1;
    for (const y of [edge, ...bands[i + 1] && bands[i + 1].top - band.bottom < 40 ? [] : [band.bottom + 1]]) if (!ys.some((v) => Math.abs(v - y) <= TOLERANCE)) {
      ys.push(y);
      loose.add(y);
    }
  }
  ys.sort((a, b) => a - b);
  const R2 = ys.length - 1, C = xs.length - 1;
  const owner = Array.from({ length: R2 }, () => Array(C).fill(-1));
  const all2 = fills;
  for (let r = 0; r < R2; r++) for (let c = 0; c < C; c++) {
    const cx = (xs[c] + xs[c + 1]) / 2, cy = (ys[r] + ys[r + 1]) / 2;
    for (let i = all2.length - 1; i >= 0; i--) {
      const b = all2[i].box;
      if (cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height) {
        owner[r][c] = i;
        break;
      }
    }
  }
  const covered = (r, along, at, from, to) => along === "x" ? Math.abs(r.box.x - at) <= TOLERANCE && r.box.y <= from + TOLERANCE && r.box.y + r.box.height >= to - TOLERANCE : Math.abs(r.box.y - at) <= TOLERANCE && r.box.x <= from + TOLERANCE && r.box.x + r.box.width >= to - TOLERANCE;
  const wallRight = (r, c) => owner[r][c] !== owner[r][c + 1] || rules.some((x) => covered(x, "x", xs[c + 1], ys[r], ys[r + 1]));
  const wallBelow = (r, c) => loose.has(ys[r + 1]) || owner[r][c] !== owner[r + 1][c] || rules.some((x) => covered(x, "y", ys[r + 1], xs[c], xs[c + 1]));
  const textAt = Array.from({ length: R2 }, () => Array.from({ length: C }, () => []));
  const cellOf = (run2) => [Math.min(R2 - 1, Math.max(0, snapCell(ys, run2.baseline - run2.size * 0.35))), Math.min(C - 1, Math.max(0, snapCell(xs, run2.x + Math.min(run2.width, run2.size * 2) / 2)))];
  const ruled = (from, to, baseline, size) => rules.some((x) => x.box.width < 1.5 && x.box.x > from - 0.5 && x.box.x < to + 0.5 && x.box.y <= baseline - size * 0.5 && x.box.y + x.box.height >= baseline);
  const textLines = [];
  for (const run2 of [...runs].filter((run3) => run3.text.trim()).sort((a, b) => a.baseline - b.baseline)) {
    const line = textLines.at(-1);
    if (line && Math.abs(line[0].baseline - run2.baseline) < run2.size * 0.4) line.push(run2);
    else textLines.push([run2]);
  }
  let previous, start;
  for (const run2 of textLines.flatMap((line) => line.sort((a, b) => a.x - b.x))) {
    const joins = previous && Math.abs(previous.baseline - run2.baseline) < run2.size * 0.4 && run2.x - (previous.x + previous.width) < Math.max(run2.size, previous.size) * 0.8 && run2.x >= previous.x && !ruled(previous.x + previous.width, run2.x + Math.min(run2.width, run2.size), run2.baseline, run2.size);
    const at = joins && start ? start : cellOf(run2);
    textAt[at[0]][at[1]].push(run2);
    previous = run2;
    start = at;
  }
  const taken = Array.from({ length: R2 }, () => Array(C).fill(false)), regions = [];
  for (let r = 0; r < R2; r++) for (let c = 0; c < C; c++) {
    if (taken[r][c]) continue;
    let cols = 1, rows = 1;
    while (c + cols < C && !taken[r][c + cols] && !wallRight(r, c + cols - 1)) cols++;
    grow: while (r + rows < R2) {
      for (let k = 0; k < cols; k++) {
        if (taken[r + rows][c + k] || wallBelow(r + rows - 1, c + k) || k < cols - 1 && wallRight(r + rows, c + k)) break grow;
      }
      if (c + cols < C && !wallRight(r + rows, c + cols - 1)) break;
      if (c > 0 && !wallRight(r + rows, c - 1)) break;
      rows++;
    }
    const runsIn = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_2, k) => textAt[r + i][c + k])).flat(2);
    if (!runsIn.length && (owner[r][c] < 0 || all2[owner[r][c]].page)) {
      cols = 1;
      rows = 1;
    }
    for (let i = 0; i < rows; i++) for (let k = 0; k < cols; k++) taken[r + i][c + k] = true;
    const box = { x: xs[c], y: ys[r], width: xs[c + cols] - xs[c], height: ys[r + rows] - ys[r] }, own = owner[r][c];
    const fill = own >= 0 ? all2[own].color : void 0;
    const edge = (along, at, from, to) => {
      const rule = rules.find((x) => covered(x, along, at, from, to));
      return rule?.stroke ? { color: rule.stroke.color, width: rule.stroke.width } : void 0;
    };
    const borders = { top: edge("y", box.y, box.x, box.x + box.width), bottom: edge("y", box.y + box.height, box.x, box.x + box.width), left: edge("x", box.x, box.y, box.y + box.height), right: edge("x", box.x + box.width, box.y, box.y + box.height) };
    regions.push({ row: r, col: c, rows, cols, borders: Object.values(borders).some(Boolean) ? borders : void 0, fill: fill && fill !== "#ffffff" ? fill : void 0, page: own >= 0 && all2[own].page, text: cellText(runsIn.length ? runsIn : [], box) });
  }
  const xsT = [...cells.flatMap((f) => [f.box.x, f.box.x + f.box.width]), ...rules.map((r) => r.box.x), ...rules.map((r) => r.box.x + r.box.width)];
  const ysT = [...cells.flatMap((f) => [f.box.y, f.box.y + f.box.height]), ...rules.map((r) => r.box.y), ...rules.map((r) => r.box.y + r.box.height)];
  const tables = xsT.length ? [{ col: snap(xs, Math.min(...xsT)), row: snap(ys, Math.min(...ysT)), cols: Math.max(1, snap(xs, Math.max(...xsT)) - snap(xs, Math.min(...xsT))), rows: Math.max(1, snap(ys, Math.max(...ysT)) - snap(ys, Math.min(...ysT))) }] : [];
  return { xs, ys, regions, width, height, tables };
}
function snapCell(edges, v) {
  let i = 0;
  while (i < edges.length - 2 && v > edges[i + 1]) i++;
  return i;
}
function tableOf(grid) {
  const t = grid.tables[0];
  if (!t || t.rows < 1 || t.cols < 1) return null;
  const cells = grid.regions.filter((r) => r.row >= t.row && r.col >= t.col && r.row + r.rows <= t.row + t.rows && r.col + r.cols <= t.col + t.cols).map((r) => ({ ...r, row: r.row - t.row, col: r.col - t.col }));
  const count = cells.reduce((n, r) => n + r.rows * r.cols, 0);
  if (count !== t.rows * t.cols || !cells.some((c) => c.text)) return null;
  const xs = grid.xs.slice(t.col, t.col + t.cols + 1), ys = grid.ys.slice(t.row, t.row + t.rows + 1);
  return { x: xs[0], y: ys[0], width: xs.at(-1) - xs[0], height: ys.at(-1) - ys[0], colW: xs.slice(1).map((x, i) => x - xs[i]), rowH: ys.slice(1).map((y, i) => y - ys[i]), cells };
}
var insideTable = (t, box) => box.x >= t.x - 3 && box.y >= t.y - 3 && box.x + box.width <= t.x + t.width + 3 && box.y + box.height <= t.y + t.height + 3;

// ../cliqueprojeto/gcp-pdf/src/main/conversion.ts
var import_pptxgenjs = __toESM(require("pptxgenjs"));
var localRequire = (0, import_node_module.createRequire)(typeof __filename === "string" ? __filename : (0, import_node_url.pathToFileURL)((0, import_node_path2.resolve)("package.json")));
var pdfjsPromise;
async function pdfjs() {
  Object.assign(globalThis, { DOMMatrix: import_canvas2.DOMMatrix, ImageData: import_canvas2.ImageData, Path2D: import_canvas2.Path2D });
  return pdfjsPromise ??= import("pdfjs-dist/legacy/build/pdf.mjs");
}
var NodeCanvasFactory = class {
  create(width, height) {
    const canvas = (0, import_canvas2.createCanvas)(Math.ceil(width), Math.ceil(height));
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(target, width, height) {
    target.canvas.width = Math.ceil(width);
    target.canvas.height = Math.ceil(height);
  }
  destroy(target) {
    target.canvas.width = 1;
    target.canvas.height = 1;
  }
};
async function loadPdf(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) throw new Error("O PDF est\xE1 vazio ou n\xE3o p\xF4de ser lido.");
  const engine = await pdfjs();
  const root = (0, import_node_path2.dirname)(localRequire.resolve("pdfjs-dist/package.json"));
  const task = engine.getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: true,
    disableFontFace: true,
    fontExtraProperties: true,
    standardFontDataUrl: (0, import_node_path2.join)(root, "standard_fonts") + "/",
    cMapUrl: (0, import_node_path2.join)(root, "cmaps") + "/",
    cMapPacked: true,
    wasmUrl: (0, import_node_path2.join)(root, "wasm") + "/",
    CanvasFactory: NodeCanvasFactory
  });
  try {
    return await task.promise;
  } catch (error) {
    await task.destroy();
    throw new Error(`N\xE3o foi poss\xEDvel abrir o PDF para exporta\xE7\xE3o: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function cleanFont(value) {
  const font = value.replace(/^[A-Z]{6}\+/, "").replace(/[-,](BoldItalic|BoldOblique|Regular|Italic|Oblique|Bold|Roman|MT).*$/i, "").replace(/PSMT$/, "");
  return /serif/i.test(font) && !/sans/i.test(font) ? "Times New Roman" : /sans|helvetica|arial|inter/i.test(font) ? "Arial" : /mono|courier/i.test(font) ? "Courier New" : font || "Arial";
}
function joinRuns(runs) {
  let text2 = "";
  let previous;
  for (const run2 of runs) {
    if (previous && run2.x - (previous.x + previous.width) > Math.max(1, run2.fontSize * 0.17) && !/\s$/.test(text2) && !/^\s/.test(run2.text)) text2 += " ";
    text2 += run2.text;
    previous = run2;
  }
  return text2;
}
function groupLines(runs) {
  const rows = [];
  for (const run2 of runs.sort((a, b) => a.y - b.y || a.x - b.x)) {
    const row = rows.find((r) => Math.abs(r[0].y - run2.y) <= Math.max(2, Math.min(r[0].fontSize, run2.fontSize) * 0.28));
    if (row) row.push(run2);
    else rows.push([run2]);
  }
  return rows.map((row) => {
    row.sort((a, b) => a.x - b.x);
    const x = Math.min(...row.map((r) => r.x)), y = Math.min(...row.map((r) => r.y));
    return { runs: row, x, y, width: Math.max(...row.map((r) => r.x + r.width)) - x, height: Math.max(...row.map((r) => r.height)), fontSize: Math.max(...row.map((r) => r.fontSize)), text: joinRuns(row) };
  }).sort((a, b) => a.y - b.y || a.x - b.x);
}
async function inspectPage(page2, includeImages) {
  const engine = await pdfjs(), viewport = page2.getViewport({ scale: 1 });
  const operators = includeImages ? await page2.getOperatorList() : void 0;
  const content = await page2.getTextContent();
  const runs = [];
  for (const item of content.items) {
    if (!("str" in item) || !item.str.trim()) continue;
    const t = engine.Util.transform(viewport.transform, item.transform), style = content.styles[item.fontName];
    let rawFont = style?.fontFamily || "Arial", isBold = false, isItalic = false;
    try {
      const font = page2.commonObjs.get(item.fontName);
      rawFont = font?.name || font?.systemFontInfo?.baseFontName || font?.cssFontInfo?.fontFamily || rawFont;
      isBold = Boolean(font?.bold || font?.black);
      isItalic = Boolean(font?.italic);
    } catch {
    }
    const fontSize = Math.max(1, Math.hypot(t[2], t[3])), ascent = style?.ascent ?? 0.85;
    const x = t[4], y = t[5] - fontSize * ascent;
    if ([x, y, fontSize, item.width].every(Number.isFinite)) runs.push({ text: item.str, x, y, width: Math.max(item.width, 1), height: fontSize * 1.25, fontSize, font: cleanFont(rawFont), bold: isBold || /bold|black|semibold|demi/i.test(rawFont), italic: isItalic || /italic|oblique/i.test(rawFont), angle: Math.atan2(t[1], t[0]) * 180 / Math.PI });
  }
  const result = { page: page2, width: viewport.width, height: viewport.height, lines: groupLines(runs), images: [], hasVectors: false, warnings: [] };
  if (!includeImages) return result;
  try {
    if (!operators) return result;
    let matrix = [1, 0, 0, 1, 0, 0];
    const stack = [];
    const OPS = engine.OPS;
    for (let i = 0; i < operators.fnArray.length; i++) {
      const fn = operators.fnArray[i], args = operators.argsArray[i];
      if (fn === OPS.save) {
        stack.push([...matrix]);
        continue;
      }
      if (fn === OPS.restore) {
        matrix = stack.pop() ?? [1, 0, 0, 1, 0, 0];
        continue;
      }
      if (fn === OPS.transform) {
        matrix = engine.Util.transform(matrix, args);
        continue;
      }
      if (fn === OPS.constructPath) {
        result.hasVectors = true;
        continue;
      }
      if (fn === OPS.paintImageMaskXObject || fn === OPS.paintImageXObjectRepeat || fn === OPS.paintImageMaskXObjectRepeat) {
        result.warnings.push("M\xE1scaras ou imagens repetidas podem precisar do modo de fidelidade visual.");
        continue;
      }
      if (fn !== OPS.paintImageXObject && fn !== OPS.paintInlineImageXObject) continue;
      let image;
      if (fn === OPS.paintInlineImageXObject) image = args[0];
      else {
        const id = String(args[0]);
        image = await new Promise((resolveImage) => {
          const store = id.startsWith("g_") ? page2.commonObjs : page2.objs;
          try {
            store.get(id, resolveImage);
          } catch {
            resolveImage(null);
          }
        });
      }
      if (!image?.width || !image.height) continue;
      const source = (0, import_canvas2.createCanvas)(image.width, image.height), sourceContext = source.getContext("2d");
      if (image.bitmap) sourceContext.drawImage(image.bitmap, 0, 0);
      else if (image.data) {
        const rgba = new Uint8ClampedArray(image.width * image.height * 4), input = image.data;
        if (input.length === rgba.length) rgba.set(input);
        else if (input.length === image.width * image.height * 3) for (let p = 0, q = 0; p < input.length; p += 3, q += 4) {
          rgba[q] = input[p];
          rgba[q + 1] = input[p + 1];
          rgba[q + 2] = input[p + 2];
          rgba[q + 3] = 255;
        }
        else {
          result.warnings.push("Uma imagem com codifica\xE7\xE3o especial n\xE3o p\xF4de ser reconstru\xEDda no modo edit\xE1vel.");
          continue;
        }
        sourceContext.putImageData(new import_canvas2.ImageData(rgba, image.width, image.height), 0, 0);
      } else continue;
      const t = engine.Util.transform(viewport.transform, matrix), points = [[t[4], t[5]], [t[4] + t[0], t[5] + t[1]], [t[4] + t[2], t[5] + t[3]], [t[4] + t[0] + t[2], t[5] + t[1] + t[3]]];
      const x = Math.min(...points.map((p) => p[0])), y = Math.min(...points.map((p) => p[1])), width = Math.max(...points.map((p) => p[0])) - x, height = Math.max(...points.map((p) => p[1])) - y;
      if (width <= 0 || height <= 0 || width * height > 4e7) continue;
      const target = (0, import_canvas2.createCanvas)(Math.max(1, Math.ceil(width * 2)), Math.max(1, Math.ceil(height * 2))), context = target.getContext("2d");
      context.setTransform(2 * t[0] / image.width, 2 * t[1] / image.width, -2 * t[2] / image.height, -2 * t[3] / image.height, 2 * (t[4] + t[2] - x), 2 * (t[5] + t[3] - y));
      context.drawImage(source, 0, 0);
      result.images.push({ bytes: target.toBuffer("image/png"), x, y, width, height });
    }
  } catch (error) {
    result.warnings.push(`Imagens n\xE3o puderam ser totalmente extra\xEDdas: ${error instanceof Error ? error.message : String(error)}`);
  }
  return result;
}
async function renderPage(page2, dpi, warnings) {
  const requested = page2.getViewport({ scale: dpi / 72 });
  const reduction = Math.min(1, Math.sqrt(4e7 / (requested.width * requested.height)));
  if (reduction < 1) warnings.push("Uma p\xE1gina muito grande teve a resolu\xE7\xE3o ajustada para caber na mem\xF3ria de renderiza\xE7\xE3o.");
  const viewport = page2.getViewport({ scale: dpi / 72 * reduction });
  const canvas = (0, import_canvas2.createCanvas)(Math.max(1, Math.ceil(viewport.width)), Math.max(1, Math.ceil(viewport.height)));
  await page2.render({ canvas, canvasContext: canvas.getContext("2d"), viewport, background: "white" }).promise;
  return canvas.toBuffer("image/png");
}
function progress(callback, page2, total) {
  callback?.(`Convertendo p\xE1gina ${page2} de ${total}\u2026`);
}
function uniqueWarnings(warnings) {
  return [...new Set(warnings)];
}
function validateOptions(options) {
  const formats = ["pdf", "image-pdf", "png", "txt", "docx", "xlsx", "pptx"];
  if (!options || !formats.includes(options.format)) throw new Error("Formato de exporta\xE7\xE3o n\xE3o reconhecido.");
  if (options.mode !== void 0 && !["editable", "fidelity"].includes(options.mode)) throw new Error("Modo de exporta\xE7\xE3o n\xE3o reconhecido.");
  if (options.dpi !== void 0 && (!Number.isFinite(options.dpi) || options.dpi < 72 || options.dpi > 600)) throw new Error("Escolha uma resolu\xE7\xE3o entre 72 e 600 DPI.");
}
async function extractDocumentText(bytes) {
  const pdf = await loadPdf(bytes);
  try {
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const data = await inspectPage(await pdf.getPage(i), false);
      pages.push(`[P\xE1gina ${i}]
${data.lines.map((l) => l.text).join("\n")}`);
    }
    return pages.join("\n\n");
  } finally {
    await pdf.loadingTask.destroy();
  }
}
async function convertPdf(bytes, options, onProgress, ocr = /* @__PURE__ */ new Map()) {
  validateOptions(options);
  if (options.format === "pdf") return { bytes: new Uint8Array(bytes), extension: "pdf", warnings: [] };
  const pdf = await loadPdf(bytes), warnings = [], dpi = options.dpi ?? (options.format === "image-pdf" ? 300 : 150);
  try {
    if (options.format === "txt") {
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        progress(onProgress, i, pdf.numPages);
        const data = await inspectPage(await pdf.getPage(i), false);
        pages.push(data.lines.map((l) => l.text).join("\n"));
        if (!data.lines.length) warnings.push(`A p\xE1gina ${i} n\xE3o tem texto extra\xEDvel; execute OCR para obter texto.`);
      }
      return { bytes: Buffer.from(pages.join("\n\f\n"), "utf8"), extension: "txt", warnings: uniqueWarnings(warnings) };
    }
    if (options.format === "png") {
      if (pdf.numPages > 1) warnings.push("A exporta\xE7\xE3o PNG cont\xE9m somente a primeira p\xE1gina. Para todas as p\xE1ginas em um arquivo, use PDF baseado em imagem.");
      return { bytes: await renderPage(await pdf.getPage(1), dpi, warnings), extension: "png", warnings };
    }
    if (options.format === "image-pdf") {
      const output = await import_pdf_lib3.PDFDocument.create();
      output.setProducer("GCP-PDF");
      output.setCreator("GCP-PDF \u2014 Gest\xE3o Cultural Pro");
      for (let i = 1; i <= pdf.numPages; i++) {
        progress(onProgress, i, pdf.numPages);
        const page2 = await pdf.getPage(i), viewport = page2.getViewport({ scale: 1 }), png = await output.embedPng(await renderPage(page2, dpi, warnings));
        output.addPage([viewport.width, viewport.height]).drawImage(png, { x: 0, y: 0, width: viewport.width, height: viewport.height });
      }
      warnings.push("O PDF cont\xE9m apenas imagens das p\xE1ginas; ele n\xE3o mant\xE9m texto pesquis\xE1vel, formul\xE1rios ou assinaturas criptogr\xE1ficas. Uma imagem ainda pode ser alterada por outros programas.");
      return { bytes: await output.save(), extension: "pdf", warnings: uniqueWarnings(warnings) };
    }
    if (options.format === "docx" && options.mode !== "fidelity") return await toDocxLayout(bytes, options.dpi ?? 150, warnings, onProgress, ocr);
    if (options.format === "docx") return await toDocx(pdf, options, dpi, warnings, onProgress);
    if (options.format === "xlsx") return await toXlsx(pdf, dpi, warnings, onProgress);
    if (options.mode !== "fidelity") return await toPptxLayout(bytes, options.dpi ?? 150, warnings, onProgress, ocr);
    return await toPptx(pdf, options, dpi, warnings, onProgress);
  } finally {
    await pdf.loadingTask.destroy();
  }
}
function imageParagraph(image) {
  return new import_docx3.Paragraph({ spacing: { before: 0, after: 0 }, children: [new import_docx3.ImageRun({ type: "png", data: image.bytes, transformation: { width: image.width * 96 / 72, height: image.height * 96 / 72 }, floating: { horizontalPosition: { relative: import_docx3.HorizontalPositionRelativeFrom.PAGE, offset: Math.round(image.x * 12700) }, verticalPosition: { relative: import_docx3.VerticalPositionRelativeFrom.PAGE, offset: Math.round(image.y * 12700) }, allowOverlap: true, lockAnchor: true, wrap: { type: import_docx3.TextWrappingType.NONE } } })] });
}
async function toDocx(pdf, options, dpi, warnings, onProgress) {
  const sections = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    progress(onProgress, i, pdf.numPages);
    const data = await inspectPage(await pdf.getPage(i), options.mode !== "fidelity"), children2 = [];
    warnings.push(...data.warnings);
    if (options.mode === "fidelity" || !data.lines.length) {
      if (options.mode !== "fidelity" && !data.lines.length) warnings.push(`A p\xE1gina ${i} n\xE3o tem texto extra\xEDvel e foi preservada como imagem. Execute OCR para gerar texto edit\xE1vel.`);
      children2.push(imageParagraph({ bytes: await renderPage(data.page, dpi, warnings), x: 0, y: 0, width: data.width, height: data.height }));
    } else {
      for (const image of data.images) children2.push(imageParagraph(image));
      for (const line of data.lines) {
        if (line.runs.some((r) => Math.abs(r.angle) > 0.5)) warnings.push("Textos inclinados ou verticais podem mudar de orienta\xE7\xE3o no Word edit\xE1vel.");
        for (const segment of splitLineRuns(line)) {
          const x = segment[0].x, width = Math.max(...segment.map((run2) => run2.x + run2.width)) - x, fontSize = Math.max(...segment.map((run2) => run2.fontSize));
          children2.push(new import_docx3.Paragraph({ frame: { type: "absolute", position: { x: Math.max(0, Math.round(x * 20)), y: Math.max(0, Math.round(line.y * 20)) }, width: Math.max(20, Math.round(Math.min(data.width - x, width + fontSize * 1.3) * 20)), height: Math.round(line.height * 20), anchor: { horizontal: import_docx3.FrameAnchorType.PAGE, vertical: import_docx3.FrameAnchorType.PAGE }, rule: import_docx3.HeightRule.ATLEAST, wrap: import_docx3.FrameWrap.NONE, space: { horizontal: 0, vertical: 0 } }, spacing: { before: 0, after: 0, line: Math.round(fontSize * 24) }, children: segment.map((run2, index) => {
            const previous = segment[index - 1], gap = previous ? run2.x - (previous.x + previous.width) : 0;
            return new import_docx3.TextRun({ text: (gap > Math.max(1, run2.fontSize * 0.17) && !/^\s/.test(run2.text) ? " " : "") + run2.text, font: run2.font, size: Math.round(run2.fontSize * 2), bold: run2.bold, italics: run2.italic });
          }) }));
        }
      }
      if (data.hasVectors) warnings.push("O Word edit\xE1vel reconstr\xF3i texto e imagens; vetores, efeitos, recortes complexos e fontes indispon\xEDveis podem diferir. Use fidelidade visual quando a apar\xEAncia exata for priorit\xE1ria.");
    }
    children2.push(new import_docx3.Paragraph({ spacing: { before: 0, after: 0, line: 1 }, children: [new import_docx3.TextRun({ text: "", size: 1 })] }));
    sections.push({ properties: { type: import_docx3.SectionType.NEXT_PAGE, page: { size: { width: Math.round(data.width * 20), height: Math.round(data.height * 20) }, margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 } } }, children: children2 });
    data.page.cleanup();
  }
  if (options.mode === "fidelity") warnings.push("O Word em fidelidade visual cont\xE9m uma imagem de cada p\xE1gina; o conte\xFAdo n\xE3o \xE9 texto edit\xE1vel.");
  else warnings.push("O Word edit\xE1vel conserva posi\xE7\xF5es em quadros de texto; revise quebras de linha e fontes no aplicativo de destino.");
  const document = new import_docx3.Document({ creator: "Bruno Albertini | Gest\xE3o Cultural Pro", title: "Documento convertido pelo GCP-PDF", description: "Convers\xE3o local de PDF", sections, styles: { default: { document: { run: { font: "Arial", language: { value: "pt-BR" } } } } } });
  return { bytes: await import_docx3.Packer.toBuffer(document), extension: "docx", warnings: uniqueWarnings(warnings) };
}
function splitLineRuns(line) {
  const segments = [];
  for (const run2 of line.runs) {
    const last = segments[segments.length - 1], previous = last?.[last.length - 1];
    if (last && previous && run2.x - (previous.x + previous.width) <= Math.max(8, run2.fontSize * 1.5)) last.push(run2);
    else segments.push([run2]);
  }
  return segments;
}
function lineCells(line) {
  return splitLineRuns(line).map((r) => ({ x: r[0].x, right: Math.max(...r.map((v) => v.x + v.width)), text: joinRuns(r).trim(), fontSize: Math.max(...r.map((v) => v.fontSize)), bold: r.some((v) => v.bold), font: r[0].font }));
}
function spreadsheetValue(text2) {
  const trimmed = text2.trim(), currency = /^R\$\s*/.test(trimmed), value = trimmed.replace(/^R\$\s*/, "").replace(/\u00a0/g, " ").trim();
  if (/^0\d/.test(value) || /\d[-/ ]\d/.test(value)) return { value: trimmed };
  if (/^-?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?$/.test(value)) {
    const number = Number(value.replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(number) && Number.isSafeInteger(Math.trunc(number))) return { value: number, format: currency ? '"R$" #,##0.00' : value.includes(",") ? "#,##0.00" : void 0 };
  }
  if (/^-?\d+\.\d{1,2}$/.test(value) && !currency) return { value: Number(value), format: "#,##0.00" };
  if (/^-?\d+(?:[.,]\d+)?\s*%$/.test(value)) {
    const n = Number(value.replace(/\s*%$/, "").replace(",", "."));
    return { value: n / 100, format: Number.isInteger(n) ? "0%" : "0.00%" };
  }
  return { value: trimmed };
}
var PT_PER_CHAR = 5.25;
function paperSize(width, height) {
  const [short, long] = [Math.min(width, height), Math.max(width, height)], near = (a, b) => Math.abs(short - a) < 6 && Math.abs(long - b) < 6;
  return near(612, 792) ? 1 : near(612, 1008) ? 5 : near(842, 1191) ? 8 : near(420, 595) ? 11 : 9;
}
var argb = (hex3) => "FF" + hex3.replace("#", "").toUpperCase();
function gridSheet(sheet, grid, images, turned = []) {
  const used = grid.regions.filter((r) => r.text || r.fill && !r.page), lastRow = Math.max(0, ...used.map((r) => r.row + r.rows)), rows = Math.max(1, lastRow);
  sheet.columns = grid.xs.slice(0, -1).map((x, c) => ({ width: Math.max(1, (grid.xs[c + 1] - x) / PT_PER_CHAR) }));
  for (let r = 0; r < rows; r++) sheet.getRow(r + 1).height = Math.min(409, Math.max(4, grid.ys[r + 1] - grid.ys[r]));
  for (const region of grid.regions) {
    if (region.row >= rows) continue;
    const cell = sheet.getCell(region.row + 1, region.col + 1);
    if (region.rows > 1 || region.cols > 1) sheet.mergeCells(region.row + 1, region.col + 1, region.row + region.rows, region.col + region.cols);
    if (region.fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(region.fill) } };
    if (region.borders) {
      const side = (e) => e ? { style: e.width >= 2.5 ? "thick" : e.width >= 1.4 ? "medium" : "thin", color: { argb: argb(e.color) } } : void 0;
      cell.border = { top: side(region.borders.top), bottom: side(region.borders.bottom), left: side(region.borders.left), right: side(region.borders.right) };
    }
    const t = region.text;
    if (!t) continue;
    const parsed = t.text.includes("\n") ? { value: t.text } : spreadsheetValue(t.text);
    const mixed = t.parts.length > 1 && t.parts.some((p) => p.bold !== t.parts[0].bold || p.color !== t.parts[0].color || p.italic !== t.parts[0].italic || p.font !== t.parts[0].font || p.size !== t.parts[0].size);
    cell.value = mixed && typeof parsed.value === "string" ? { richText: t.parts.map((p) => ({ text: p.text, font: { name: p.font || t.font, size: Math.round(p.size * 10) / 10, bold: p.bold, italic: p.italic, color: { argb: argb(p.color) } } })) } : parsed.value;
    if (parsed.format) cell.numFmt = parsed.format;
    cell.font = { name: t.font, size: Math.round(t.size * 10) / 10, bold: t.bold, italic: t.italic, color: { argb: argb(t.color) } };
    cell.alignment = { horizontal: typeof parsed.value === "number" && t.align === "left" ? "right" : t.align, vertical: t.valign === "middle" ? "middle" : t.valign, wrapText: !t.overflow };
  }
  const track = (edges, v) => {
    let i = 0;
    while (i < edges.length - 2 && v > edges[i + 1]) i++;
    return i;
  };
  for (const t of turned) {
    const box = turnedBox(t), r = track(grid.ys, box.y + box.height / 2), c = track(grid.xs, box.x + box.width / 2);
    if (r >= rows) continue;
    const cell = sheet.getCell(r + 1, c + 1), master = cell.master ?? cell, rotation = Math.max(-90, Math.min(90, Math.round(-t.angle)));
    master.value = master.value ? `${String(typeof master.value === "object" && "richText" in master.value ? master.value.richText.map((p) => p.text).join("") : master.value)} ${t.text}` : t.text;
    master.font = { name: t.font, size: Math.round(t.size * 10) / 10, bold: t.bold, italic: t.italic, color: { argb: argb(t.color) } };
    master.alignment = { ...master.alignment, textRotation: rotation, horizontal: "center", vertical: "middle" };
  }
  const at = (edges, v) => {
    let i = 0;
    while (i < edges.length - 2 && v > edges[i + 1]) i++;
    return i + Math.max(0, Math.min(1, (v - edges[i]) / (edges[i + 1] - edges[i] || 1)));
  };
  for (const image of images) sheet.addImage(image.id, { tl: { col: at(grid.xs, image.x), row: at(grid.ys, image.y) }, ext: { width: image.width * 96 / 72, height: image.height * 96 / 72 } });
}
async function toXlsx(pdf, dpi, warnings, onProgress) {
  const workbook = new import_exceljs.default.Workbook();
  workbook.creator = "Bruno Albertini | Gest\xE3o Cultural Pro";
  workbook.company = "Gest\xE3o Cultural Pro";
  let gridPages = 0;
  for (let i = 1; i <= pdf.numPages; i++) {
    progress(onProgress, i, pdf.numPages);
    const data = await inspectPage(await pdf.getPage(i), true), sheet = workbook.addWorksheet(`P\xE1gina ${i}`, { pageSetup: { paperSize: paperSize(data.width, data.height), orientation: data.width > data.height ? "landscape" : "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: false, verticalCentered: false, margins: { left: 0, right: 0, top: 0, bottom: 0, header: 0, footer: 0 } }, properties: { defaultRowHeight: 18 }, views: [{ showGridLines: false }] });
    const grid = await pageGrid(data.page).catch(() => null);
    if (grid && grid.regions.some((r) => r.text)) {
      const images = data.images.filter((im) => im.width > 8 && im.height > 8).map((im) => ({ x: im.x, y: im.y, width: im.width, height: im.height, id: workbook.addImage({ buffer: im.bytes, extension: "png" }) }));
      gridSheet(sheet, grid, images, await turnedText(data.page).catch(() => []));
      gridPages++;
      data.page.cleanup();
      continue;
    }
    sheet.views = [{ showGridLines: true }];
    const rows = data.lines.map((line) => ({ line, cells: lineCells(line) })), anchors = [];
    for (const row of rows) for (const cell of row.cells) {
      if (!anchors.some((x) => Math.abs(x - cell.x) < 10)) anchors.push(cell.x);
    }
    anchors.sort((a, b) => a - b);
    if (!anchors.length) {
      const png = await renderPage(data.page, dpi, warnings), imageId = workbook.addImage({ buffer: png, extension: "png" });
      sheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: data.width * 96 / 72, height: data.height * 96 / 72 } });
      warnings.push(`A p\xE1gina ${i} n\xE3o tem texto extra\xEDvel e foi inclu\xEDda como imagem na planilha. Execute OCR para obter c\xE9lulas edit\xE1veis.`);
    } else {
      sheet.columns = anchors.map((x, index) => ({ width: Math.max(8, Math.min(80, ((anchors[index + 1] ?? data.width - 18) - x) / 7)) }));
      let rowNumber = 1, previousBottom = rows[0]?.line.y ?? 0;
      for (const row of rows) {
        const gap = row.line.y - previousBottom;
        if (gap > row.line.fontSize * 1.8) {
          sheet.getRow(rowNumber).height = Math.min(90, gap);
          rowNumber++;
        }
        const excelRow = sheet.getRow(rowNumber++);
        excelRow.height = Math.max(14, row.line.height * 1.1);
        for (const cell of row.cells) {
          const index = anchors.reduce((best, x, j) => Math.abs(x - cell.x) < Math.abs(anchors[best] - cell.x) ? j : best, 0), excelCell = excelRow.getCell(index + 1), parsed = spreadsheetValue(cell.text);
          if (excelCell.value) {
            excelCell.value = String(excelCell.value) + " " + cell.text;
            continue;
          }
          excelCell.value = parsed.value;
          excelCell.font = { name: cell.font, size: Math.max(8, Math.min(30, cell.fontSize)), bold: cell.bold };
          excelCell.alignment = { vertical: "top", wrapText: true, horizontal: typeof parsed.value === "number" ? "right" : "left" };
          if (parsed.format) excelCell.numFmt = parsed.format;
        }
        previousBottom = row.line.y + row.line.height;
      }
      for (const t of await turnedText(data.page).catch(() => [])) {
        const cell = sheet.getRow(rowNumber++).getCell(1);
        cell.value = t.text;
        cell.font = { name: t.font, size: Math.max(8, Math.min(30, t.size)), bold: t.bold, italic: t.italic };
        cell.alignment = { textRotation: Math.max(-90, Math.min(90, Math.round(-t.angle))), vertical: "middle" };
      }
    }
    data.page.cleanup();
  }
  if (gridPages < pdf.numPages) warnings.push("Nas p\xE1ginas sem tabela desenhada, as colunas s\xE3o inferidas pela posi\xE7\xE3o do texto. Revise textos sobrepostos e p\xE1ginas digitalizadas.");
  if (gridPages) warnings.push(`${gridPages} p\xE1gina${gridPages > 1 ? "s" : ""} com tabelas reconstru\xEDdas como c\xE9lulas reais (mesclagens, cores, larguras e alturas do PDF).`);
  return { bytes: new Uint8Array(await workbook.xlsx.writeBuffer()), extension: "xlsx", warnings: uniqueWarnings(warnings) };
}
async function toPptx(pdf, options, dpi, warnings, onProgress) {
  const presentation = new import_pptxgenjs.default();
  presentation.author = "Bruno Albertini";
  presentation.company = "Gest\xE3o Cultural Pro";
  presentation.subject = "Convers\xE3o local de PDF";
  presentation.title = "Documento convertido pelo GCP-PDF";
  const dimensions = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const p = await pdf.getPage(i), v = p.getViewport({ scale: 1 });
    dimensions.push({ width: v.width, height: v.height });
  }
  const width = Math.max(...dimensions.map((d) => d.width)), height = Math.max(...dimensions.map((d) => d.height));
  presentation.defineLayout({ name: "PDF", width: width / 72, height: height / 72 });
  presentation.layout = "PDF";
  if (dimensions.some((d) => d.width !== width || d.height !== height)) warnings.push("P\xE1ginas de tamanhos diferentes foram centralizadas em slides com o maior tamanho do PDF.");
  for (let i = 1; i <= pdf.numPages; i++) {
    progress(onProgress, i, pdf.numPages);
    const data = await inspectPage(await pdf.getPage(i), options.mode !== "fidelity"), slide = presentation.addSlide(), dx = (width - data.width) / 2, dy = (height - data.height) / 2;
    slide.background = { color: "FFFFFF" };
    warnings.push(...data.warnings);
    if (options.mode === "fidelity" || !data.lines.length) {
      slide.addImage({ data: "data:image/png;base64," + (await renderPage(data.page, dpi, warnings)).toString("base64"), x: dx / 72, y: dy / 72, w: data.width / 72, h: data.height / 72 });
      if (options.mode !== "fidelity") warnings.push(`O slide ${i} n\xE3o tem texto extra\xEDvel e foi preservado como imagem; execute OCR para editar seu texto.`);
    } else {
      for (const image of data.images) slide.addImage({ data: "data:image/png;base64," + image.bytes.toString("base64"), x: (image.x + dx) / 72, y: (image.y + dy) / 72, w: image.width / 72, h: image.height / 72 });
      for (const line of data.lines) for (const run2 of line.runs) slide.addText(run2.text, { x: (run2.x + dx) / 72, y: (run2.y + dy) / 72, w: Math.max(0.05, (run2.width + run2.fontSize * 0.5) / 72), h: Math.max(0.05, run2.height / 72), fontFace: run2.font, fontSize: run2.fontSize, bold: run2.bold, italic: run2.italic, color: "111111", margin: 0, breakLine: false, valign: "top", lang: "pt-BR", paraSpaceAfter: 0, rotate: Math.abs(run2.angle) > 0.5 ? (run2.angle % 360 + 360) % 360 : 0, transparency: 0 });
      if (data.hasVectors) warnings.push("O PowerPoint edit\xE1vel reconstr\xF3i textos e imagens. Elementos vetoriais, efeitos e fontes indispon\xEDveis podem diferir; o modo de fidelidade preserva a apar\xEAncia como imagem.");
    }
    data.page.cleanup();
  }
  if (options.mode === "fidelity") warnings.push("O PowerPoint em fidelidade visual cont\xE9m imagens das p\xE1ginas, sem texto edit\xE1vel.");
  return { bytes: new Uint8Array(await presentation.write({ outputType: "nodebuffer" })), extension: "pptx", warnings: uniqueWarnings(warnings) };
}
async function renderPdfPages(bytes, indices, dpi, onPage) {
  validateOptions({ format: "png", dpi });
  const pdf = await loadPdf(bytes), out = [];
  try {
    for (const [n, index] of indices.entries()) {
      if (!Number.isInteger(index) || index < 0 || index >= pdf.numPages) throw new Error("Uma das p\xE1ginas escolhidas n\xE3o existe.");
      const page2 = await pdf.getPage(index + 1), view = page2.getViewport({ scale: 1 });
      out.push({ bytes: await renderPage(page2, dpi, []), width: view.width, height: view.height });
      page2.cleanup();
      onPage(n + 1, indices.length);
    }
    return out;
  } finally {
    await pdf.loadingTask.destroy();
  }
}

// electron/engines/gcp-pdf/_entry.ts
init_docx_html();
init_xlsx_html();

// ../cliqueprojeto/gcp-pdf/src/main/epub.ts
var import_canvas3 = require("@napi-rs/canvas");
var import_fflate2 = require("fflate");
var import_node_crypto = require("node:crypto");
var esc = (text2) => text2.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var flat = (text2) => text2.normalize("NFC").toLocaleLowerCase("pt-BR").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
var blockText = (b) => b.lines.map((l) => l.runs.map((r) => r.text).join(" ")).join(" ").replace(/\s+/g, " ").trim();
var MARK = /^\s*(\d{1,3}|[*†‡§]{1,3})\s*$/;
var superscript = (run2, line) => MARK.test(run2.text) && run2.size <= line.size * 0.82 && run2.baseline < line.baseline - run2.size * 0.2;
var cached = null;
function readBook(bytes, onProgress) {
  const key2 = (0, import_node_crypto.createHash)("sha256").update(bytes).digest("hex");
  if (cached?.key === key2) return cached.book;
  const book = (async () => {
    const pdf = await loadPdf(bytes), fonts = await FontContext.of(bytes, false);
    try {
      const flows = [], pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        onProgress?.(`Lendo p\xE1gina ${i} de ${pdf.numPages}\u2026`);
        const page2 = await pdf.getPage(i), images = (await inspectPage(page2, true)).images.filter((m) => m.width > 24 && m.height > 24);
        const flow = await flowPage(page2, fonts, images) ?? await looseFlow(page2, fonts, i, images);
        if (flow) {
          flows.push(flow);
          pages.push({ number: i, items: [] });
        } else pages.push({ number: i, items: [], art: await renderArt(page2) });
        page2.cleanup();
      }
      const { body } = splitRepeats(flows);
      let k = 0;
      for (const page2 of pages) if (!page2.art) page2.items = attachSuperscripts(body[k++]);
      const info = await pdf.getMetadata().catch(() => null);
      return { pages, body: bodyStyle(flows).size / 2 || 11, outline: await outlineChapters(pdf), title: String(info?.info?.Title ?? "").trim(), author: String(info?.info?.Author ?? "").trim() };
    } finally {
      await pdf.loadingTask.destroy();
    }
  })();
  cached = { key: key2, book };
  book.catch(() => {
    if (cached?.book === book) cached = null;
  });
  return book;
}
function attachSuperscripts(items) {
  const paragraphs = items.filter((i) => i.kind === "paragraph");
  const lone = paragraphs.filter((p) => p.block.lines.length === 1 && p.block.lines[0].runs.length === 1 && MARK.test(p.block.lines[0].runs[0].text));
  const moved = /* @__PURE__ */ new Set();
  for (const marker of lone) {
    const run2 = marker.block.lines[0].runs[0];
    for (const host of paragraphs) {
      if (host === marker || moved.has(host)) continue;
      const line = host.block.lines.find((l) => run2.size <= l.size * 0.82 && run2.baseline < l.baseline - run2.size * 0.2 && run2.baseline > l.baseline - l.size * 1.05 && run2.x >= l.x - 1 && run2.x <= l.right + l.size);
      if (!line) continue;
      line.runs = [...line.runs, run2].sort((a, b) => a.x - b.x);
      line.right = Math.max(line.right, run2.x + run2.width);
      moved.add(marker);
      break;
    }
  }
  return items.filter((i) => !moved.has(i));
}
async function looseFlow(page2, fonts, number, images) {
  const runs = await pageRuns(page2, fonts), chars = runs.reduce((n, r) => n + r.text.trim().length, 0);
  if (chars < 200) return null;
  const view = page2.getViewport({ scale: 1 });
  const items = buildBlocks(buildLines(runs)).map((block) => ({ kind: "paragraph", top: block.lines[0].baseline - block.size * 0.95, bottom: block.lines.at(-1).baseline + block.size * 0.27, block }));
  for (const image of images) items.push({ kind: "image", top: image.y, bottom: image.y + image.height, image });
  return { width: view.width, height: view.height, items: items.sort((a, b) => a.top - b.top), runs, number };
}
async function renderArt(page2) {
  const view = page2.getViewport({ scale: 1 }), scale = Math.min(2, 1400 / Math.max(view.width, view.height)), viewport = page2.getViewport({ scale });
  const canvas = (0, import_canvas3.createCanvas)(Math.ceil(viewport.width), Math.ceil(viewport.height));
  await page2.render({ canvas, canvasContext: canvas.getContext("2d"), viewport, background: "white" }).promise;
  return { jpeg: canvas.toBuffer("image/jpeg", 86), width: canvas.width, height: canvas.height };
}
async function outlineChapters(pdf) {
  const outline = await pdf.getOutline().catch(() => null);
  if (!outline?.length) return [];
  const out = [];
  const visit = async (items, level) => {
    for (const item of items) {
      try {
        const dest = typeof item.dest === "string" ? await pdf.getDestination(item.dest) : item.dest;
        const ref = Array.isArray(dest) ? dest[0] : null;
        const page2 = ref && typeof ref === "object" ? await pdf.getPageIndex(ref) : typeof ref === "number" ? ref : -1;
        if (page2 >= 0 && item.title?.trim()) out.push({ title: item.title.trim(), page: page2, level });
      } catch {
      }
      if (level === 1 && item.items?.length) await visit(item.items, 2);
    }
  };
  await visit(outline, 1);
  return out.sort((a, b) => a.page - b.page);
}
function headingChapters(book) {
  const found = [];
  for (const page2 of book.pages) for (const item of page2.items) {
    if (item.kind !== "paragraph" || item.list) continue;
    const text2 = blockText(item.block);
    if (item.block.size >= book.body * 1.25 && item.block.lines.length <= 3 && text2.length > 1 && text2.length <= 120 && !/^\d+$/.test(text2)) found.push({ size: Math.round(item.block.size * 2) / 2, title: text2, page: page2.number - 1 });
  }
  const sizes = [...new Set(found.map((h) => h.size))].sort((a, b) => b - a), count = (s) => found.filter((h) => h.size === s).length;
  const top = sizes.find((s) => count(s) >= 2) ?? sizes[0];
  if (top === void 0) return [];
  const second = sizes.find((s) => s < top && count(s) >= 2);
  return found.filter((h) => h.size === top || h.size === second).map((h) => ({ title: h.title, page: h.page, level: h.size === top ? 1 : 2 }));
}
async function analyzeEpub(bytes, onProgress) {
  const book = await readBook(bytes, onProgress);
  const chapters = book.outline.length ? book.outline : headingChapters(book);
  let footnotes = 0;
  for (const page2 of book.pages) footnotes += pageNotes(page2, book.body).notes.size;
  const first = book.pages.find((p) => p.items.length)?.items.find((i) => i.kind === "paragraph");
  return { pages: book.pages.length, chapters, source: book.outline.length ? "outline" : chapters.length ? "headings" : "none", title: book.title || (first ? blockText(first.block).slice(0, 120) : ""), author: book.author, footnotes };
}
function pageNotes(page2, body) {
  const refs = /* @__PURE__ */ new Set();
  for (const item of page2.items) if (item.kind === "paragraph") {
    for (const line of item.block.lines) for (const run2 of line.runs) if (superscript(run2, line)) refs.add(run2.text.trim());
  }
  const notes = /* @__PURE__ */ new Map(), skip = /* @__PURE__ */ new Set();
  if (!refs.size) return { refs, notes, skip };
  const paragraphs = page2.items.filter((i) => i.kind === "paragraph");
  const bottom = Math.max(...page2.items.map((i) => i.bottom));
  let current = null;
  for (const item of paragraphs) {
    const head = item.block.lines[0].runs[0], marker = /^\s*(\d{1,3}|[*†‡§]{1,3})(?=[\s.)]|$)/.exec(head.text)?.[1] ?? (item.block.lines[0].runs.length > 1 && MARK.test(head.text) ? head.text.trim() : void 0);
    const small = item.block.size <= body * 0.95, low = item.top > bottom - (bottom - Math.min(...page2.items.map((i) => i.top))) * 0.5;
    if (marker && refs.has(marker) && small && low) {
      current = marker;
      notes.set(marker, [item]);
      skip.add(item);
      continue;
    }
    if (current && small && low && item.top > notes.get(current).at(-1).top) {
      notes.get(current).push(item);
      skip.add(item);
      continue;
    }
    current = null;
  }
  return { refs, notes, skip };
}
function inline(block, link, dropMarker) {
  let html = "", plain = "";
  block.lines.forEach((line, li) => {
    line.runs.forEach((run2, ri) => {
      let text2 = run2.text;
      if (li === 0 && ri === 0 && dropMarker) text2 = text2.replace(new RegExp(`^\\s*${dropMarker.replace(/[*†‡§]/g, "\\$&")}[.)]?\\s*`), "");
      const previous = line.runs[ri - 1], gap = previous ? run2.x - (previous.x + previous.width) : 0;
      const space = ri === 0 ? li > 0 && !/-$/.test(plain) ? " " : "" : run2.space || gap > run2.size * 0.15 ? " " : "";
      if (li > 0 && ri === 0 && /[\p{L}]-$/u.test(plain) && new RegExp("^\\p{Ll}", "u").test(text2)) {
        html = html.replace(/-(<\/(?:strong|em)>)*$/, "$1");
        plain = plain.slice(0, -1);
      }
      if (link && superscript(run2, line)) {
        const href = link(run2.text.trim());
        if (href) {
          html += `<a class="noteref" epub:type="noteref" ${href}><sup>${esc(run2.text.trim())}</sup></a>`;
          plain += run2.text.trim();
          return;
        }
      }
      const body = esc((space && !/^\s/.test(text2) ? " " : "") + text2);
      html += run2.bold && run2.italic ? `<strong><em>${body}</em></strong>` : run2.bold ? `<strong>${body}</strong>` : run2.italic ? `<em>${body}</em>` : body;
      plain += (space ? " " : "") + text2;
    });
  });
  return html.replace(/<\/strong><strong>|<\/em><em>/g, "").replace(/\s+/g, " ").trim();
}
function chapterBody(book, chapters, index, images) {
  const chapter = chapters[index], next = chapters[index + 1];
  const start = (c) => {
    const page2 = book.pages[c.page];
    const target = flat(c.title);
    const at = page2?.items.findIndex((i) => i.kind === "paragraph" && target && flat(blockText(i.block)).startsWith(target.slice(0, 40))) ?? -1;
    return { page: c.page, item: Math.max(0, at) };
  };
  const from = start(chapter), to = next ? start(next) : { page: book.pages.length, item: 0 };
  const parts = [], notes = [];
  let open3 = null;
  const flush = () => {
    if (open3 !== null) {
      parts.push(`<p>${open3}</p>`);
      open3 = null;
    }
  };
  for (let p = from.page; p <= Math.min(to.page, book.pages.length - 1); p++) {
    const page2 = book.pages[p];
    if (page2.art) {
      if (p === to.page) break;
      flush();
      const name = `images/pagina-${page2.number}.jpg`;
      images.push({ name, bytes: page2.art.jpeg, type: "image/jpeg" });
      parts.push(`<figure class="page-art"><img src="../${name}" alt="P\xE1gina ${page2.number}"/></figure>`);
      continue;
    }
    const { notes: found, skip } = pageNotes(page2, book.body), ids = /* @__PURE__ */ new Map();
    for (const marker of found.keys()) ids.set(marker, `p${page2.number}-n${marker.replace(/[^\w]/g, (c) => c.charCodeAt(0).toString(16))}`);
    const link = (marker) => {
      const id = ids.get(marker);
      return id ? `href="#fn-${id}" id="ref-${id}"` : void 0;
    };
    page2.items.forEach((item, i) => {
      if (p === from.page && i < from.item || p === to.page && i >= to.item || skip.has(item)) return;
      if (item.kind === "paragraph") {
        const text2 = blockText(item.block), isTitle = chapter.title && p === from.page && i === from.item && flat(text2).startsWith(flat(chapter.title).slice(0, 40));
        if (isTitle) {
          flush();
          parts.push(`<h1>${esc(text2)}</h1>`);
          return;
        }
        if (item.block.size >= book.body * 1.25 && item.block.lines.length <= 3 && text2.length <= 120) {
          flush();
          parts.push(`<h2>${inline(item.block)}</h2>`);
          return;
        }
        if (item.list) {
          flush();
          parts.push(`<p class="list-item">${inline(item.block, link)}</p>`);
          return;
        }
        const html = inline(item.block, link);
        if (open3 !== null && i === page2.items.findIndex((x) => !skip.has(x)) && new RegExp("^\\p{Ll}", "u").test(text2)) {
          open3 = (/[\p{L}]-$/u.test(open3) ? open3.slice(0, -1) : open3 + " ") + html;
        } else {
          flush();
          open3 = html;
        }
        if (/[.!?:;»"”)]$/.test(text2) || item.block.align === "center") flush();
        else if (i !== page2.items.length - 1) flush();
        if (item.block.align === "center" && open3 === null && parts.length) parts[parts.length - 1] = parts.at(-1).replace(/^<p>/, '<p class="center">');
        return;
      }
      flush();
      if (item.kind === "image") {
        const name = `images/p${page2.number}-${i}.png`;
        images.push({ name, bytes: item.image.bytes, type: "image/png" });
        parts.push(`<figure><img src="../${name}" alt=""/></figure>`);
      } else if (item.kind === "rule") parts.push("<hr/>");
      else if (item.kind === "line") parts.push(`<p>${item.blocks.map((b) => inline(b, link)).join(" \u2014 ")}</p>`);
      else if (item.kind === "table" || item.kind === "columns") {
        const t = item.table, rows = /* @__PURE__ */ new Map();
        for (const cell of t.cells) rows.set(cell.row, [...rows.get(cell.row) ?? [], `<td${cell.cols > 1 ? ` colspan="${cell.cols}"` : ""}${cell.rows > 1 ? ` rowspan="${cell.rows}"` : ""}>${esc((cell.text?.text ?? "").replace(/\s+/g, " ").trim())}</td>`]);
        parts.push(`<table>${[...rows].sort((a, b) => a[0] - b[0]).map(([, cells]) => `<tr>${cells.join("")}</tr>`).join("")}</table>`);
      }
    });
    for (const [marker, items] of found) {
      const id = ids.get(marker);
      notes.push({ id, marker, html: items.map((it, k) => it.kind === "paragraph" ? inline(it.block, void 0, k === 0 ? marker : void 0) : "").join(" ") });
    }
  }
  flush();
  return { html: parts.join("\n"), notes };
}
var CSS = `@namespace epub "http://www.idpf.org/2007/ops";
body{margin:0 4%;font-family:serif;line-height:1.5;text-align:justify;hyphens:auto;-webkit-hyphens:auto;widows:2;orphans:2}
h1{font-size:1.6em;line-height:1.25;margin:2.2em 0 1.2em;text-align:left}
h2{font-size:1.2em;margin:1.6em 0 .6em;text-align:left}
p{margin:0;text-indent:1.4em}
h1+p,h2+p,hr+p,figure+p,.list-item,.center{text-indent:0}
.list-item{margin:.25em 0 .25em 1.4em}
.center{text-align:center}
figure{margin:1em 0;text-align:center}
figure img{max-width:100%;max-height:95vh}
.page-art{page-break-before:always;break-before:page;margin:0}
table{border-collapse:collapse;margin:1em 0;width:100%;font-size:.9em}
td{border:1px solid #999;padding:.25em .4em;vertical-align:top;text-indent:0}
hr{border:0;border-top:1px solid #999;margin:1.2em 25%}
a.noteref{text-decoration:none;font-size:.75em;vertical-align:super;line-height:0}
a.noteref sup{vertical-align:baseline;font-size:1em}
section.footnotes{margin-top:2.5em;border-top:1px solid #999;padding-top:.6em;font-size:.88em}
section.footnotes h2{font-size:1em;margin-top:0}
aside.footnote p{text-indent:0;margin:.35em 0}
aside.footnote a.backlink{text-decoration:none;font-weight:bold;margin-right:.3em}
.cover{margin:0;padding:0;text-align:center}
.cover img{max-width:100%;max-height:100vh}
nav ol{list-style:none;padding-left:1em}`;
var page = (title, lang, body) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}">
<head><meta charset="UTF-8"/><title>${esc(title)}</title><link rel="stylesheet" type="text/css" href="../styles/livro.css"/></head>
<body>
${body}
</body>
</html>`;
async function toEpub(bytes, options, onProgress) {
  const book = await readBook(bytes, onProgress);
  const title = options.title.trim() || book.title || "Sem t\xEDtulo", author = options.author.trim(), lang = options.language;
  let chapters = [...options.chapters].filter((c) => Number.isInteger(c.page) && c.page >= 0 && c.page < book.pages.length).sort((a, b) => a.page - b.page);
  if (!chapters.length || chapters[0].page > 0) chapters = [{ title: chapters.length ? "In\xEDcio" : title, page: 0, level: 1 }, ...chapters];
  const images = [], files = {}, manifest = [], spine = [], nav = [];
  files["mimetype"] = [(0, import_fflate2.strToU8)("application/epub+zip"), { level: 0 }];
  files["META-INF/container.xml"] = (0, import_fflate2.strToU8)(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  files["OEBPS/styles/livro.css"] = (0, import_fflate2.strToU8)(CSS);
  manifest.push('<item id="css" href="styles/livro.css" media-type="text/css"/>');
  if (options.cover) {
    const match = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(options.cover);
    if (!match) throw new Error("A capa precisa ser uma imagem PNG ou JPEG.");
    const ext = match[1] === "png" ? "png" : "jpg";
    files[`OEBPS/images/capa.${ext}`] = Buffer.from(match[2], "base64");
    manifest.push(`<item id="cover-image" href="images/capa.${ext}" media-type="image/${match[1]}" properties="cover-image"/>`);
    files["OEBPS/text/capa.xhtml"] = (0, import_fflate2.strToU8)(page("Capa", lang, `<section class="cover" epub:type="cover"><img src="../images/capa.${ext}" alt="${esc(title)}"/></section>`));
    manifest.push('<item id="capa" href="text/capa.xhtml" media-type="application/xhtml+xml"/>');
    spine.push('<itemref idref="capa" linear="yes"/>');
  }
  let notes = 0;
  for (let i = 0; i < chapters.length; i++) {
    onProgress?.(`Montando cap\xEDtulo ${i + 1} de ${chapters.length}\u2026`);
    const chapter = chapters[i], { html, notes: found } = chapterBody(book, chapters, i, images), name = `cap${String(i + 1).padStart(3, "0")}.xhtml`;
    notes += found.length;
    const hasTitle = html.startsWith("<h1>"), heading = hasTitle ? "" : `<h1>${esc(chapter.title)}</h1>
`;
    const footnotes = found.length ? `
<section class="footnotes" epub:type="footnotes"><h2>Notas</h2>
${found.map((n) => `<aside class="footnote" epub:type="footnote" id="fn-${n.id}"><p><a class="backlink" href="#ref-${n.id}" title="Voltar ao texto">${esc(n.marker)}</a> ${n.html}</p></aside>`).join("\n")}
</section>` : "";
    files[`OEBPS/text/${name}`] = (0, import_fflate2.strToU8)(page(chapter.title, lang, `<section epub:type="chapter">
${heading}${html}${footnotes}
</section>`));
    manifest.push(`<item id="c${i + 1}" href="text/${name}" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="c${i + 1}"/>`);
    nav.push({ title: chapter.title, href: `text/${name}`, level: chapter.level });
  }
  for (const [n, image] of images.entries()) {
    files[`OEBPS/${image.name}`] = image.bytes;
    manifest.push(`<item id="img${n + 1}" href="${image.name}" media-type="${image.type}"/>`);
  }
  const tree = [];
  let inner = false;
  for (const item of nav) {
    const li = `<li><a href="${item.href.replace("text/", "")}">${esc(item.title)}</a>`;
    if (item.level === 2 && tree.length) {
      if (!inner) {
        tree[tree.length - 1] = tree.at(-1).replace(/<\/li>$/, "") + "<ol>";
        inner = true;
      }
      tree.push(li + "</li>");
    } else {
      if (inner) {
        tree.push("</ol></li>");
        inner = false;
      }
      tree.push(li + "</li>");
    }
  }
  if (inner) tree.push("</ol></li>");
  files["OEBPS/text/sumario.xhtml"] = (0, import_fflate2.strToU8)(page("Sum\xE1rio", lang, `<nav epub:type="toc" id="toc"><h1>Sum\xE1rio</h1><ol>${tree.join("")}</ol></nav>`));
  manifest.push('<item id="nav" href="text/sumario.xhtml" media-type="application/xhtml+xml" properties="nav"/>');
  spine.splice(options.cover ? 1 : 0, 0, '<itemref idref="nav"/>');
  const id = `urn:uuid:${(0, import_node_crypto.randomUUID)()}`;
  files["OEBPS/toc.ncx"] = (0, import_fflate2.strToU8)(`<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${id}"/></head><docTitle><text>${esc(title)}</text></docTitle><navMap>${nav.map((n, k) => `<navPoint id="n${k + 1}" playOrder="${k + 1}"><navLabel><text>${esc(n.title)}</text></navLabel><content src="${n.href}"/></navPoint>`).join("")}</navMap></ncx>`);
  manifest.push('<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>');
  const year = options.year?.trim(), date2 = year && /^\d{4}$/.test(year) ? year : void 0;
  const meta = [
    `<dc:identifier id="bookid">${id}</dc:identifier>`,
    `<dc:title>${esc(title)}</dc:title>`,
    `<dc:language>${esc(lang)}</dc:language>`,
    author ? `<dc:creator id="autor">${esc(author)}</dc:creator><meta refines="#autor" property="role" scheme="marc:relators">aut</meta><meta refines="#autor" property="file-as">${esc(fileAs(author))}</meta>` : "",
    date2 ? `<dc:date>${date2}</dc:date>` : "",
    ...options.genre?.trim() ? options.genre.split(/[,;]/).map((g) => g.trim()).filter(Boolean).map((g) => `<dc:subject>${esc(g)}</dc:subject>`) : [],
    options.publisher?.trim() ? `<dc:publisher>${esc(options.publisher.trim())}</dc:publisher>` : "",
    options.description?.trim() ? `<dc:description>${esc(options.description.trim())}</dc:description>` : "",
    `<meta property="dcterms:modified">${(/* @__PURE__ */ new Date()).toISOString().replace(/\.\d+Z$/, "Z")}</meta>`,
    options.cover ? '<meta name="cover" content="cover-image"/>' : "",
    `<meta name="generator" content="GCP-PDF"/>`
  ].filter(Boolean).join("\n    ");
  files["OEBPS/content.opf"] = (0, import_fflate2.strToU8)(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${esc(lang)}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    ${meta}
  </metadata>
  <manifest>
    ${manifest.join("\n    ")}
  </manifest>
  <spine toc="ncx">
    ${spine.join("\n    ")}
  </spine>
</package>`);
  onProgress?.(`EPUB pronto: ${chapters.length} cap\xEDtulo${chapters.length > 1 ? "s" : ""}${notes ? `, ${notes} nota${notes > 1 ? "s" : ""} de rodap\xE9 com links` : ""}.`);
  return (0, import_fflate2.zipSync)(files, { level: 9 });
}
function fileAs(author) {
  const parts = author.split(/\s+/);
  return parts.length > 1 ? `${parts.at(-1)}, ${parts.slice(0, -1).join(" ")}` : author;
}

// ../cliqueprojeto/gcp-pdf/src/main/launch-input.ts
var import_promises2 = require("node:fs/promises");
async function hasPdfHeader(path3) {
  const handle = await (0, import_promises2.open)(path3, "r");
  try {
    const header = Buffer.alloc(1024);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    return /%PDF-\d\.\d/.test(header.subarray(0, bytesRead).toString("latin1"));
  } finally {
    await handle.close();
  }
}

// ../cliqueprojeto/gcp-pdf/src/main/system.ts
var import_node_child_process3 = require("node:child_process");
var import_node_util = require("node:util");
var import_node_fs2 = require("node:fs");
var import_promises5 = require("node:fs/promises");
var import_node_path5 = require("node:path");
var import_node_os3 = require("node:os");
var import_node_url2 = require("node:url");
var import_pdf_lib5 = require("pdf-lib");
var import_canvas4 = require("@napi-rs/canvas");

// ../cliqueprojeto/gcp-pdf/src/main/office.ts
var import_node_child_process2 = require("node:child_process");
var import_node_fs = require("node:fs");
var import_promises4 = require("node:fs/promises");
var import_node_os2 = require("node:os");
var import_node_path4 = require("node:path");

// ../cliqueprojeto/gcp-pdf/src/main/pdfcraft-sidecar.ts
var import_node_child_process = require("node:child_process");
var import_promises3 = require("node:fs/promises");
var import_node_path3 = __toESM(require("node:path"));
var import_pdf_lib4 = require("pdf-lib");
var TIMEOUT = 6e4;
function invoke(executable, args, cwd, timeout = TIMEOUT) {
  return new Promise((resolve2) => (0, import_node_child_process.execFile)(executable, args, { cwd, timeout, windowsHide: true, maxBuffer: 16 * 1024 * 1024, encoding: "utf8" }, (error, stdout, stderr) => resolve2({ stdout, stderr, error })));
}
async function privateDirectory(root) {
  if (process.platform !== "win32") {
    await (0, import_promises3.chmod)(root, 448);
    return;
  }
  const literal = `'${root.replaceAll("'", "''")}'`;
  const script = `$ErrorActionPreference='Stop';$sid=[System.Security.Principal.WindowsIdentity]::GetCurrent().User;$acl=[System.Security.AccessControl.DirectorySecurity]::new();$acl.SetAccessRuleProtection($true,$false);$acl.SetOwner($sid);$inherit=[System.Security.AccessControl.InheritanceFlags]'ContainerInherit,ObjectInherit';$prop=[System.Security.AccessControl.PropagationFlags]::None;$allow=[System.Security.AccessControl.AccessControlType]::Allow;$rights=[System.Security.AccessControl.FileSystemRights]::FullControl;$acl.AddAccessRule([System.Security.AccessControl.FileSystemAccessRule]::new($sid,$rights,$inherit,$prop,$allow));$system=[System.Security.Principal.SecurityIdentifier]::new('S-1-5-18');$acl.AddAccessRule([System.Security.AccessControl.FileSystemAccessRule]::new($system,$rights,$inherit,$prop,$allow));([System.IO.DirectoryInfo]::new(${literal})).SetAccessControl($acl)`;
  const result = await invoke(import_node_path3.default.join(process.env.SystemRoot ?? "C:\\Windows", "System32/WindowsPowerShell/v1.0/powershell.exe"), ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")], root, 15e3);
  if (result.error) throw new Error("N\xE3o foi poss\xEDvel criar uma \xE1rea privada para editar o documento.", { cause: result.error });
}

// ../cliqueprojeto/gcp-pdf/src/main/office.ts
var WORD = [".docx", ".doc", ".rtf", ".odt", ".txt"];
var EXCEL = [".xlsx", ".xls", ".ods"];
var POWERPOINT = [".pptx", ".ppt", ".odp"];
var SCRIPTS = {
  word: "$a=New-Object -ComObject Word.Application;$a.AutomationSecurity=3;$a.Visible=$false;$a.DisplayAlerts=0;try{$d=$a.Documents.Open($env:GCP_IN,$false,$true,$false);$d.ExportAsFixedFormat($env:GCP_OUT,17);$d.Close(0)}finally{$a.Quit();[void][Runtime.InteropServices.Marshal]::ReleaseComObject($a)}",
  excel: "$a=New-Object -ComObject Excel.Application;$a.AutomationSecurity=3;$a.Visible=$false;$a.DisplayAlerts=$false;try{$w=$a.Workbooks.Open($env:GCP_IN,0,$true);$w.ExportAsFixedFormat(0,$env:GCP_OUT);$w.Close($false)}finally{$a.Quit();[void][Runtime.InteropServices.Marshal]::ReleaseComObject($a)}",
  powerpoint: "$a=New-Object -ComObject PowerPoint.Application;$a.AutomationSecurity=3;try{$p=$a.Presentations.Open($env:GCP_IN,-1,0,0);$p.SaveAs($env:GCP_OUT,32);$p.Close()}finally{$a.Quit();[void][Runtime.InteropServices.Marshal]::ReleaseComObject($a)}"
};
var PROGIDS = { word: "Word.Application", excel: "Excel.Application", powerpoint: "PowerPoint.Application" };
function kind(path3) {
  const e = (0, import_node_path4.extname)(path3).toLowerCase();
  return WORD.includes(e) ? "word" : EXCEL.includes(e) ? "excel" : POWERPOINT.includes(e) ? "powerpoint" : null;
}
function run(file, args, env, timeout) {
  return new Promise((resolve2) => (0, import_node_child_process2.execFile)(file, args, { env, timeout, windowsHide: true, maxBuffer: 4 * 1024 * 1024 }, (error, _out, stderr) => resolve2({ error, stderr: String(stderr) })));
}
var powershell = () => (0, import_node_path4.join)(process.env.SystemRoot ?? "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
async function officeAvailable(app) {
  if (process.platform !== "win32") return false;
  const result = await run((0, import_node_path4.join)(process.env.SystemRoot ?? "C:\\Windows", "System32", "reg.exe"), ["query", `HKCR\\${PROGIDS[app]}\\CLSID`], process.env, 1e4);
  return !result.error;
}
async function viaOffice(path3, app) {
  const folder = await (0, import_promises4.mkdtemp)((0, import_node_path4.join)((0, import_node_os2.tmpdir)(), "gcp-pdf-office-"));
  try {
    await privateDirectory(folder);
    const out = (0, import_node_path4.join)(folder, (0, import_node_path4.basename)(path3, (0, import_node_path4.extname)(path3)) + ".pdf");
    const result = await run(powershell(), ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", Buffer.from(SCRIPTS[app], "utf16le").toString("base64")], { ...process.env, GCP_IN: path3, GCP_OUT: out }, 18e4);
    if (!(0, import_node_fs.existsSync)(out)) throw new Error(result.error && "killed" in result.error && result.error.killed ? "O Microsoft Office demorou demais para converter o arquivo." : "O Microsoft Office n\xE3o conseguiu converter este arquivo. Verifique se ele abre normalmente e n\xE3o est\xE1 protegido.");
    return new Uint8Array(await (0, import_promises4.readFile)(out));
  } finally {
    await (0, import_promises4.rm)(folder, { recursive: true, force: true }).catch(() => {
    });
  }
}
var escape3 = (text2) => text2.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var PAGE_CSS = '@page{size:A4;margin:20mm 18mm}body{font-family:Calibri,Carlito,"Segoe UI",Arial,sans-serif;font-size:11pt;line-height:1.35;color:#111}';
async function wordToPdf(path3, htmlToPdf) {
  const { docxToHtml: docxToHtml2 } = await Promise.resolve().then(() => (init_docx_html(), docx_html_exports));
  const result = docxToHtml2(new Uint8Array(await (0, import_promises4.readFile)(path3)));
  return htmlToPdf(result.html, { headerTemplate: result.headerTemplate, footerTemplate: result.footerTemplate });
}
async function excelToPdf(path3, htmlToPdf) {
  const { xlsxToHtml: xlsxToHtml2 } = await Promise.resolve().then(() => (init_xlsx_html(), xlsx_html_exports));
  return htmlToPdf(await xlsxToHtml2(new Uint8Array(await (0, import_promises4.readFile)(path3))));
}
async function officeToPdf(path3, htmlToPdf, libreOffice) {
  const app = kind(path3);
  if (!app) throw new Error("Formato de documento n\xE3o reconhecido.");
  if (await officeAvailable(app)) {
    try {
      return await viaOffice(path3, app);
    } catch (error) {
      if (!libreOffice && ![".docx", ".xlsx"].includes((0, import_node_path4.extname)(path3).toLowerCase())) throw error;
    }
  }
  const extension = (0, import_node_path4.extname)(path3).toLowerCase();
  if (extension === ".txt") return htmlToPdf(`<!doctype html><meta charset="utf-8"><style>${PAGE_CSS}body{white-space:pre-wrap;font-family:Consolas,"Liberation Mono",monospace;font-size:10pt}</style><body>${escape3(await (0, import_promises4.readFile)(path3, "utf8"))}</body>`);
  const internal = extension === ".docx" || extension === ".xlsx";
  if (libreOffice) {
    try {
      const bytes = await libreOffice();
      if (bytes) return bytes;
    } catch (error) {
      if (!internal) throw error;
    }
  }
  if (extension === ".docx") return wordToPdf(path3, htmlToPdf);
  if (extension === ".xlsx") return excelToPdf(path3, htmlToPdf);
  throw new Error(app === "powerpoint" ? "Para converter apresenta\xE7\xF5es, instale o Microsoft PowerPoint (ou o LibreOffice)." : "Este formato antigo precisa do Microsoft Office ou do LibreOffice instalado. Arquivos .docx e .xlsx s\xE3o convertidos mesmo sem eles.");
}

// ../cliqueprojeto/gcp-pdf/src/main/fiscal.ts
var import_xmldom2 = require("@xmldom/xmldom");
var import_qrcode = __toESM(require("qrcode"));
var bwipjs = require("bwip-js");
var local2 = (n) => n.localName ?? n.nodeName.replace(/^.*:/, "");
var kids2 = (e) => e ? [...e.childNodes].filter((c) => c.nodeType === 1) : [];
function find(e, path3) {
  let current = e ?? null;
  for (const name of path3.split("/")) {
    if (!current) return null;
    const stack = [...kids2(current)];
    let hit = null;
    while (stack.length) {
      const c = stack.shift();
      if (local2(c) === name) {
        hit = c;
        break;
      }
      stack.push(...kids2(c));
    }
    current = hit;
  }
  return current;
}
var all = (e, name) => {
  const out = [];
  const walk2 = (x) => {
    for (const c of kids2(x)) {
      if (local2(c) === name) out.push(c);
      walk2(c);
    }
  };
  if (e) walk2(e);
  return out;
};
var text = (e, path3 = "") => ((path3 ? find(e, path3) : e)?.textContent ?? "").trim();
var esc2 = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var num2 = (v, digits = 2) => v === "" || Number.isNaN(Number(v)) ? "" : Number(v).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
var money = (v) => v === "" ? "" : "R$ " + num2(v);
function doc(v) {
  const d = v.replace(/\D/g, "");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return esc2(v);
}
var cep = (v) => esc2(v.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2"));
var phone = (v) => {
  const d = v.replace(/\D/g, "").replace(/^0+/, "");
  return d.length === 11 ? d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : d.length === 10 ? d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3") : esc2(v);
};
function date(v, time = true) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2}))?/.exec(v);
  if (!m) return esc2(v);
  return `${m[3]}/${m[2]}/${m[1]}${time && m[4] ? ` ${m[4]}:${m[5]}:${m[6]}` : ""}`;
}
var chaveFmt = (k) => esc2(k.replace(/(\d{4})(?=\d)/g, "$1 "));
var docOf = (e) => doc(text(e, "CNPJ") || text(e, "CPF") || text(e, "idEstrangeiro"));
var lines = (v) => esc2(v.replace(/<br\s*\/?>/gi, "\n")).replace(/\n/g, "<br>");
async function barcode(value) {
  return bwipjs.toSVG({ bcid: "code128", text: value, height: 11, includetext: false, paddingwidth: 0, paddingheight: 0 });
}
var qr = (value) => import_qrcode.default.toString(value, { type: "svg", margin: 0, errorCorrectionLevel: "M" });
var CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">`;
var BASE_CSS = `*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#000}
.box{border:1px solid #000;padding:2px 4px;min-height:24px;overflow:hidden}.l{font-size:6.2pt;text-transform:uppercase;color:#222;display:block;line-height:1.2}
.v{font-size:8.6pt;line-height:1.25;word-break:break-word}.row{display:flex}.row>.box{flex:1;border-right:none}.row>.box:last-child{border-right:1px solid #000}
.row+.row>.box,.row+.box,.box+.row>.box{border-top:none}.sec{font-size:7pt;font-weight:bold;margin:6px 0 1px;text-transform:uppercase}.r{text-align:right}.c{text-align:center}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #000;padding:1px 3px;font-size:6.8pt;vertical-align:top}th{font-size:5.8pt;font-weight:normal;text-transform:uppercase;background:#f2f2f2}
.watermark{position:fixed;top:40%;left:0;right:0;text-align:center;font-size:48pt;color:rgba(200,0,0,.18);transform:rotate(-28deg);font-weight:bold;z-index:-1}`;
async function danfe(root) {
  const inf = find(root, "infNFe"), ide = find(inf, "ide"), emit = find(inf, "emit"), dest = find(inf, "dest"), tot = find(inf, "total/ICMSTot"), transp = find(inf, "transp");
  const prot = find(root, "protNFe/infProt"), chave = (inf.getAttribute("Id") ?? "").replace(/^NFe/, "") || text(prot, "chNFe");
  const nNF = text(ide, "nNF").padStart(9, "0").replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3"), serie = text(ide, "serie").padStart(3, "0");
  const ender = (e) => [text(e, "xLgr"), text(e, "nro"), text(e, "xCpl")].filter(Boolean).join(", ");
  const homolog = text(ide, "tpAmb") === "2";
  const items = all(inf, "det").map((det) => {
    const p = find(det, "prod"), icms = kids2(find(det, "imposto/ICMS"))[0], ipi = find(det, "imposto/IPI");
    const di = all(p, "DI").map((d) => `DI ${esc2(text(d, "nDI"))} de ${date(text(d, "dDI"), false)} \xB7 Desembara\xE7o ${esc2(text(d, "xLocDesemb"))}/${esc2(text(d, "UFDesemb"))} em ${date(text(d, "dDesemb"), false)}${all(d, "adi").length ? ` \xB7 Adi\xE7\xF5es ${all(d, "adi").map((a) => text(a, "nAdicao")).join(", ")}` : ""}`).join("<br>");
    const extra = [text(det, "infAdProd"), text(p, "xPed") && `Pedido ${text(p, "xPed")}`].filter(Boolean).map(esc2).join(" \xB7 ");
    return `<tr><td>${esc2(text(p, "cProd"))}</td><td>${esc2(text(p, "xProd"))}${di ? `<br><i>${di}</i>` : ""}${extra ? `<br><i>${extra}</i>` : ""}</td><td>${esc2(text(p, "NCM"))}</td><td>${esc2(text(icms, "orig"))}${esc2(text(icms, "CST") || text(icms, "CSOSN"))}</td><td>${esc2(text(p, "CFOP"))}</td><td>${esc2(text(p, "uCom"))}</td><td class="r">${num2(text(p, "qCom"), 4)}</td><td class="r">${num2(text(p, "vUnCom"), 4)}</td><td class="r">${num2(text(p, "vProd"))}</td><td class="r">${num2(text(p, "vDesc") || "0")}</td><td class="r">${num2(text(icms, "vBC") || "0")}</td><td class="r">${num2(text(icms, "vICMS") || "0")}</td><td class="r">${num2(text(ipi, "vIPI") || "0")}</td><td class="r">${num2(text(icms, "pICMS") || "0")}</td><td class="r">${num2(text(ipi, "pIPI") || "0")}</td></tr>`;
  }).join("");
  const dups = all(inf, "dup").map((d) => `<div class="box"><span class="l">N\xBA ${esc2(text(d, "nDup"))}</span><span class="v">${date(text(d, "dVenc"), false)} \xB7 ${money(text(d, "vDup"))}</span></div>`).join("");
  const PAG = { "01": "Dinheiro", "02": "Cheque", "03": "Cart\xE3o de cr\xE9dito", "04": "Cart\xE3o de d\xE9bito", "05": "Cr\xE9dito loja", "10": "Vale alimenta\xE7\xE3o", "11": "Vale refei\xE7\xE3o", "12": "Vale presente", "13": "Vale combust\xEDvel", "15": "Boleto", "16": "Dep\xF3sito", "17": "PIX", "18": "Transfer\xEAncia", "19": "Fidelidade", "90": "Sem pagamento", "99": "Outros" };
  const pags = all(inf, "detPag").map((d) => `${esc2(PAG[text(d, "tPag")] ?? text(d, "tPag"))} ${money(text(d, "vPag"))}`).join(" \xB7 ");
  const vol = find(transp, "vol"), transporta = find(transp, "transporta"), FRETE = { "0": "0 - Emitente", "1": "1 - Destinat\xE1rio", "2": "2 - Terceiros", "3": "3 - Pr\xF3prio rem.", "4": "4 - Pr\xF3prio dest.", "9": "9 - Sem frete" };
  const totalBox = (label, v, strong = false) => `<div class="box"><span class="l">${label}</span><span class="v r" style="display:block${strong ? ";font-weight:bold" : ""}">${num2(v || "0")}</span></div>`;
  const autoriz = prot ? `${text(prot, "nProt")} ${date(text(prot, "dhRecbto"))}` : "NF-e sem protocolo de autoriza\xE7\xE3o no arquivo";
  const intermed = find(inf, "infIntermed");
  const info = [text(inf, "infAdic/infCpl"), intermed ? `Intermediador: CNPJ ${doc(text(intermed, "CNPJ"))} ${text(intermed, "idCadIntTran")}` : "", pags ? `Pagamento: ${pags}` : ""].filter(Boolean).join("\n");
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8">${CSP}<style>@page{size:A4;margin:7mm}${BASE_CSS}.danfe-title{font-size:15pt;font-weight:bold;letter-spacing:1px}.barcode svg{width:100%;height:40px}</style><body>
${homolog ? '<div class="watermark">SEM VALOR FISCAL<br>HOMOLOGA\xC7\xC3O</div>' : ""}
<div class="row"><div class="box" style="flex:5"><span class="l">Recebemos de ${esc2(text(emit, "xNome"))} os produtos/servi\xE7os constantes da nota fiscal indicada ao lado \xB7 Emiss\xE3o ${date(text(ide, "dhEmi") || text(ide, "dEmi"), false)} \xB7 Dest.: ${esc2(text(dest, "xNome"))} \xB7 Valor total: ${money(text(tot, "vNF"))}</span></div><div class="box c" style="flex:1.2"><b>NF-e</b><br>N\xBA ${nNF}<br>S\xE9rie ${serie}</div></div>
<div class="row"><div class="box" style="flex:1"><span class="l">Data de recebimento</span></div><div class="box" style="flex:4"><span class="l">Identifica\xE7\xE3o e assinatura do recebedor</span></div><div class="box" style="flex:1.2;border-top:none"></div></div>
<div style="border-top:1px dashed #000;margin:6px 0"></div>
<div class="row"><div class="box" style="flex:3.2;min-height:96px"><span class="l">Identifica\xE7\xE3o do emitente</span><div style="font-size:10.5pt;font-weight:bold;margin:4px 0">${esc2(text(emit, "xNome"))}</div><div class="v">${esc2(ender(find(emit, "enderEmit")))}<br>${esc2(text(emit, "enderEmit/xBairro"))} \xB7 ${esc2(text(emit, "enderEmit/xMun"))}/${esc2(text(emit, "enderEmit/UF"))} \xB7 CEP ${cep(text(emit, "enderEmit/CEP"))}<br>${text(emit, "enderEmit/fone") ? "Fone " + phone(text(emit, "enderEmit/fone")) : ""}</div></div>
<div class="box c" style="flex:1.7"><div class="danfe-title">DANFE</div><div class="v" style="font-size:7pt">Documento Auxiliar da Nota Fiscal Eletr\xF4nica</div><div class="v" style="margin:4px 0">${text(ide, "tpNF") === "0" ? "0 - Entrada" : "1 - Sa\xEDda"}</div><b>N\xBA ${nNF}</b><br>S\xE9rie ${serie}<br><span style="font-size:7pt">Folha 1/1</span></div>
<div class="box" style="flex:3.3"><div class="barcode">${chave ? await barcode(chave) : ""}</div><span class="l">Chave de acesso</span><div class="v c" style="font-weight:bold;letter-spacing:.3px">${chaveFmt(chave)}</div><div class="v c" style="font-size:7pt;margin-top:3px">Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br/portal ou no site da Sefaz autorizadora</div></div></div>
<div class="row"><div class="box" style="flex:5"><span class="l">Natureza da opera\xE7\xE3o</span><span class="v">${esc2(text(ide, "natOp"))}</span></div><div class="box" style="flex:3.3"><span class="l">Protocolo de autoriza\xE7\xE3o de uso</span><span class="v">${esc2(autoriz)}</span></div></div>
<div class="row"><div class="box"><span class="l">Inscri\xE7\xE3o estadual</span><span class="v">${esc2(text(emit, "IE"))}</span></div><div class="box"><span class="l">Insc. estadual do subst. trib.</span><span class="v">${esc2(text(emit, "IEST"))}</span></div><div class="box"><span class="l">CNPJ / CPF</span><span class="v">${docOf(emit)}</span></div></div>
<div class="sec">Destinat\xE1rio / Remetente</div>
<div class="row"><div class="box" style="flex:4"><span class="l">Nome / Raz\xE3o social</span><span class="v">${esc2(text(dest, "xNome"))}</span></div><div class="box" style="flex:1.6"><span class="l">CNPJ / CPF</span><span class="v">${docOf(dest)}</span></div><div class="box" style="flex:1.1"><span class="l">Data da emiss\xE3o</span><span class="v">${date(text(ide, "dhEmi") || text(ide, "dEmi"), false)}</span></div></div>
<div class="row"><div class="box" style="flex:3.2"><span class="l">Endere\xE7o</span><span class="v">${esc2(ender(find(dest, "enderDest")))}</span></div><div class="box" style="flex:1.4"><span class="l">Bairro / Distrito</span><span class="v">${esc2(text(dest, "enderDest/xBairro"))}</span></div><div class="box" style="flex:1"><span class="l">CEP</span><span class="v">${cep(text(dest, "enderDest/CEP"))}</span></div><div class="box" style="flex:1.1"><span class="l">Data sa\xEDda/entrada</span><span class="v">${date(text(ide, "dhSaiEnt") || text(ide, "dSaiEnt"), false)}</span></div></div>
<div class="row"><div class="box" style="flex:2.4"><span class="l">Munic\xEDpio</span><span class="v">${esc2(text(dest, "enderDest/xMun"))}</span></div><div class="box" style="flex:1.4"><span class="l">Fone / Fax</span><span class="v">${phone(text(dest, "enderDest/fone"))}</span></div><div class="box" style="flex:.5"><span class="l">UF</span><span class="v">${esc2(text(dest, "enderDest/UF"))}</span></div><div class="box" style="flex:1.6"><span class="l">Inscri\xE7\xE3o estadual</span><span class="v">${esc2(text(dest, "IE"))}</span></div><div class="box" style="flex:1.1"><span class="l">Hora da sa\xEDda</span><span class="v">${(text(ide, "dhSaiEnt").split("T")[1] ?? "").slice(0, 8)}</span></div></div>
${dups ? `<div class="sec">Fatura / Duplicatas</div><div class="row">${dups}</div>` : ""}
<div class="sec">C\xE1lculo do imposto</div>
<div class="row">${totalBox("Base de c\xE1lc. do ICMS", text(tot, "vBC"))}${totalBox("Valor do ICMS", text(tot, "vICMS"))}${totalBox("Base c\xE1lc. ICMS ST", text(tot, "vBCST"))}${totalBox("Valor do ICMS subst.", text(tot, "vST"))}${totalBox("Valor imp. importa\xE7\xE3o", text(tot, "vII"))}${totalBox("Valor total dos produtos", text(tot, "vProd"), true)}</div>
<div class="row">${totalBox("Valor do frete", text(tot, "vFrete"))}${totalBox("Valor do seguro", text(tot, "vSeg"))}${totalBox("Desconto", text(tot, "vDesc"))}${totalBox("Outras despesas", text(tot, "vOutro"))}${totalBox("Valor do IPI", text(tot, "vIPI"))}${totalBox("Valor total da nota", text(tot, "vNF"), true)}</div>
<div class="sec">Transportador / Volumes transportados</div>
<div class="row"><div class="box" style="flex:3"><span class="l">Raz\xE3o social</span><span class="v">${esc2(text(transporta, "xNome"))}</span></div><div class="box" style="flex:1.4"><span class="l">Frete por conta</span><span class="v">${FRETE[text(transp, "modFrete")] ?? ""}</span></div><div class="box"><span class="l">Placa do ve\xEDculo</span><span class="v">${esc2(text(transp, "veicTransp/placa"))}</span></div><div class="box" style="flex:1.4"><span class="l">CNPJ / CPF</span><span class="v">${docOf(transporta)}</span></div></div>
<div class="row"><div class="box"><span class="l">Quantidade</span><span class="v">${esc2(text(vol, "qVol"))}</span></div><div class="box"><span class="l">Esp\xE9cie</span><span class="v">${esc2(text(vol, "esp"))}</span></div><div class="box"><span class="l">Marca</span><span class="v">${esc2(text(vol, "marca"))}</span></div><div class="box"><span class="l">Peso bruto</span><span class="v">${num2(text(vol, "pesoB"), 3)}</span></div><div class="box"><span class="l">Peso l\xEDquido</span><span class="v">${num2(text(vol, "pesoL"), 3)}</span></div></div>
<div class="sec">Dados dos produtos / servi\xE7os</div>
<table><thead><tr><th>C\xF3digo</th><th style="width:30%">Descri\xE7\xE3o do produto / servi\xE7o</th><th>NCM/SH</th><th>CST</th><th>CFOP</th><th>Un.</th><th>Quant.</th><th>Valor unit.</th><th>Valor total</th><th>Desc.</th><th>BC ICMS</th><th>Valor ICMS</th><th>Valor IPI</th><th>Al\xEDq. ICMS</th><th>Al\xEDq. IPI</th></tr></thead><tbody>${items}</tbody></table>
<div class="sec">Dados adicionais</div>
<div class="row"><div class="box" style="flex:2.2;min-height:90px"><span class="l">Informa\xE7\xF5es complementares</span><span class="v" style="font-size:7.5pt">${lines(info)}</span>${text(inf, "infAdic/infAdFisco") ? `<span class="v" style="font-size:7.5pt"><br>${lines(text(inf, "infAdic/infAdFisco"))}</span>` : ""}</div><div class="box"><span class="l">Reservado ao fisco</span></div></div>
<div style="font-size:6pt;color:#555;margin-top:4px;text-align:right">DANFE gerado localmente pelo GCP-PDF a partir do XML autorizado</div>
</body></html>`;
}
async function danfeNfce(root) {
  const inf = find(root, "infNFe"), ide = find(inf, "ide"), emit = find(inf, "emit"), dest = find(inf, "dest"), tot = find(inf, "total/ICMSTot");
  const prot = find(root, "protNFe/infProt"), chave = (inf.getAttribute("Id") ?? "").replace(/^NFe/, "") || text(prot, "chNFe");
  const qrText = text(root, "infNFeSupl/qrCode"), url = text(root, "infNFeSupl/urlChave");
  const dets = all(inf, "det");
  const qty = (v) => Number(v) % 1 ? num2(v, 3) : String(Number(v));
  const items = dets.map((det, i) => {
    const p = find(det, "prod");
    return `<div class="item"><div>${String(i + 1).padStart(3, "0")} ${esc2(text(p, "cProd"))} ${esc2(text(p, "xProd"))}</div><div>${qty(text(p, "qCom"))} ${esc2(text(p, "uCom"))} x R$ ${num2(text(p, "vUnCom"))} = R$ ${num2(text(p, "vProd"))}</div></div>`;
  }).join("");
  const PAG = { "01": "Dinheiro", "03": "Cart\xE3o de cr\xE9dito", "04": "Cart\xE3o de d\xE9bito", "17": "PIX", "99": "Outros", "05": "Cr\xE9dito loja", "10": "Vale alimenta\xE7\xE3o", "11": "Vale refei\xE7\xE3o" };
  const pags = all(inf, "detPag").map((d) => `<div class="line"><span>${esc2(PAG[text(d, "tPag")] ?? "Pagamento " + text(d, "tPag"))}</span><span>${num2(text(d, "vPag"))}</span></div>`).join("");
  const troco = text(inf, "pag/vTroco");
  const homolog = text(ide, "tpAmb") === "2";
  const height = Math.ceil(150 + dets.length * 8 + (qrText ? 50 : 0) + text(inf, "infAdic/infCpl").length / 12);
  return { height, html: `<!doctype html><html lang="pt-BR"><meta charset="utf-8">${CSP}<style>@page{size:80mm ${height}mm;margin:3mm}body{margin:0;font-family:Arial,Helvetica,sans-serif;font-size:7.4pt;color:#000}.c{text-align:center}.r{text-align:right}
hr{border:0;border-top:1px dashed #000;margin:5px 0}table{width:100%;border-collapse:collapse}th,td{font-size:6.6pt;padding:1px 1px;vertical-align:top}th{text-align:left;border-bottom:1px solid #000}.line{display:flex;justify-content:space-between}.big{font-weight:bold;font-size:8.6pt}.qr svg{width:30mm;height:30mm}.item{margin:2px 0;line-height:1.35}.items-head{font-size:6.8pt;margin-bottom:3px}</style><body>
<div class="c"><b>${esc2(text(emit, "xNome"))}</b><br>CNPJ ${docOf(emit)} \xB7 IE ${esc2(text(emit, "IE"))}<br>${esc2([text(emit, "enderEmit/xLgr"), text(emit, "enderEmit/nro"), text(emit, "enderEmit/xBairro"), text(emit, "enderEmit/xMun") + "/" + text(emit, "enderEmit/UF")].filter(Boolean).join(", "))}</div>
<hr><div class="c"><b>DANFE NFC-e \u2014 Documento Auxiliar da Nota Fiscal de Consumidor Eletr\xF4nica</b>${homolog ? "<br><b>EMITIDA EM AMBIENTE DE HOMOLOGA\xC7\xC3O \u2014 SEM VALOR FISCAL</b>" : ""}</div><hr>
<div class="items-head"><b>ITEM C\xD3DIGO DESCRI\xC7\xC3O<br>QTD. UN. V. UNIT\xC1RIO R$ / V. TOTAL R$</b></div>${items}<hr>
<div class="line"><span>Qtde. total de itens</span><span>${dets.length}</span></div>
<div class="line"><span>Valor total R$</span><span>${num2(text(tot, "vProd"))}</span></div>
${Number(text(tot, "vDesc")) ? `<div class="line"><span>Descontos R$</span><span>${num2(text(tot, "vDesc"))}</span></div>` : ""}
${Number(text(tot, "vOutro")) || Number(text(tot, "vFrete")) ? `<div class="line"><span>Acr\xE9scimos R$</span><span>${num2(String(Number(text(tot, "vOutro") || 0) + Number(text(tot, "vFrete") || 0)))}</span></div>` : ""}
<div class="line big"><span>Valor a pagar R$</span><span>${num2(text(tot, "vNF"))}</span></div>
<div class="line" style="margin-top:3px"><b>Forma de pagamento</b><b>Valor pago R$</b></div>${pags}${troco ? `<div class="line"><span>Troco R$</span><span>${num2(troco)}</span></div>` : ""}<hr>
<div class="c"><b>CHAVE DE ACESSO</b><br>${chaveFmt(chave)}<br>Consulte pela chave de acesso em ${esc2(url || "portal da Sefaz do seu estado")}</div><hr>
<div class="c">${dest ? `CONSUMIDOR ${docOf(dest) ? `CPF/CNPJ ${docOf(dest)}` : ""} ${esc2(text(dest, "xNome"))}` : "CONSUMIDOR N\xC3O IDENTIFICADO"}</div><hr>
<div class="c"><b>NFC-e n\xBA ${esc2(text(ide, "nNF"))} S\xE9rie ${esc2(text(ide, "serie"))} ${date(text(ide, "dhEmi"))}</b><br>${prot ? `Protocolo de autoriza\xE7\xE3o: ${esc2(text(prot, "nProt"))}<br>Data de autoriza\xE7\xE3o: ${date(text(prot, "dhRecbto"))}` : "Sem protocolo de autoriza\xE7\xE3o no arquivo"}</div>
${qrText ? `<div class="c qr" style="margin-top:4px">${await qr(qrText)}<div>Consulte a autenticidade pelo QR Code</div><div style="font-size:5.6pt;word-break:break-all">${esc2(qrText)}</div></div>` : ""}
${Number(text(tot, "vTotTrib")) ? `<hr><div class="c">Tributos totais incidentes (Lei Federal 12.741/2012): R$ ${num2(text(tot, "vTotTrib"))}</div>` : ""}
${text(inf, "infAdic/infCpl") ? `<hr><div class="c" style="font-size:6.4pt">${lines(text(inf, "infAdic/infCpl"))}</div>` : ""}
</body></html>` };
}
async function danfse(root) {
  const inf = find(root, "infNFSe"), dps = find(inf, "infDPS"), emit = find(inf, "emit"), prest = find(dps, "prest"), toma = find(dps, "toma"), serv = find(dps, "serv"), val = find(dps, "valores"), trib = find(val, "trib");
  const chave = (inf.getAttribute("Id") ?? "").replace(/^NFS/, "");
  const qrSvg = chave ? await qr(`https://www.nfse.gov.br/ConsultaPublica/?tpc=1&chave=${chave}`) : "";
  const homolog = text(dps, "tpAmb") === "2";
  const cell = (label, value, flex = 1) => `<div class="box" style="flex:${flex}"><span class="l">${label}</span><span class="v">${value || "-"}</span></div>`;
  const tomaEnd = find(toma, "end"), emitEnd = find(emit, "enderNac");
  const enderToma = [text(tomaEnd, "xLgr"), text(tomaEnd, "nro"), text(tomaEnd, "xCpl"), text(tomaEnd, "xBairro")].filter(Boolean).join(", ");
  const enderEmit = [text(emitEnd, "xLgr"), text(emitEnd, "nro"), text(emitEnd, "xCpl"), text(emitEnd, "xBairro")].filter(Boolean).join(", ");
  const SN = { "1": "N\xE3o optante", "2": "Optante - Microempreendedor Individual (MEI)", "3": "Optante - Microempresa ou Empresa de Pequeno Porte (ME/EPP)" };
  const RET = { "1": "N\xE3o retido", "2": "Retido pelo tomador", "3": "Retido pelo intermedi\xE1rio" };
  const TRIB = { "1": "Opera\xE7\xE3o tribut\xE1vel", "2": "Imunidade", "3": "Exporta\xE7\xE3o de servi\xE7o", "4": "N\xE3o incid\xEAncia" };
  const vServ = text(val, "vServPrest/vServ"), vLiq = text(inf, "valores/vLiq") || vServ;
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8">${CSP}<style>@page{size:A4;margin:8mm}${BASE_CSS}.head{display:flex;align-items:center;border:1px solid #000;padding:6px}.qr svg{width:26mm;height:26mm}
.band{font-weight:bold;font-size:8pt;text-transform:uppercase;background:#ececec;border:1px solid #000;border-top:none;padding:2px 4px}</style><body>
${homolog ? '<div class="watermark">SEM VALOR FISCAL<br>HOMOLOGA\xC7\xC3O</div>' : ""}
<div class="head"><div style="flex:1;font-size:15pt;font-weight:bold;color:#1f5f99">NFS<span style="color:#7aa83f">e</span><div style="font-size:6.5pt;color:#333;font-weight:normal">Nota Fiscal de Servi\xE7o eletr\xF4nica</div></div>
<div style="flex:2;text-align:center"><b style="font-size:11pt">DANFSe v2.0</b><br><b>Documento Auxiliar da NFS-e</b></div>
<div style="flex:1.4;font-size:8pt">Munic\xEDpio: ${esc2(text(inf, "xLocEmi"))}<br>Ambiente gerador: ${esc2(text(inf, "ambGer"))}<br>Tipo de ambiente: ${esc2(text(dps, "tpAmb"))}</div></div>
<div class="row"><div class="box" style="flex:3"><span class="l">Chave de acesso da NFS-e</span><span class="v" style="font-weight:bold">${esc2(chave)}</span>
<div class="row" style="margin-top:4px">${cell("N\xFAmero da NFS-e", esc2(text(inf, "nNFSe")))}${cell("Compet\xEAncia da NFS-e", date(text(dps, "dCompet"), false))}${cell("Data e hora da emiss\xE3o da NFS-e", date(text(inf, "dhProc")))}</div>
<div class="row">${cell("N\xFAmero da DPS", esc2(text(dps, "nDPS")))}${cell("S\xE9rie da DPS", esc2(text(dps, "serie")))}${cell("Data e hora da emiss\xE3o da DPS", date(text(dps, "dhEmi")))}</div>
<div class="row">${cell("Emitente da NFS-e", text(dps, "tpEmit") === "1" ? "Prestador" : text(dps, "tpEmit") === "2" ? "Tomador" : "Intermedi\xE1rio")}${cell("Situa\xE7\xE3o da NFS-e", text(inf, "cStat") === "100" ? "NFS-e gerada" : esc2(text(inf, "cStat")))}${cell("Finalidade", "-")}</div></div>
<div class="box c qr" style="flex:1">${qrSvg}<div style="font-size:6pt;margin-top:2px">A autenticidade desta NFS-e pode ser verificada pela leitura deste c\xF3digo QR ou pela consulta da chave de acesso no portal nacional da NFS-e</div></div></div>
<div class="band">Prestador / Fornecedor</div>
<div class="row">${cell("Nome / Nome empresarial", esc2(text(emit, "xNome")), 2)}${cell("CNPJ / CPF / NIF", docOf(emit) || docOf(prest))}${cell("Indicador municipal (inscri\xE7\xE3o)", esc2(text(emit, "IM") || text(prest, "IM")))}${cell("Telefone", phone(text(prest, "fone") || text(emit, "fone")))}</div>
<div class="row">${cell("Endere\xE7o", esc2(enderEmit), 2)}${cell("Munic\xEDpio / Sigla UF", `${esc2(text(inf, "xLocEmi"))} / ${esc2(text(emitEnd, "UF"))}`)}${cell("C\xF3digo IBGE / CEP", `${esc2(text(emitEnd, "cMun"))} / ${cep(text(emitEnd, "CEP"))}`)}${cell("E-mail", esc2((text(prest, "email") || text(emit, "email")).toLowerCase()))}</div>
<div class="row">${cell("Simples Nacional na data de compet\xEAncia", SN[text(prest, "regTrib/opSimpNac")] ?? "-", 2)}${cell("Regime de apura\xE7\xE3o tribut\xE1ria pelo SN", text(prest, "regTrib/regApTribSN") === "1" ? "Regime de apura\xE7\xE3o dos tributos federais e municipal pelo Simples Nacional" : text(prest, "regTrib/regApTribSN") ? "Tributos federais pelo SN e ISSQN pela NFS-e" : "-", 3)}</div>
<div class="band">Tomador / Adquirente</div>
<div class="row">${cell("Nome / Nome empresarial", esc2(text(toma, "xNome")), 2)}${cell("CNPJ / CPF / NIF", docOf(toma))}${cell("Indicador municipal (inscri\xE7\xE3o)", esc2(text(toma, "IM")))}${cell("Telefone", phone(text(toma, "fone")))}</div>
<div class="row">${cell("Endere\xE7o", esc2(enderToma), 2)}${cell("C\xF3digo IBGE / CEP", `${esc2(text(tomaEnd, "cMun"))} / ${cep(text(tomaEnd, "CEP"))}`)}${cell("E-mail", esc2(text(toma, "email").toLowerCase()), 2)}</div>
<div class="band">Servi\xE7o prestado</div>
<div class="row">${cell("C\xF3digo de tributa\xE7\xE3o nacional / municipal", `${esc2(text(serv, "cServ/cTribNac").replace(/(\d{2})(\d{2})(\d{2})/, "$1.$2.$3"))} / ${esc2(text(serv, "cServ/cTribMun"))}`)}${cell("C\xF3digo da NBS", esc2(text(serv, "cServ/cNBS")))}${cell("Local da presta\xE7\xE3o", esc2(text(inf, "xLocPrestacao")))}</div>
<div class="box" style="border-top:none"><span class="l">Tributa\xE7\xE3o nacional</span><span class="v">${esc2(text(inf, "xTribNac"))}</span></div>
<div class="box" style="border-top:none;min-height:42px"><span class="l">Descri\xE7\xE3o do servi\xE7o</span><span class="v">${lines(text(serv, "cServ/xDescServ"))}</span></div>
<div class="band">Tributa\xE7\xE3o municipal (ISSQN)</div>
<div class="row">${cell("Tipo de tributa\xE7\xE3o do ISSQN", TRIB[text(trib, "tribMun/tribISSQN")] ?? "-")}${cell("Munic\xEDpio de incid\xEAncia", esc2(text(inf, "xLocIncid")))}${cell("Reten\xE7\xE3o do ISSQN", RET[text(trib, "tribMun/tpRetISSQN")] ?? "-")}${cell("Al\xEDquota aplicada", text(trib, "tribMun/pAliq") ? num2(text(trib, "tribMun/pAliq")) + "%" : "-")}${cell("ISSQN apurado", money(text(inf, "valores/vISSQN")) || "-")}</div>
<div class="band">Tributa\xE7\xE3o federal</div>
<div class="row">${cell("IRRF", money(text(trib, "tribFed/vRetIRRF")))}${cell("Contribui\xE7\xE3o previdenci\xE1ria retida", money(text(trib, "tribFed/vRetCP")))}${cell("PIS / COFINS (CST)", esc2(text(trib, "tribFed/piscofins/CST")))}${cell("Reten\xE7\xE3o PIS/COFINS/CSLL", text(trib, "tribFed/piscofins/tpRetPisCofins") === "0" ? "N\xE3o retidos" : esc2(text(trib, "tribFed/piscofins/tpRetPisCofins")))}</div>
<div class="band">Valor total da NFS-e</div>
<div class="row">${cell("Valor do servi\xE7o", money(vServ))}${cell("Desconto incondicionado", money(text(val, "vDescCondIncond/vDescIncond")))}${cell("Desconto condicionado", money(text(val, "vDescCondIncond/vDescCond")))}${cell("Total das reten\xE7\xF5es", money(text(inf, "valores/vTotalRet")))}<div class="box" style="flex:1"><span class="l">Valor l\xEDquido da NFS-e</span><span class="v" style="font-weight:bold;font-size:11pt">${money(vLiq)}</span></div></div>
<div class="band">Informa\xE7\xF5es complementares</div>
<div class="box" style="border-top:none;min-height:40px"><span class="v">${text(trib, "totTrib/pTotTribSN") ? `Total aproximado dos tributos (Simples Nacional): ${num2(text(trib, "totTrib/pTotTribSN"))}%` : ""}${text(dps, "xInfComp") ? `<br>${lines(text(dps, "xInfComp"))}` : ""}</span></div>
<div style="font-size:6pt;color:#555;margin-top:4px;text-align:right">DANFSe gerado localmente pelo GCP-PDF a partir do XML da NFS-e</div>
</body></html>`;
}
async function nfseAbrasf(root) {
  const inf = find(root, "InfNfse") ?? root, servico = find(inf, "Servico") ?? find(root, "Servico"), val = find(servico, "Valores");
  const prest = find(inf, "PrestadorServico") ?? find(root, "Prestador"), toma = find(inf, "TomadorServico") ?? find(root, "Tomador") ?? find(root, "TomadorServico");
  const id = (e) => doc(text(e, "Cnpj") || text(e, "Cpf") || text(e, "CNPJ") || text(e, "CPF"));
  const end = (e) => {
    const x = find(e, "Endereco");
    return [text(x, "Endereco"), text(x, "Numero"), text(x, "Complemento"), text(x, "Bairro"), text(x, "Cep") && "CEP " + cep(text(x, "Cep")), text(x, "Uf")].filter(Boolean).join(", ");
  };
  const cell = (label, value, flex = 1) => `<div class="box" style="flex:${flex}"><span class="l">${label}</span><span class="v">${value || "-"}</span></div>`;
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8">${CSP}<style>@page{size:A4;margin:9mm}${BASE_CSS}.band{font-weight:bold;font-size:8pt;text-transform:uppercase;background:#ececec;border:1px solid #000;border-top:none;padding:2px 4px}</style><body>
<div class="box c" style="padding:8px"><b style="font-size:13pt">NOTA FISCAL DE SERVI\xC7OS ELETR\xD4NICA \u2014 NFS-e</b><br><span class="v">Layout municipal (ABRASF) \xB7 ${esc2(text(inf, "OrgaoGerador/CodigoMunicipio") || text(servico, "CodigoMunicipio"))}</span></div>
<div class="row">${cell("N\xFAmero da NFS-e", esc2(text(inf, "Numero")))}${cell("Data e hora da emiss\xE3o", date(text(inf, "DataEmissao")))}${cell("Compet\xEAncia", date(text(inf, "Competencia") || text(root, "Competencia"), false))}${cell("C\xF3digo de verifica\xE7\xE3o", esc2(text(inf, "CodigoVerificacao")))}</div>
<div class="band">Prestador de servi\xE7os</div>
<div class="row">${cell("Raz\xE3o social", esc2(text(prest, "RazaoSocial") || text(prest, "NomeFantasia")), 2)}${cell("CNPJ / CPF", id(prest))}${cell("Inscri\xE7\xE3o municipal", esc2(text(prest, "InscricaoMunicipal")))}</div>
<div class="box" style="border-top:none"><span class="l">Endere\xE7o</span><span class="v">${esc2(end(prest))}</span></div>
<div class="band">Tomador de servi\xE7os</div>
<div class="row">${cell("Raz\xE3o social", esc2(text(toma, "RazaoSocial")), 2)}${cell("CNPJ / CPF", id(toma))}${cell("Inscri\xE7\xE3o municipal", esc2(text(toma, "InscricaoMunicipal")))}</div>
<div class="box" style="border-top:none"><span class="l">Endere\xE7o</span><span class="v">${esc2(end(toma))}</span></div>
<div class="band">Discrimina\xE7\xE3o dos servi\xE7os</div>
<div class="box" style="border-top:none;min-height:120px"><span class="v">${lines(text(servico, "Discriminacao"))}</span></div>
<div class="row">${cell("Item da lista de servi\xE7os", esc2(text(servico, "ItemListaServico")))}${cell("C\xF3digo de tributa\xE7\xE3o municipal", esc2(text(servico, "CodigoTributacaoMunicipio")))}${cell("CNAE", esc2(text(servico, "CodigoCnae")))}</div>
<div class="band">Valores</div>
<div class="row">${cell("Valor dos servi\xE7os", money(text(val, "ValorServicos")))}${cell("Dedu\xE7\xF5es", money(text(val, "ValorDeducoes")))}${cell("Base de c\xE1lculo", money(text(val, "BaseCalculo") || text(inf, "ValoresNfse/BaseCalculo")))}${cell("Al\xEDquota", text(val, "Aliquota") ? num2(text(val, "Aliquota"), 2) : "")}${cell("Valor do ISS", money(text(val, "ValorIss") || text(inf, "ValoresNfse/ValorIss")))}</div>
<div class="row">${cell("PIS", money(text(val, "ValorPis")))}${cell("COFINS", money(text(val, "ValorCofins")))}${cell("INSS", money(text(val, "ValorInss")))}${cell("IR", money(text(val, "ValorIr")))}${cell("CSLL", money(text(val, "ValorCsll")))}<div class="box"><span class="l">Valor l\xEDquido</span><span class="v" style="font-weight:bold">${money(text(val, "ValorLiquidoNfse") || text(inf, "ValoresNfse/ValorLiquidoNfse") || text(val, "ValorServicos"))}</span></div></div>
${text(inf, "OutrasInformacoes") ? `<div class="band">Outras informa\xE7\xF5es</div><div class="box" style="border-top:none"><span class="v">${lines(text(inf, "OutrasInformacoes"))}</span></div>` : ""}
<div style="font-size:6pt;color:#555;margin-top:4px;text-align:right">Gerado localmente pelo GCP-PDF. Cada prefeitura tem seu pr\xF3prio modelo visual; confira a vers\xE3o oficial no portal do munic\xEDpio.</div>
</body></html>`;
}
function generic(root, title) {
  const rows = [];
  const walk2 = (e, depth, path3) => {
    const children2 = kids2(e).filter((c) => local2(c) !== "Signature");
    if (!children2.length) {
      const v = (e.textContent ?? "").trim();
      if (v) rows.push(`<tr><td style="padding-left:${4 + depth * 8}px">${esc2(local2(e))}</td><td>${lines(v)}</td></tr>`);
      return;
    }
    rows.push(`<tr><th colspan="2" style="text-align:left;padding-left:${4 + depth * 8}px">${esc2(path3 ? path3 + " \u203A " : "")}${esc2(local2(e))}</th></tr>`);
    for (const c of children2) walk2(c, depth + 1, "");
  };
  walk2(root, 0, "");
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8">${CSP}<style>@page{size:A4;margin:10mm}${BASE_CSS}td:first-child{width:32%;color:#333}</style><body><h2 style="font-size:13pt;margin:0 0 6px">${esc2(title)}</h2><p style="font-size:7.5pt;margin:0 0 8px">Formato sem modelo visual oficial reconhecido pelo GCP-PDF: todos os campos do XML est\xE3o listados abaixo, na ordem do arquivo.</p><table>${rows.join("")}</table></body></html>`;
}
function fiscalKind(root) {
  const name = local2(root), ns = root.namespaceURI ?? "";
  const inf = find(root, "infNFe") ?? (name === "infNFe" ? root : null);
  if (inf || /portalfiscal\.inf\.br\/nfe/.test(ns)) return text(inf, "ide/mod") === "65" ? "nfce" : "nfe";
  if (/sped\.fazenda\.gov\.br\/nfse/.test(ns) || find(root, "infNFSe")) return "nfse-nacional";
  if (find(root, "InfNfse") || /abrasf|nfse/i.test(ns) || /nfse/i.test(name)) return "nfse-abrasf";
  return "generico";
}
var LABEL = { nfe: "NF-e (DANFE)", nfce: "NFC-e (DANFE NFC-e)", "nfse-nacional": "NFS-e Nacional (DANFSe)", "nfse-abrasf": "NFS-e municipal (ABRASF)", generico: "XML fiscal" };
function decodeXml(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("latin1").decode(bytes);
  }
}
async function fiscalXmlToPdf(bytes, htmlToPdf, htmlToPdfSized) {
  const source = decodeXml(bytes).replace(/^﻿/, "");
  const errors = [];
  const parsed = new import_xmldom2.DOMParser({ onError: (level, message) => {
    if (level !== "warning") errors.push(message);
  } }).parseFromString(source, "text/xml");
  const root = parsed.documentElement;
  if (!root || errors.length && !kids2(root).length) throw new Error("Este arquivo XML est\xE1 malformado e n\xE3o p\xF4de ser lido.");
  const kind2 = fiscalKind(root);
  let out;
  if (kind2 === "nfe") out = await htmlToPdf(await danfe(root));
  else if (kind2 === "nfce") {
    const { html, height } = await danfeNfce(root);
    out = htmlToPdfSized ? await htmlToPdfSized(html, 80, height) : await htmlToPdf(html);
  } else if (kind2 === "nfse-nacional") out = await htmlToPdf(await danfse(root));
  else if (kind2 === "nfse-abrasf") out = await htmlToPdf(await nfseAbrasf(root));
  else out = await htmlToPdf(generic(root, local2(root) === "cteProc" || find(root, "infCte") ? "CT-e \u2014 Conhecimento de Transporte eletr\xF4nico" : `Documento XML \u2014 ${local2(root)}`));
  return { bytes: out, kind: kind2, label: LABEL[kind2] };
}

// ../cliqueprojeto/gcp-pdf/src/main/system.ts
var exec = (0, import_node_util.promisify)(import_node_child_process3.execFile);
var INPUT_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".docx", ".xlsx", ".pptx", ".odt", ".ods", ".odp", ".doc", ".xls", ".ppt", ".rtf", ".txt", ".xml"];
async function isPdfInput(path3) {
  const extension = (0, import_node_path5.extname)(path3).toLowerCase();
  return extension === ".pdf" || !INPUT_EXTENSIONS.includes(extension) && await hasPdfHeader(path3);
}
async function readInputDocument(path3, htmlToPdf) {
  const extension = (0, import_node_path5.extname)(path3).toLowerCase(), sourcePdf = await isPdfInput(path3);
  if (!sourcePdf && !INPUT_EXTENSIONS.includes(extension)) throw new Error("O arquivo selecionado n\xE3o \xE9 um PDF nem um formato suportado.");
  return { bytes: sourcePdf ? new Uint8Array(await (0, import_promises5.readFile)(path3)) : await convertInputPdf(path3, htmlToPdf), sourcePdf };
}
async function convertInputPdf(path3, htmlToPdf) {
  const extension = (0, import_node_path5.extname)(path3).toLowerCase();
  if (extension === ".xml") {
    if (!htmlToPdf) throw new Error("Convers\xE3o interna indispon\xEDvel neste contexto.");
    return (await fiscalXmlToPdf(new Uint8Array(await (0, import_promises5.readFile)(path3)), htmlToPdf)).bytes;
  }
  if ([".png", ".jpg", ".jpeg", ".webp", ".bmp"].includes(extension)) {
    const image = await (0, import_canvas4.loadImage)(await (0, import_promises5.readFile)(path3));
    if (image.width * image.height > 1e8) throw new Error("A imagem ultrapassa 100 megapixels. Reduza-a antes de importar.");
    const canvas = (0, import_canvas4.createCanvas)(image.width, image.height);
    canvas.getContext("2d").drawImage(image, 0, 0);
    const doc2 = await import_pdf_lib5.PDFDocument.create(), embedded = await doc2.embedPng(canvas.toBuffer("image/png"));
    const landscape = image.width > image.height;
    const page2 = doc2.addPage(landscape ? [841.89, 595.28] : [595.28, 841.89]);
    const width = page2.getWidth() - 48, height = page2.getHeight() - 48, scale = Math.min(width / image.width, height / image.height);
    page2.drawImage(embedded, { x: (page2.getWidth() - image.width * scale) / 2, y: (page2.getHeight() - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
    return doc2.save();
  }
  return officeToPdf(path3, htmlToPdf ?? (async () => {
    throw new Error("Convers\xE3o interna indispon\xEDvel neste contexto.");
  }), () => libreOfficeToPdf(path3));
}
function libreOfficeCandidates(platform = process.platform, env = process.env, home = (0, import_node_os3.homedir)()) {
  const windows = platform === "win32", sep = windows ? "\\" : "/", at = (...parts) => parts.join(sep), names = windows ? ["soffice.exe"] : ["soffice", "libreoffice"];
  const fixed = windows ? [at(env.ProgramFiles || "C:\\Program Files", "LibreOffice", "program", "soffice.exe"), at(env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "LibreOffice", "program", "soffice.exe")] : platform === "darwin" ? ["/Applications/LibreOffice.app/Contents/MacOS/soffice", at(home, "Applications", "LibreOffice.app", "Contents", "MacOS", "soffice"), "/opt/homebrew/bin/soffice", "/usr/local/bin/soffice"] : ["/usr/bin/libreoffice", "/usr/bin/soffice", "/usr/local/bin/libreoffice", "/usr/local/bin/soffice", "/usr/lib/libreoffice/program/soffice", "/usr/lib64/libreoffice/program/soffice", "/opt/libreoffice/program/soffice", "/snap/bin/libreoffice", "/var/lib/flatpak/exports/bin/org.libreoffice.LibreOffice", at(home, ".local", "share", "flatpak", "exports", "bin", "org.libreoffice.LibreOffice")];
  const onPath = (env.PATH ?? env.Path ?? "").split(windows ? ";" : ":").filter(Boolean).flatMap((folder) => names.map((name) => at(folder.replace(/[\\/]+$/, ""), name)));
  return [...new Set([env.GCP_PDF_LIBREOFFICE, ...fixed, ...onPath].filter((p) => !!p))];
}
async function libreOfficeToPdf(path3) {
  const executable = libreOfficeCandidates().find((p) => (0, import_node_fs2.existsSync)(p));
  if (!executable) return null;
  const temp = await (0, import_promises5.mkdtemp)((0, import_node_path5.join)((0, import_node_os3.tmpdir)(), "gcp-pdf-convert-"));
  try {
    await exec(executable, ["-env:UserInstallation=" + (0, import_node_url2.pathToFileURL)((0, import_node_path5.join)(temp, "profile")).href, "--headless", "--convert-to", "pdf", "--outdir", temp, path3], { timeout: 12e4, windowsHide: true, maxBuffer: 1024 * 1024 });
    return new Uint8Array(await (0, import_promises5.readFile)((0, import_node_path5.join)(temp, (0, import_node_path5.basename)(path3, (0, import_node_path5.extname)(path3)) + ".pdf")));
  } catch {
    throw new Error("N\xE3o foi poss\xEDvel converter este arquivo com o LibreOffice. Verifique se o formato \xE9 compat\xEDvel e se o arquivo n\xE3o est\xE1 protegido.");
  } finally {
    await (0, import_promises5.rm)(temp, { recursive: true, force: true });
  }
}

// ../cliqueprojeto/gcp-pdf/src/main/epub-reader.ts
var import_fflate3 = require("fflate");
var import_xmldom3 = require("@xmldom/xmldom");
var import_node_crypto2 = require("node:crypto");
var import_node_path6 = require("node:path");
var MAX_TOTAL = 400 * 1024 * 1024;
var MEDIA = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", ttf: "font/ttf", otf: "font/otf", woff: "font/woff", woff2: "font/woff2" };
var DROP = /* @__PURE__ */ new Set(["script", "iframe", "frame", "frameset", "object", "embed", "applet", "form", "input", "button", "select", "textarea", "base", "meta", "link", "audio", "video", "source", "track", "canvas", "noscript", "template", "portal"]);
function readBook2(bytes) {
  let total = 0;
  const files = (0, import_fflate3.unzipSync)(bytes, { filter: (file) => {
    total += file.originalSize;
    if (total > MAX_TOTAL) throw new Error("O livro \xE9 grande demais para abrir (mais de 400 MB descompactado).");
    return true;
  } });
  const text2 = (path3) => {
    const f = files[path3];
    if (!f) throw new Error(`O EPUB est\xE1 incompleto: falta ${path3}.`);
    return (0, import_fflate3.strFromU8)(f);
  };
  const xml = (path3) => new import_xmldom3.DOMParser({ onError: () => {
  } }).parseFromString(text2(path3), "application/xml");
  const container = xml("META-INF/container.xml"), rootfile = container.getElementsByTagName("rootfile")[0]?.getAttribute("full-path");
  if (!rootfile) throw new Error("Este arquivo n\xE3o \xE9 um EPUB v\xE1lido (sem container).");
  const opf = xml(rootfile), base = import_node_path6.posix.dirname(rootfile), resolve2 = (from, href) => import_node_path6.posix.normalize(import_node_path6.posix.join(import_node_path6.posix.dirname(from), decodeURIComponent(href.split("#")[0])));
  const first = (tag) => opf.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
  const manifest = /* @__PURE__ */ new Map();
  for (const item of Array.from(opf.getElementsByTagName("item"))) manifest.set(item.getAttribute("id") ?? "", { href: import_node_path6.posix.normalize(import_node_path6.posix.join(base, decodeURIComponent(item.getAttribute("href") ?? ""))), type: item.getAttribute("media-type") ?? "", props: item.getAttribute("properties") ?? "" });
  const spine = Array.from(opf.getElementsByTagName("itemref")).map((r) => manifest.get(r.getAttribute("idref") ?? "")).filter((i) => !!i && /html/.test(i.type) && !!files[i.href]);
  if (!spine.length) throw new Error("O livro n\xE3o tem cap\xEDtulos leg\xEDveis.");
  const chapterOf = new Map(spine.map((s, i) => [s.href, i]));
  const dataUrl = (path3) => {
    const f = files[path3];
    if (!f) return void 0;
    const type = MEDIA[import_node_path6.posix.extname(path3).slice(1).toLowerCase()];
    return type ? `data:${type};base64,${Buffer.from(f).toString("base64")}` : void 0;
  };
  const cssUrls = (css2, from) => css2.replace(/@import[^;]+;/g, "").replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (_m, _q, href) => /^(data:|#)/.test(href) ? `url(${href})` : /^[a-z]+:/i.test(href) ? "none" : `url(${dataUrl(resolve2(from, href)) ?? "none"})`);
  const anchor = (i, id) => `c${i}-${id}`;
  const link = (from, href) => {
    if (/^[a-z]+:/i.test(href)) return void 0;
    const [path3, hash] = href.split("#"), target2 = path3 ? resolve2(from, href) : from, chapter = chapterOf.get(target2);
    return chapter === void 0 ? void 0 : "#" + (hash ? anchor(chapter, decodeURIComponent(hash)) : `c${chapter}`);
  };
  const css = [];
  const serializer = new import_xmldom3.XMLSerializer();
  const sections = spine.map((item, i) => {
    const source = text2(item.href);
    let doc2 = new import_xmldom3.DOMParser({ onError: () => {
    } }).parseFromString(source, "application/xhtml+xml");
    if (!doc2.getElementsByTagName("body")[0]) doc2 = new import_xmldom3.DOMParser({ onError: () => {
    } }).parseFromString(source, "text/html");
    for (const style of Array.from(doc2.getElementsByTagName("style"))) css.push(cssUrls(style.textContent ?? "", item.href));
    for (const l of Array.from(doc2.getElementsByTagName("link"))) if (/stylesheet/i.test(l.getAttribute("rel") ?? "")) {
      const path3 = resolve2(item.href, l.getAttribute("href") ?? "");
      if (files[path3] && !css.includes(path3)) css.push(`/*${path3}*/` + cssUrls((0, import_fflate3.strFromU8)(files[path3]), path3));
    }
    const body = doc2.getElementsByTagName("body")[0];
    if (!body) return `<section class="gcp-chapter" id="c${i}" data-chapter="${i}"></section>`;
    const clean = (node) => {
      for (const child2 of Array.from(node.childNodes)) {
        if (child2.nodeType === 4) {
          node.replaceChild(child2.ownerDocument.createTextNode(child2.data), child2);
          continue;
        }
        if (child2.nodeType !== 1) {
          if (child2.nodeType !== 3) node.removeChild(child2);
          continue;
        }
        const tag = String(child2.localName ?? child2.nodeName).toLowerCase();
        if (DROP.has(tag) || tag === "style") {
          node.removeChild(child2);
          continue;
        }
        for (const attr2 of Array.from(child2.attributes)) {
          const name = String(attr2.name).toLowerCase(), value = String(attr2.value);
          if (name.startsWith("on") || name === "srcdoc" || name === "formaction" || name === "srcset") {
            child2.removeAttribute(attr2.name);
            continue;
          }
          if (name === "id" || name === "xml:id") {
            child2.setAttribute("id", anchor(i, value));
            if (name !== "id") child2.removeAttribute(attr2.name);
            continue;
          }
          if (name === "style") {
            child2.setAttribute("style", cssUrls(value, item.href));
            continue;
          }
          if (name === "src" || name === "xlink:href" || name === "href" && (tag === "image" || tag === "use")) {
            const url = /^data:image\//.test(value) ? value : /^[a-z]+:/i.test(value) ? void 0 : dataUrl(resolve2(item.href, value));
            if (url) child2.setAttribute(attr2.name, url);
            else child2.removeAttribute(attr2.name);
            continue;
          }
          if (name === "href") {
            const target2 = link(item.href, value);
            if (target2) child2.setAttribute("href", target2);
            else {
              child2.removeAttribute("href");
              if (/^https?:/i.test(value)) child2.setAttribute("data-external", value);
            }
            continue;
          }
          if (name === "poster" || name === "background" || name === "action") child2.removeAttribute(attr2.name);
        }
        clean(child2);
      }
    };
    clean(body);
    const inner = Array.from(body.childNodes).map((n) => serializer.serializeToString(n)).join("");
    return `<section class="gcp-chapter" id="c${i}" data-chapter="${i}">${inner.replace(/\sxmlns(:\w+)?="[^"]*"/g, "")}</section>`;
  });
  const toc = [];
  const navItem = [...manifest.values()].find((m) => /\bnav\b/.test(m.props));
  const target = (from, href) => {
    const [path3, hash] = href.split("#"), chapter = chapterOf.get(path3 ? resolve2(from, href) : from);
    return chapter === void 0 ? void 0 : { chapter, ...hash ? { anchor: anchor(chapter, decodeURIComponent(hash)) } : {} };
  };
  if (navItem && files[navItem.href]) {
    const nav = new import_xmldom3.DOMParser({ onError: () => {
    } }).parseFromString(text2(navItem.href), "application/xhtml+xml");
    const tocNav = Array.from(nav.getElementsByTagName("nav")).find((n) => /toc/.test(n.getAttribute("epub:type") ?? n.getAttribute("type") ?? "")) ?? nav.getElementsByTagName("nav")[0];
    const walk2 = (ol2, level) => {
      for (const li of Array.from(ol2.childNodes).filter((n) => n.localName === "li")) {
        const a = Array.from(li.childNodes).find((n) => n.localName === "a" || n.localName === "span");
        const href = a?.getAttribute?.("href");
        const where = href ? target(navItem.href, href) : void 0;
        if (a && where) toc.push({ title: (a.textContent ?? "").replace(/\s+/g, " ").trim(), level, ...where });
        const sub = Array.from(li.childNodes).find((n) => n.localName === "ol");
        if (sub) walk2(sub, level + 1);
      }
    };
    const ol = tocNav ? Array.from(tocNav.childNodes).find((n) => n.localName === "ol") : void 0;
    if (ol) walk2(ol, 1);
  }
  const ncx = [...manifest.values()].find((m) => /ncx/.test(m.type));
  if (!toc.length && ncx && files[ncx.href]) {
    const doc2 = xml(ncx.href);
    const walk2 = (node, level) => {
      for (const point of Array.from(node.childNodes).filter((n) => n.localName === "navPoint")) {
        const label = point.getElementsByTagName("text")[0]?.textContent?.trim() ?? "", src = point.getElementsByTagName("content")[0]?.getAttribute("src");
        const where = src ? target(ncx.href, src) : void 0;
        if (where && label) toc.push({ title: label, level, ...where });
        walk2(point, level + 1);
      }
    };
    const map = doc2.getElementsByTagName("navMap")[0];
    if (map) walk2(map, 1);
  }
  const tocGenerated = !toc.length;
  if (tocGenerated) spine.forEach((s, i) => toc.push({ title: `Cap\xEDtulo ${i + 1}`, chapter: i, level: 1 }));
  const coverItem = [...manifest.values()].find((m) => /cover-image/.test(m.props)) ?? manifest.get(Array.from(opf.getElementsByTagName("meta")).find((m) => m.getAttribute("name") === "cover")?.getAttribute("content") ?? "");
  const identifier = first("dc:identifier");
  return {
    id: (0, import_node_crypto2.createHash)("sha256").update(identifier || "").update(first("dc:title")).update(String(bytes.length)).update(identifier ? "" : Buffer.from(bytes.subarray(0, 65536))).digest("hex").slice(0, 24),
    title: first("dc:title") || "Livro sem t\xEDtulo",
    author: first("dc:creator"),
    language: first("dc:language"),
    ...coverItem && /^image\//.test(coverItem.type) && dataUrl(coverItem.href) ? { cover: dataUrl(coverItem.href) } : {},
    // The reader embeds this CSS in a <style> element: "<" never appears raw, so a stylesheet cannot
    // close the element and inject markup past the sanitizer. \3C is the same character for CSS.
    toc,
    ...tocGenerated ? { tocGenerated } : {},
    chapters: spine.length,
    html: sections.join("\n"),
    css: css.join("\n").replace(/</g, "\\3C ")
  };
}

// ../cliqueprojeto/gcp-pdf/src/main/comics.ts
var import_node_crypto3 = require("node:crypto");
var import_libarchive_wasm = require("libarchive-wasm");
var TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif", bmp: "image/bmp" };
var COMIC_EXTENSIONS = [".cbz", ".cbr", ".cb7"];
var module2;
var collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
async function readComic(bytes, name) {
  module2 ??= (0, import_libarchive_wasm.libarchiveWasm)();
  const reader = new import_libarchive_wasm.ArchiveReader(await module2, new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  const found = [];
  try {
    for (const entry of reader.entries()) {
      const path3 = entry.getPathname() ?? "", base = path3.split(/[\\/]/).pop() ?? "";
      const type = TYPES[base.split(".").pop()?.toLowerCase() ?? ""];
      if (!type || !base || base.startsWith(".") || /(^|[\\/])__MACOSX[\\/]/.test(path3) || entry.getFiletype() !== "File") continue;
      const data = entry.readData();
      if (data?.length) found.push({ name: path3, data: new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)), type });
    }
  } finally {
    reader.free();
  }
  if (!found.length) throw new Error("Este arquivo n\xE3o tem p\xE1ginas de imagem que o leitor reconhe\xE7a.");
  found.sort((a, b) => collator.compare(a.name, b.name));
  const title = name.replace(/\.(cbz|cbr|cb7)$/i, "").replace(/[_]+/g, " ").trim() || name;
  return { id: (0, import_node_crypto3.createHash)("sha256").update(name).update(String(bytes.length)).update(found.map((p) => p.name).join("\n")).digest("hex").slice(0, 24), title, names: found.map((p) => p.name), pages: found.map(({ data, type }) => ({ data, type })) };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COMIC_EXTENSIONS,
  INPUT_EXTENSIONS,
  analyzeEpub,
  convertPdf,
  docxToHtml,
  extractDocumentText,
  fiscalXmlToPdf,
  libreOfficeCandidates,
  loadPdf,
  officeToPdf,
  readComic,
  readEpubBook,
  readInputDocument,
  renderPdfPages,
  toEpub,
  xlsxToHtml
});
