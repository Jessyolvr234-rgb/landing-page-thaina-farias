# Landing page — Thainá Farias

Landing page responsiva em HTML, CSS e JavaScript para apresentação profissional e contato.

## Arquivos

- `index.html` — estrutura e conteúdo da página.
- `style.css` — identidade visual, layout e responsividade.
- `script.js` — menu mobile e configuração dos links de contato.
- `admin.html` e `admin.js` — painel privado para revisar, editar, aprovar e rejeitar feedbacks.
- `supabase/schema.sql` — tabelas, permissões e políticas de segurança do banco.
- `supabase-config.js` — URL e chave pública do projeto Supabase.
- `assets/logo-thaina.png` — logotipo usado no cabeçalho, destaque e rodapé.
- `assets/thaina-farias.png` — foto profissional usada no destaque principal.
- A página também apresenta princípios de acolhimento, sem depoimentos de pacientes.
- Os feedbacks ficam pendentes até aprovação manual; somente os aprovados aparecem no site.
- Não há agenda nem horários exibidos no site ou no painel administrativo.

## Identidade visual

- Creme: `#FCF7EF`
- Rosa antigo: `#C9958C`
- Nude rosado: `#E7CDC4`
- Champanhe: `#F4EAE3`
- Dourado fosco: `#B28A60`
- Marrom profundo: `#705044`

## Como abrir

1. Extraia o ZIP.
2. Abra a pasta no VS Code.
3. Abra `index.html` no navegador ou use a extensão Live Server.

## Ativar feedbacks e moderação

1. Crie um projeto no [Supabase](https://supabase.com/) e abra **SQL Editor**.
2. Execute o conteúdo de `supabase/schema.sql` para criar as tabelas e políticas de acesso.
3. No painel do projeto, copie a **Project URL** e a chave pública **anon** ou **publishable** para `url` e `publicKey` em `supabase-config.js`. A URL deste projeto já está preenchida. Essa chave pública é destinada ao navegador; nunca coloque a chave `service_role` ou outra chave secreta nesse arquivo.
4. Em **Authentication → Settings**, desative novos cadastros públicos de usuários. O formulário de feedback continua aceitando comentários anônimos.
5. Em **Authentication → Users**, crie o usuário que fará a moderação e copie o UUID dele.
6. No SQL Editor, autorize esse usuário como moderador, substituindo o UUID:

   ```sql
   insert into public.feedback_moderators (user_id)
   values ('UUID-DO-USUARIO');
   ```

7. Publique todos os arquivos do projeto. A página `admin.html` permite entrar com o usuário criado, revisar, editar, aprovar ou rejeitar cada comentário.
8. Apenas comentários aprovados aparecem publicamente e sem nome. O envio exige consentimento para análise e possível publicação anônima.
9. Configure limites de uso e proteção contra spam no Supabase antes de divulgar amplamente o formulário. Revise comentários para remover detalhes pessoais ou de saúde; nunca publique um relato sem autorização.
10. Confirme com a profissional se a publicação de feedbacks está de acordo com as regras éticas aplicáveis à Psicologia.

## Antes de publicar

1. O link de WhatsApp informado já está configurado em `script.js`.
2. O link do perfil profissional no Instagram já está configurado em `script.js`.
3. O logotipo e a foto enviados já estão aplicados no site.
4. Confirme as áreas de atuação, modalidades, registro profissional e demais informações antes da publicação.
5. Revise a página com a profissional para garantir conformidade com as regras de publicidade profissional aplicáveis à Psicologia.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos do projeto, incluindo `admin.html`, `admin.js`, `supabase-config.js`, a pasta `supabase` e a pasta `assets`, para a raiz do repositório.
3. No GitHub, acesse **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`, depois salve.
6. Aguarde a publicação e abra o endereço fornecido pelo GitHub Pages.

## Observações

- O site usa Google Fonts; sem conexão, fontes de sistema serão usadas como alternativa.
- Depois da configuração descrita acima, o Supabase armazena feedbacks enviados com consentimento; eles só são publicados após moderação.
- O botão de WhatsApp abre o link oficial informado pela profissional.
- Os textos de serviços são introdutórios e devem ser validados pela profissional.
