import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export async function POST(request) {
  try {
    console.log('=== INICIANDO UPLOAD ===');
    
    const formData = await request.formData();
    const codigoRastreio = formData.get('codigo_rastreio');
    const tipo = formData.get('tipo');
    const file = formData.get('file');
    
    console.log('Parâmetros recebidos:', {
      codigoRastreio,
      tipo,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    // Validação
    if (!codigoRastreio) {
      console.error('Erro: Código de rastreio não fornecido');
      return NextResponse.json(
        { error: 'Código de rastreio é obrigatório' },
        { status: 400 }
      );
    }

    if (!tipo || !['documento_jogador1', 'documento_jogador2', 'comprovante'].includes(tipo)) {
      console.error('Erro: Tipo de arquivo inválido:', tipo);
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use: documento_jogador1, documento_jogador2 ou comprovante' },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      console.error('Erro: Arquivo não fornecido ou vazio');
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Erro: Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Erro: Tipo de arquivo não permitido:', file.type);
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG' },
        { status: 400 }
      );
    }

    // Buscar dupla pelo código de rastreio
    console.log('Buscando dupla com código:', codigoRastreio);
    const duplaResult = await pool.query(
      'SELECT id, status, codigo_rastreio FROM duplas WHERE codigo_rastreio = $1',
      [codigoRastreio]
    );

    console.log('Resultado da busca:', {
      encontrou: duplaResult.rows.length > 0,
      id: duplaResult.rows[0]?.id,
      status: duplaResult.rows[0]?.status
    });

    if (duplaResult.rows.length === 0) {
      console.error('Erro: Dupla não encontrada com código:', codigoRastreio);
      return NextResponse.json(
        { error: 'Dupla não encontrada com este código de rastreio' },
        { status: 404 }
      );
    }

    const dupla = duplaResult.rows[0];

    if (dupla.status === 'cancelado') {
      console.error('Erro: Inscrição cancelada para código:', codigoRastreio);
      return NextResponse.json(
        { error: 'Inscrição cancelada' },
        { status: 400 }
      );
    }

    // Verificar se já existe um arquivo deste tipo
    const arquivoExistente = await pool.query(
      'SELECT id FROM arquivos WHERE dupla_id = $1 AND tipo = $2',
      [dupla.id, tipo]
    );

    console.log('Arquivo existente:', arquivoExistente.rows.length > 0);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const nomeOriginal = file.name;
    const extensao = nomeOriginal.split('.').pop();
    const nomeArquivo = `${dupla.codigo_rastreio}_${tipo}_${timestamp}.${extensao}`;

    console.log('Fazendo upload para blob:', nomeArquivo);

    // Upload para Vercel Blob
    let blobUrl;
    try {
      blobUrl = await put(nomeArquivo, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      console.log('Upload para blob realizado com sucesso:', blobUrl);
    } catch (blobError) {
      console.error('Erro ao fazer upload para blob:', blobError);
      throw new Error('Falha no upload do arquivo para armazenamento');
    }

    // Salvar no banco de dados
    if (arquivoExistente.rows.length > 0) {
      console.log('Atualizando arquivo existente...');
      // Atualizar arquivo existente
      await pool.query(`
        UPDATE arquivos 
        SET blob_url = $1, criado_em = NOW()
        WHERE dupla_id = $2 AND tipo = $3
      `, [blobUrl, dupla.id, tipo]);
    } else {
      console.log('Inserindo novo arquivo...');
      // Inserir novo arquivo
      await pool.query(`
        INSERT INTO arquivos (dupla_id, tipo, blob_url)
        VALUES ($1, $2, $3)
      `, [dupla.id, tipo, blobUrl]);
    }

    console.log('=== UPLOAD CONCLUÍDO COM SUCESSO ===');

    return NextResponse.json({
      success: true,
      url: blobUrl,
      tipo: tipo,
      dupla_id: dupla.id,
      codigo_rastreio: dupla.codigo_rastreio,
      message: 'Arquivo enviado com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    
    if (error.message.includes('Falha no upload')) {
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo. Tente novamente.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}