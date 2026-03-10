// ---------------------------------------------------------------
// REGISTRO DE FERRAMENTAS
// Para adicionar uma nova ferramenta, basta incluir um item aqui.
// ---------------------------------------------------------------
export const TOOLS = [
  {
    id: 'viabilidade',
    label: 'Análise de Viabilidade',
    icon: '🎯',
    href: '/dashboard',
    description: 'Score e análise completa para qualquer vaga',
    status: 'active' as 'active' | 'soon',
  },
  // {
  //   id: 'booleana',
  //   label: 'Busca Booleana',
  //   icon: '🔎',
  //   href: '/dashboard/booleana',
  //   description: 'Strings booleanas prontas para LinkedIn Recruiter',
  //   status: 'active' as const,
  // },
  {
    id: 'analisar-perfil',
    label: 'Analisar Perfil',
    icon: '👤',
    href: '/dashboard/analisar-perfil',
    description: 'Score de aderência candidato × vaga',
    status: 'active' as const,
  },
  // {
  //   id: 'mensagem',
  //   label: 'Mensagem WhatsApp',
  //   icon: '💬',
  //   href: '/dashboard/mensagem',
  //   description: 'Mensagens personalizadas para primeiro contato',
  //   status: 'active' as const,
  // },
  // ---------- PRÓXIMAS FERRAMENTAS (descomente ao implementar) ----------
  // {
  //   id: 'email',
  //   label: 'Gerador de E-mail',
  //   icon: '✉️',
  //   href: '/dashboard/email',
  //   description: 'E-mails de abordagem para candidatos passivos',
  //   status: 'active' as const,
  // },
  {
    id: 'benchmarking',
    label: 'Benchmarking Salarial',
    icon: '📊',
    href: '/dashboard/benchmarking',
    description: 'Faixas salariais por cargo, nível e setor',
    status: 'active' as const,
  },
]
