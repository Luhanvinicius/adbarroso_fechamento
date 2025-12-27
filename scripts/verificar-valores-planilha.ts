// Script para verificar e corrigir valores conforme a planilha
// Execute: npx tsx scripts/verificar-valores-planilha.ts

// Carregar variáveis de ambiente
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (key && cleanValue) {
          process.env[key] = cleanValue;
        }
      }
    }
  });
  console.log('✅ Variáveis de ambiente carregadas\n');
} else {
  console.error('❌ Arquivo .env.local não encontrado!');
  process.exit(1);
}

import { supabaseAdmin } from '../lib/supabase';

async function verificarValores() {
  try {
    console.log('🔍 Verificando valores conforme a planilha...\n');

    // Buscar ID da congregação Pici
    const { data: pici } = await supabaseAdmin
      .from('congregacoes')
      .select('id, name')
      .ilike('name', 'Pici')
      .maybeSingle();

    if (!pici) {
      console.error('❌ Congregação Pici não encontrada!');
      return;
    }

    // Buscar todas as movimentações de Nov/2025 da Pici
    const { data: movimentacoes } = await supabaseAdmin
      .from('movimentacoes')
      .select('*')
      .eq('congregacao_id', pici.id)
      .eq('mes', 11)
      .eq('ano', 2025)
      .order('dia', { ascending: true })
      .order('created_at', { ascending: true });

    if (!movimentacoes || movimentacoes.length === 0) {
      console.log('❌ Nenhuma movimentação encontrada!');
      return;
    }

    console.log(`📊 Total de movimentações encontradas: ${movimentacoes.length}\n`);

    // Calcular totais
    let totalDizimo = 0;
    let totalOfertas = 0;
    let totalOutros = 0;
    let totalEntradas = 0;
    let totalSaidas = 0;

    console.log('📋 Movimentações por dia:\n');
    movimentacoes.forEach(mov => {
      if (mov.tipo === 'entrada') {
        totalEntradas += parseFloat(mov.valor);
        if (mov.categoria_entrada === 'dizimo') {
          totalDizimo += parseFloat(mov.valor);
        } else if (mov.categoria_entrada === 'ofertas') {
          totalOfertas += parseFloat(mov.valor);
        } else if (mov.categoria_entrada === 'outros') {
          totalOutros += parseFloat(mov.valor);
        }
      } else {
        totalSaidas += parseFloat(mov.valor);
      }
      
      console.log(`  Dia ${mov.dia}: ${mov.descricao.substring(0, 60)} - R$ ${parseFloat(mov.valor).toFixed(2)}`);
    });

    console.log('\n📊 TOTAIS CALCULADOS:');
    console.log(`  Dízimo: R$ ${totalDizimo.toFixed(2)}`);
    console.log(`  Ofertas: R$ ${totalOfertas.toFixed(2)}`);
    console.log(`  Outros: R$ ${totalOutros.toFixed(2)}`);
    console.log(`  Total Entradas: R$ ${totalEntradas.toFixed(2)}`);
    console.log(`  Total Saídas: R$ ${totalSaidas.toFixed(2)}`);
    console.log(`  Saldo Final: R$ ${(totalEntradas - totalSaidas).toFixed(2)}`);

    console.log('\n📊 VALORES ESPERADOS DA PLANILHA:');
    console.log(`  Dízimo: R$ 590,00`);
    console.log(`  Ofertas: R$ 111,50`);
    console.log(`  Outros: R$ 0,00`);
    console.log(`  Total Entradas: R$ 701,50`);
    console.log(`  Total Saídas: R$ 92,41`);
    console.log(`  Saldo Final: R$ 609,09`);

    console.log('\n🔍 DIFERENÇAS:');
    console.log(`  Dízimo: ${totalDizimo.toFixed(2)} vs 590,00 = ${(totalDizimo - 590).toFixed(2)}`);
    console.log(`  Ofertas: ${totalOfertas.toFixed(2)} vs 111,50 = ${(totalOfertas - 111.50).toFixed(2)}`);
    console.log(`  Total Entradas: ${totalEntradas.toFixed(2)} vs 701,50 = ${(totalEntradas - 701.50).toFixed(2)}`);

    // Verificar quais movimentações estão faltando
    const movimentacoesEsperadas = [
      { dia: 2, descricao: 'Rec. Culto de adoração - Oferta de 3,00 reais', tipo: 'entrada', categoria: 'ofertas', valor: 3.00 },
      { dia: 5, descricao: 'Rec. Culto da Vitoria - Dizimo Levi - 100 reais', tipo: 'entrada', categoria: 'dizimo', valor: 100.00 },
      { dia: 5, descricao: 'Rec. Culto da Vitoria - Dizimo Samuel- 100 reais', tipo: 'entrada', categoria: 'dizimo', valor: 100.00 },
      { dia: 5, descricao: 'Rec. Culto da Vitoria - Ofertas 4,00 reais', tipo: 'entrada', categoria: 'ofertas', valor: 4.00 },
      { dia: 7, descricao: 'Rec. Culto de Doutrina - Ofertas 7,00 Reais', tipo: 'entrada', categoria: 'ofertas', valor: 7.00 },
      { dia: 12, descricao: 'Rec. Culto da vitoria- Oferta de 4,50 reais', tipo: 'entrada', categoria: 'ofertas', valor: 4.50 },
      { dia: 14, descricao: 'Rec. Culto de Santa Ceia - Oferas 16,00 reais', tipo: 'entrada', categoria: 'ofertas', valor: 16.00 },
      { dia: 16, descricao: 'Rec. Culto de adoração - Ofertas 12,00 reais', tipo: 'entrada', categoria: 'ofertas', valor: 12.00 },
      { dia: 16, descricao: 'Rec. Culto de adoração- Dizimo Levi - 50 reais', tipo: 'entrada', categoria: 'dizimo', valor: 50.00 },
      { dia: 16, descricao: 'Rec. Culto de adoração- Dizimo Samuel- 50 reais', tipo: 'entrada', categoria: 'dizimo', valor: 50.00 },
      { dia: 19, descricao: 'Rec. Culto da vitoria- Oferta de 7,00 reais', tipo: 'entrada', categoria: 'ofertas', valor: 7.00 },
      { dia: 20, descricao: 'Pg. Pagamento Agua - 52,89', tipo: 'saida', categoria: null, valor: 52.89 },
      { dia: 21, descricao: 'Rec. Culto de Doutrina - Ofertas 9,00 Reais', tipo: 'entrada', categoria: 'ofertas', valor: 9.00 },
      { dia: 23, descricao: 'Rec. Culto de adoração- Ofertas 31,00 reais', tipo: 'entrada', categoria: 'ofertas', valor: 31.00 },
      { dia: 26, descricao: 'Rec. Culto da Vitoria- dizimo aurineide 50,00', tipo: 'entrada', categoria: 'dizimo', valor: 50.00 },
      { dia: 26, descricao: 'Rec. Culto da Vitoria- Ofertas 12,00', tipo: 'entrada', categoria: 'ofertas', valor: 12.00 },
      { dia: 28, descricao: 'Rec. Culto de Doutrina - Ofertas 3,00 Reais', tipo: 'entrada', categoria: 'ofertas', valor: 3.00 },
      { dia: 30, descricao: 'Rec. Culto de Doutrina - Ofertas 16,00 Reais', tipo: 'entrada', categoria: 'ofertas', valor: 16.00 },
      { dia: 30, descricao: 'Pg. compra de 4 garrafão de agua - 11 reais', tipo: 'saida', categoria: null, valor: 11.00 },
      { dia: 30, descricao: 'Pg. pagamento conta de Luz - 28,52', tipo: 'saida', categoria: null, valor: 28.52 },
      { dia: 30, descricao: 'Rec. Culto de Doutrina - Dizimo Pr Junior- 140 reais', tipo: 'entrada', categoria: 'dizimo', valor: 140.00 },
      { dia: 30, descricao: 'Rec. Culto de Doutrina - Dizimo Robson - 100 reais', tipo: 'entrada', categoria: 'dizimo', valor: 100.00 },
    ];

    console.log('\n🔍 Verificando movimentações faltantes...\n');
    const movimentacoesEncontradas = movimentacoes.map(m => ({
      dia: m.dia,
      descricao: m.descricao.toLowerCase(),
      tipo: m.tipo,
      categoria: m.categoria_entrada,
      valor: parseFloat(m.valor),
    }));

    const faltantes: typeof movimentacoesEsperadas = [];
    for (const esperada of movimentacoesEsperadas) {
      const encontrada = movimentacoesEncontradas.find(
        m => m.dia === esperada.dia &&
        m.descricao.includes(esperada.descricao.substring(0, 30).toLowerCase()) &&
        Math.abs(m.valor - esperada.valor) < 0.01
      );
      
      if (!encontrada) {
        faltantes.push(esperada);
        console.log(`  ❌ FALTANDO: Dia ${esperada.dia} - ${esperada.descricao} - R$ ${esperada.valor.toFixed(2)}`);
      }
    }

    if (faltantes.length === 0) {
      console.log('  ✅ Todas as movimentações esperadas estão presentes!');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

verificarValores();

