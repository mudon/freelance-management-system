export const navigation = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    color: 'from-blue-500 to-cyan-400', 
    gradient: 'from-blue-500/10 to-cyan-400/10',
    path: '/' 
  },
  { 
    id: 'clients', 
    label: 'Clients', 
    color: 'from-emerald-500 to-teal-400', 
    gradient: 'from-emerald-500/10 to-teal-400/10',
    path: '/clients' 
  },
  { 
    id: 'projects', 
    label: 'Projects', 
    color: 'from-purple-500 to-pink-400', 
    gradient: 'from-purple-500/10 to-pink-400/10',
    path: '/projects' 
  },
  { 
    id: 'invoices', 
    label: 'Invoices', 
    color: 'from-amber-500 to-orange-400', 
    gradient: 'from-amber-500/10 to-orange-400/10',
    path: '/invoices' 
  },
  { 
    id: 'quotes', 
    label: 'Quotes', 
    color: 'from-pink-500 to-rose-400', 
    gradient: 'from-pink-500/10 to-rose-400/10',
    path: '/quotes' 
  },
] as const;