import { NextRequest, NextResponse } from 'next/server';
import XLSX from 'xlsx';
import { join } from 'path';
import { getRelatorioMensal } from '@/lib/db-operations-supabase';
import { getMovimentacoes } from '@/lib/db-operations-supabase';
import { getSaldoAnterior } from '@/lib/db-operations-supabase';
import { getCongregacaoById } from '@/lib/db-operations-supabase';
import { getMonthName } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { congregacaoId, mes, ano } = body;

    if (!congregacaoId || !mes || !ano) {
      return NextResponse.json(
        { error: 'congregacaoId, mes e ano são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar dados
    const [relatorio, movimentacoes, saldoAnterior, congregacao] = await Promise.all([
      getRelatorioMensal(congregacaoId, mes, ano),
      getMovimentacoes({ congregacaoId, mes, ano }),
      getSaldoAnterior(congregacaoId, mes, ano),
      getCongregacaoById(congregacaoId),
    ]);

    if (!congregacao) {
      return NextResponse.json(
        { error: 'Congregação não encontrada' },
        { status: 404 }
      );
    }

    // Ler o arquivo template
    const templatePath = join(process.cwd(), 'Modelo das congregações 2025 (2) (1).xlsx');
    let workbook;
    
    try {
      workbook = XLSX.readFile(templatePath, { cellStyles: true });
    } catch (error) {
      // Se não conseguir ler com estilos, tentar sem
      workbook = XLSX.readFile(templatePath);
    }

    // Pegar a primeira planilha (sheet)
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Converter para JSON para manipular os dados
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

    // Encontrar onde estão os dados no template e substituir
    // Assumindo que o template tem uma estrutura específica
    // Vamos procurar por padrões e substituir

    const mesNome = getMonthName(mes);
    let saldoAcumulado = saldoAnterior;

    // Procurar e substituir cabeçalhos e dados
    // Vamos criar uma nova planilha baseada no template mas com os dados atualizados
    const newData: any[][] = [];

    // Processar cada linha do template
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const newRow: any[] = [];

      // Se a linha contém informações que precisam ser substituídas
      if (Array.isArray(row) && row.length > 0) {
        const firstCell = String(row[0] || '').toUpperCase();

        // Substituir informações do cabeçalho
        if (firstCell.includes('CONGREGAÇÃO') || firstCell.includes('CONGREGACAO')) {
          newRow.push(`Congregação: ${congregacao.name}`);
          for (let j = 1; j < row.length; j++) {
            newRow.push(row[j]);
          }
        } else if (firstCell.includes('MOVIMENTAÇÃO') || firstCell.includes('MOVIMENTACAO')) {
          newRow.push(`MOVIMENTAÇÃO DO CAIXA - ${mesNome} de ${ano}`);
          for (let j = 1; j < row.length; j++) {
            newRow.push(row[j]);
          }
        } else if (firstCell === 'SALDO ANTERIOR' || firstCell.includes('SALDO ANTERIOR')) {
          // Linha de saldo anterior
          newRow.push('SALDO ANTERIOR');
          for (let j = 1; j < 7; j++) {
            newRow.push('');
          }
          newRow.push(saldoAnterior);
        } else if (firstCell === 'TOTAIS' || firstCell.includes('TOTAIS')) {
          // Linha de totais
          newRow.push('TOTAIS');
          newRow.push('');
          newRow.push(relatorio.totalDizimo);
          newRow.push(relatorio.totalOfertas);
          newRow.push(relatorio.totalOutros);
          newRow.push(relatorio.totalEntradas);
          newRow.push(relatorio.totalSaidas);
          newRow.push(relatorio.saldoFinal);
        } else if (firstCell.includes('TOTAL A SER RECOLHIDO')) {
          // Linha de total a ser recolhido
          newRow.push(`TOTAL A SER RECOLHIDO NA TESOURARIA DA SEDE: ${relatorio.saldoFinal.toFixed(2)}`);
          for (let j = 1; j < row.length; j++) {
            newRow.push(row[j]);
          }
        } else if (typeof row[0] === 'number' && row[0] >= 1 && row[0] <= 31) {
          // Linha de movimentação (dia entre 1 e 31)
          // Verificar se essa linha corresponde a uma movimentação real
          const dia = row[0];
          const mov = movimentacoes.find(m => m.dia === dia);
          
          if (mov) {
            newRow.push(mov.dia);
            newRow.push(mov.descricao);
            
            if (mov.tipo === 'entrada') {
              newRow.push(mov.categoriaEntrada === 'dizimo' ? mov.valor : '');
              newRow.push(mov.categoriaEntrada === 'ofertas' ? mov.valor : '');
              newRow.push(mov.categoriaEntrada === 'outros' ? mov.valor : '');
              newRow.push(mov.valor);
              newRow.push('');
              saldoAcumulado += mov.valor;
            } else {
              newRow.push('');
              newRow.push('');
              newRow.push('');
              newRow.push('');
              newRow.push(mov.valor);
              saldoAcumulado -= mov.valor;
            }
            
            newRow.push(saldoAcumulado);
          } else {
            // Manter linha vazia do template
            newRow.push(...row);
          }
        } else {
          // Manter linha original do template
          newRow.push(...row);
        }
      } else {
        newRow.push(...row);
      }

      newData.push(newRow);
    }

    // Inserir movimentações que não estão no template
    // Encontrar onde inserir (após saldo anterior, antes de totais)
    let saldoAnteriorIndex = -1;
    let totaisIndex = -1;

    for (let i = 0; i < newData.length; i++) {
      const firstCell = String(newData[i][0] || '').toUpperCase();
      if (firstCell.includes('SALDO ANTERIOR')) {
        saldoAnteriorIndex = i;
      }
      if (firstCell.includes('TOTAIS')) {
        totaisIndex = i;
        break;
      }
    }

    // Se encontramos onde inserir, adicionar as movimentações
    if (saldoAnteriorIndex >= 0 && totaisIndex > saldoAnteriorIndex) {
      // Resetar saldo acumulado
      saldoAcumulado = saldoAnterior;
      
      // Remover linhas antigas de movimentações (entre saldo anterior e totais)
      const movimentacoesOrdenadas = [...movimentacoes].sort((a, b) => a.dia - b.dia);
      
      // Inserir movimentações ordenadas
      const linhasMovimentacoes: any[][] = [];
      movimentacoesOrdenadas.forEach((mov) => {
        const linha: any[] = [];
        linha.push(mov.dia);
        linha.push(mov.descricao);
        
        if (mov.tipo === 'entrada') {
          linha.push(mov.categoriaEntrada === 'dizimo' ? mov.valor : '');
          linha.push(mov.categoriaEntrada === 'ofertas' ? mov.valor : '');
          linha.push(mov.categoriaEntrada === 'outros' ? mov.valor : '');
          linha.push(mov.valor);
          linha.push('');
          saldoAcumulado += mov.valor;
        } else {
          linha.push('');
          linha.push('');
          linha.push('');
          linha.push('');
          linha.push(mov.valor);
          saldoAcumulado -= mov.valor;
        }
        
        linha.push(saldoAcumulado);
        linhasMovimentacoes.push(linha);
      });

      // Reconstruir o array: cabeçalho até saldo anterior + movimentações + totais até fim
      const antesSaldoAnterior = newData.slice(0, saldoAnteriorIndex + 1);
      const depoisTotais = newData.slice(totaisIndex);
      
      // Atualizar linha de totais com saldo correto
      if (depoisTotais.length > 0 && depoisTotais[0][0] === 'TOTAIS') {
        depoisTotais[0][7] = saldoAcumulado; // Atualizar saldo final
      }

      newData.length = 0;
      newData.push(...antesSaldoAnterior);
      newData.push(...linhasMovimentacoes);
      newData.push(...depoisTotais);
    }

    // Criar nova planilha com os dados atualizados
    const newWorksheet = XLSX.utils.aoa_to_sheet(newData);

    // Copiar formatação do template original
    // Manter larguras de colunas do template
    if (worksheet['!cols']) {
      newWorksheet['!cols'] = worksheet['!cols'];
    }

    // Copiar ranges mesclados (merged cells) se existirem
    if (worksheet['!merges']) {
      newWorksheet['!merges'] = worksheet['!merges'];
    }

    // Tentar copiar estilos básicos das células do template
    // A biblioteca xlsx tem limitações, mas podemos tentar preservar o máximo possível
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const newRange = XLSX.utils.decode_range(newWorksheet['!ref'] || 'A1');
    
    // Copiar propriedades de células que existem em ambos
    for (let R = range.s.r; R <= Math.min(range.e.r, newRange.e.r); ++R) {
      for (let C = range.s.c; C <= Math.min(range.e.c, newRange.e.c); ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const templateCell = worksheet[cellAddress];
        const newCell = newWorksheet[cellAddress];
        
        if (templateCell && newCell) {
          // Copiar propriedades de formatação se existirem
          if (templateCell.s) {
            newCell.s = templateCell.s;
          }
          if (templateCell.z && !newCell.z) {
            newCell.z = templateCell.z;
          }
        }
      }
    }

    // Criar novo workbook baseado no template para preservar metadados
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
    
    // Copiar propriedades do workbook original se existirem
    if (workbook.Props) {
      newWorkbook.Props = workbook.Props;
    }

    // Converter para buffer
    const buffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });

    // Retornar arquivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Movimentacao_${congregacao.name.replace(/\s+/g, '_')}_${mesNome}_${ano}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao exportar XLSX:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar XLSX', details: error.message },
      { status: 500 }
    );
  }
}

