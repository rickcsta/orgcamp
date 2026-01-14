import { NextResponse } from 'next/server';
import pool from '@/lib/db';


// Função para gerar código de 6 dígitos
function gerarCodigo6Digitos() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  const mesNascimento = nascimento.getMonth();
  const diaNascimento = nascimento.getDate();
  
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
    idade--;
  }
  
  return idade;
}

function validarIdadeParaCategoria(idade, categoria) {
  if (categoria.nome === 'Open') return true;
  if (categoria.idade_max === null) return true;
  return idade <= categoria.idade_max;
}

export async function POST(request) {
  try {
    console.log('=== CRIANDO INSCRIÇÃO ===');
    
    const data = await request.json();
    console.log('Dados recebidos:', data);

    // Validação
    const errors = [];
    
    if (!data.responsavel_nome?.trim()) errors.push('Nome do responsável é obrigatório');
    if (!data.responsavel_email?.trim()) errors.push('Email do responsável é obrigatório');
    if (!data.responsavel_numero?.trim()) errors.push('Número do responsável é obrigatório');
    if (!data.jogador1_nome?.trim()) errors.push('Nome do jogador 1 é obrigatório');
    if (!data.jogador1_nascimento) errors.push('Data de nascimento do jogador 1 é obrigatória');
    if (!data.jogador1_camisa) errors.push('Tamanho da camisa do jogador 1 é obrigatório');
    if (!data.jogador2_nome?.trim()) errors.push('Nome do jogador 2 é obrigatório');
    if (!data.jogador2_nascimento) errors.push('Data de nascimento do jogador 2 é obrigatória');
    if (!data.jogador2_camisa) errors.push('Tamanho da camisa do jogador 2 é obrigatório');
    
    if (!data.categorias || !Array.isArray(data.categorias) || data.categorias.length === 0) {
      errors.push('Selecione pelo menos uma categoria');
    }

    if (errors.length > 0) {
      console.error('Erros de validação:', errors);
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Validar idade das categorias
    const idadeJogador1 = calcularIdade(data.jogador1_nascimento);
    const idadeJogador2 = calcularIdade(data.jogador2_nascimento);
    
    const categoriasQuery = await pool.query(
      'SELECT * FROM categorias WHERE id = ANY($1)',
      [data.categorias.map(id => parseInt(id))]
    );
    
    const categoriasInvalidas = [];
    for (const categoria of categoriasQuery.rows) {
      if (!validarIdadeParaCategoria(idadeJogador1, categoria)) {
        categoriasInvalidas.push(`${categoria.nome} ${categoria.sexo}: Jogador 1 não atende faixa etária (idade: ${idadeJogador1}, máximo: ${categoria.idade_max})`);
      }
      if (!validarIdadeParaCategoria(idadeJogador2, categoria)) {
        categoriasInvalidas.push(`${categoria.nome} ${categoria.sexo}: Jogador 2 não atende faixa etária (idade: ${idadeJogador2}, máximo: ${categoria.idade_max})`);
      }
    }
    
    if (categoriasInvalidas.length > 0) {
      console.error('Erros de idade:', categoriasInvalidas);
      return NextResponse.json({ 
        error: 'Problemas com faixa etária',
        details: categoriasInvalidas 
      }, { status: 400 });
    }

    // Verificar vagas disponíveis
    for (const categoriaId of data.categorias) {
      const vagaResult = await pool.query(`
        SELECT 
          c.limite_duplas,
          COUNT(DISTINCT CASE WHEN d.status IN ('confirmado', 'pendente', 'aguardando_pagamento') THEN dc.dupla_id END) as ocupadas
        FROM categorias c
        LEFT JOIN dupla_categorias dc ON c.id = dc.categoria_id
        LEFT JOIN duplas d ON dc.dupla_id = d.id
        WHERE c.id = $1
        GROUP BY c.id
      `, [parseInt(categoriaId)]);
      
      const vaga = vagaResult.rows[0];
      if (vaga?.ocupadas >= vaga?.limite_duplas) {
        const cat = categoriasQuery.rows.find(c => c.id === parseInt(categoriaId));
        console.error('Categoria sem vagas:', cat?.nome, cat?.sexo);
        return NextResponse.json(
          { error: `Categoria ${cat?.nome} ${cat?.sexo} está sem vagas disponíveis` },
          { status: 400 }
        );
      }
    }

    // Calcular valor total
    let valorTotal = 0;
    for (const categoriaId of data.categorias) {
      const cat = categoriasQuery.rows.find(c => c.id === parseInt(categoriaId));
      if (cat) {
        valorTotal += parseFloat(cat.valor);
      }
    }
    
    if (data.categorias.length > 1) {
      valorTotal *= 0.9; // 10% de desconto
    }

    // Gerar código de rastreio
    const codigoRastreio = gerarCodigo6Digitos();
    console.log('Código de rastreio gerado:', codigoRastreio);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Criar dupla
      const duplaResult = await client.query(`
        INSERT INTO duplas (
          responsavel_nome, responsavel_email, responsavel_numero,
          jogador1_nome, jogador1_nascimento, jogador1_camisa,
          jogador2_nome, jogador2_nascimento, jogador2_camisa,
          valor_total, codigo_rastreio, expira_em, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() + INTERVAL '30 minutes', 'aguardando_pagamento')
        RETURNING id, codigo_rastreio, expira_em
      `, [
        data.responsavel_nome.trim(),
        data.responsavel_email.trim(),
        data.responsavel_numero.trim(),
        data.jogador1_nome.trim(),
        data.jogador1_nascimento,
        data.jogador1_camisa,
        data.jogador2_nome.trim(),
        data.jogador2_nascimento,
        data.jogador2_camisa,
        valorTotal,
        codigoRastreio
      ]);

      const duplaId = duplaResult.rows[0].id;
      console.log('Dupla criada com ID:', duplaId);

      // Vincular categorias
      for (const categoriaId of data.categorias) {
        await client.query(`
          INSERT INTO dupla_categorias (dupla_id, categoria_id)
          VALUES ($1, $2)
        `, [duplaId, parseInt(categoriaId)]);
      }

      await client.query('COMMIT');

      console.log('=== INSCRIÇÃO CRIADA COM SUCESSO ===');

      return NextResponse.json({
        success: true,
        dupla_id: duplaId,
        codigo_rastreio: duplaResult.rows[0].codigo_rastreio,
        expira_em: duplaResult.rows[0].expira_em,
        valor_total: valorTotal
      }, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro na transação:', error);
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao criar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}