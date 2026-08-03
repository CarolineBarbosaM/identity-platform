# ADR-001 — Ciclo de vida e rotação de tokens

## Status

Accepted

## Contexto

O sistema precisa utilizar tokens para autenticação, mas também precisa limitar o período de exposição caso uma credencial seja comprometida.

Um token de longa duração utilizado diretamente para acessar recursos protegidos aumenta o impacto de um possível vazamento. Por outro lado, exigir uma nova autenticação do usuário em intervalos muito curtos prejudica a experiência de uso.

Além disso, o sistema precisa permitir que uma sessão permaneça ativa por um período maior sem exigir que o usuário informe novamente suas credenciais a cada acesso.

## Decisão

Será adotada uma estratégia baseada em dois tipos de tokens:

* **Access Token:** validade de 15 minutos.
* **Refresh Token:** validade de 30 dias.

O Access Token será utilizado exclusivamente para acesso aos recursos protegidos da aplicação.

O Refresh Token será utilizado para solicitar novos Access Tokens sem exigir que o usuário realize novamente o processo completo de autenticação.

### Refresh Token Rotation

A cada utilização válida de um Refresh Token:

1. O Refresh Token utilizado será invalidado.
2. Um novo Refresh Token será emitido.
3. Um novo Access Token será emitido.
4. O novo Refresh Token passará a representar a continuidade da sessão.

Dessa forma, um Refresh Token não deverá ser reutilizado indefinidamente.

## Detecção de reutilização

Caso um Refresh Token que já tenha sido utilizado e invalidado seja apresentado novamente, o sistema deverá considerar a possibilidade de comprometimento da sessão.

Esse cenário deverá resultar na revogação da sessão correspondente e dos tokens associados.

A estratégia detalhada para detecção e resposta será definida durante a implementação do gerenciamento de sessões.

## Justificativa

A combinação de Access Tokens de curta duração com Refresh Tokens de maior duração permite equilibrar segurança e experiência do usuário.

O Access Token possui uma janela de exposição reduzida, enquanto o Refresh Token permite manter a sessão ativa sem exigir autenticação frequente.

A rotação dos Refresh Tokens reduz o impacto de seu eventual comprometimento e permite detectar tentativas de reutilização de credenciais já invalidadas.

## Trade-offs

### Benefícios

* Reduz o período de validade de um Access Token comprometido.
* Permite sessões de longa duração sem Access Tokens de longa duração.
* Permite detectar reutilização de Refresh Tokens.
* Possibilita revogação da sessão.
* Permite integrar a estratégia de tokens ao gerenciamento de dispositivos.

### Custos

* A aplicação precisa manter estado relacionado aos Refresh Tokens.
* Cada renovação exige uma operação adicional para invalidar o token anterior e emitir um novo.
* A implementação precisa tratar corretamente concorrência e reutilização de tokens.
* O gerenciamento de sessões torna-se mais complexo.

## Consequências

O gerenciamento de tokens não será completamente stateless.

O sistema precisará manter informações suficientes para controlar sessões, Refresh Tokens e revogações.

A estratégia de blacklist continuará sendo utilizada para tokens explicitamente revogados, enquanto a expiração natural continuará sendo aplicada independentemente de logout.

## Valores definidos

| Credencial    |   Validade |
| ------------- | ---------: |
| Access Token  | 15 minutos |
| Refresh Token |    30 dias |
| Sessão        |    30 dias |
