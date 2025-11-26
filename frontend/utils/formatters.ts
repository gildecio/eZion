/**
 * Formata CNPJ no padrão XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) {
    return cnpj;
  }
  
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Remove formatação de CNPJ
 */
export function unformatCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Formata CPF no padrão XXX.XXX.XXX-XX
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) {
    return cpf;
  }
  
  return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Remove formatação de CPF
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Formata valor monetário em Real (BRL)
 */
export function formatCurrency(value: number | string): string {
  const numValue = parseDecimal(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Formata quantidade/peso (3 casas decimais)
 */
export function formatQuantity(value: number | string): string {
  const numValue = parseDecimal(value);
  const safe = Number.isFinite(numValue) ? numValue : 0;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(safe);
}

/**
 * Converte string com vírgula (formato brasileiro) para número
 */
export function parseDecimal(value: any): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    // Remove separadores de milhar comuns antes de converter
    // Ex: "1.234,56" -> "1234,56" -> "1234.56"
    const normalized = trimmed
      .replace(/\s+/g, '')
      .replace(/\.(?=\d{3}(\D|$))/g, '') // remove pontos que antecedem grupos de 3 dígitos
      .replace(/,/g, '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value == null) return 0;
  try {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : 0;
  } catch {
    return 0;
  }
}

/**
 * Formata data no padrão brasileiro DD/MM/YYYY
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

/**
 * Formata data e hora no padrão brasileiro DD/MM/YYYY HH:mm
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dateObj);
}
