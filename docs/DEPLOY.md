# Colocar o Bloco online com Supabase e Vercel

> **Estado atual:** a integração está preparada no código, mas só começa a sincronizar depois de conectar um projeto Supabase e publicar um novo build. Durante os testes em andamento, não altere as variáveis de produção nem faça novo deploy. O app atual continua usando o armazenamento local do navegador.

## 1. Preparar o Supabase

Use um projeto dedicado ao Bloco para evitar misturar dados e regras com outras aplicações. Antes de criar, confira o plano/custo exibido no painel da Supabase.

1. Abra o SQL Editor do projeto e execute uma vez `supabase/migrations/202610060001_classroom.sql`. Se usar Supabase CLI, aplique a migração no projeto vinculado com `supabase db push`. Isso cria as tabelas, índices, funções, validações e políticas de isolamento (RLS). Não habilite acesso público às tabelas.
2. Em Authentication, habilite **Anonymous Sign-Ins**. Isso cria a identidade do computador; não solicita e-mail aos alunos.
3. Crie sua conta de professor em **Authentication → Users → Add user**, com seu e-mail, sua senha e confirmação do e-mail. Defina a senha diretamente no painel, nunca em arquivos do projeto ou no chat.
4. Copie o UUID dessa conta. No SQL Editor, autorize somente essa conta:

```sql
insert into public.teacher_profiles (id)
values ('COLE_AQUI_O_UUID_DA_CONTA')
on conflict do nothing;
```

O trecho acima é um modelo; substitua o texto pelo UUID real. A aplicação não oferece cadastro público de professores. Ter uma conta comum não concede acesso às turmas.

5. Nas configurações de API do projeto, copie a **Project URL** e a **Publishable key** (ou chave `anon` legada). Não use `service_role`, `sb_secret_...` nem a senha do banco na aplicação.

## 2. Configurar e publicar na Vercel

**Faça esta etapa só quando terminar os testes e autorizar a publicação.** Na Vercel, conecte o repositório com este projeto (ou use o Vercel CLI dentro da pasta do projeto). A raiz deve conter `package.json` e `vercel.json`.

| Configuração | Valor |
| --- | --- |
| Framework | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| `VITE_SUPABASE_URL` | Project URL do Supabase |
| `VITE_SUPABASE_ANON_KEY` | Publishable key ou chave anon |

Cadastre as duas variáveis no ambiente **Production** e, se for testar prévias, também em **Preview**. Faça um novo deploy depois de alterar variáveis: o Vite as incorpora durante o build.

Para testar localmente, copie `.env.example` para `.env.local`, preencha apenas as duas variáveis públicas e reinicie o Vite. `.env.local` está ignorado no Git.

## 3. Primeiro acesso

1. Depois do deploy autorizado, abra o endereço publicado, entre no **Espaço do professor** com a conta autorizada e crie as turmas.
2. Anote o código de seis letras exibido no painel.
3. Em cada computador dos alunos, use **Conectar à sala do professor** e digite o código. Basta conectar uma vez por navegador.
4. Na criação da equipe, escolha o ano e a letra da turma. A lista válida é 1º A/B/C, 2º A/B, 3º A/B/C, 4º A/B/C e 5º A/B/C. Em outro computador, conecte a sala e digite o código de 8 letras da equipe; o professor gera esse código nos detalhes da equipe. O cadastro de cada equipe só pode ser editado no painel do professor.
5. Resolva um desafio de teste, encerre a sessão e confirme no painel de outro computador que o progresso e o feedback chegaram.
6. Conceda um sticker e confirme a chegada em **Conquistas** na equipe. A consulta automática ocorre a cada 30 segundos.

As turmas online são fixas e criadas automaticamente para a sala do professor. Sem configurar o Supabase, o aplicativo usa as mesmas opções em modo local e mantém os dados somente no navegador atual.

## 4. Como o acesso é protegido

- O professor usa Supabase Auth com e-mail/senha e uma entrada em `teacher_profiles` criada pelo administrador.
- O painel bloqueia ao sair ou após dez minutos sem interação. A sessão do professor não é persistida no armazenamento do navegador.
- Cada computador mantém outra sessão Supabase, anônima e persistente. Entrar como professor não troca a identidade dos alunos.
- O código da sala permite cadastrar o computador, mas não ler equipes de outros computadores.
- O professor vê somente as turmas e equipes da própria sala. Alunos não podem atribuir stickers nem se registrar como professores.
- Nenhuma tabela contém a senha do professor. Nunca coloque uma senha ou chave administrativa em `VITE_*`, pois essas variáveis vão para o navegador.
- A chave publicável aparece no código enviado ao navegador por definição. A proteção dos dados depende das políticas RLS instaladas pela migração; a chave secreta/service_role nunca deve ser usada no app.

Progresso é informado pelo cliente e serve para acompanhamento pedagógico, não para avaliação inviolável. As políticas protegem acesso entre contas e privilégios; não impedem que alguém altere o próprio progresso pelas ferramentas do navegador.

## 5. Operação e recuperação

- Abra a página com internet antes da aula. Se a conexão cair depois, as ações ficam no navegador para sincronização posterior.
- Ao terminar a aula, confira o indicador de sincronização. Equipes com turma local precisam ser vinculadas a uma turma online para enviar dados.
- Não limpe o armazenamento dos computadores antes de sincronizar. A conta anônima do computador não pode ser recuperada somente pelo nome da equipe.
- O professor pode exportar um backup de todas as equipes visíveis no painel. No modo local, pode importar e combinar backups.
- Para mudar de endereço (por exemplo, do protótipo para a Vercel), exporte os dados locais no endereço antigo. O armazenamento de um domínio não é compartilhado com outro. Antes de ativar Supabase no novo endereço, a importação local permite levar os dados; depois vincule as equipes às turmas online.
- Senha remota é administrada no Supabase. O projeto não envia e-mails nem cria senhas padrão.
- Verifique os limites e as configurações de autenticação do seu plano Supabase/Vercel antes do uso com várias turmas. Para publicação aberta na internet, configure a proteção contra abuso da autenticação anônima conforme a documentação Supabase; o fluxo atual não inclui CAPTCHA.

## 6. Verificação após o deploy

O pacote inclui testes locais de motor, interface, persistência, sincronização simulada e RLS em PostgreSQL. Depois de conectar um projeto real, ainda é necessário conferir autenticação anônima habilitada, conta docente autorizada, variáveis públicas corretas e sincronização entre dois navegadores. Não exponha os nomes reais de alunos em repositórios, capturas públicas ou arquivos de demonstração.

## Documentação oficial

- [Supabase: acesso anônimo](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Variáveis de ambiente na Vercel](https://vercel.com/docs/environment-variables/managing-environment-variables)
