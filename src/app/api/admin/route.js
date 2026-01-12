import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN; // token do Vercel Blob

export async function GET() {
  try {
    // 1️⃣ Seleciona duplas expiradas
    const { rows: duplas } = await pool.query(`
      SELECT id
      FROM duplas
      WHERE status = 'aguardando_pagamento'
        AND expira_em < NOW()
    `);

    console.log(`Encontradas ${duplas.length} duplas expiradas`);

    for (const dupla of duplas) {
      const duplaId = dupla.id;

      // 2️⃣ Busca todos os arquivos da dupla
      const { rows: arquivos } = await pool.query(
        'SELECT id, blob_url FROM arquivos WHERE dupla_id = $1',
        [duplaId]
      );

      // 3️⃣ Deleta todos os arquivos do blob em paralelo
      await Promise.all(
        arquivos.map(async (arquivo) => {
          try {
            await fetch(arquivo.blob_url, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
            });

            console.log(`Arquivo ${arquivo.id} removido do blob`);
          } catch (err) {
            console.error(`Erro ao apagar arquivo ${arquivo.id}:`, err.message);
          }
        })
      );

      // 4️⃣ Remove registros da tabela 'arquivos'
      await pool.query('DELETE FROM arquivos WHERE dupla_id = $1', [duplaId]);
      console.log(`Registros da tabela arquivos da dupla ${duplaId} removidos`);

      // 5️⃣ Atualiza status da dupla
      await pool.query(
        `UPDATE duplas SET status = 'cancelado', atualizado_em = NOW() WHERE id = $1`,
        [duplaId]
      );
      console.log(`Dupla ${duplaId} marcada como cancelada`);
    }

    return NextResponse.json({
      message: `${duplas.length} duplas expiradas processadas e arquivos removidos`,
    });
  } catch (error) {
    console.error('Erro ao processar duplas expiradas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
