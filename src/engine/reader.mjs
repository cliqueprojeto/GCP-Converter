// Leitor de e-books (MOBI, AZW, AZW3, FB2, CBZ) usado pelo motor embutido.
// Usa foliate-js (MIT) dentro do Chromium do próprio aplicativo.
import { MOBI, isMOBI } from '../../node_modules/foliate-js/mobi.js'
import { makeFB2 } from '../../node_modules/foliate-js/fb2.js'
import * as fflate from '../../node_modules/foliate-js/vendor/fflate.js'

const blobToDataURL = (blob) => new Promise((resolve) => {
  const r = new FileReader()
  r.onload = () => resolve(r.result)
  r.onerror = () => resolve('')
  r.readAsDataURL(blob)
})

async function inlineImages(root, baseURL) {
  for (const el of root.querySelectorAll('img, image')) {
    const attr = el.tagName.toLowerCase() === 'image' ? (el.getAttribute('href') ? 'href' : 'xlink:href') : 'src'
    const src = el.getAttribute(attr)
    if (!src || src.startsWith('data:')) continue
    try {
      const url = new URL(src, baseURL).href
      const blob = await (await fetch(url)).blob()
      const data = await blobToDataURL(blob)
      if (el.tagName.toLowerCase() === 'image') {
        const img = document.createElement('img')
        img.setAttribute('src', data)
        el.closest('svg')?.replaceWith(img)
      } else el.setAttribute('src', data)
    } catch { el.remove() }
  }
}

function clean(doc) {
  doc.querySelectorAll('script, style, link, meta, title').forEach((n) => n.remove())
  // atributos próprios do MOBI que não interessam fora dele
  doc.querySelectorAll('[filepos], [recindex]').forEach((n) => { n.removeAttribute('filepos'); n.removeAttribute('recindex') })
  doc.querySelectorAll('mbp\\:pagebreak').forEach((n) => n.replaceWith(Object.assign(document.createElement('hr'), { className: 'pagebreak' })))
}

async function readBook(fileURL, kind) {
  const blob = await (await fetch(fileURL)).blob()
  const file = new File([blob], fileURL.split('/').pop())
  let book
  if (kind === 'fb2') book = await makeFB2(file)
  else {
    if (!(await isMOBI(file))) throw new Error('Arquivo MOBI/AZW inválido ou protegido por DRM')
    book = await new MOBI({ unzlib: fflate.unzlibSync }).open(file)
  }
  const parts = []
  for (const section of book.sections || []) {
    if (section.linear === 'no') continue
    let doc
    try {
      // load(): seção com imagens e recursos já resolvidos (blob:)
      const url = await section.load()
      const text = await (await fetch(url)).text()
      const type = /<\?xml|xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/.test(text.slice(0, 500)) ? 'application/xhtml+xml' : 'text/html'
      doc = new DOMParser().parseFromString(text, type)
      if (doc.querySelector('parsererror')) doc = new DOMParser().parseFromString(text, 'text/html')
    } catch {
      try { doc = await section.createDocument() } catch { continue }
    }
    if (!doc || !doc.body) continue
    clean(doc)
    await inlineImages(doc.body, doc.baseURI || location.href)
    parts.push(`<section>${doc.body.innerHTML}</section>`)
  }
  const md = book.metadata || {}
  const pick = (v) => (typeof v === 'string' ? v : v && typeof v === 'object' ? (v.name ? pick(v.name) : Object.values(v)[0]) : '')
  const author = Array.isArray(md.author) ? md.author.map(pick).join(', ') : pick(md.author)
  let cover = ''
  try { const c = await book.getCover?.(); if (c) cover = await blobToDataURL(c) } catch {}
  return { html: parts.join('\n'), title: pick(md.title) || '', author: author || '', lang: pick(md.language) || '', cover }
}

window.gcpReadBook = async (url, kind) => {
  try { return { ok: true, ...(await readBook(url, kind)) } } catch (e) { return { ok: false, error: String(e && e.message || e) } }
}
window.gcpReady = true
