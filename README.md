# Bloco · uma aventura de aprender

Aplicação em **React 19 + Vite + Tailwind CSS 4**, em português, para aulas de pensamento computacional. A interface usa ilustrações SVG próprias e um editor visual de blocos. Não depende de Blockly nem utiliza áudio.

## O que já funciona

- **10 mundos de aprendizagem e 200 desafios ativos**, distribuídos por trilhas de dez. Cada mundo tem apenas a quantidade necessária para ensinar e consolidar seu objetivo.
- Sequências, orientação espacial, reconhecimento de padrões, repetição, condições, funções, depuração, otimização e decomposição introduzidos progressivamente.
- Equipes individuais, duplas, trios e quartetos; primeiro nome dos alunos, avatar e escolha de turma.
- Troca de equipes no mesmo computador, com progresso independente e migração dos dados da versão anterior.
- Nível 1 com setas grandes, objetivo visual, animação de demonstração, execução passo a passo e retorno visual. Sem leitura obrigatória para mover o personagem e sem som. Cadastro acompanhado por adulto quando necessário.
- Todos os desafios ficam abertos, sem perder vidas. As soluções são avaliadas por um interpretador próprio, sem `eval`.
- Feedback ao encerrar uma sessão: carinhas, dificuldade percebida e comentário opcional. Também é possível encerrar sem responder.
- Painel do professor com senha, filtro por turma, busca por nomes, progresso por desafio, contagem de tentativas e histórico de sessões.
- 18 stickers que o professor pode entregar com um recado. As equipes os encontram em Conquistas.
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

### Progressão dos mundos

| Mundo | Objetivo novo | Desafios / trilhas |
| --- | --- | --- |
| 1. Jardim dos primeiros passos | Entender setas, sequência e execução visual | 10 / 1 |
| 2. Algoritmos do dia a dia | Ordenar instruções e perceber dependências entre etapas | 10 / 1 |
| 3. Ilha dos caminhos | Planejar rotas maiores, prever resultados e depurar sequências | 20 / 2 |
| 4. Vale dos padrões | Introduzir `repetir` e reconhecer padrões em movimentos | 10 / 1 |
| 5. Floresta das escolhas | Usar `se/senão` em dois ou três cenários | 20 / 2 |
| 6. Estação das invenções | Criar funções, chamá-las, e combinar função com repetição | 30 / 3 |
| 7. Labirinto com obstáculos | Transferir `repetir` para mapas com paredes e verificar rotas curtas | 20 / 2 |
| 8. Expedição das ações | Combinar deslocamento com pegar, pular, atacar e abrir | 30 / 3 |
| 9. Oficina das ações | Ativar botões, organizar movimentos e planejar duas passagens | 30 / 3 |
| 10. Trilha dos imprevistos | Resolver mapas mutáveis com condições e, depois, com repetição | 20 / 2 |

A progressão não exige que as equipes repitam um tutorial já concluído: um mundo curto introduz ou consolida uma ideia; mundos posteriores a aplicam em outro contexto. Os desafios continuam abertos para que o professor adapte a sequência à turma. Planeje cada encontro com 5 min de aquecimento, 30 min de desafios, 10 min de conversa e 5 min de feedback. Alternem quem planeja, quem monta os blocos e quem confere.

A matemática foi retirada do percurso de programação; o foco atual é pensamento computacional, algoritmos e construção de programas.

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

- `src/data/curriculum.js`: catálogo ativo de 200 desafios, ordem pedagógica e compatibilidade com IDs anteriores.
- `src/data/baseCurriculum.js`: as 50 missões originais e construtores de tabuleiro.
- `src/game/engine.js`: interpretação segura e avaliação de todos os cenários.
- `src/components/BlockEditor.jsx`: blocos aninhados, arraste/toque, reordenação e desfazer.
- `src/components/Teacher.jsx`: autenticação, painel, turmas, histórico e recompensas.
- `src/hooks/useClassroom.js`: persistência, sessões e sincronização.
- `src/services/cloud.js`: clientes Supabase separados para professor e computador.
- `src/data/classroom.js`: validação, migração e combinação de backups.

## Verificação desta versão

Testes automatizados cobrem as soluções de todos os desafios ativos, cenários alternativos, limites de blocos, depuração, editor, cadastro e troca de equipes, migração, senha, filtros, stickers, feedback e retomada após falha de sincronização.

O SQL foi executado em PostgreSQL via PGlite, com testes de RLS para dois professores e dois computadores: isolamento de equipes, bloqueio de elevação a professor, proteção dos códigos da sala e entrega/remoção de stickers. Isso valida a migração e as políticas localmente; não substitui a verificação de uma instância Supabase real após a configuração.

A redução do currículo está sendo validada em uma branch de desenvolvimento. Desafios retirados deixam de entrar nos totais ativos, mas os registros históricos correspondentes são preservados para não apagar o progresso anterior. A branch não foi mesclada em `main` nem publicada em produção.

