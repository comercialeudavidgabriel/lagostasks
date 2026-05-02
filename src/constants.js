export const DEPARTMENTS = [
  { id: 'editor_videos',  label: 'Editor de Vídeos' },
  { id: 'designer',       label: 'Designer' },
  { id: 'social_media',   label: 'Social Media' },
  { id: 'trafego_pago',   label: 'Tráfego Pago' },
  { id: 'sites',          label: 'Sites' },
];

export const DEPARTMENT_BY_ID = Object.fromEntries(DEPARTMENTS.map(d => [d.id, d]));

export const MOMENTOS = [
  { id: 'call_alinhamento',     label: 'Call de alinhamento' },
  { id: 'producao_estrategica', label: 'Produção estratégica' },
  { id: 'rodando',              label: 'Rodando' },
];

export const PLANOS = [
  { id: 'silver', label: 'Silver' },
  { id: 'gold',   label: 'Gold' },
  { id: 'lagos',  label: 'Lagos' },
];

export const SITUACOES = [
  { id: 'ativo',         label: 'Ativo',         color: '#22c55e' },
  { id: 'em_fechamento', label: 'Em fechamento', color: '#f59e0b' },
  { id: 'pendencias',    label: 'Pendências',    color: '#ef4444' },
  { id: 'desativado',    label: 'Desativado',    color: '#94a3b8' },
];
