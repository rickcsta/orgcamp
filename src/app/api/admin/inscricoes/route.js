import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');
    
    let query = `
      SELECT 
        d.id,
        d.responsavel_nome,
        d.responsavel_email,
        d.responsavel_numero as telefone,
        d.jogador1_nome,
        d.jogador1_nascimento,
        d.jogador1_camisa,
        d.jogador2_nome,
        d.jogador2_nascimento,
        d.jogador2_camisa,
        d.valor_total,
        d.codigo_rastreio as codigo,
        d.status,
        d.motivo_recusa,
        d.criado_em as dataInscricao,
        d.expira_em,
        d.atualizado_em,
        (
          SELECT STRING_AGG(
            CONCAT(c.nome, ' - ', c.sexo, ' (R$', c.valor, ')'),
            ', '
          )
          FROM dupla_categorias dc
          JOIN categorias c ON dc.categoria_id = c.id
          WHERE dc.dupla_id = d.id
        ) as categorias_string,
        (
          SELECT STRING_AGG(c.sexo, ', ') 
          FROM dupla_categorias dc
          JOIN categorias c ON dc.categoria_id = c.id
          WHERE dc.dupla_id = d.id
        ) as sexos,
        (
          SELECT COUNT(*) > 0 
          FROM arquivos a 
          WHERE a.dupla_id = d.id AND a.tipo = 'comprovante'
        ) as pagamento_confirmado,
        CASE 
          WHEN d.status = 'confirmado' AND (
            SELECT COUNT(*) > 0 
            FROM arquivos a 
            WHERE a.dupla_id = d.id AND a.tipo = 'comprovante'
          ) THEN 'Confirmado'
          WHEN d.status = 'pendente' THEN 'Pendente'
          WHEN d.status = 'aguardando_pagamento' THEN 'Aguardando Pagamento'
          WHEN d.status = 'recusado' THEN 'Recusado'
          ELSE 'Cancelado'
        END as status_pagamento
      FROM duplas d
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Filtrar por status
    if (status && status !== 'todos') {
      query += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Filtrar por categoria
    if (categoria && categoria !== 'Todas') {
      query += ` AND d.id IN (
        SELECT dc.dupla_id 
        FROM dupla_categorias dc 
        JOIN categorias c ON dc.categoria_id = c.id 
        WHERE CONCAT(c.nome, ' - ', c.sexo) = $${paramIndex}
      )`;
      params.push(categoria);
      paramIndex++;
    }
    
    // Filtrar por busca
    if (search) {
      query += ` AND (
        d.responsavel_nome ILIKE $${paramIndex} OR
        d.codigo_rastreio ILIKE $${paramIndex} OR
        d.responsavel_email ILIKE $${paramIndex} OR
        d.jogador1_nome ILIKE $${paramIndex} OR
        d.jogador2_nome ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Ordenar por data mais recente primeiro
    query += ` ORDER BY d.criado_em DESC`;
    
    const result = await pool.query(query, params);
    
    // Processar os dados
    const inscricoes = result.rows.map(row => {
      // Calcular idade dos jogadores
      const calcularIdade = (dataNascimento) => {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
          idade--;
        }
        return idade;
      };
      
      // Processar categorias
      const categoriasArray = row.categorias_string 
        ? row.categorias_string.split(', ').map(cat => {
            const match = cat.match(/^(.*?) - (.*?) \(R\$([\d.]+)\)$/);
            return match ? {
              nome: match[1],
              sexo: match[2],
              valor: parseFloat(match[3])
            } : { nome: cat, sexo: 'Não especificado', valor: 0 };
          })
        : [];
      
      // Determinar prioridade baseada no tempo de expiração
      let prioridade = 'normal';
      if (row.status === 'aguardando_pagamento' && row.expira_em) {
        const expiraEm = new Date(row.expira_em);
        const agora = new Date();
        const horasRestantes = (expiraEm - agora) / (1000 * 60 * 60);
        if (horasRestantes < 1) {
          prioridade = 'alta';
        } else if (horasRestantes < 12) {
          prioridade = 'media';
        }
      }
      
      return {
        id: row.id,
        codigo: row.codigo,
        responsavel: row.responsavel_nome,
        email: row.responsavel_email,
        telefone: row.responsavel_numero,
        jogador1: {
          nome: row.jogador1_nome,
          nascimento: row.jogador1_nascimento,
          idade: calcularIdade(row.jogador1_nascimento),
          camisa: row.jogador1_camisa,
          tamanho: 'G' // Padrão, pode ser ajustado se tiver campo no banco
        },
        jogador2: {
          nome: row.jogador2_nome,
          nascimento: row.jogador2_nascimento,
          idade: calcularIdade(row.jogador2_nascimento),
          camisa: row.jogador2_camisa,
          tamanho: 'G'
        },
        categorias: categoriasArray,
        categoria: categoriasArray.map(c => `${c.nome} - ${c.sexo}`).join(', '),
        sexos: row.sexos || '',
        valor: parseFloat(row.valor_total),
        status: row.status,
        motivoRecusa: row.motivo_recusa,
        dataInscricao: row.datainscricao,
        pagamento: row.status_pagamento,
        formaPagamento: 'PIX', // Padrão, pode ser ajustado se tiver campo no banco
        observacoes: row.pagamento_confirmado ? 'Pagamento confirmado' : 'Aguardando pagamento',
        prioridade: prioridade,
        arquivos: [], // Será populado se necessário
        documentos_enviados: 0, // Será populado se necessário
        comprovante_enviado: row.pagamento_confirmado
      };
    });
    
    return NextResponse.json({ inscricoes }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao buscar inscrições admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}