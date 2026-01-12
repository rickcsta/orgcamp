import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    // CORREÇÃO AQUI: params é uma Promise no Next.js 13+
    const { codigo } = await params;

    // Mude para 6 dígitos (seus códigos são de 6 dígitos)
    if (!codigo || codigo.length < 6) {
      return NextResponse.json(
        { error: 'Código de rastreio inválido' },
        { status: 400 }
      );
    }

    // Buscar dados da dupla
    const duplaResult = await pool.query(`
      SELECT 
        d.*,
        (SELECT COUNT(*) FROM arquivos WHERE dupla_id = d.id AND tipo LIKE 'documento_%') as documentos_enviados,
        (SELECT COUNT(*) FROM arquivos WHERE dupla_id = d.id AND tipo = 'comprovante') as comprovante_enviado,
        NOW() as agora
      FROM duplas d
      WHERE d.codigo_rastreio = $1
    `, [codigo]);

    if (duplaResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    const dupla = duplaResult.rows[0];

    // Buscar categorias da dupla
    const categoriasResult = await pool.query(`
      SELECT c.* FROM categorias c
      JOIN dupla_categorias dc ON c.id = dc.categoria_id
      WHERE dc.dupla_id = $1
    `, [dupla.id]);

    // Buscar arquivos
    const arquivosResult = await pool.query(`
      SELECT tipo, blob_url FROM arquivos
      WHERE dupla_id = $1
      ORDER BY tipo
    `, [dupla.id]);

    // Calcular tempo restante
    let timeLeft = 0;
    if (dupla.expira_em && dupla.status === 'aguardando_pagamento') {
      const agora = new Date(dupla.agora);
      const expiraEm = new Date(dupla.expira_em);
      timeLeft = Math.max(0, Math.floor((expiraEm.getTime() - agora.getTime()) / 1000));
    }

    const response = {
      dupla: {
        id: dupla.id,
        responsavel_nome: dupla.responsavel_nome,
        responsavel_email: dupla.responsavel_email,
        responsavel_numero: dupla.responsavel_numero, // Note: seu banco tem 'responsavel_numero' não 'responsavel_telefone'
        jogador1_nome: dupla.jogador1_nome,
        jogador1_nascimento: dupla.jogador1_nascimento,
        jogador1_camisa: dupla.jogador1_camisa,
        jogador2_nome: dupla.jogador2_nome,
        jogador2_nascimento: dupla.jogador2_nascimento,
        jogador2_camisa: dupla.jogador2_camisa,
        categorias: categoriasResult.rows.map(c => ({
          id: c.id,
          nome: c.nome,
          sexo: c.sexo,
          idade_min: c.idade_min,
          idade_max: c.idade_max,
          valor: parseFloat(c.valor)
        })),
        valor_total: parseFloat(dupla.valor_total),
        status: dupla.status,
        motivo_recusa: dupla.motivo_recusa,
        codigo_rastreio: dupla.codigo_rastreio,
        criado_em: dupla.criado_em,
        expira_em: dupla.expira_em,
        atualizado_em: dupla.atualizado_em,
        documentos_enviados: parseInt(dupla.documentos_enviados),
        comprovante_enviado: parseInt(dupla.comprovante_enviado) > 0,
        arquivos: arquivosResult.rows,
        time_left: timeLeft
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}