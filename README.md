# SMS Resistências · Central do Cliente (Molla)

Portal estático com tela de acesso e a Central do Cliente, onde ficam todos os materiais em HTML do atendimento, organizados em quatro categorias: **Planejamento**, **Conteúdos**, **Reports** e **Análises e estudos**.

Endereço: https://central-molla-sms-resistencias.vercel.app/

## Estrutura
- `index.html` — tela de login (nome livre + senha). Depois do login, abre a Central.
- `central.html` — página inicial da Central, com as categorias, os materiais e o contato da Molla.
- `materiais/` — um arquivo HTML por material. Só abrem após o login.
  - `pauta-reuniao-alinhamento-julho-2026.html` — Pauta da reunião de alinhamento de julho (Planejamento)
  - `otimizacoes-demandas-status-28-07-2026.html` — Otimizações e Demandas · Status (Reports)
  - `atualizacao-conta-julho-2026.html` — Atualização da Conta · Julho 2026 (Reports)
  - `atualizacao-conta-junho-2026.html` — Atualização da Conta · Junho 2026 (Reports)
  - `performance-google-ads-jan-jul-2026.html` — Performance do Semestre · Jan a Jul 2026 (Análises e estudos)
  - As duas planilhas de Planejamento são links do Google Sheets e abrem em nova aba.
- `assets/materiais.js` — **lista de materiais exibidos na Central** (é o único arquivo a editar para publicar um material novo).
- `assets/guarda.js` — acesso restrito e barra "‹ Central · Exportar PDF · Sair" dentro dos materiais.
- `assets/` — logos Molla (laranja e branca), logos SMS (SVG colorido e branco) e ícones.
- `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest` — ícone da SMS na aba do navegador e na tela do celular.
- `vercel.json` — noindex e cabeçalhos. Sem `cleanUrls` (padrão da conta SMS).

## Publicar
1. No GitHub, envie todo o conteúdo desta pasta para a **raiz** do repositório (mantendo as pastas `assets/` e `materiais/`). O `index.html` não pode ficar dentro de subpasta.
2. No Vercel, importe o repositório (Framework Preset: **Other**, Build Command e Output Directory em branco). Nome do projeto: `central-molla-sms-resistencias`. Cada novo envio ao GitHub publica sozinho.

## Publicar um material novo
1. Salve o HTML dentro de `materiais/` (ex.: `materiais/report-outubro-2026.html`).
2. No HTML, logo depois de `<meta charset="UTF-8">`, cole:
   `<script src="../assets/guarda.js"></script>`
3. Em `assets/materiais.js`, acrescente um bloco em `MATERIAIS` com título, resumo, categoria (`planejamento`, `conteudos`, `reports` ou `analises`), arquivo e data.
4. Envie os dois arquivos ao GitHub.

## Acesso
Qualquer nome é aceito no campo "Seu nome"; só a senha é verificada, sem diferenciar maiúsculas e minúsculas.
Senha vigente: enviada ao cliente separada do guia de acesso.

## Trocar a senha
Gere o SHA-256 da nova senha **em minúsculas** e substitua o valor de `HASH` no `index.html`.
Ex.: `echo -n "novasenha" | shasum -a 256`

Observação: a restrição é feita no navegador (sessionStorage). Serve para organizar e restringir o acesso casual ao link, não substitui autenticação de servidor.

---
© 2026 Agência Molla
