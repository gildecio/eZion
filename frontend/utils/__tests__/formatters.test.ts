import { formatCNPJ } from '../formatters';

describe('Formatadores', () => {
  describe('formatCNPJ', () => {
    it('deve formatar CNPJ com 14 dígitos', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('deve retornar string vazia para CNPJ vazio', () => {
      expect(formatCNPJ('')).toBe('');
    });

    it('deve retornar valor original se não tiver 14 dígitos', () => {
      expect(formatCNPJ('123')).toBe('123');
      expect(formatCNPJ('12345678901')).toBe('12345678901');
    });

    it('deve remover caracteres não numéricos antes de formatar', () => {
      expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81');
    });

    it('deve formatar CNPJs com zeros no início', () => {
      expect(formatCNPJ('00000000000191')).toBe('00.000.000/0001-91');
    });

    it('deve lidar com valores parciais durante digitação', () => {
      expect(formatCNPJ('11')).toBe('11');
      expect(formatCNPJ('1122')).toBe('1122');
      expect(formatCNPJ('112223')).toBe('112223');
      expect(formatCNPJ('11222333')).toBe('11222333');
      expect(formatCNPJ('112223330')).toBe('112223330');
      expect(formatCNPJ('1122233300')).toBe('1122233300');
      expect(formatCNPJ('11222333000')).toBe('11222333000');
      expect(formatCNPJ('112223330001')).toBe('112223330001');
      expect(formatCNPJ('1122233300018')).toBe('1122233300018');
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    });
  });
});
