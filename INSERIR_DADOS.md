# Inserção de Dados no Banco de Dados

## 📋 Sobre

Este documento explica como inserir os dados financeiros da congregação Pici diretamente no Supabase de produção. Os dados são persistidos no banco e **não serão perdidos** em novos deploys do Vercel.

## ✅ Dados Inseridos

Os seguintes dados foram inseridos no banco de produção:

- **Agosto/2025**: 21 movimentações
- **Setembro/2025**: 18 movimentações  
- **Outubro/2025**: 17 movimentações
- **Novembro/2025**: 22 movimentações

**Total**: 78 movimentações

## 🚀 Como Executar

### Opção 1: Script Local (Recomendado)

Execute o script diretamente no seu ambiente local:

```bash
npm run inserir-todos-dados-pici
```

Ou:

```bash
node --import tsx scripts/inserir-todos-dados-pici.ts
```

### Opção 2: Via API (Vercel)

Se precisar executar no Vercel após um deploy, faça uma requisição POST para:

```
POST https://seu-dominio.vercel.app/api/inserir-dados-pici
```

**Importante**: Esta rota deve ser protegida ou removida após uso para evitar inserções acidentais.

## 🔄 Comportamento do Script

O script:

1. ✅ Verifica se a congregação Pici existe
2. ✅ Busca um usuário válido para vincular as movimentações
3. ✅ **Remove dados existentes** dos meses especificados antes de inserir novos
4. ✅ Insere todos os dados de uma vez
5. ✅ Exibe um resumo completo por mês

## 📊 Resumo dos Dados

### Agosto/2025
- Dízimo: R$ 612,00
- Ofertas: R$ 153,00
- Entradas: R$ 765,00
- Saídas: R$ 80,51
- Saldo Final: R$ 684,49

### Setembro/2025
- Dízimo: R$ 650,00
- Ofertas: R$ 86,50
- Entradas: R$ 736,50
- Saídas: R$ 73,56
- Saldo Final: R$ 662,94

### Outubro/2025
- Dízimo: R$ 590,00
- Ofertas: R$ 128,00
- Entradas: R$ 718,00
- Saídas: R$ 78,22
- Saldo Final: R$ 639,78

### Novembro/2025
- Dízimo: R$ 590,00
- Ofertas: R$ 124,50
- Entradas: R$ 714,50
- Saídas: R$ 92,41
- Saldo Final: R$ 622,09

## 🔒 Persistência

Os dados estão armazenados no **Supabase PostgreSQL**, que é um banco de dados externo e persistente. Isso significa que:

- ✅ Os dados **não serão perdidos** em novos deploys
- ✅ Os dados **não serão perdidos** se o Vercel reiniciar
- ✅ Os dados **permanecem** mesmo após mudanças no código
- ✅ Os dados podem ser acessados de qualquer ambiente (local, Vercel, etc.)

## ⚠️ Importante

- O script **substitui** dados existentes dos meses especificados
- Certifique-se de ter as variáveis de ambiente configuradas corretamente
- A rota `/api/inserir-dados-pici` deve ser protegida ou removida após uso

## 📝 Variáveis de Ambiente Necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=https://hkjvxswdpsoiidgvuyit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Essas variáveis devem estar configuradas:
- No arquivo `.env.local` (para execução local)
- No painel do Vercel (para execução em produção)

