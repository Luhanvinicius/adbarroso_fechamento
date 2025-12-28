// Script para chamar a rota de inserção de dados
// Execute: tsx scripts/chamar-inserir-dados.ts

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Carregar variáveis de ambiente
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
}

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function inserirDados() {
  try {
    console.log(`🌱 Chamando rota de inserção de dados em: ${BASE_URL}/api/inserir-dados-pici\n`);
    
    const response = await fetch(`${BASE_URL}/api/inserir-dados-pici`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro ao inserir dados:', data);
      process.exit(1);
    }

    console.log('✅ Dados inseridos com sucesso!\n');
    console.log(`📊 Total inserido: ${data.totalInserido}`);
    console.log(`⚠️  Total ignorados (já existiam): ${data.totalIgnorados}`);
    console.log(`❌ Total de erros: ${data.totalErros}\n`);
    
    console.log('📋 Detalhes por mês:');
    for (const [mes, resultado] of Object.entries(data.resultados)) {
      const res = resultado as any;
      console.log(`  ${mes.toUpperCase()}:`);
      console.log(`    - Inseridos: ${res.sucesso}`);
      console.log(`    - Ignorados: ${res.ignorados}`);
      console.log(`    - Erros: ${res.erros}`);
      console.log(`    - Já existiam: ${res.existentes}`);
    }

    console.log(`\n✅ ${data.nota}`);
  } catch (error: any) {
    console.error('❌ Erro ao chamar rota:', error.message);
    process.exit(1);
  }
}

inserirDados();


