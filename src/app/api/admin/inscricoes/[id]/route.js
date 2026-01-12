import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, motivo_recusa } = body;
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }
    
    // Validar status permitidos
    const statusPermitidos = ['pendente', 'confirmado', 'recusado', 'cancelado'];
    if (!statusPermitidos.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }
    
    // Se for recusado, motivo é obrigatório
    if (status === 'recusado' && (!motivo_recusa || motivo_recusa.trim() === '')) {
      return NextResponse.json(
        { error: 'Motivo da recusa é obrigatório' },
        { status: 400 }
      );
    }
    
    let query;
    let paramsArray;
    
    if (status === 'recusado') {
      query = `
        UPDATE duplas 
        SET 
          status = $1,
          motivo_recusa = $2,
          atualizado_em = NOW()
        WHERE id = $3
        RETURNING *
      `;
      paramsArray = [status, motivo_recusa, id];
    } else {
      query = `
        UPDATE duplas 
        SET 
          status = $1,
          motivo_recusa = NULL,
          atualizado_em = NOW()
        WHERE id = $2
        RETURNING *
      `;
      paramsArray = [status, id];
    }
    
    const result = await pool.query(query, paramsArray);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Inscrição ${status === 'confirmado' ? 'confirmada' : status} com sucesso`,
      dupla: result.rows[0]
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao atualizar status da inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET para buscar detalhes específicos da inscrição para admin
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const query = `
      SELECT 
        d.*,
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', c.id,
              'nome', c.nome,
              'sexo', c.sexo,
              'idade_min', c.idade_min,
              'idade_max', c.idade_max,
              'valor', c.valor
            )
          )
          FROM dupla_categorias dc
          JOIN categorias c ON dc.categoria_id = c.id
          WHERE dc.dupla_id = d.id
        ) as categorias,
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'tipo', a.tipo,
              'blob_url', a.blob_url,
              'criado_em', a.criado_em
            )
          )
          FROM arquivos a
          WHERE a.dupla_id = d.id
        ) as arquivos
      FROM duplas d
      WHERE d.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }
    
    const dupla = result.rows[0];
    
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
    
    const response = {
      dupla: {
        id: dupla.id,
        codigo: dupla.codigo_rastreio,
        responsavel_nome: dupla.responsavel_nome,
        responsavel_email: dupla.responsavel_email,
        responsavel_numero: dupla.responsavel_numero,
        jogador1_nome: dupla.jogador1_nome,
        jogador1_nascimento: dupla.jogador1_nascimento,
        jogador1_idade: calcularIdade(dupla.jogador1_nascimento),
        jogador1_camisa: dupla.jogador1_camisa,
        jogador2_nome: dupla.jogador2_nome,
        jogador2_nascimento: dupla.jogador2_nascimento,
        jogador2_idade: calcularIdade(dupla.jogador2_nascimento),
        jogador2_camisa: dupla.jogador2_camisa,
        categorias: dupla.categorias || [],
        valor_total: parseFloat(dupla.valor_total),
        status: dupla.status,
        motivo_recusa: dupla.motivo_recusa,
        criado_em: dupla.criado_em,
        expira_em: dupla.expira_em,
        atualizado_em: dupla.atualizado_em,
        arquivos: dupla.arquivos || [],
        pagamento_confirmado: dupla.arquivos && dupla.arquivos.some(a => a.tipo === 'comprovante')
      }
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao buscar detalhes da inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}