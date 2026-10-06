# Bloco · uma aventura de aprender

Aplicação em **React 19 + Vite + Tailwind CSS 4**, em português, para aulas de pensamento computacional. A interface usa ilustrações SVG próprias e um editor visual de blocos. Não depende de Blockly nem utiliza áudio.

## O que já funciona

- **5 níveis de dificuldade livres, 200 desafios**: 40 por nível, em quatro trilhas de dez.
- Sequências, orientação espacial, reconhecimento de padrões, repetição, condições, funções, depuração, otimização e decomposição introduzidos progressivamente.
- Equipes individuais, duplas, trios e quartetos; primeiro nome dos alunos, avatar e escolha de turma.
- Troca de equipes no mesmo computador, com progresso independente e migração dos dados da versão anterior.
- Nível 1 com setas grandes, objetivo visual, animação de demonstração, execução passo a passo e retorno visual. Sem leitura obrigatória para mover o personagem e sem som. Cadastro acompanhado por adulto quando necessário.
- Todos os desafios ficam abertos, sem perder vidas. As soluções são avaliadas por um interpretador próprio, sem `eval`.
- Feedback ao encerrar uma sessão: carinhas, dificuldade percebida e comentário opcional. Também é possível encerrar sem responder.
- Painel do professor com senha, filtro por turma, busca por nomes, progresso por desafio, contagem de tentativas e histórico de sessões.
- Oito stickers que o professor pode entregar com um recado. As equipes os encontram em Conquistas.
- Turmas fixas: 1º A/B/C, 2º A/B, 3º A/B/C, 4º A/B/C e 5º A/B/C.
- Alunos não editam cadastros de equipe; alterações ficam no painel do professor. O banco separa os dados de cada equipe.
- Backup JSON e importação combinando equipes e melhores resultados, sem incluir a senha.
- Adaptador Supabase com autenticação do professor, identidade anônima por computador, regras de acesso no banco e fila local de sincronização.

## Rodar no computador

Requer Node.js 20.19+ ou 22.12+.

```bash
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. O servidor de desenvolvimento usa a porta 4173 e aceita conexões da rede local.

```bash
npm test
npm run build
npm run preview
```

`dist/` contém a versão estática. Sirva por HTTP/HTTPS; abrir `index.html` diretamente por `file://` não é suportado.

## Usar nas aulas

1. Abra **Espaço do professor** e configure sua senha antes de liberar o computador aos alunos. No modo online, use a conta autorizada no Supabase.
2. No modo online, conecte os computadores usando o código da sala exibido no painel.
3. Os alunos criam a equipe escolhendo a turma e os integrantes. Correções no cadastro podem ser feitas pelo professor ao abrir os detalhes da equipe.
4. Escolha qualquer nível e trilha. A interface sugere continuidade, mas não bloqueia desafios.
5. Reserve o final da aula para **Encerrar sessão**. O feedback e os resultados aparecem no painel do professor.
6. Entregue stickers abrindo os detalhes da equipe no painel.

### Organização sugerida

| Nível | Conteúdos combinados | Quatro trilhas de dez desafios |
| --- | --- | --- |
| 1 | Sequências, direções, padrões visuais e correção | Primeiros passos; Caminhos e padrões; Detetives das setas; Expedição do jardim |
| 2 | Planejamento, sequências, repetição e economia de blocos | Planejar e conferir; Rotas e tesouros; Descobrindo repetições; Planos mais inteligentes |
| 3 | Repetição, depuração, condições e otimização | O poder dos padrões; Repetir e corrigir; Primeiras decisões; Juntar as peças |
| 4 | Condições, múltiplos cenários, funções e repetições | Decidir pelo caminho; Um plano, muitos cenários; Oficina de correções; Inventar e reutilizar |
| 5 | Decomposição, integração, testes e escolha de estratégias | Peças de uma invenção; Decompor e combinar; Laboratório de testes; Grandes expedições |

Planeje uma trilha por encontro: 5 min de aquecimento, 30 min de desafios, 10 min de conversa e 5 min de feedback. São **quatro aulas de 50 minutos por nível como proposta**, ajustáveis a três aulas conforme a turma. A duração depende da autonomia dos alunos; o número de desafios não garante sozinho esse tempo. Alternem quem planeja, quem monta os blocos e quem confere. O painel contém perguntas para cada encontro.

## Onde os dados ficam

**Sem variáveis Supabase:** tudo fica no `localStorage` deste navegador e endereço. A senha local é armazenada com salt e PBKDF2-SHA256, sem texto legível. Ela restringe a interface, mas não substitui segurança de servidor: alguém com acesso às ferramentas do navegador pode alterar dados locais. Exporte backups antes de limpar o navegador.

**Com Supabase configurado:** a Vercel serve a aplicação; o Supabase guarda equipes, progresso, sessões e stickers. O professor entra de qualquer computador e vê as equipes das suas turmas. Apenas equipes vinculadas a uma **turma online** sincronizam; a interface sinaliza equipes que continuam somente locais.

A identidade dos alunos pertence ao navegador do computador, sem exigir e-mail ou senha infantil. As equipes de um computador não aparecem automaticamente em outro. Limpar o armazenamento perde essa identidade; registros já sincronizados continuam disponíveis ao professor. A troca de equipe neste computador permanece livre, como solicitado para uso em sala.

O jogo já aberto continua salvando localmente se a internet cair. Sincroniza ao reconectar e verifica atualizações a cada 30 segundos. Isto não é uma PWA: abrir a página pela primeira vez ainda requer acesso ao servidor. Cada equipe mantém até 100 sessões e até 100 stickers no armazenamento local.

## Supabase + Vercel

Veja [docs/DEPLOY.md](docs/DEPLOY.md). Os arquivos necessários estão incluídos:

- `supabase/migrations/202610060001_classroom.sql`: tabelas, índices, validações, função de conexão e regras RLS.
- `.env.example`: somente URL e chave pública do Supabase.
- `vercel.json`: configuração do Vite na Vercel.

A presença desses arquivos não significa que exista um banco remoto configurado ou um deploy Vercel ativo. Sem as variáveis de ambiente, a aplicação inicia em modo local.

## Estrutura

- `src/data/curriculum.js`: 200 desafios e progressão pedagógica; IDs antigos preservados.
- `src/data/baseCurriculum.js`: as 50 missões originais e construtores de tabuleiro.
- `src/game/engine.js`: interpretação segura e avaliação de todos os cenários.
- `src/components/BlockEditor.jsx`: blocos aninhados, arraste/toque, reordenação e desfazer.
- `src/components/Teacher.jsx`: autenticação, painel, turmas, histórico e recompensas.
- `src/hooks/useClassroom.js`: persistência, sessões e sincronização.
- `src/services/cloud.js`: clientes Supabase separados para professor e computador.
- `src/data/classroom.js`: validação, migração e combinação de backups.

## Verificação desta versão

**223 testes automatizados**: soluções dos 200 desafios (319 cenários), limites de blocos, depuração, editor, cadastro e troca de equipes, migração, senha, filtros, stickers, feedback e retomada após falha de sincronização.

O SQL foi executado em PostgreSQL via PGlite, com testes de RLS para dois professores e dois computadores: isolamento de equipes, bloqueio de elevação a professor, proteção dos códigos da sala e entrega/remoção de stickers. Isso valida a migração e as políticas localmente; não substitui a verificação de uma instância Supabase real após a configuração.

Build de produção validado. Interações verificadas em DOM simulado; revisão visual em navegador não esteve disponível nesta sessão.
