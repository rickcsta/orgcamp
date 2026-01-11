import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  try {
    // NO NEXT.JS 13+, params É UMA PROMISE!
    const { codigo } = await params;
    
    console.log('=== COMPLETANDO INSCRIÇÃO ===');
    console.log('Código:', codigo);

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código de rastreio é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a dupla existe
    const duplaResult = await pool.query(
      `SELECT id, status FROM duplas WHERE codigo_rastreio = $1`,
      [codigo]
    );

    if (duplaResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    const dupla = duplaResult.rows[0];

    // Verificar se todos os documentos foram enviados
    const arquivosResult = await pool.query(
      `SELECT tipo FROM arquivos WHERE dupla_id = $1`,
      [dupla.id]
    );

    const arquivosEnviados = arquivosResult.rows.map(row => row.tipo);
    const documentosEnviados = arquivosEnviados.filter(tipo => 
      tipo === 'documento_jogador1' || tipo === 'documento_jogador2'
    ).length;
    const comprovanteEnviado = arquivosEnviados.includes('comprovante');

    console.log('Documentos enviados:', documentosEnviados);
    console.log('Comprovante enviado:', comprovanteEnviado);

    if (documentosEnviados < 2) {
      return NextResponse.json({
        error: 'Faltam documentos obrigatórios',
        documentos_faltantes: 2 - documentosEnviados
      }, { status: 400 });
    }

    if (!comprovanteEnviado) {
      return NextResponse.json({
        error: 'Comprovante de pagamento não enviado'
      }, { status: 400 });
    }

    // Atualizar status da dupla
    await pool.query(
      `UPDATE duplas 
       SET status = 'pendente', 
           atualizado_em = NOW(),
           expira_em = NULL
       WHERE id = $1`,
      [dupla.id]
    );

    console.log('=== INSCRIÇÃO COMPLETADA COM SUCESSO ===');

    return NextResponse.json({
      success: true,
      message: 'Inscrição completada com sucesso! Aguarde a confirmação.',
      status: 'pendente'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao completar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}