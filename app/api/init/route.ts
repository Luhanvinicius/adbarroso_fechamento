import { NextResponse } from 'next/server';
import { createCongregacao, createUser, createMovimentacao } from '@/lib/db-operations-supabase';

export async function GET() {
  try {
    // PROTEÇÃO: Esta rota está desabilitada em produção para evitar perda de dados
    // Em produção (Vercel), retornar erro para evitar deletar dados existentes
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      return NextResponse.json(
        { 
          error: 'Esta rota está desabilitada em produção para proteger os dados existentes.',
          message: 'Use a rota /api/inserir-dados-pici para inserir dados sem deletar.'
        },
        { status: 403 }
      );
    }

    // Apenas em desenvolvimento: Limpar dados existentes (cuidado!)
    const { supabaseAdmin } = await import('@/lib/supabase');
    
    await supabaseAdmin.from('movimentacoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('saldos_anteriores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('congregacoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Criar congregações
    const congregacoesData = [
      { name: 'Pici', campo: 'Barroso II' },
      { name: 'Potengi', campo: 'Barroso II' },
      { name: 'Nova Assunção', campo: 'Barroso II' },
      { name: 'Novo Barroso', campo: 'Barroso II' },
      { name: 'Sede', campo: 'Barroso II' },
      { name: 'Jangurussu', campo: 'Barroso II' },
      { name: 'Vila Ema', campo: 'Barroso II' },
    ];

    const createdCongregacoes = [];
    for (const cong of congregacoesData) {
      const created = await createCongregacao(cong);
      createdCongregacoes.push(created);
    }

    // Criar usuários de exemplo
    const usersData = [
      {
        name: 'Admin Sistema',
        email: 'admin@adbarroso.com',
        password: 'admin123',
        role: 'admin' as const,
        campo: 'Barroso II',
        congregacaoId: undefined,
      },
      {
        name: 'Pr. Presidente do Campo',
        email: 'presidente@adbarroso.com',
        password: 'pres123',
        role: 'presidente_campo' as const,
        campo: 'Barroso II',
        congregacaoId: undefined,
      },
      {
        name: 'Pr. Júnior',
        email: 'prjunior@adbarroso.com',
        password: 'pr123',
        role: 'pastor' as const,
        campo: 'Barroso II',
        congregacaoId: createdCongregacoes.find(c => c.name === 'Pici')?.id,
      },
      {
        name: 'Tesoureiro Campo',
        email: 'tesoureiro@adbarroso.com',
        password: 'tes123',
        role: 'tesoureiro_campo' as const,
        campo: 'Barroso II',
        congregacaoId: undefined,
      },
      {
        name: 'Tesoureiro Pici',
        email: 'tespici@adbarroso.com',
        password: 'tes123',
        role: 'tesoureiro_congregacao' as const,
        campo: 'Barroso II',
        congregacaoId: createdCongregacoes.find(c => c.name === 'Pici')?.id,
      },
      {
        name: 'Líder Sede',
        email: 'lider@adbarroso.com',
        password: 'lider123',
        role: 'lider_congregacao' as const,
        campo: 'Barroso II',
        congregacaoId: createdCongregacoes.find(c => c.name === 'Sede')?.id,
      },
    ];

    const createdUsers = [];
    for (const user of usersData) {
      const created = await createUser(user);
      createdUsers.push(created);
    }

    // Criar movimentações de exemplo (Novembro 2025 - Pici)
    const piciId = createdCongregacoes.find(c => c.name === 'Pici')?.id!;
    const userId = createdUsers.find(u => u.email === 'prjunior@adbarroso.com')?.id!;

    const movimentacoesData = [
      {
        dia: 2,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto de adoração - Oferta de 3,00 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 3.00,
        congregacaoId: piciId,
        userId: userId,
      },
      {
        dia: 5,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto da Vitoria - Dizimo Levi - 100 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 100.00,
        congregacaoId: piciId,
        userId: userId,
      },
      {
        dia: 5,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto da Vitoria - Dizimo Samuel- 100 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 100.00,
        congregacaoId: piciId,
        userId: userId,
      },
      {
        dia: 16,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto de adoração- Dizimo Levi - 50 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 50.00,
        congregacaoId: piciId,
        userId: userId,
      },
      {
        dia: 20,
        mes: 11,
        ano: 2025,
        descricao: 'Pg. Pagamento Agua - 52,89',
        tipo: 'saida' as const,
        valor: 52.89,
        congregacaoId: piciId,
        userId: userId,
      },
      {
        dia: 30,
        mes: 11,
        ano: 2025,
        descricao: 'Pg. compra de 4 garrafão de agua - 11 reais',
        tipo: 'saida' as const,
        valor: 11.00,
        congregacaoId: piciId,
        userId: userId,
      },
      {
        dia: 30,
        mes: 11,
        ano: 2025,
        descricao: 'Pg. pagamento conta de Luz - 28,52',
        tipo: 'saida' as const,
        valor: 28.52,
        congregacaoId: piciId,
        userId: userId,
      },
      {
        dia: 30,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto de Doutrina - Dizimo Pr Junior- 140 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 140.00,
        congregacaoId: piciId,
        userId: userId,
      },
    ];

    for (const mov of movimentacoesData) {
      await createMovimentacao(mov);
    }

    return NextResponse.json({
      success: true,
      message: 'Banco de dados inicializado com sucesso!',
      data: {
        congregacoes: createdCongregacoes.length,
        users: createdUsers.length,
        movimentacoes: movimentacoesData.length,
      },
    });
  } catch (error: any) {
    console.error('Erro ao inicializar:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao inicializar banco de dados' },
      { status: 500 }
    );
  }
}
