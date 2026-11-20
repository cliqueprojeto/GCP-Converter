# Histórico de versões

Todas as mudanças relevantes do GCP Converter são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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
