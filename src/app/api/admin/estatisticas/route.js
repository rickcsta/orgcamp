import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Estatísticas gerais
    const estatisticasQuery = await pool.query(`
      SELECT 
        COUNT(*) as total_inscricoes,
        COUNT(CASE WHEN status = 'aguardando_pagamento' THEN 1 END) as aguardando_pagamento,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'confirmado' THEN 1 END) as confirmadas,
        COUNT(CASE WHEN status = 'recusado' THEN 1 END) as recusadas,
        COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as canceladas,
        SUM(CASE WHEN status = 'confirmado' THEN valor_total ELSE 0 END) as valor_total_confirmado,
        COUNT(DISTINCT responsavel_email) as responsaveis_unicos,
        (
          SELECT COUNT(*)
          FROM arquivos 
          WHERE tipo = 'comprovante'
        ) as comprovantes_enviados,
        (
          SELECT STRING_AGG(
            CONCAT(nome, ': ', count, ' (R$', total, ')'),
            ', '
          )
          FROM (
            SELECT 
              c.nome,
              COUNT(DISTINCT dc.dupla_id) as count,
              SUM(d.valor_total) as total
            FROM categorias c
            JOIN dupla_categorias dc ON c.id = dc.categoria_id
            JOIN duplas d ON dc.dupla_id = d.id
            WHERE d.status = 'confirmado'
            GROUP BY c.nome
            ORDER BY c.nome
          ) subquery
        ) as categorias_resumo
      FROM duplas
    `);
    
    // Inscrições por dia (últimos 7 dias)
    const inscricoesPorDiaQuery = await pool.query(`
      SELECT 
        DATE(criado_em) as data,
        COUNT(*) as quantidade,
        SUM(valor_total) as valor_total
      FROM duplas
      WHERE criado_em >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(criado_em)
      ORDER BY data DESC
    `);
    
    // Inscrições pendentes que expiram em breve (próximas 24h)
    const expiramEmBreveQuery = await pool.query(`
      SELECT 
        COUNT(*) as quantidade,
        SUM(valor_total) as valor_total
      FROM duplas
      WHERE status = 'aguardando_pagamento'
      AND expira_em BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
    `);
    
    // Categorias mais populares
    const categoriasPopularesQuery = await pool.query(`
      SELECT 
        c.nome,
        c.sexo,
        COUNT(DISTINCT dc.dupla_id) as inscricoes,
        c.limite_duplas,
        ROUND(COUNT(DISTINCT dc.dupla_id) * 100.0 / c.limite_duplas, 1) as ocupacao_percentual,
        c.valor,
        COUNT(DISTINCT CASE WHEN d.status = 'confirmado' THEN dc.dupla_id END) as confirmadas,
        COUNT(DISTINCT CASE WHEN d.status = 'pendente' THEN dc.dupla_id END) as pendentes,
        COUNT(DISTINCT CASE WHEN d.status = 'aguardando_pagamento' THEN dc.dupla_id END) as aguardando
      FROM categorias c
      LEFT JOIN dupla_categorias dc ON c.id = dc.categoria_id
      LEFT JOIN duplas d ON dc.dupla_id = d.id
      GROUP BY c.id, c.nome, c.sexo, c.limite_duplas, c.valor
      ORDER BY inscricoes DESC
    `);
    
    const estatisticas = estatisticasQuery.rows[0];
    const response = {
      total_inscricoes: parseInt(estatisticas.total_inscricoes),
      por_status: {
        aguardando_pagamento: parseInt(estatisticas.aguardando_pagamento),
        pendentes: parseInt(estatisticas.pendentes),
        confirmadas: parseInt(estatisticas.confirmadas),
        recusadas: parseInt(estatisticas.recusadas),
        canceladas: parseInt(estatisticas.canceladas)
      },
      valor_total_confirmado: parseFloat(estatisticas.valor_total_confirmado || 0),
      responsaveis_unicos: parseInt(estatisticas.responsaveis_unicos),
      comprovantes_enviados: parseInt(estatisticas.comprovantes_enviados),
      categorias_resumo: estatisticas.categorias_resumo || 'Nenhuma categoria com inscrições',
      inscricoes_ultimos_7_dias: inscricoesPorDiaQuery.rows.map(row => ({
        data: row.data,
        quantidade: parseInt(row.quantidade),
        valor_total: parseFloat(row.valor_total || 0)
      })),
      expiram_em_24h: {
        quantidade: parseInt(expiramEmBreveQuery.rows[0]?.quantidade || 0), // CORREÇÃO AQUI
        valor_total: parseFloat(expiramEmBreveQuery.rows[0]?.valor_total || 0) // CORREÇÃO AQUI
      },
      categorias_populares: categoriasPopularesQuery.rows.map(row => ({
        nome: `${row.nome} - ${row.sexo}`,
        inscricoes: parseInt(row.inscricoes || 0),
        limite: row.limite_duplas,
        ocupacao_percentual: parseFloat(row.ocupacao_percentual || 0),
        valor: parseFloat(row.valor || 0),
        confirmadas: parseInt(row.confirmadas || 0),
        pendentes: parseInt(row.pendentes || 0),
        aguardando: parseInt(row.aguardando || 0),
        status: row.ocupacao_percentual >= 100 ? 'ESGOTADA' : 
                row.ocupacao_percentual >= 80 ? 'QUASE ESGOTADA' : 'DISPONÍVEL'
      }))
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}