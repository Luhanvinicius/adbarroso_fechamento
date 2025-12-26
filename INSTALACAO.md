# Guia de Instalação - Sistema AD Barroso

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🚀 Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Inicializar Banco de Dados

O sistema inicializa automaticamente na primeira execução! 

**Opção 1 - Automática (Recomendada):**
- Apenas execute `npm run dev` e acesse a página de login
- O sistema detectará que não há dados e inicializará automaticamente

**Opção 2 - Manual:**
- Acesse `http://localhost:3000/api/init` no navegador após iniciar o servidor

A inicialização irá:
- Criar estrutura de dados em memória (localStorage)
- Inserir congregações de exemplo
- Criar usuários de exemplo com senhas
- Inserir movimentações de exemplo (Novembro 2025)

### 3. Executar o Sistema

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔐 Usuários de Exemplo

Após executar `npm run init-db`, você terá os seguintes usuários:

| Email | Senha | Perfil | Congregação |
|-------|-------|--------|-------------|
| admin@adbarroso.com | admin123 | Admin | Todas |
| prjunior@adbarroso.com | pr123 | Pastor | Pici |
| tesoureiro@adbarroso.com | tes123 | Tesoureiro do Campo | Todas |
| tespici@adbarroso.com | tes123 | Tesoureiro da Congregação | Pici |
| lider@adbarroso.com | lider123 | Líder de Congregação | Sede |

## 📁 Armazenamento de Dados

Os dados são armazenados em **localStorage** do navegador (em memória no servidor):

- **users**: Usuários do sistema
- **congregacoes**: Congregações cadastradas
- **movimentacoes**: Entradas e saídas financeiras
- **saldos_anteriores**: Saldos iniciais por mês/ano

**Nota**: Para produção no Vercel, você precisará migrar para um banco de dados remoto (PostgreSQL, MySQL, etc.)

## 🔄 Reinicializar Banco de Dados

Para limpar e recriar os dados:

1. Limpe o localStorage do navegador (F12 → Application → Local Storage → Clear)
2. Ou acesse `http://localhost:3000/api/init` novamente

⚠️ **Atenção**: Isso apagará todos os dados existentes!

## 🛠️ Troubleshooting

### Erro ao instalar dependências

Certifique-se de que o Node.js está na versão 18 ou superior:

```bash
node --version
```

### Dados não persistem

Os dados são salvos no localStorage do navegador. Certifique-se de:
- Não estar usando modo anônimo/privado
- Não ter limpo os dados do navegador
- Estar usando o mesmo navegador

### Erro ao inicializar

Se a inicialização automática não funcionar:
1. Acesse `http://localhost:3000/api/init` manualmente
2. Verifique o console do navegador (F12) para erros

## 📝 Notas

- ✅ **Sem Python necessário**: O sistema funciona sem necessidade de Python ou compilação nativa
- ✅ **Pronto para Vercel**: Pode ser facilmente migrado para banco remoto
- ✅ **Dados persistentes**: Os dados são salvos no localStorage do navegador
- 🔄 **Migração futura**: Para produção, migre para PostgreSQL/MySQL/Supabase

