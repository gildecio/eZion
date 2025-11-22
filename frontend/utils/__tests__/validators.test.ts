import { isValidCNPJ } from '../validators';

describe('Validadores', () => {
  describe('isValidCNPJ', () => {
    it('deve validar CNPJs corretos', () => {
      const cnpjsValidos = [
        '11222333000181',
        '11.222.333/0001-81',
        '00000000000191',
      ];

      cnpjsValidos.forEach(cnpj => {
        expect(isValidCNPJ(cnpj)).toBe(true);
      });
    });

    it('deve rejeitar CNPJs inválidos', () => {
      const cnpjsInvalidos = [
        '11222333000180', // dígito verificador errado
        '00000000000000', // todos zeros
        '11111111111111', // todos iguais
        '123',            // muito curto
        '123456789012345', // muito longo
        '',               // vazio
        'abcd1234567890', // com letras
      ];

      cnpjsInvalidos.forEach(cnpj => {
        expect(isValidCNPJ(cnpj)).toBe(false);
      });
    });

    it('deve remover caracteres de formatação automaticamente', () => {
      const cnpj = '11.222.333/0001-81';
      expect(isValidCNPJ(cnpj)).toBe(true);
    });

    it('deve rejeitar CNPJ com todos dígitos iguais', () => {
      const cnpjsRepetidos = [
        '11111111111111',
        '22222222222222',
        '99999999999999',
      ];

      cnpjsRepetidos.forEach(cnpj => {
        expect(isValidCNPJ(cnpj)).toBe(false);
      });
    });
  });
});
