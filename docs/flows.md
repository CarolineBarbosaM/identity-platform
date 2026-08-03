# Fluxos de Autenticação

## 1. Cadastro e verificação de e-mail

O usuário inicia o processo de cadastro informando seus dados.

O sistema deverá:

1. Receber os dados de cadastro.
2. Validar as informações fornecidas.
3. Verificar se já existe uma conta associada ao e-mail informado.
4. Criar a conta do usuário em estado não verificado.
5. Gerar uma credencial temporária para verificação do e-mail.
6. Enviar um e-mail contendo o mecanismo de confirmação.
7. O usuário acessa o mecanismo de confirmação recebido por e-mail.
8. O sistema valida a credencial de verificação.
9. A conta passa para o estado de e-mail verificado.
10. O usuário poderá realizar o primeiro login.

### Regra

Uma conta cujo e-mail ainda não foi confirmado **não poderá realizar autenticação utilizando suas credenciais locais**.

### Observação

A estratégia utilizada para gerar, armazenar, expirar e invalidar a credencial de verificação será definida posteriormente na arquitetura.

---

## 2. Login com e-mail e senha

O usuário informa seu e-mail e senha.

O sistema deverá:

1. Receber as credenciais.
2. Verificar se a conta existe.
3. Verificar se o e-mail da conta foi confirmado.
4. Validar a senha informada.
5. Verificar se a conta possui autenticação de dois fatores habilitada.

### Usuário sem 2FA

Caso o usuário não possua 2FA habilitado:

1. As credenciais são consideradas válidas.
2. O sistema cria uma sessão autenticada.
3. O sistema emite os tokens de autenticação.
4. O usuário recebe acesso aos recursos protegidos.

### Usuário com 2FA

Caso o usuário possua 2FA habilitado:

1. As credenciais são consideradas válidas.
2. O sistema **não emite os tokens de autenticação**.
3. O sistema cria um contexto de autenticação temporário.
4. O usuário deverá fornecer o segundo fator.
5. O sistema valida o segundo fator.
6. Somente após a validação bem-sucedida do 2FA, o sistema cria a sessão autenticada.
7. O sistema emite os tokens de autenticação.
8. O usuário recebe acesso aos recursos protegidos.

### Regra de segurança

A validação da senha, por si só, não será suficiente para concluir a autenticação quando o 2FA estiver habilitado.

**Tokens de acesso e refresh tokens somente poderão ser emitidos após a validação bem-sucedida do segundo fator.**

### Observação

A implementação do contexto de autenticação temporário e da emissão dos tokens será definida posteriormente na arquitetura.

---

## 3. Login com Google

O usuário inicia o processo de autenticação utilizando sua conta Google.

O sistema deverá:

1. Redirecionar o usuário para o provedor de identidade Google.
2. O usuário realiza a autenticação no Google.
3. O Google retorna as informações de identidade para a aplicação.
4. O sistema valida a resposta recebida do provedor.
5. O sistema identifica o usuário a partir da identidade fornecida pelo Google.
6. Caso exista uma conta local associada à identidade, o sistema vincula a autenticação Google à conta existente.
7. Caso não exista uma conta local associada, o sistema cria uma nova conta.
8. A identidade Google passa a ser associada à conta local.
9. O sistema cria a sessão autenticada.
10. O sistema emite os tokens de autenticação.
11. O usuário recebe acesso aos recursos protegidos.

### Conta existente

Quando uma conta local já existir para a identidade apresentada pelo Google, nenhuma nova conta deverá ser criada.

A identidade externa será vinculada à conta local existente.

### Nova conta

Quando nenhuma conta local estiver associada à identidade Google, o sistema deverá criar uma nova conta e associar a identidade externa criada pelo provedor.

### Regra de segurança

As informações recebidas do Google deverão ser validadas pelo sistema antes que a identidade seja considerada autenticada.

A aplicação não deverá confiar exclusivamente em informações fornecidas pelo cliente.

### Observação

A estratégia de integração com o Google, incluindo o protocolo utilizado, validação da identidade, armazenamento da identidade externa e gerenciamento dos vínculos será definida posteriormente na arquitetura.

---

## 4. Login com Microsoft

O usuário inicia o processo de autenticação utilizando sua conta Microsoft.

O sistema deverá:

1. Redirecionar o usuário para o provedor de identidade Microsoft.
2. O usuário realiza a autenticação no Microsoft.
3. O Microsoft retorna as informações de identidade para a aplicação.
4. O sistema valida a resposta recebida do provedor.
5. O sistema identifica a identidade externa apresentada pelo Microsoft.
6. Caso exista uma conta local associada à identidade Microsoft, o sistema utiliza a conta existente.
7. Caso não exista uma conta local associada, o sistema cria uma nova conta.
8. A identidade Microsoft passa a ser associada à conta local.
9. O sistema cria a sessão autenticada.
10. O sistema emite os tokens de autenticação.
11. O usuário recebe acesso aos recursos protegidos.

### Conta existente

Quando uma conta local já estiver associada à identidade apresentada pelo Microsoft, nenhuma nova conta deverá ser criada.

A identidade externa será vinculada à conta local existente.

### Nova conta

Quando nenhuma conta local estiver associada à identidade Microsoft, o sistema deverá criar uma nova conta e associar a identidade externa à nova conta.

### Regra de segurança

As informações recebidas do Microsoft deverão ser validadas pelo sistema antes que a identidade seja considerada autenticada.

A aplicação não deverá confiar exclusivamente em informações fornecidas pelo cliente.

### Observação

A estratégia de integração com o Microsoft, incluindo o protocolo utilizado, validação da identidade, armazenamento da identidade externa e gerenciamento dos vínculos será definida posteriormente na arquitetura.

---

## 5. Recuperação de senha

O usuário poderá solicitar a recuperação de sua senha informando o e-mail associado à conta.

O sistema deverá:

1. Receber a solicitação de recuperação.
2. Verificar se existe uma conta associada ao e-mail informado.
3. Gerar uma credencial temporária para recuperação.
4. Enviar um e-mail contendo o mecanismo de recuperação.
5. O usuário acessa o mecanismo recebido.
6. O sistema valida a credencial de recuperação.
7. O usuário informa uma nova senha.
8. O sistema valida os requisitos da nova senha.
9. A senha anterior é substituída.
10. A credencial de recuperação é invalidada.
11. As sessões existentes do usuário são revogadas.
12. Os tokens associados às sessões revogadas são invalidados por meio da estratégia de blacklist.
13. O usuário deverá realizar uma nova autenticação para acessar a conta.

### Regras de segurança

A credencial de recuperação deverá:

* possuir validade limitada;
* ser utilizável apenas uma vez;
* ser invalidada após a conclusão ou expiração do processo;
* não permitir acesso direto aos recursos protegidos da aplicação.

O sistema não deverá revelar se um determinado e-mail está associado a uma conta durante a solicitação de recuperação.

### Revogação das sessões

A alteração da senha será considerada um evento de segurança.

As sessões existentes serão revogadas para reduzir o risco de acesso não autorizado por credenciais ou tokens previamente comprometidos.

### Observação

A estratégia utilizada para geração, armazenamento, expiração e validação da credencial de recuperação será definida posteriormente na arquitetura.

---

## 6. Logout

O usuário poderá encerrar sua sessão autenticada por meio do fluxo de logout.

O sistema deverá:

1. Identificar a sessão associada à autenticação atual.
2. Encerrar a sessão.
3. Identificar os tokens associados à sessão.
4. Revogar os tokens ainda válidos.
5. Registrar os identificadores dos tokens revogados na blacklist.
6. Impedir a utilização posterior dos tokens revogados.

### Revogação do Access Token

O Access Token utilizado na solicitação de logout será considerado revogado e não poderá mais ser utilizado para acessar recursos protegidos.

### Revogação do Refresh Token

O Refresh Token associado à sessão também deverá ser revogado.

Um Refresh Token revogado não poderá ser utilizado para obter novos tokens de autenticação.

### Blacklist

A blacklist armazenará a identificação dos tokens revogados, e não necessariamente o token completo.

Cada entrada deverá possuir um tempo de vida limitado à validade restante do token correspondente.

Após a expiração natural do token, sua entrada na blacklist deixará de ser necessária.

### Regra de segurança

O logout deverá invalidar a sessão e impedir a reutilização dos tokens associados a ela.

A existência de um token ainda não expirado não deverá ser suficiente para manter uma sessão que tenha sido explicitamente revogada.

---

## 7. Gerenciamento de dispositivos e sessões

O sistema deverá permitir que o usuário visualize e gerencie as sessões associadas à sua conta.

Cada sessão deverá representar uma autenticação realizada a partir de um dispositivo ou contexto de acesso.

### Visualização de dispositivos

O usuário autenticado poderá consultar suas sessões ativas.

Para cada sessão, o sistema deverá apresentar informações suficientes para que o usuário consiga identificar o dispositivo, como:

* Nome ou tipo do dispositivo.
* Sistema operacional.
* Navegador ou aplicação utilizada.
* Data e hora do último acesso.
* Data e hora de criação da sessão.
* Identificação da sessão atual.

Informações sensíveis que possam comprometer a privacidade do usuário não deverão ser expostas.

### Revogação de uma sessão específica

O usuário poderá encerrar individualmente uma sessão associada a um dispositivo.

O sistema deverá:

1. Identificar a sessão selecionada.
2. Verificar se a sessão pertence ao usuário autenticado.
3. Encerrar a sessão.
4. Revogar os tokens associados à sessão.
5. Registrar os identificadores dos tokens revogados na blacklist.
6. Impedir que os tokens da sessão encerrada sejam utilizados novamente.

As demais sessões do usuário permanecerão ativas.

### Revogação da sessão atual

O usuário também poderá encerrar a sessão utilizada atualmente.

Nesse caso, o comportamento será equivalente ao fluxo de logout.

### Segurança

Um usuário não poderá revogar ou consultar sessões pertencentes a outro usuário.

A identificação da sessão deverá ser validada no contexto do usuário autenticado, e não apenas a partir de um identificador fornecido pelo cliente.

### Relação entre sessão e tokens

Uma sessão poderá possuir:

* um ou mais Access Tokens ao longo de seu ciclo de vida;
* Refresh Tokens rotacionados;
* informações do dispositivo;
* estado de revogação;
* data de criação;
* data de expiração.

A sessão será o elemento utilizado para controlar o ciclo de vida da autenticação de um determinado dispositivo.

### Expiração

Uma sessão possuirá validade máxima de 30 dias.

A renovação dos tokens não deverá permitir que uma sessão permaneça ativa indefinidamente sem respeitar as regras de expiração definidas pelo sistema.
