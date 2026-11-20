# Histórico de versões

Todas as mudanças relevantes do GCP Converter são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-11-20

### Novidades
- **Conversão de documentos 100% embutida**: não é mais preciso instalar LibreOffice nem Calibre.
  - Usa o **mesmo motor do GCP-PDF**, com a mesma ordem de prioridade: Microsoft Office (Windows, se instalado) → LibreOffice (se instalado) → motor interno. Word e Excel saem com o layout de página fiel, e PDF → DOCX/PPTX/XLSX/EPUB preserva o layout.
  - Novos leitores próprios para **ODT, ODS, ODP, PPTX e RTF**, que preservam títulos, listas, tabelas, imagens, cores, mesclagens, formatos de moeda, porcentagem e data, tamanhos do slide mestre e formas.
  - Novos geradores de **ODT, ODS, ODP, RTF, CSV, PPTX, MOBI e FB2**.
  - **E-books**: leitura de MOBI, AZW, AZW3, FB2, CBZ, CBR e CB7, e geração de **MOBI (Kindle)** e **FB2** sem Calibre. O MOBI foi validado com o KindleUnpack.
- **PDF → imagens**: a ferramenta Imagem converte cada página do PDF em JPG, PNG, WEBP e outros formatos.
- **Nova ferramenta "Notas fiscais"** (XML → PDF no leiaute oficial, em lote e com opção de unir tudo em um PDF):
  - **DANFSe v2.0** (NFS-e padrão nacional), reproduzindo o leiaute do Portal Nacional: chave de acesso, QR Code de autenticidade, prestador, tomador, intermediário, serviço (códigos de tributação nacional e NBS), ISSQN, tributação federal, IBS/CBS, totais e rodapé de certificação.
  - **DANFE NFC-e** (modelo 65) em bobina de 80 mm, no padrão do cupom térmico: itens, totais, forma de pagamento, chave de acesso, consumidor, protocolo, QR Code, tributos da Lei 12.741 e avisos de contingência e homologação.
  - **Extrato do CF-e SAT** (cupom fiscal eletrônico) com código de barras da chave e QR Code.
  - **DANFE** (NF-e), NFS-e ABRASF e CT-e com o motor do GCP-PDF.
- **Nome dos arquivos**: o nome original é preservado e recebe `_Convertido`, `_Compactado` ou `_Unido` no final, no idioma do aplicativo (`_Converted`/`_Compressed` em inglês e `_Convertido`/`_Comprimido` em espanhol). Arquivos já convertidos não recebem o sufixo de novo.

### Alterações
- LibreOffice, Calibre e Ghostscript passam a ser **opcionais**. Pandoc e Poppler não são mais usados.
- Calibre só é necessário para gerar AZW3 e para formatos raros (KFX, LIT, LRF, PDB, DjVu).

## [1.0.1] - 2026-11-20

### Corrigido
- **Arch / BigLinux / Manjaro**: o pacote `.pkg.tar.zst` não instalava com dois cliques. Ele pedia dependências que não existem mais nos repositórios oficiais (`http-parser` e `libappindicator-gtk3`) e tinha a descrição em duas linhas, fora do padrão do pacman. Agora usa só dependências oficiais (`gtk3`, `nss`, `alsa-lib`, `libxss`, `libxtst`, `libnotify`, `mesa`, `at-spi2-core`, `xdg-utils`) e foi validado com o próprio pacman.
- Removidas dependências desnecessárias do pacote Arch (`ffmpeg`, `libvpx` e outras): o GCP Converter já traz o próprio FFmpeg.

## [1.0.0] - 2026-11-20

Primeira versão pública do **GCP Converter**, o conversor universal da série GCP.

### Conversão
- **Vídeo**: MP4, MKV, WEBM, MOV, AVI, WMV, M4V, FLV, MPEG, 3GP, GIF e WEBP animado, com codecs H.264, H.265/HEVC, VP9 e AV1.
- **Áudio**: MP3, M4A/AAC, OGG, OPUS, FLAC, WAV, AIFF, ALAC, WMA, AC3 e AMR. Também extrai o áudio de vídeos.
- **Imagem**: JPG, PNG, WEBP, AVIF, GIF, BMP, TIFF, ICO e PDF, incluindo entrada SVG.
- **Documentos**: PDF, DOCX, ODT, RTF, TXT, HTML, Markdown, planilhas (XLSX, ODS, CSV) e apresentações (PPTX, ODP).
- **E-books**: EPUB, MOBI, AZW3 (Kindle), FB2, PDF, DOCX, TXT e HTML.
- União de vários arquivos em um único PDF.

### Compactação
- Compactação inteligente de vídeos, áudios, imagens e PDFs em 4 níveis: leve, recomendado, máximo e tamanho exato (MB).
- Criação de arquivos ZIP com vários arquivos.
- Mantém o original quando a versão compactada não fica menor.

### Lote e fila
- Conversão em lote com execução paralela configurável (1 a 8 tarefas).
- Fila com progresso em tempo real, velocidade, cancelamento, nova tentativa e economia de espaço.
- Arrastar e soltar arquivos e pastas inteiras, com detecção automática do tipo.
- Padrões de nome com `{name}`, `{target}`, `{ext}`, `{date}`, `{time}` e `{index}`.
- Histórico de conversões e estatísticas.

### Predefinições
- Vídeo: YouTube, Instagram Reels, TikTok/Shorts, WhatsApp, e-mail, 4K e Web.
- Áudio: podcast, música 320k, audiófilo, WhatsApp, toque de celular e estúdio.
- Imagem: web, redes sociais, miniatura, impressão, ícone e ultra leve.

### Interface
- Visual premium da série GCP, com temas escuro, claro ou do sistema.
- Ícone em duas variantes (gradiente e claro).
- Português, inglês e espanhol, com detecção automática do idioma do sistema.
- Botão "Apoie o projeto" com PIX (QR Code) e Stripe.

### Atualizações
- Verificação de novas versões nas Releases do GitHub: sempre ao abrir, diariamente, semanalmente, a cada duas semanas, mensalmente ou nunca.
- Instalação automática do pacote certo para cada sistema: `.exe`, `.dmg` (Intel e Apple Silicon), `.deb`, `.rpm`, `.pkg.tar.zst` e AppImage.

### Plataformas
- Linux: `.deb` (Debian, Ubuntu, Mint), `.rpm` (Fedora, openSUSE), `.pkg.tar.zst` (Arch, BigLinux, Manjaro) e AppImage.
- Windows 10/11 (instalador x64).
- macOS Apple Silicon (M1 ou superior) e Intel.
