import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function GET(req) {
  // ✅ Verifica o segredo
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows: duplas } = await pool.query(`
      SELECT id
      FROM duplas
      WHERE status = 'aguardando_pagamento'
        AND expira_em < NOW()
    `);

    for (const dupla of duplas) {
      const duplaId = dupla.id;

      const { rows: arquivos } = await pool.query(
        'SELECT id, blob_url FROM arquivos WHERE dupla_id = $1',
        [duplaId]
      );

      await Promise.all(
        arquivos.map(async (arquivo) => {
          try {
            await fetch(arquivo.blob_url, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
            });
          } catch (err) {
            console.error(`Erro ao apagar arquivo ${arquivo.id}:`, err.message);
          }
        })
      );

      await pool.query('DELETE FROM arquivos WHERE dupla_id = $1', [duplaId]);

      await pool.query(
        `UPDATE duplas SET status = 'cancelado', atualizado_em = NOW() WHERE id = $1`,
        [duplaId]
      );
    }

    return NextResponse.json({
      message: `${duplas.length} duplas expiradas processadas`,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
