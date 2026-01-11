import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.nome,
        c.sexo,
        c.idade_min,
        c.idade_max,
        c.limite_duplas,
        c.valor,
        COUNT(DISTINCT CASE WHEN d.status IN ('confirmado', 'pendente') THEN dc.dupla_id END) as duplas_confirmadas,
        COUNT(DISTINCT CASE WHEN d.status = 'aguardando_pagamento' THEN dc.dupla_id END) as duplas_reservadas,
        c.limite_duplas - COUNT(DISTINCT CASE WHEN d.status IN ('confirmado', 'pendente', 'aguardando_pagamento') THEN dc.dupla_id END) as vagas_disponiveis
      FROM categorias c
      LEFT JOIN dupla_categorias dc ON c.id = dc.categoria_id
      LEFT JOIN duplas d ON dc.dupla_id = d.id
      GROUP BY c.id
      ORDER BY 
        CASE 
          WHEN c.nome = 'Sub 17' THEN 1
          WHEN c.nome = 'Sub 21' THEN 2
          WHEN c.nome = 'Open' THEN 3
        END,
        c.sexo DESC
    `);

    const categorias = result.rows.map(cat => ({
      ...cat,
      valor: parseFloat(cat.valor),
      duplas_confirmadas: parseInt(cat.duplas_confirmadas),
      duplas_reservadas: parseInt(cat.duplas_reservadas),
      vagas_disponiveis: Math.max(0, parseInt(cat.vagas_disponiveis)),
      status: cat.vagas_disponiveis <= 0 ? 'ESGOTADO' : 
              cat.vagas_disponiveis <= 3 ? 'ÚLTIMAS VAGAS' : 'DISPONÍVEL'
    }));

    return NextResponse.json({ categorias }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}