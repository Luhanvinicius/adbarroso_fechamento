// Script para garantir que todas as movimentações de Nov/2025 estejam vinculadas à Pici
// Execute: npx tsx scripts/garantir-dados-pici.ts

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
import bcrypt from 'bcryptjs';

async function garantirDadosPici() {
  try {
    console.log('🔧 Garantindo que todas as movimentações de Nov/2025 estejam em Pici...\n');

    // Buscar ID da congregação Pici
    const { data: pici, error: errorPici } = await supabaseAdmin
      .from('congregacoes')
      .select('id, name')
      .ilike('name', 'Pici')
      .maybeSingle();

    if (errorPici || !pici) {
      console.error('❌ Erro ao buscar congregação Pici:', errorPici);
      return;
    }

    console.log(`✅ Congregação Pici encontrada: ${pici.id}\n`);

    // Buscar usuário Pr. Júnior ou criar um usuário admin para as movimentações
    let userId: string;
    const { data: usuario } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('email', 'prjunior@adbarroso.com')
      .maybeSingle();

    if (usuario) {
      userId = usuario.id;
      console.log(`✅ Usuário encontrado: ${userId}\n`);
    } else {
      // Criar usuário temporário se não existir
      const { data: adminUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .ilike('email', 'admin@adbarroso.com')
        .maybeSingle();
      
      if (adminUser) {
        userId = adminUser.id;
        console.log(`✅ Usando usuário admin: ${userId}\n`);
      } else {
        console.error('❌ Nenhum usuário encontrado!');
        return;
      }
    }

    // Buscar TODAS as movimentações de Nov/2025
    const { data: todasMovimentacoes, error: errorMov } = await supabaseAdmin
      .from('movimentacoes')
      .select('id, dia, descricao, congregacao_id')
      .eq('mes', 11)
      .eq('ano', 2025);

    if (errorMov) {
      console.error('❌ Erro ao buscar movimentações:', errorMov);
      return;
    }

    console.log(`📊 Encontradas ${todasMovimentacoes?.length || 0} movimentações de Nov/2025\n`);

    // Atualizar TODAS para Pici
    if (todasMovimentacoes && todasMovimentacoes.length > 0) {
      const idsParaAtualizar = todasMovimentacoes
        .filter(m => m.congregacao_id !== pici.id)
        .map(m => m.id);

      if (idsParaAtualizar.length > 0) {
        console.log(`🔄 Atualizando ${idsParaAtualizar.length} movimentações para Pici...`);
        const { error: updateError } = await supabaseAdmin
          .from('movimentacoes')
          .update({ congregacao_id: pici.id })
          .in('id', idsParaAtualizar);

        if (updateError) {
          console.error('❌ Erro ao atualizar movimentações:', updateError);
          return;
        }

        console.log(`✅ ${idsParaAtualizar.length} movimentações atualizadas para Pici!\n`);
      } else {
        console.log('✅ Todas as movimentações já estão vinculadas à Pici!\n');
      }
    }

    // Agora inserir todas as movimentações que estão faltando
    console.log('📝 Inserindo movimentações completas de Novembro/2025...\n');

    const movimentacoesCompletas = [
      // Dia 2
      { dia: 2, descricao: 'Rec. Culto de adoração - Oferta de 3,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 3.00 },
      
      // Dia 5
      { dia: 5, descricao: 'Rec. Culto da Vitoria - Dizimo Levi - 100 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 100.00 },
      { dia: 5, descricao: 'Rec. Culto da Vitoria - Dizimo Samuel- 100 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 100.00 },
      { dia: 5, descricao: 'Rec. Culto da Vitoria - Ofertas 4,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 4.00 },
      
      // Dia 7
      { dia: 7, descricao: 'Rec. Culto de Doutrina - Ofertas 7,00 Reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 7.00 },
      
      // Dia 12
      { dia: 12, descricao: 'Rec. Culto da vitoria- Oferta de 4,50 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 4.50 },
      
      // Dia 14
      { dia: 14, descricao: 'Rec. Culto de Santa Ceia - Oferas 16,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 16.00 },
      
      // Dia 16
      { dia: 16, descricao: 'Rec. Culto de adoração - Ofertas 12,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 12.00 },
      { dia: 16, descricao: 'Rec. Culto de adoração- Dizimo Levi - 50 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 50.00 },
      { dia: 16, descricao: 'Rec. Culto de adoração- Dizimo Samuel- 50 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 50.00 },
      
      // Dia 19
      { dia: 19, descricao: 'Rec. Culto da vitoria- Oferta de 7,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 7.00 },
      
      // Dia 20
      { dia: 20, descricao: 'Pg. Pagamento Agua - 52,89', tipo: 'saida', categoria_entrada: null, valor: 52.89 },
      
      // Dia 21
      { dia: 21, descricao: 'Rec. Culto de Doutrina - Ofertas 9,00 Reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 9.00 },
      
      // Dia 23
      { dia: 23, descricao: 'Rec. Culto de adoração- Ofertas 31,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 31.00 },
      
      // Dia 26
      { dia: 26, descricao: 'Rec. Culto da Vitoria- dizimo aurineide 50,00', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 50.00 },
      { dia: 26, descricao: 'Rec. Culto da Vitoria- Ofertas 12,00', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 12.00 },
      
      // Dia 28
      { dia: 28, descricao: 'Rec. Culto de Doutrina - Ofertas 3,00 Reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 3.00 },
      
      // Dia 30
      { dia: 30, descricao: 'Rec. Culto de Doutrina - Ofertas 16,00 Reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 16.00 },
      { dia: 30, descricao: 'Pg. compra de 4 garrafão de agua - 11 reais', tipo: 'saida', categoria_entrada: null, valor: 11.00 },
      { dia: 30, descricao: 'Pg. pagamento conta de Luz - 28,52', tipo: 'saida', categoria_entrada: null, valor: 28.52 },
      { dia: 30, descricao: 'Rec. Culto de Doutrina - Dizimo Pr Junior- 140 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 140.00 },
      { dia: 30, descricao: 'Rec. Culto de Doutrina - Dizimo Robson - 100 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 100.00 },
    ];

    // Verificar quais já existem e inserir apenas as que faltam
    const movimentacoesExistentes = todasMovimentacoes || [];
    
    for (const mov of movimentacoesCompletas) {
      // Verificar se já existe uma movimentação com mesma descrição, dia, mês e ano
      const existe = movimentacoesExistentes.some(
        m => m.dia === mov.dia && 
        m.descricao.toLowerCase().includes(mov.descricao.substring(0, 20).toLowerCase())
      );

      if (!existe) {
        try {
          const { error: insertError } = await supabaseAdmin
            .from('movimentacoes')
            .insert({
              dia: mov.dia,
              mes: 11,
              ano: 2025,
              descricao: mov.descricao,
              tipo: mov.tipo,
              categoria_entrada: mov.categoria_entrada,
              valor: mov.valor,
              congregacao_id: pici.id,
              user_id: userId,
            });

          if (insertError) {
            console.error(`⚠️  Erro ao inserir movimentação dia ${mov.dia}:`, insertError.message);
          } else {
            console.log(`✅ Inserida: Dia ${mov.dia} - ${mov.descricao.substring(0, 50)}...`);
          }
        } catch (err: any) {
          console.error(`⚠️  Erro ao inserir movimentação dia ${mov.dia}:`, err.message);
        }
      } else {
        console.log(`⏭️  Já existe: Dia ${mov.dia} - ${mov.descricao.substring(0, 50)}...`);
      }
    }

    // Verificar resultado final
    const { data: movimentacoesFinais } = await supabaseAdmin
      .from('movimentacoes')
      .select('id, dia, descricao, congregacao_id')
      .eq('mes', 11)
      .eq('ano', 2025)
      .eq('congregacao_id', pici.id);

    console.log(`\n✅ Processo concluído!`);
    console.log(`📊 Total de movimentações de Nov/2025 vinculadas à Pici: ${movimentacoesFinais?.length || 0}\n`);

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

garantirDadosPici();


