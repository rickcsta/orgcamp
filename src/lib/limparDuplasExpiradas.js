import pool from './db';
import { del } from '@vercel/blob';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Função para extrair a URL string do blob
function extrairUrlString(blobData) {
  if (!blobData) return null;
  
  console.log(`Extraindo URL de:`, typeof blobData, blobData);
  
  try {
    let url;
    
    // 1. Se for uma string JSON (como está no banco)
    if (typeof blobData === 'string' && blobData.startsWith('{')) {
      try {
        const parsed = JSON.parse(blobData);
        url = parsed.url; // Pegar a propriedade 'url' do objeto
        console.log(`Parseado JSON, URL encontrada: ${url}`);
      } catch (jsonError) {
        console.error('Erro ao parsear JSON:', jsonError);
        return null;
      }
    }
    // 2. Se já for um objeto JavaScript (pode acontecer em alguns casos)
    else if (typeof blobData === 'object' && blobData !== null) {
      url = blobData.url; // Pegar a propriedade 'url' direto
      console.log(`É objeto, URL encontrada: ${url}`);
    }
    // 3. Se já for uma URL string (formato correto)
    else if (typeof blobData === 'string' && blobData.startsWith('http')) {
      url = blobData;
      console.log(`Já é URL string: ${url}`);
    }
    // 4. Outros casos
    else {
      console.log(`Formato não reconhecido:`, typeof blobData, blobData);
      return null;
    }
    
    // Verificar se a URL é válida
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return url;
    }
    
    return null;
    
  } catch (error) {
    console.error('Erro ao extrair URL:', error);
    return null;
  }
}

export async function limparDuplasExpiradas() {
  let duplasCanceladas = 0;
  let arquivosDeletados = 0;
  let errosDeletacao = 0;
  
  try {
    console.log('=== INICIANDO LIMPEZA DE DUPLAS EXPIRADAS ===');
    
    // Seleciona duplas expiradas
    const { rows: duplas } = await pool.query(`
      SELECT id, codigo_rastreio
      FROM duplas
      WHERE status = 'aguardando_pagamento'
        AND expira_em < NOW()
    `);

    console.log(`Encontradas ${duplas.length} duplas expiradas`);

    for (const dupla of duplas) {
      const duplaId = dupla.id;
      const codigoRastreio = dupla.codigo_rastreio;

      console.log(`\n📋 Processando dupla ${duplaId} (${codigoRastreio})`);

      // Busca arquivos da dupla
      const { rows: arquivos } = await pool.query(
        'SELECT id, blob_url, tipo FROM arquivos WHERE dupla_id = $1',
        [duplaId]
      );

      console.log(`📁 Encontrados ${arquivos.length} arquivos para deletar`);

      // Para cada arquivo, deletar do blob usando del()
      for (const arquivo of arquivos) {
        try {
          console.log(`\n🔄 Processando arquivo ${arquivo.id} (${arquivo.tipo})`);
          console.log(`Dados do blob_url:`, arquivo.blob_url);
          
          // Extrair a URL string do blob
          const urlBlob = extrairUrlString(arquivo.blob_url);
          
          if (!urlBlob) {
            console.log(`⚠️  Não foi possível extrair URL válida do arquivo ${arquivo.id}`);
            errosDeletacao++;
            continue;
          }
          
          console.log(`🗑️  URL para deletar: ${urlBlob}`);
          
          // Usar a função del() do @vercel/blob
          // ⚠️ IMPORTANTE: del() espera a URL string, não o objeto!
          await del(urlBlob, {
            token: BLOB_TOKEN
          });
          
          console.log(`✅ Arquivo ${arquivo.id} deletado do blob com sucesso`);
          arquivosDeletados++;
          
        } catch (err) {
          console.error(`❌ Erro ao deletar arquivo ${arquivo.id}:`, err.message);
          console.error(`Detalhes do erro:`, err);
          errosDeletacao++;
        }
      }

      // Remove registros da tabela arquivos
      await pool.query('DELETE FROM arquivos WHERE dupla_id = $1', [duplaId]);
      console.log(`🗑️  Registros de arquivos removidos do banco para dupla ${duplaId}`);

      // Atualiza status da dupla
      await pool.query(
        `UPDATE duplas SET status = 'cancelado', atualizado_em = NOW() WHERE id = $1`,
        [duplaId]
      );

      console.log(`✅ Dupla ${duplaId} cancelada`);
      duplasCanceladas++;
    }

    console.log('\n=== RESUMO DA LIMPEZA ===');
    console.log(`📊 Duplas canceladas: ${duplasCanceladas}`);
    console.log(`🗂️  Arquivos deletados do blob: ${arquivosDeletados}`);
    console.log(`❌ Erros de deleção: ${errosDeletacao}`);
    console.log('=== LIMPEZA CONCLUÍDA ===');
    
  } catch (error) {
    console.error('❌ Erro geral ao limpar duplas expiradas:', error);
    console.error('Stack trace:', error.stack);
  }
  
  return duplasCanceladas;
}