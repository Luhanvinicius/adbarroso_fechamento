import * as XLSX from 'xlsx';
import { formatCurrency, getMonthName } from './utils';

interface Movimentacao {
  dia: number;
  descricao: string;
  tipo: 'entrada' | 'saida';
  categoriaEntrada?: 'dizimo' | 'ofertas' | 'outros';
  valor: number;
}

interface Relatorio {
  mes: number;
  ano: number;
  saldoAnterior: number;
  totalDizimo: number;
  totalOfertas: number;
  totalOutros: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
}

export function exportarParaCSV(
  relatorio: Relatorio,
  movimentacoes: Movimentacao[],
  congregacaoNome: string
): void {
  const mesNome = getMonthName(relatorio.mes);
  const linhas: string[] = [];

  // Cabeçalho
  linhas.push('Assembleia de Deus Ministério de Madureira');
  linhas.push('Campo do Barroso II');
  linhas.push(`MOVIMENTAÇÃO DO CAIXA - ${mesNome} de ${relatorio.ano}`);
  linhas.push(`Congregação: ${congregacaoNome}`);
  linhas.push('');

  // Cabeçalho da tabela
  linhas.push('DIA;DESCRIÇÃO;DÍZIMO;OFERTAS;OUTROS;TOTAL ENTRADA;SAÍDAS;SALDO');

  // Saldo Anterior
  let saldoAcumulado = relatorio.saldoAnterior;
  linhas.push(`SALDO ANTERIOR;;;;;;;${formatCurrency(saldoAcumulado).replace('R$', '').trim()}`);

  // Movimentações
  movimentacoes.forEach((mov) => {
    const dia = mov.dia.toString();
    const descricao = mov.descricao.replace(/;/g, ',');
    const dizimo = mov.tipo === 'entrada' && mov.categoriaEntrada === 'dizimo' 
      ? mov.valor.toFixed(2).replace('.', ',') 
      : '';
    const ofertas = mov.tipo === 'entrada' && mov.categoriaEntrada === 'ofertas' 
      ? mov.valor.toFixed(2).replace('.', ',') 
      : '';
    const outros = mov.tipo === 'entrada' && mov.categoriaEntrada === 'outros' 
      ? mov.valor.toFixed(2).replace('.', ',') 
      : '';
    const totalEntrada = mov.tipo === 'entrada' 
      ? mov.valor.toFixed(2).replace('.', ',') 
      : '';
    const saidas = mov.tipo === 'saida' 
      ? mov.valor.toFixed(2).replace('.', ',') 
      : '';

    if (mov.tipo === 'entrada') {
      saldoAcumulado += mov.valor;
    } else {
      saldoAcumulado -= mov.valor;
    }

    const saldo = saldoAcumulado.toFixed(2).replace('.', ',');

    linhas.push(`${dia};${descricao};${dizimo};${ofertas};${outros};${totalEntrada};${saidas};${saldo}`);
  });

  // Totais
  linhas.push(`TOTAIS;;${relatorio.totalDizimo.toFixed(2).replace('.', ',')};${relatorio.totalOfertas.toFixed(2).replace('.', ',')};${relatorio.totalOutros.toFixed(2).replace('.', ',')};${relatorio.totalEntradas.toFixed(2).replace('.', ',')};${relatorio.totalSaidas.toFixed(2).replace('.', ',')};${relatorio.saldoFinal.toFixed(2).replace('.', ',')}`);
  linhas.push('');
  linhas.push(`TOTAL A SER RECOLHIDO NA TESOURARIA DA SEDE: ${relatorio.saldoFinal.toFixed(2).replace('.', ',')}`);

  // Criar arquivo
  const csvContent = linhas.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  const nomeArquivo = `Movimentacao_${congregacaoNome.replace(/\s+/g, '_')}_${mesNome}_${relatorio.ano}.csv`;
  link.setAttribute('download', nomeArquivo);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportarParaXLSX(
  relatorio: Relatorio,
  movimentacoes: Movimentacao[],
  congregacaoNome: string,
  congregacaoId?: string
): Promise<void> {
  // Se temos congregacaoId, usar a API route que usa o template
  if (congregacaoId) {
    try {
      const response = await fetch('/api/exportar-xlsx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          congregacaoId,
          mes: relatorio.mes,
          ano: relatorio.ano,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar XLSX');
      }

      // Baixar o arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const mesNome = getMonthName(relatorio.mes);
      link.download = `Movimentacao_${congregacaoNome.replace(/\s+/g, '_')}_${mesNome}_${relatorio.ano}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    } catch (error) {
      console.error('Erro ao exportar usando template:', error);
      // Fallback para método antigo se houver erro
    }
  }

  // Método antigo (fallback)
  const mesNome = getMonthName(relatorio.mes);
  const workbook = XLSX.utils.book_new();

  // Preparar dados da tabela
  const dados: any[][] = [];

  // Cabeçalho
  dados.push(['Assembleia de Deus Ministério de Madureira']);
  dados.push(['Campo do Barroso II']);
  dados.push([`MOVIMENTAÇÃO DO CAIXA - ${mesNome} de ${relatorio.ano}`]);
  dados.push([`Congregação: ${congregacaoNome}`]);
  dados.push([]);

  // Cabeçalho da tabela
  dados.push(['DIA', 'DESCRIÇÃO', 'DÍZIMO', 'OFERTAS', 'OUTROS', 'TOTAL ENTRADA', 'SAÍDAS', 'SALDO']);

  // Saldo Anterior
  let saldoAcumulado = relatorio.saldoAnterior;
  dados.push(['SALDO ANTERIOR', '', '', '', '', '', '', relatorio.saldoAnterior]);

  // Movimentações
  movimentacoes.forEach((mov) => {
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
    dados.push(linha);
  });

  // Totais
  dados.push([
    'TOTAIS',
    '',
    relatorio.totalDizimo,
    relatorio.totalOfertas,
    relatorio.totalOutros,
    relatorio.totalEntradas,
    relatorio.totalSaidas,
    relatorio.saldoFinal
  ]);

  dados.push([]);
  dados.push([`TOTAL A SER RECOLHIDO NA TESOURARIA DA SEDE: ${relatorio.saldoFinal.toFixed(2)}`]);

  // Criar worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(dados);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 8 },  // DIA
    { wch: 50 }, // DESCRIÇÃO
    { wch: 12 }, // DÍZIMO
    { wch: 12 }, // OFERTAS
    { wch: 12 }, // OUTROS
    { wch: 15 }, // TOTAL ENTRADA
    { wch: 12 }, // SAÍDAS
    { wch: 15 }, // SALDO
  ];
  worksheet['!cols'] = colWidths;

  // Formatar células de valores monetários
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Formatar saldo anterior e totais
  for (let row = 5; row <= range.e.r; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 7 }); // Coluna SALDO (H)
    if (!worksheet[cellAddress]) continue;
    
    if (row === 5) { // Saldo Anterior
      worksheet[cellAddress].z = '#,##0.00';
    } else if (row === range.e.r - 1) { // Totais
      worksheet[cellAddress].z = '#,##0.00';
    } else if (worksheet[cellAddress].v !== undefined && typeof worksheet[cellAddress].v === 'number') {
      worksheet[cellAddress].z = '#,##0.00';
    }
  }

  // Formatar colunas de valores
  for (let col = 2; col <= 7; col++) {
    for (let row = 6; row < range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellAddress] && typeof worksheet[cellAddress].v === 'number') {
        worksheet[cellAddress].z = '#,##0.00';
      }
    }
  }

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimentação');

  // Baixar arquivo
  const nomeArquivo = `Movimentacao_${congregacaoNome.replace(/\s+/g, '_')}_${mesNome}_${relatorio.ano}.xlsx`;
  XLSX.writeFile(workbook, nomeArquivo);
}

