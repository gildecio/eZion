from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from app.modules.configuracoes.models.sequencia import Sequencia, TipoSequencia
from app.modules.configuracoes.schemas.sequencia import SequenciaInDB


class SequenciaService:
    """Service para gerenciar sequências de documentos"""
    
    def obter_proximo_numero(
        self, 
        db: Session, 
        empresa_id: int, 
        documento_tipo: str,
        serie: str = None
    ) -> dict:
        """
        Obtém e incrementa o próximo número da sequência
        
        Regras de negócio:
        - ANUAL: Se série != ano atual, reseta número para 1 e atualiza série para ano atual
        - CONTINUO: Se número > máximo, incrementa série em 1 e reseta número para 1
        
        Args:
            db: Sessão do banco de dados
            empresa_id: ID da empresa
            documento_tipo: Tipo do documento (ex: 'ESTOQUE_AJUSTE')
            serie: Série da sequência (opcional, será sobrescrito se tipo ANUAL)
            
        Returns:
            dict com 'numero' (int), 'numero_formatado' (str) e 'serie' (str)
            
        Raises:
            HTTPException 404: Se sequência não existe
            HTTPException 400: Se sequência esgotada (CONTINUO sem espaço)
        """
        # Buscar sequência
        query = db.query(Sequencia).filter(
            Sequencia.empresa_id == empresa_id,
            Sequencia.documento_tipo == documento_tipo
        )
        
        # Para tipo CONTINUO, filtrar por série se fornecida
        # Para tipo ANUAL, não filtrar por série (será atualizada automaticamente para o ano)
        # Como não sabemos o tipo antes de buscar, primeiro buscamos sem filtro de série
        sequencia = query.with_for_update().first()
        
        if not sequencia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sequência '{documento_tipo}' não configurada para esta empresa. Configure em Configurações > Sequências."
            )
        
        ano_atual = str(datetime.now().year)
        
        # Lógica por tipo de sequência
        if sequencia.tipo == TipoSequencia.ANUAL:
            # ANUAL: Verificar se série é diferente do ano atual
            if sequencia.serie != ano_atual:
                # Reset: número volta para 1, série atualiza para ano atual
                sequencia.numero = 1
                sequencia.serie = ano_atual
                numero_atual = 1
                sequencia.numero = 2  # Próximo será 2
            else:
                # Mesmo ano: incrementar normalmente
                sequencia.numero += 1
                numero_atual = sequencia.numero
                
                # Validar se não ultrapassou o limite no mesmo ano
                if sequencia.numero > sequencia.numero_maximo:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Sequência '{documento_tipo}' esgotada para o ano {ano_atual}. Máximo: {sequencia.numero_maximo}"
                    )
        
        elif sequencia.tipo == TipoSequencia.CONTINUO:
            # CONTINUO: Verificar se atingiu o máximo
            if sequencia.numero > sequencia.numero_maximo:
                # Incrementar série e resetar número
                try:
                    # Tentar converter série para int e incrementar
                    serie_int = int(sequencia.serie) if sequencia.serie else 0
                    sequencia.serie = str(serie_int + 1)
                    sequencia.numero = 1
                    numero_atual = 1
                    sequencia.numero = 2  # Próximo será 2
                except ValueError:
                    # Série não é numérica, não pode incrementar
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Sequência '{documento_tipo}' esgotada e série não é numérica. Configure nova sequência."
                    )
            else:
                # Incrementar normalmente
                sequencia.numero += 1
                numero_atual = sequencia.numero
        
        else:
            # Tipo desconhecido (não deveria acontecer)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Tipo de sequência inválido: {sequencia.tipo}"
            )
        
        db.commit()
        
        # Formatar apenas o número com zeros à esquerda
        numero_formatado = str(numero_atual).zfill(6)
        
        return {
            'numero': numero_formatado,  # Número com zeros à esquerda
            'serie': sequencia.serie      # Série separada
        }
    
    def _formatar_numero(self, numero: int, serie: str = None) -> str:
        """
        Formata o número da sequência
        
        Ex: serie='A', numero=5 -> 'A00005'
            serie=None, numero=100 -> '000100'
        """
        numero_str = str(numero).zfill(6)  # 6 dígitos com zeros à esquerda
        
        if serie:
            return f"{serie}{numero_str}"
        
        return numero_str
    
    def validar_sequencia_existe(
        self, 
        db: Session, 
        empresa_id: int, 
        documento_tipo: str,
        serie: str = None
    ) -> bool:
        """
        Valida se sequência existe sem consumir número
        
        Returns:
            True se existe, False caso contrário
        """
        query = db.query(Sequencia).filter(
            Sequencia.empresa_id == empresa_id,
            Sequencia.documento_tipo == documento_tipo
        )
        
        if serie:
            query = query.filter(Sequencia.serie == serie)
        else:
            query = query.filter(Sequencia.serie.is_(None))
        
        return query.first() is not None


# Instância global do service
sequencia_service = SequenciaService()
