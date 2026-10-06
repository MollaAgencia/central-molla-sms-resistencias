/* =====================================================================
   Central do Cliente · SMS Resistências · Agência Molla
   LISTA DE MATERIAIS — é o único arquivo a editar para publicar um material novo.

   Cada material:
     titulo      Nome do material no card
     resumo      Uma ou duas frases sobre o conteúdo
     categoria   planejamento | conteudos | reports | analises
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
    id: 'conteudos',
    nome: 'Conteúdos',
    descricao: 'Textos dos anúncios e materiais das campanhas.',
    icone: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21'
  },
  {
    id: 'reports',
    nome: 'Reports',
    descricao: 'Atualizações da conta e o andamento das entregas.',
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

  /* ---------- Conteúdos ---------- */
  // (nenhum material publicado ainda)

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
