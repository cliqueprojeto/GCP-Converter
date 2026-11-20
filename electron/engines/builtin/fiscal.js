// Documentos fiscais (XML → layout oficial em PDF).
//  • DANFSe v2.0 (NFS-e padrão nacional) — reproduz o leiaute oficial do Portal Nacional da NFS-e.
//  • Extrato do CF-e SAT (Cupom Fiscal Eletrônico) — bobina de 80 mm com código de barras e QR Code.
// NF-e (DANFE), NFC-e (DANFE NFC-e), NFS-e ABRASF e CT-e usam o motor do GCP-PDF.
'use strict';
const { DOMParser } = require('@xmldom/xmldom');

const kids = (e) => (e ? Array.from(e.childNodes || []).filter((c) => c.nodeType === 1) : []);
const local = (e) => e.localName || e.nodeName.replace(/^.*:/, '');
function find(e, p) {
  let cur = e;
  for (const part of p.split('/')) {
    if (!cur) return null;
    const stack = [cur];
    let hit = null;
    // busca em profundidade pelo primeiro elemento com esse nome
    while (stack.length && !hit) {
      const x = stack.shift();
      for (const c of kids(x)) { if (local(c) === part) { hit = c; break; } stack.push(c); }
    }
    cur = hit;
  }
  return cur;
}
const tx = (e, p) => ((p ? find(e, p) : e) || {}).textContent ? String(((p ? find(e, p) : e) || {}).textContent).trim() : '';
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dash = (v) => (v === '' || v == null ? '-' : esc(v));
const num = (v, d = 2) => (v === '' || v == null || isNaN(Number(v)) ? '' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }));
const money = (v) => (v === '' || v == null || isNaN(Number(v)) ? '' : 'R$ ' + num(v));
const pct = (v) => (v === '' || v == null ? '' : num(v, 2) + '%');
function docFmt(v) {
  const d = String(v || '').replace(/\D/g, '');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return v || '';
}
function dt(v, time = true) {
  const m = String(v || '').match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):?(\d{2})?)?/);
  if (!m) return v || '';
  return `${m[3]}/${m[2]}/${m[1]}${time && m[4] ? ` ${m[4]}:${m[5]}:${m[6] || '00'}` : ''}`;
}
const cep = (v) => String(v || '').replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2-$3');
const ibge = (v) => String(v || '').replace(/(\d{2})(\d{5})/, '$1.$2');
function phone(v) {
  const d = String(v || '').replace(/\D/g, '').replace(/^0+/, '');
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return v || '';
}
const tribNac = (v) => String(v || '').replace(/^(\d{2})(\d{2})(\d{2})$/, '$1.$2.$3');
const nbs = (v) => String(v || '').replace(/^(\d)(\d{4})(\d{2})(\d{2})$/, '$1.$2.$3.$4');

async function qrSvg(text) {
  const QR = require('qrcode');
  return QR.toString(text, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });
}

/* ------------------------------------------------------------------ */
/* DANFSe v2.0                                                         */
/* ------------------------------------------------------------------ */

const OP_SN = { 1: 'Não Optante', 2: 'Optante - Microempreendedor Individual (MEI)', 3: 'Optante - Microempresa ou Empresa de Pequeno Porte (ME/EPP)' };
const REG_SN = {
  1: 'Regime de apuração dos tributos federais e municipal pelo Simples Nacional',
  2: 'Regime de apuração dos tributos federais pelo SN e o ISSQN pela NFS-e conforme respectiva legislação municipal do tributo',
  3: 'Regime de apuração dos tributos federais e municipal pela NFS-e conforme respectivas legislações federal e municipal de cada tributo'
};
const TRIB_ISSQN = { 1: 'Operação Tributável', 2: 'Imunidade', 3: 'Exportação de Serviço', 4: 'Não Incidência' };
const RET_ISSQN = { 1: 'Não Retido', 2: 'Retido pelo Tomador', 3: 'Retido pelo Intermediário' };
const EMITENTE = { 1: 'Prestador', 2: 'Tomador', 3: 'Intermediário' };
const SITUACAO = { 100: 'NFS-e Gerada', 101: 'NFS-e de Substituição Gerada', 102: 'NFS-e de Decisão Judicial', 103: 'NFS-e Avulsa' };
const RET_PISCOFINS = {
  0: 'PIS/COFINS/CSLL Não Retidos', 1: 'PIS/COFINS/CSLL Retidos', 2: 'PIS/COFINS Retidos, CSLL Não Retido', 3: 'PIS/COFINS Não Retidos, CSLL Retido',
  4: 'PIS/COFINS Retidos, CSLL Retido', 5: 'PIS Retido, COFINS/CSLL Não Retidos', 6: 'COFINS Retido, PIS/CSLL Não Retidos', 7: 'PIS Não Retido, COFINS/CSLL Retidos',
  8: 'PIS/COFINS Não Retidos, CSLL Retido', 9: 'COFINS Não Retido, PIS/CSLL Retidos'
};

const NFSE_LOGO = `<svg viewBox="0 0 132 40" width="34mm" height="10.3mm" aria-label="NFS-e"><text x="0" y="29" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="31" fill="#1a7a3d" letter-spacing="-1">NFS</text><text x="64" y="29" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="31" fill="#2a9fd6">e</text><text x="85" y="15" font-family="Arial,sans-serif" font-size="7.4" fill="#333">Nota Fiscal de</text><text x="85" y="24" font-family="Arial,sans-serif" font-size="7.4" fill="#333">Serviço eletrônica</text></svg>`;

async function danfseV2(root) {
  const inf = find(root, 'infNFSe');
  const dps = find(inf, 'infDPS');
  const emit = find(inf, 'emit');
  const prest = find(dps, 'prest');
  const toma = find(dps, 'toma');
  const interm = find(dps, 'interm');
  const serv = find(dps, 'serv');
  const val = find(dps, 'valores');
  const valN = kids(inf).find((k) => local(k) === 'valores');
  const trib = find(val, 'trib');
  const tribMun = find(trib, 'tribMun');
  const tribFed = find(trib, 'tribFed');
  const ibscbs = find(dps, 'IBSCBS');
  const ibscbsN = kids(inf).find((k) => local(k) === 'IBSCBS');
  const chave = (inf.getAttribute('Id') || '').replace(/^NFS/, '');
  const cityOf = (code) => {
    if (!code) return '';
    const pairs = [[tx(inf, 'cLocIncid'), tx(inf, 'xLocIncid')], [tx(dps, 'cLocEmi'), tx(inf, 'xLocEmi')], [tx(serv, 'cLocPrestacao'), tx(inf, 'xLocPrestacao')]];
    const hit = pairs.find(([c, n]) => c === code && n);
    return hit ? hit[1] : '';
  };
  const ufOf = (end) => tx(end, 'UF') || (tx(emit, 'enderNac/UF') && tx(end, 'cMun').slice(0, 2) === tx(emit, 'enderNac/cMun').slice(0, 2) ? tx(emit, 'enderNac/UF') : '');
  const party = (p, isEmit) => {
    const end = isEmit ? find(emit, 'enderNac') : find(p, 'end');
    const endNac = end && (find(end, 'endNac') || end);
    const cMun = tx(endNac, 'cMun');
    const nome = isEmit ? tx(emit, 'xNome') : tx(p, 'xNome');
    const docv = tx(p, 'CNPJ') || tx(p, 'CPF') || tx(p, 'NIF') || (isEmit ? tx(emit, 'CNPJ') || tx(emit, 'CPF') : '');
    const addr = [tx(end, 'xLgr'), tx(end, 'nro'), tx(end, 'xCpl'), tx(end, 'xBairro')].filter(Boolean).join(', ');
    const city = cityOf(cMun);
    const uf = ufOf(endNac) || (endNac && tx(endNac, 'UF'));
    return {
      doc: docFmt(docv), im: tx(p, 'IM'), fone: phone(tx(p, 'fone') || (isEmit ? tx(emit, 'fone') : '')), email: tx(p, 'email') || (isEmit ? tx(emit, 'email') : ''),
      nome, addr, mun: city ? `${city}${uf ? ' / ' + uf : ''}` : uf ? `${ibge(cMun)} / ${uf}` : '', ibgeCep: [ibge(cMun), cep(tx(endNac, 'CEP'))].filter(Boolean).join(' / ')
    };
  };
  const P = party(prest, true);
  const T = toma ? party(toma, false) : null;
  const I = interm ? party(interm, false) : null;
  const regTrib = find(prest, 'regTrib');
  const sn = tx(regTrib, 'opSimpNac');
  const regsn = tx(regTrib, 'regApTribSN');
  const cServ = find(serv, 'cServ');
  const locPrest = find(serv, 'locPrest');
  const cLocPrest = tx(locPrest, 'cLocPrestacao');
  const localPrest = cLocPrest ? `${cityOf(cLocPrest) || ibge(cLocPrest)} / ${cLocPrest === tx(emit, 'enderNac/cMun') ? tx(emit, 'enderNac/UF') : tx(inf, 'xLocPrestacao') ? (tx(emit, 'enderNac/UF') || '') : ''} / ${tx(locPrest, 'cPaisPrestacao') || '-'}` : tx(locPrest, 'cPaisPrestacao') || '-';
  const incid = tx(inf, 'cLocIncid');
  const munIncid = incid ? `${tx(inf, 'xLocIncid') || ibge(incid)} / ${incid.slice(0, 2) === tx(emit, 'enderNac/cMun').slice(0, 2) ? tx(emit, 'enderNac/UF') : ''} / -` : '-';
  const piscofins = find(tribFed, 'piscofins');
  const totTrib = find(trib, 'totTrib');
  const vTot = find(totTrib, 'vTotTrib');
  const pTot = find(totTrib, 'pTotTrib');
  const aprox = vTot
    ? `Federais: ${money(tx(vTot, 'vTotTribFed')) || '-'}; Estaduais: ${money(tx(vTot, 'vTotTribEst')) || '-'}; Municipais: ${money(tx(vTot, 'vTotTribMun')) || '-'};`
    : pTot ? `Federais: ${pct(tx(pTot, 'pTotTribFed')) || '-'}; Estaduais: ${pct(tx(pTot, 'pTotTribEst')) || '-'}; Municipais: ${pct(tx(pTot, 'pTotTribMun')) || '-'};`
    : 'Federais: -; Estaduais: -; Municipais: -;';
  const vServ = tx(val, 'vServPrest/vServ');
  const vLiq = tx(valN, 'vLiq') || vServ;
  const vRet = tx(valN, 'vTotalRet');
  const vIbsCbs = tx(ibscbsN, 'vTotNF') ? '' : '';
  const totIbsCbs = tx(ibscbsN, 'totCIBS/vTotNF') ? money(Number(tx(ibscbsN, 'totCIBS/vTotNF')) - Number(vLiq || 0)) : 'R$ 0,00';
  const liqMaisIbs = tx(ibscbsN, 'totCIBS/vTotNF') ? money(tx(ibscbsN, 'totCIBS/vTotNF')) : 'R$ 0,00';
  const g = (ib, path) => tx(ib, path);
  const infCpl = [tx(serv, 'infoCompl/xInfComp'), tx(dps, 'xInfComp')].filter(Boolean).join(' ');
  const qr = chave ? await qrSvg(`https://www.nfse.gov.br/ConsultaPublica/?tpc=1&chave=${chave}`) : '';
  const homolog = tx(dps, 'tpAmb') === '2';

  const cell = (label, value, opts = {}) => `<td${opts.span ? ` colspan="${opts.span}"` : ''}${opts.cls ? ` class="${opts.cls}"` : ''}><div class="l">${label}</div><div class="v">${value === undefined ? '' : value}</div></td>`;
  const sec = (title, cells2, rest = []) => `<table class="g">${[`<tr><td class="t">${title}</td>${cells2}</tr>`, ...rest.map((r) => `<tr>${r}</tr>`)].join('')}</table>`;
  const partyBlock = (title, X) => X ? sec(title, cell('CNPJ / CPF / NIF', dash(X.doc)) + cell('Indicador Municipal (Inscrição)', dash(X.im)) + cell('Telefone', dash(X.fone)), [
    cell('Nome / Nome Empresarial', dash(X.nome), { span: 2 }) + cell('Município / Sigla UF', dash(X.mun)) + cell('Código IBGE / CEP', dash(X.ibgeCep)),
    cell('Endereço', dash(X.addr), { span: 2 }) + cell('E-mail', dash(X.email), { span: 2 })
  ]) : '';

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>DANFSe ${esc(tx(inf, 'nNFSe'))}</title><style>
  @page { size: A4; margin: 7mm 7mm 8mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, "Liberation Sans", sans-serif; color: #000; margin: 0; font-size: 7pt; }
  .frame { border: 1px solid #000; min-height: 281mm; display: flex; flex-direction: column; }
  .head { display: grid; grid-template-columns: 38mm 1fr 52mm; align-items: center; padding: 1.6mm 2mm; border-bottom: 1px solid #000; }
  .head .tt { text-align: center; font-weight: bold; font-size: 10.5pt; line-height: 1.3; }
  .head .mun { font-size: 7.4pt; line-height: 1.35; }
  .head .mun b { font-size: 8pt; }
  table.g { width: 100%; border-collapse: collapse; table-layout: fixed; border-bottom: 1px solid #000; }
  table.g td { width: 25%; vertical-align: top; padding: .55mm 1.6mm .7mm; }
  td.t { font-weight: bold; font-size: 7.6pt; text-transform: uppercase; }
  .l { font-size: 6.2pt; font-weight: bold; line-height: 1.25; }
  .v { font-size: 7.4pt; line-height: 1.25; min-height: 9px; word-break: break-word; }
  .top { display: grid; grid-template-columns: 1fr 46mm; border-bottom: 1px solid #000; }
  .top table.g { border-bottom: 0; }
  .top table.g td { width: 33.3%; }
  .qr { text-align: center; padding: 1.5mm 2mm; font-size: 6.2pt; line-height: 1.3; }
  .qr svg { width: 25mm; height: 25mm; display: block; margin: 0 auto 1mm; }
  .chave .v { font-weight: bold; font-size: 8pt; letter-spacing: .2px; }
  .ni { text-align: center; font-weight: bold; font-size: 6.8pt; padding: .6mm; border-bottom: 1px solid #000; line-height: 1.4; }
  .desc { padding: .5mm 1.6mm 1mm; border-bottom: 1px solid #000; }
  .desc .v { white-space: pre-wrap; }
  .comp { padding: 1mm 1.6mm; min-height: 22mm; border-bottom: 1px solid #000; flex: 1; }
  .comp .v { margin-top: 1.6mm; white-space: pre-wrap; }
  .spacer { height: 100%; }
  .foot td { height: 13mm; }
  .wm { position: fixed; top: 42%; left: 0; right: 0; text-align: center; font-size: 46pt; color: rgba(200,0,0,.16); transform: rotate(-24deg); font-weight: bold; }
</style></head><body>
${homolog ? '<div class="wm">SEM VALOR FISCAL<br><span style="font-size:20pt">Ambiente de homologação</span></div>' : ''}
<div class="frame">
  <div class="head">
    <div>${NFSE_LOGO}</div>
    <div class="tt">DANFSe v2.0<br>Documento Auxiliar da NFS-e</div>
    <div class="mun"><b>Município: ${esc(tx(inf, 'xLocEmi'))}${tx(emit, 'enderNac/UF') ? ' - ' + esc(tx(emit, 'enderNac/UF')) : ''}</b><br>Ambiente Gerador: ${dash(tx(inf, 'ambGer'))}<br>Tipo de Ambiente: ${dash(tx(dps, 'tpAmb'))}</div>
  </div>
  <div class="top">
    <div>
      <table class="g"><tr><td colspan="3" class="chave">${`<div class="l">CHAVE DE ACESSO DA NFS-e</div><div class="v">${esc(chave)}</div>`}</td></tr>
        <tr>${cell('NÚMERO DA NFS-e', dash(tx(inf, 'nNFSe')))}${cell('COMPETÊNCIA DA NFS-e', dash(dt(tx(dps, 'dCompet'), false)))}${cell('DATA E HORA DA EMISSÃO DA NFS-e', dash(dt(tx(inf, 'dhProc'))))}</tr>
        <tr>${cell('NÚMERO DA DPS', dash(tx(dps, 'nDPS')))}${cell('SÉRIE DA DPS', dash(tx(dps, 'serie')))}${cell('DATA E HORA DA EMISSÃO DA DPS', dash(dt(tx(dps, 'dhEmi'))))}</tr>
        <tr>${cell('EMITENTE DA NFS-e', dash(EMITENTE[tx(dps, 'tpEmit')]))}${cell('SITUAÇÃO DA NFS-e', dash(SITUACAO[tx(inf, 'cStat')] || tx(inf, 'cStat')))}${cell('FINALIDADE', dash(g(ibscbs, 'finNFSe') === '0' ? 'NFS-e regular' : g(ibscbs, 'finNFSe')))}</tr>
      </table>
    </div>
    <div class="qr">${qr}A autenticidade desta NFS-e pode ser verificada pela leitura deste código QR ou pela consulta da chave de acesso no portal nacional da NFS-e</div>
  </div>
  ${partyBlock('PRESTADOR / FORNECEDOR', P)}
  <table class="g"><tr>${cell('Simples Nacional na Data de Competência', dash(OP_SN[sn]))}${cell('Regime de Apuração Tributária pelo SN', dash(REG_SN[regsn]), { span: 3 })}</tr></table>
  ${T ? partyBlock('TOMADOR / ADQUIRENTE', T) : '<div class="ni">TOMADOR DA OPERAÇÃO NÃO IDENTIFICADO NA NFS-e</div>'}
  ${ibscbs && find(ibscbs, 'dest') ? partyBlock('DESTINATÁRIO DA OPERAÇÃO', party(find(ibscbs, 'dest'), false)) : ''}
  ${I ? partyBlock('INTERMEDIÁRIO DA OPERAÇÃO', I) : ''}
  ${(!ibscbs || !find(ibscbs, 'dest')) || !I ? `<div class="ni">${!ibscbs || !find(ibscbs, 'dest') ? 'DESTINATÁRIO DA OPERAÇÃO NÃO IDENTIFICADO NA NFS-e<br>' : ''}${!I ? 'INTERMEDIÁRIO DA OPERAÇÃO NÃO IDENTIFICADO NA NFS-e' : ''}</div>` : ''}
  ${sec('SERVIÇO PRESTADO', cell('Código de Tributação Nacional/Municipal', dash([tribNac(tx(cServ, 'cTribNac')), tx(cServ, 'cTribMun')].filter(Boolean).join(' / '))) + cell('Código da NBS', dash(nbs(tx(cServ, 'cNBS')))) + cell('Local da Prestação / Sigla UF / País', dash(localPrest)))}
  <div class="desc"><div class="v">${esc(tx(inf, 'xTribMun') || tx(inf, 'xTribNac'))}</div><div class="l" style="margin-top:.8mm">Descrição do Serviço</div><div class="v">${esc(tx(cServ, 'xDescServ'))}</div></div>
  ${sec('TRIBUTAÇÃO MUNICIPAL (ISSQN)', cell('Tipo de Tributação do ISSQN', dash(TRIB_ISSQN[tx(tribMun, 'tribISSQN')])) + cell('Município / Sigla UF / País de Incidência do ISSQN', dash(munIncid), { span: 2 }), [
    cell('BC ISSQN', dash(money(tx(valN, 'vBC')))) + cell('Alíquota Aplicada', dash(pct(tx(valN, 'pAliqAplic') || tx(tribMun, 'pAliq')))) + cell('Retenção do ISSQN', dash(RET_ISSQN[tx(tribMun, 'tpRetISSQN')])) + cell('ISSQN Apurado', dash(money(tx(valN, 'vISSQN'))))
  ])}
  ${sec('TRIBUTAÇÃO FEDERAL (EXCETO CBS)', cell('IRRF', dash(money(tx(tribFed, 'vRetIRRF')))) + cell('Contribuição Previdenciária - Retida', dash(money(tx(tribFed, 'vRetCP')))) + cell('Contribuições Sociais - Retidas', dash(money(tx(tribFed, 'vRetCSLL')))), [
    cell('PIS - Débito Apuração Própria', dash(money(tx(piscofins, 'vPis')))) + cell('COFINS - Débito Apuração Própria', dash(money(tx(piscofins, 'vCofins')))) + cell('Descrição Contrib. Sociais - Retidas', esc(`${tx(piscofins, 'tpRetPisCofins') || '0'} - ${RET_PISCOFINS[tx(piscofins, 'tpRetPisCofins') || '0'] || ''}`), { span: 2 })
  ])}
  ${sec('TRIBUTAÇÃO IBS/CBS', cell('CST / cClassTrib', esc(`${g(ibscbs, 'valores/trib/gIBSCBS/CST') || g(ibscbs, 'CST') || '-'}/${g(ibscbs, 'cClassTrib') || '-'}`)) + cell('Indicador de Operação / Código IBGE Incidência / Município Incidência / Sigla UF', esc(`${g(ibscbs, 'cIndOp') || '-'}/${g(ibscbsN, 'cLocalidadeIncid') || '-'}/${g(ibscbsN, 'xLocalidadeIncid') || '-'}/${g(ibscbsN, 'UFIncid') || '-'}`), { span: 2 }), [
    cell('Exclusões e Reduções da Base de Cálculo', money(g(ibscbsN, 'valores/vCalcReeRepRes') || '0')) + cell('Base de Cálculo Após Exclusões e Reduções', dash(money(g(ibscbsN, 'valores/vBC')))) + cell('Red. Alíquota IBS / Red. Alíquota CBS', esc(`${pct(g(ibscbsN, 'pRedAliqUF')) || '-'}/${pct(g(ibscbsN, 'pRedAliqMun')) || '-'}/${pct(g(ibscbsN, 'pRedAliqCBS')) || '-'}`)) + cell('Alíquota - IBS UF / IBS Mun', esc(`${pct(g(ibscbsN, 'pIBSUF')) || '-'}/${pct(g(ibscbsN, 'pIBSMun')) || '-'}`)),
    cell('Alíq. Efetiva Municipal - IBS', dash(pct(g(ibscbsN, 'pAliqEfetMun')))) + cell('Valor Apurado Municipal - IBS', dash(money(g(ibscbsN, 'vIBSMun')))) + cell('Alíq. Efetiva Estadual - IBS', dash(pct(g(ibscbsN, 'pAliqEfetUF')))) + cell('Valor Apurado Estadual - IBS', dash(money(g(ibscbsN, 'vIBSUF')))),
    cell('Valor Total Apurado - IBS', dash(money(g(ibscbsN, 'vIBSTot')))) + cell('Alíquota - CBS', dash(pct(g(ibscbsN, 'pCBS')))) + cell('Alíquota Efetiva - CBS', dash(pct(g(ibscbsN, 'pAliqEfetCBS')))) + cell('Valor Total Apurado - CBS', dash(money(g(ibscbsN, 'vCBS'))))
  ])}
  ${sec('VALOR TOTAL DA NFS-e', cell('VALOR DA OPERAÇÃO / SERVIÇO', dash(money(vServ))) + cell('Desconto Incondicionado', dash(money(tx(val, 'vDescCondIncond/vDescIncond')))) + cell('Desconto Condicionado', dash(money(tx(val, 'vDescCondIncond/vDescCond')))), [
    cell('Total das Retenções (ISSQN / Federais)', dash(money(vRet))) + cell('VALOR LÍQUIDO DA NFS-e', `<b>${dash(money(vLiq))}</b>`) + cell('Total do IBS/CBS', totIbsCbs) + cell('VALOR LÍQUIDO DA NFS-e + IBS/CBS', `<b>${liqMaisIbs}</b>`)
  ])}
  <div class="comp"><div class="l" style="font-size:7.6pt">INFORMAÇÕES COMPLEMENTARES</div><div class="v">${infCpl ? esc(infCpl) + '\n' : ''}Totais aproximados dos Tributos cfe. Lei n° 12.741/2012: ${esc(aprox)}</div></div>
  <table class="g foot" style="border-bottom:0"><tr>${cell('DATA CIENTIFICAÇÃO:', '')}${cell('IDENTIFICAÇÃO E ASSINATURA', '')}${cell('N° NFS-e / CHAVE NFS-e', `${esc(tx(inf, 'nNFSe'))} / ${esc(chave)}`, { span: 2 })}</tr></table>
</div>
</body></html>`;
}

/* ------------------------------------------------------------------ */
/* CF-e SAT — Extrato (bobina 80 mm)                                    */
/* ------------------------------------------------------------------ */

const PAG = { '01': 'Dinheiro', '02': 'Cheque', '03': 'Cartão de Crédito', '04': 'Cartão de Débito', '05': 'Crédito Loja', '10': 'Vale Alimentação', '11': 'Vale Refeição', '12': 'Vale Presente', '13': 'Vale Combustível', '15': 'Boleto Bancário', '16': 'Depósito Bancário', '17': 'PIX', '18': 'Transferência', '19': 'Programa de Fidelidade', '90': 'Sem pagamento', '99': 'Outros' };

async function code128Svg(value) {
  const bwip = require('bwip-js');
  return bwip.toSVG({ bcid: 'code128', text: value, scale: 1, height: 9, includetext: false });
}

async function extratoCfe(root) {
  const inf = find(root, 'infCFe');
  const ide = find(inf, 'ide');
  const emit = find(inf, 'emit');
  const dest = find(inf, 'dest');
  const tot = find(inf, 'total');
  const pgto = find(inf, 'pgto');
  const chave = (inf.getAttribute('Id') || '').replace(/^CFe/, '');
  const dets = kids(inf).filter((k) => local(k) === 'det');
  const ender = find(emit, 'enderEmit');
  const dEmi = tx(ide, 'dEmi'), hEmi = tx(ide, 'hEmi');
  const dataHora = dEmi ? `${dEmi.slice(6, 8)}/${dEmi.slice(4, 6)}/${dEmi.slice(0, 4)} ${hEmi.slice(0, 2)}:${hEmi.slice(2, 4)}:${hEmi.slice(4, 6)}` : '';
  const vCFe = tx(tot, 'vCFe');
  const destDoc = tx(dest, 'CNPJ') || tx(dest, 'CPF');
  const qrText = [chave, dEmi + hEmi, vCFe, destDoc, tx(ide, 'assinaturaQRCODE')].join('|');
  const bc1 = chave ? await code128Svg(chave.slice(0, 22)) : '';
  const bc2 = chave ? await code128Svg(chave.slice(22)) : '';
  const qr = chave ? await qrSvg(qrText) : '';
  const homolog = tx(ide, 'tpAmb') === '2';
  const items = dets.map((d) => {
    const p = find(d, 'prod');
    return `<div class="it"><div>${esc(d.getAttribute('nItem') || '')} ${esc(tx(p, 'cProd'))} ${esc(tx(p, 'xProd'))}</div><div class="ln"><span>${num(tx(p, 'qCom'), 3)} ${esc(tx(p, 'uCom'))} x ${num(tx(p, 'vUnCom'))}${tx(find(d, 'imposto'), 'vItem12741') ? ` (${num(tx(find(d, 'imposto'), 'vItem12741'))})` : ''}</span><span>${num(tx(p, 'vProd'))}</span></div>${Number(tx(p, 'vDesc')) ? `<div class="ln"><span>desconto sobre item</span><span>-${num(tx(p, 'vDesc'))}</span></div>` : ''}</div>`;
  }).join('');
  const pays = kids(pgto).filter((k) => local(k) === 'MP').map((m) => `<div class="ln"><span>${esc(PAG[tx(m, 'cMP')] || 'Outros')}</span><span>${num(tx(m, 'vMP'))}</span></div>`).join('');
  const height = Math.ceil(200 + dets.length * 10 + (tx(find(inf, 'infAdic'), 'infCpl').length / 9));
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Extrato CF-e SAT</title><style>
    @page { size: 80mm ${height}mm; margin: 3mm 3.5mm; }
    body { font-family: "Courier New", "Liberation Mono", monospace; font-size: 7.4pt; color: #000; margin: 0; line-height: 1.32; }
    .c { text-align: center; } .b { font-weight: bold; }
    hr { border: 0; border-top: 1px dashed #000; margin: 4px 0; }
    .ln { display: flex; justify-content: space-between; gap: 6px; }
    .it { margin: 2px 0; }
    .big { font-size: 9pt; font-weight: bold; }
    .bc svg { width: 100%; height: 9mm; display: block; margin: 2px 0; }
    .qr svg { width: 30mm; height: 30mm; }
    .wm { color: #c00; font-weight: bold; text-align: center; }
  </style></head><body>
  <div class="c b">${esc(tx(emit, 'xFant') || tx(emit, 'xNome'))}</div>
  <div class="c">${esc(tx(emit, 'xNome'))}</div>
  <div class="c">${esc([tx(ender, 'xLgr'), tx(ender, 'nro'), tx(ender, 'xCpl'), tx(ender, 'xBairro'), tx(ender, 'xMun'), cep(tx(ender, 'CEP')).replace(/\./, '')].filter(Boolean).join(', '))}</div>
  <div class="c">CNPJ ${esc(docFmt(tx(emit, 'CNPJ')))} IE ${esc(tx(emit, 'IE'))}${tx(emit, 'IM') ? ' IM ' + esc(tx(emit, 'IM')) : ''}</div>
  <hr><div class="c b">Extrato No. ${esc(tx(ide, 'nCFe'))}<br>CUPOM FISCAL ELETRÔNICO - SAT</div>
  ${homolog ? '<div class="wm">= TESTE =<br>&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;</div>' : ''}
  <hr><div>CPF/CNPJ do Consumidor: ${destDoc ? esc(docFmt(destDoc)) : '-'}${tx(dest, 'xNome') ? '<br>Razão Social/Nome: ' + esc(tx(dest, 'xNome')) : ''}</div>
  <hr><div class="ln b"><span># | COD | DESC | QTD | UN | VL UN R$ | (VL TR R$)*</span><span>VL ITEM R$</span></div>${items}
  <hr>
  ${Number(tx(tot, 'ICMSTot/vDesc')) ? `<div class="ln"><span>Total bruto de itens</span><span>${num(tx(tot, 'ICMSTot/vProd'))}</span></div><div class="ln"><span>Total de descontos</span><span>-${num(tx(tot, 'ICMSTot/vDesc'))}</span></div>` : ''}
  <div class="ln big"><span>TOTAL R$</span><span>${num(vCFe)}</span></div>
  ${pays}${Number(tx(pgto, 'vTroco')) ? `<div class="ln"><span>Troco R$</span><span>${num(tx(pgto, 'vTroco'))}</span></div>` : ''}
  <hr><div>OBSERVAÇÕES DO CONTRIBUINTE</div><div>${esc(tx(find(inf, 'infAdic'), 'infCpl'))}</div>
  ${tx(tot, 'vCFeLei12741') ? `<div>*Valor aproximado dos tributos do item<br>Valor aproximado dos tributos deste cupom R$ ${num(tx(tot, 'vCFeLei12741'))} (conforme Lei Fed. 12.741/2012)</div>` : ''}
  <hr><div class="c b">SAT No. ${esc(tx(ide, 'nserieSAT'))}<br>${esc(dataHora)}</div>
  <div class="c" style="font-size:6.8pt;letter-spacing:.3px">${esc(chave.replace(/(\d{4})(?=\d)/g, '$1 '))}</div>
  <div class="bc">${bc1}${bc2}</div>
  <div class="c qr">${qr}</div>
  <div class="c" style="font-size:6.6pt">Consulte o QR Code pelo aplicativo "De olho na nota",<br>disponível na AppStore (Apple) e PlayStore (Android)</div>
  </body></html>`;
  return { html, height };
}

/* ------------------------------------------------------------------ */
/* DANFE NFC-e (modelo 65) — cupom térmico 80 mm (Manual do DANFE NFC-e) */
/* ------------------------------------------------------------------ */

async function danfeNfce(root) {
  const inf = find(root, 'infNFe');
  const ide = find(inf, 'ide');
  const emit = find(inf, 'emit');
  const dest = find(inf, 'dest');
  const ender = find(emit, 'enderEmit');
  const icms = find(inf, 'total/ICMSTot');
  const pag = find(inf, 'pag');
  const prot = find(root, 'infProt');
  const supl = find(root, 'infNFeSupl');
  const chave = (inf.getAttribute('Id') || '').replace(/^NFe/, '') || tx(prot, 'chNFe');
  const dets = kids(inf).filter((k) => local(k) === 'det');
  const qrText = tx(supl, 'qrCode');
  const urlChave = tx(supl, 'urlChave');
  const homolog = tx(ide, 'tpAmb') === '2';
  const conting = tx(ide, 'tpEmis') === '9';
  const pad = (n, w) => String(n).padStart(w, '0');
  const items = dets.map((d) => {
    const p = find(d, 'prod');
    const desc = Number(tx(p, 'vDesc'));
    return `<div class="it"><div>${pad(d.getAttribute('nItem') || '', 3)} ${esc(tx(p, 'cProd'))} ${esc(tx(p, 'xProd'))}</div><div class="ln"><span>${num(tx(p, 'qCom'), Number(tx(p, 'qCom')) % 1 ? 3 : 0)} ${esc(tx(p, 'uCom'))} X ${num(tx(p, 'vUnCom'), Number(tx(p, 'vUnCom')) * 100 % 1 ? 3 : 2)}</span><span>${num(tx(p, 'vProd'))}</span></div>${desc ? `<div class="ln"><span>desconto</span><span>-${num(desc)}</span></div>` : ''}</div>`;
  }).join('');
  const pays = kids(pag).filter((k) => local(k) === 'detPag').map((m) => `<div class="ln"><span>${esc(PAG[tx(m, 'tPag')] || tx(m, 'xPag') || 'Outros')}</span><span>${num(tx(m, 'vPag'))}</span></div>`).join('');
  const destDoc = tx(dest, 'CNPJ') || tx(dest, 'CPF') || tx(dest, 'idEstrangeiro');
  const destEnd = find(dest, 'enderDest');
  const vDesc = Number(tx(icms, 'vDesc'));
  const vAcresc = Number(tx(icms, 'vOutro') || 0) + Number(tx(icms, 'vFrete') || 0) + Number(tx(icms, 'vSeg') || 0);
  const infCpl = tx(find(inf, 'infAdic'), 'infCpl');
  const infFisco = tx(find(inf, 'infAdic'), 'infAdFisco');
  const qr = qrText ? await qrSvg(qrText) : '';
  const height = Math.ceil(150 + dets.length * 7.4 + (infCpl.length + infFisco.length) / 9 + (destEnd ? 8 : 0));
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>DANFE NFC-e ${esc(tx(ide, 'nNF'))}</title><style>
    @page { size: 80mm ${height}mm; margin: 3mm 3mm 4mm; }
    body { font-family: "Courier New", "Liberation Mono", "DejaVu Sans Mono", monospace; font-size: 7.3pt; color: #000; margin: 0; line-height: 1.3; }
    .c { text-align: center; } .b { font-weight: bold; }
    hr { border: 0; border-top: 1px dashed #000; margin: 3px 0; }
    .ln { display: flex; justify-content: space-between; gap: 6px; }
    .ln span:last-child { text-align: right; white-space: nowrap; }
    .it { margin: 1.5px 0; }
    .head { display: flex; justify-content: space-between; font-weight: bold; font-size: 6.6pt; }
    .big { font-weight: bold; font-size: 8.4pt; }
    .qr svg { width: 31mm; height: 31mm; display: block; margin: 3px auto; }
    .key { letter-spacing: .4px; }
    .warn { font-weight: bold; text-align: center; }
  </style></head><body>
  <div class="c"><span class="b">CNPJ: ${esc(docFmt(tx(emit, 'CNPJ') || tx(emit, 'CPF')))} ${esc(tx(emit, 'xNome'))}</span></div>
  <div class="c">${esc([tx(ender, 'xLgr'), tx(ender, 'nro'), tx(ender, 'xCpl'), tx(ender, 'xBairro'), tx(ender, 'xMun'), tx(ender, 'UF'), cep(tx(ender, 'CEP')).replace('.', '')].filter(Boolean).join(', '))}</div>
  <div class="c">${tx(ender, 'fone') ? 'Fone: ' + esc(phone(tx(ender, 'fone'))) + ' ' : ''}I.E.: ${esc(tx(emit, 'IE'))}</div>
  <div class="c b" style="margin-top:2px">Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica</div>
  ${conting ? '<div class="warn">EMITIDA EM CONTINGÊNCIA<br>Pendente de autorização</div>' : ''}
  ${homolog ? '<div class="warn">EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL</div>' : ''}
  <hr><div class="head"><span># Código Descrição Qtde Un Valor unit.</span><span>Valor total</span></div>${items}
  <hr>
  <div class="ln"><span>Qtde. total de itens</span><span>${dets.length}</span></div>
  <div class="ln"><span>Valor total R$</span><span>${num(tx(icms, 'vProd'))}</span></div>
  ${vDesc ? `<div class="ln"><span>Desconto R$</span><span>-${num(vDesc)}</span></div>` : ''}
  ${vAcresc ? `<div class="ln"><span>Acréscimos R$</span><span>${num(vAcresc)}</span></div>` : ''}
  <div class="ln big"><span>Valor a Pagar R$</span><span>${num(tx(icms, 'vNF'))}</span></div>
  <div class="ln b"><span>FORMA DE PAGAMENTO</span><span>VALOR PAGO R$</span></div>${pays}
  ${Number(tx(pag, 'vTroco')) ? `<div class="ln"><span>Troco R$</span><span>${num(tx(pag, 'vTroco'))}</span></div>` : ''}
  <hr><div class="c b">Consulta pela Chave de Acesso em</div><div class="c">${esc(urlChave)}</div><div class="c key">${esc(chave.replace(/(\d{4})(?=\d)/g, '$1 '))}</div>
  <hr><div class="c b">${destDoc ? `CONSUMIDOR - ${tx(dest, 'CNPJ') ? 'CNPJ' : tx(dest, 'CPF') ? 'CPF' : 'Id. Estrangeiro'} ${esc(docFmt(destDoc))}` : 'CONSUMIDOR NÃO IDENTIFICADO'}</div>
  ${tx(dest, 'xNome') ? `<div class="c">${esc(tx(dest, 'xNome'))}</div>` : ''}
  ${destEnd ? `<div class="c">${esc([tx(destEnd, 'xLgr'), tx(destEnd, 'nro'), tx(destEnd, 'xBairro'), tx(destEnd, 'xMun'), tx(destEnd, 'UF')].filter(Boolean).join(', '))}</div>` : ''}
  <hr><div class="c b">NFC-e nº ${esc(pad(tx(ide, 'nNF'), 9))} Série ${esc(pad(tx(ide, 'serie'), 3))} ${esc(dt(tx(ide, 'dhEmi')))}</div>
  ${prot ? `<div class="c b">Protocolo de Autorização: ${esc(tx(prot, 'nProt'))}</div><div class="c b">Data de Autorização: ${esc(dt(tx(prot, 'dhRecbto')))}</div>` : ''}
  <div class="qr">${qr}</div>
  ${tx(icms, 'vTotTrib') ? `<div class="c">Tributos Totais Incidentes (Lei Federal 12.741/2012): R$ ${num(tx(icms, 'vTotTrib'))}</div>` : ''}
  ${infCpl ? `<div class="c" style="margin-top:2px">${esc(infCpl)}</div>` : ''}
  ${infFisco ? `<div class="c" style="margin-top:2px">${esc(infFisco)}</div>` : ''}
  </body></html>`;
  return { html, height };
}

/** Tipo do documento fiscal do XML. */
function kindOf(root) {
  const name = local(root);
  if (name === 'CFe' || find(root, 'infCFe')) return 'cfe';
  if (find(root, 'infNFSe') && find(root, 'infDPS')) return 'nfse-nacional';
  if (find(root, 'infNFe') && tx(root, 'infNFe/ide/mod') === '65') return 'nfce';
  return null;
}

function parse(bytes) {
  let text = Buffer.from(bytes).toString('utf8');
  const enc = (text.slice(0, 200).match(/encoding=["']([^"']+)/i) || [])[1];
  if (enc && /8859|latin|1252/i.test(enc)) text = Buffer.from(bytes).toString('latin1');
  return new DOMParser().parseFromString(text.replace(/^﻿/, ''), 'text/xml').documentElement;
}

module.exports = { danfseV2, extratoCfe, danfeNfce, kindOf, parse };
