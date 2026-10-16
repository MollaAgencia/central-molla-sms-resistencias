/* =====================================================================
   Central do Cliente · SMS Resistências · Agência Molla
   LISTA DE MATERIAIS — é o único arquivo a editar para publicar um material novo.

   Cada material:
     titulo      Nome do material no card
     resumo      Uma ou duas frases sobre o conteúdo
     categoria   planejamento | trimestral | reports | analises
     arquivo     Caminho do HTML (ex.: 'materiais/report-agosto-2026.html')
                 ou link externo completo (https://...), que abre em nova aba
     data        AAAA-MM-DD (ordena do mais recente para o mais antigo)
     dataTexto   Data como aparece no card
     detalhes    Etiquetas extras (opcional)
   ===================================================================== */

window.CATEGORIAS = [
  {
    id: 'planejamento',
    nome: 'Planejamento',
    descricao: 'Estrutura das campanhas, palavras-chave e pautas de alinhamento.',
    icone: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6'
  },
  {
    id: 'trimestral',
    nome: 'Reports Trimestral',
    descricao: 'Balanço de cada trimestre: evolução, campanhas e prioridades.',
    icone: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18M8 14h3M8 18h8'
  },
  {
    id: 'reports',
    nome: 'Report Mensal',
    descricao: 'O mês a mês da conta, as atualizações e o andamento das entregas.',
    icone: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
  },
  {
    id: 'analises',
    nome: 'Análises e estudos',
    descricao: 'Performance, presença na busca e leitura de mercado.',
    icone: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35'
  }
];

window.MATERIAIS = [
  /* ---------- Planejamento ---------- */
  {
    titulo: 'Estrutura e Planejamento das Campanhas',
    resumo: 'Como as campanhas de Google Ads estão organizadas: divisão por linha de produto, palavras-chave e orçamento de cada frente.',
    categoria: 'planejamento',
    arquivo: 'https://docs.google.com/spreadsheets/d/1nKGXExFA1pgm-tjuR2vLRuyKhiwG2CNZqmPkWT2C9xo/edit?usp=drive_link',
    data: '2026-03-01',
    dataTexto: 'Planilha online',
    detalhes: ['Google Ads']
  },
  {
    titulo: 'Revisão de Palavras-chave e Termos de Pesquisa',
    resumo: 'Levantamento das buscas que as campanhas captaram, separando o que traz cliente do que é desperdício de verba.',
    categoria: 'planejamento',
    arquivo: 'https://docs.google.com/spreadsheets/d/1LkZoQbRnqU8UV62rM9WOMEow3W5KfQ4o04w9qZOIKQs/edit?usp=drive_link',
    data: '2026-03-31',
    dataTexto: 'Março 2026',
    detalhes: ['Planilha online']
  },
  {
    titulo: 'Pauta da Reunião de Alinhamento · Julho',
    resumo: 'Os pontos tratados na reunião de julho: investimento do mês, campanhas antigas e novas, site, organização dos termos de busca e a performance dos últimos 12 meses.',
    categoria: 'planejamento',
    arquivo: 'materiais/pauta-reuniao-alinhamento-julho-2026.html',
    data: '2026-07-01',
    dataTexto: '1º de julho de 2026',
    detalhes: ['Interativo']
  },

  /* ---------- Reports (mensais e trimestrais) ---------- */
  {
    titulo: 'Report Trimestral · 3º trimestre 2026',
    resumo: 'Julho a setembro: o primeiro trimestre inteiro com a estrutura nova e a comparação com o mesmo período de 2025.',
    categoria: 'trimestral',
    arquivo: 'materiais/report-trimestral-t3-2026.html',
    data: '2026-10-01',
    dataTexto: '3º trimestre 2026',
    detalhes: ['Trimestral', 'Interativo']
  },
  {
    titulo: 'Report Trimestral · 2º trimestre 2026',
    resumo: 'Abril a junho: nove campanhas novas, mais visitas e cada visita mais barata.',
    categoria: 'trimestral',
    arquivo: 'materiais/report-trimestral-t2-2026.html',
    data: '2026-07-01',
    dataTexto: '2º trimestre 2026',
    detalhes: ['Trimestral', 'Interativo']
  },
  {
    titulo: 'Report Trimestral · 1º trimestre 2026',
    resumo: 'Janeiro a março: a virada de gestão e o salto de qualidade do clique em março.',
    categoria: 'trimestral',
    arquivo: 'materiais/report-trimestral-t1-2026.html',
    data: '2026-04-01',
    dataTexto: '1º trimestre 2026',
    detalhes: ['Trimestral', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Outubro 2026 · parcial até 14/10',
    resumo: 'Negativações validadas com a SMS no ar, custo por clique de volta ao menor patamar do ano e a leitura de leilão palavra por palavra.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-outubro-2026.html',
    data: '2026-10-14',
    dataTexto: 'Outubro 2026 · parcial até 14/10',
    detalhes: ['Mensal', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Setembro 2026',
    resumo: 'A SMS mais vezes no topo e em primeiro lugar, com o levantamento completo dos termos de pesquisa.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-setembro-2026.html',
    data: '2026-09-30',
    dataTexto: 'Setembro 2026',
    detalhes: ['Mensal', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Agosto 2026',
    resumo: 'A estrutura completa no ar e a comparação direta com agosto de 2025.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-agosto-2026.html',
    data: '2026-08-31',
    dataTexto: 'Agosto 2026',
    detalhes: ['Mensal', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Julho 2026',
    resumo: 'Volume acima do recorde de junho, 524 termos organizados e o plano de 29 ações.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-julho-2026.html',
    data: '2026-07-31',
    dataTexto: 'Julho 2026',
    detalhes: ['Mensal', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Junho 2026',
    resumo: 'O recorde da conta: maior volume de cliques e maior taxa de clique da série, com quatro campanhas novas no ar.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-junho-2026.html',
    data: '2026-06-30',
    dataTexto: 'Junho 2026',
    detalhes: ['Mensal', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Maio 2026',
    resumo: 'Volume e eficiência melhorando juntos, com a estreia de Tubulares e Cartucho no clique mais barato da conta.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-maio-2026.html',
    data: '2026-05-31',
    dataTexto: 'Maio 2026',
    detalhes: ['Mensal', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Abril 2026',
    resumo: 'A estrutura nova entra no ar: mesmo volume de visitas de março, com custo por clique bem menor.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-abril-2026.html',
    data: '2026-04-30',
    dataTexto: 'Abril 2026',
    detalhes: ['Mensal', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Março 2026',
    resumo: 'Primeiro mês da gestão Molla: taxa de clique recorde e a SMS mais vezes em primeiro lugar, com a exposição irrelevante cortada.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-marco-2026.html',
    data: '2026-03-31',
    dataTexto: 'Março 2026',
    detalhes: ['Mensal', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Fevereiro 2026',
    resumo: 'Último mês da estrutura original: mais relevância e mais posição, com o custo por visita em alta. O diagnóstico que levou à mudança.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-fevereiro-2026.html',
    data: '2026-02-28',
    dataTexto: 'Fevereiro 2026',
    detalhes: ['Mensal', 'Interativo']
  },
  {
    titulo: 'Report Mensal · Janeiro 2026',
    resumo: 'O ponto de partida: a conta antes da reestruturação, com a taxa de clique já subindo. É a régua para os meses seguintes.',
    categoria: 'reports',
    arquivo: 'materiais/report-mensal-janeiro-2026.html',
    data: '2026-01-31',
    dataTexto: 'Janeiro 2026',
    detalhes: ['Mensal', 'Interativo']
  },

  /* ---------- Reports ---------- */
  {
    titulo: 'Otimizações e Demandas · Status',
    resumo: 'As 29 ações do plano em cinco entregas, o cronograma até os eventos de setembro e o material das sete campanhas novas, item por item.',
    categoria: 'reports',
    arquivo: 'materiais/otimizacoes-demandas-status-28-07-2026.html',
    data: '2026-07-28',
    dataTexto: '28 de julho de 2026',
    detalhes: ['Interativo']
  },
  {
    titulo: 'Atualização da Conta · Julho 2026',
    resumo: 'Alinhamento da conta: investimento confirmado, organização de 524 termos de busca e a fotografia dos últimos 12 meses.',
    categoria: 'reports',
    arquivo: 'materiais/atualizacao-conta-julho-2026.html',
    data: '2026-07-01',
    dataTexto: '1º de julho de 2026',
    detalhes: ['Google Ads']
  },
  {
    titulo: 'Atualização da Conta · Junho 2026',
    resumo: 'O que entrou no ar nas campanhas, os bloqueios de buscas aplicados e os pontos que ficaram aguardando confirmação.',
    categoria: 'reports',
    arquivo: 'materiais/atualizacao-conta-junho-2026.html',
    data: '2026-06-15',
    dataTexto: '15 de junho de 2026',
    detalhes: ['Google Ads']
  },

  /* ---------- Análises e estudos ---------- */
  {
    titulo: 'Performance do Semestre · Jan a Jul 2026',
    resumo: 'Balanço do primeiro semestre e parcial de julho: evolução de custo por visita, volume, presença na busca e as prioridades dos próximos 60 dias.',
    categoria: 'analises',
    arquivo: 'materiais/performance-google-ads-jan-jul-2026.html',
    data: '2026-07-20',
    dataTexto: '1 jan a 20 jul de 2026',
    detalhes: ['Google Ads', 'Interativo']
  }
];
