import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const query = `
      SELECT 
        a.id,
        a.tipo,
        a.blob_url,
        a.criado_em,
        CASE 
          WHEN a.tipo = 'comprovante' THEN 'Comprovante de Pagamento'
          WHEN a.tipo LIKE 'documento_%' THEN 
            'Documento - ' || 
            CASE 
              WHEN a.tipo = 'documento_jogador1' THEN 'Jogador 1'
              WHEN a.tipo = 'documento_jogador2' THEN 'Jogador 2'
              WHEN a.tipo = 'documento_responsavel' THEN 'Responsável'
              ELSE 'Documento'
            END
          ELSE 'Arquivo'
        END as descricao
      FROM arquivos a
      WHERE a.dupla_id = $1
      ORDER BY a.tipo, a.criado_em DESC
    `;
    
    const result = await pool.query(query, [id]);
    
    return NextResponse.json({ arquivos: result.rows }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao buscar arquivos da inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}