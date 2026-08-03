# Arquitetura

## Visão geral

A Identity Platform será construída inicialmente como um **Modular Monolith** utilizando NestJS.

A aplicação será executada como uma única unidade de deploy, mas suas responsabilidades serão organizadas em módulos independentes, com limites e responsabilidades bem definidos.

O objetivo é manter a simplicidade operacional de uma aplicação única sem abrir mão da separação de responsabilidades necessária para que o sistema possa evoluir.

## Arquitetura de alto nível

```text
                         ┌─────────────────────┐
                         │       Clients       │
                         │ Web / Mobile / APIs │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Identity Platform  │
                         │      NestJS API     │
                         └──────────┬──────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
   ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
   │   Identity   │          │Authentication│          │   Sessions   │
   └──────────────┘          └──────────────┘          └──────────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
                 ▼                                     ▼
            ┌──────────────┐                      ┌──────────────┐
            │    Tokens    │                      │  Two-Factor  │
            └──────────────┘                      └──────────────┘
                 │
                 │
                 ▼
          ┌──────────────┐
          │    Redis     │
          │              │
          │ Blacklist    │
          │ Challenges   │
          │ Token State  │
          └──────────────┘

                 ┌───────────────────────────────┐
                 │           Storage             │
                 │                               │
                 │         PostgreSQL            │
                 └───────────────────────────────┘

                 ┌───────────────────────────────┐
                 │     External Providers        │
                 │                               │
                 │ Google │ Microsoft │ OIDC     │
                 └───────────────────────────────┘

                 ┌───────────────────────────────┐
                 │      External Services        │
                 │                               │
                 │          E-mail               │
                 └───────────────────────────────┘
```

## Componentes

### Identity Platform

É a aplicação responsável por fornecer os recursos de identidade e autenticação.

A aplicação será desenvolvida utilizando NestJS e será responsável por coordenar os diferentes módulos do domínio.

---

### Identity

Responsável pelo gerenciamento da identidade do usuário.

Entre suas responsabilidades estão:

* Cadastro de usuários.
* Dados básicos da conta.
* Estado da conta.
* Verificação de e-mail.
* Credenciais locais.
* Recuperação de acesso.

---

### Authentication

Responsável pelos processos de autenticação.

Entre suas responsabilidades estão:

* Login com credenciais.
* Validação das credenciais.
* Orquestração do processo de autenticação.
* Criação do contexto de autenticação.
* Conclusão da autenticação após os fatores necessários serem validados.

O módulo não deverá ser responsável diretamente pelo armazenamento ou gerenciamento de tokens.

---

### Sessions

Responsável pelo ciclo de vida das sessões autenticadas.

Entre suas responsabilidades estão:

* Criação de sessões.
* Identificação do dispositivo.
* Controle do estado da sessão.
* Expiração da sessão.
* Revogação de sessões.
* Consulta das sessões do usuário.
* Revogação individual de dispositivos.

Uma sessão representa o contexto persistente de uma autenticação realizada por um determinado dispositivo ou cliente.

---

### Tokens

Responsável pelo ciclo de vida das credenciais utilizadas para autenticação.

Entre suas responsabilidades estão:

* Geração de Access Tokens.
* Geração de Refresh Tokens.
* Validação relacionada ao ciclo de vida dos tokens.
* Refresh Token Rotation.
* Revogação.
* Controle da blacklist.
* Expiração.

A estratégia definida atualmente estabelece:

* Access Token: 15 minutos.
* Refresh Token: 30 dias.

---

### Two-Factor Authentication

Responsável pela segunda etapa de autenticação.

Entre suas responsabilidades estão:

* Configuração do 2FA.
* Geração de desafios.
* Validação do segundo fator.
* Controle do estado temporário do processo de autenticação.

Quando o 2FA estiver habilitado, a validação da senha não será suficiente para concluir a autenticação.

Tokens de autenticação somente serão emitidos após a validação bem-sucedida do segundo fator.

---

### Federation

Responsável pela integração com provedores externos de identidade.

Entre suas responsabilidades estão:

* Google.
* Microsoft.
* OpenID Connect.
* Single Sign-On.
* Validação das identidades externas.
* Associação de identidades externas a contas locais.

Uma conta local poderá possuir múltiplas identidades externas associadas.

---

## Infraestrutura

### PostgreSQL

Será utilizado como banco de dados principal da aplicação.

Deverá armazenar informações persistentes relacionadas ao domínio, como:

* Usuários.
* Credenciais.
* Identidades externas.
* Sessões.
* Configurações de autenticação.
* Informações necessárias para recuperação e verificação de contas.

---

### Redis

Será utilizado para dados que exigem acesso rápido e/ou possuem ciclo de vida temporário.

Inicialmente, seus principais usos serão:

* Blacklist de tokens.
* Contextos temporários de autenticação.
* Challenges de 2FA.
* Dados temporários relacionados aos fluxos de autenticação.

As entradas da blacklist possuirão TTL compatível com a validade restante do token revogado.

---

### Provedores de identidade

A aplicação poderá integrar-se com provedores externos para autenticação federada.

Os provedores inicialmente considerados são:

* Google.
* Microsoft.
* Provedores compatíveis com OpenID Connect.

---

### Serviço de e-mail

Será utilizado para fluxos que exigem comunicação com o usuário, incluindo:

* Verificação de e-mail.
* Recuperação de senha.

A implementação concreta do provedor de e-mail deverá permanecer desacoplada das regras de negócio.

---

## Princípios arquiteturais

A arquitetura seguirá os seguintes princípios:

### Separação de responsabilidades

Cada módulo deverá possuir uma responsabilidade clara e evitar assumir regras pertencentes a outros módulos.

### Baixo acoplamento

Os módulos deverão depender de contratos bem definidos em vez de acessar diretamente detalhes internos de outros módulos.

### Independência de infraestrutura

As regras de negócio deverão evitar dependência direta de tecnologias específicas sempre que possível.

### Segurança por padrão

Os fluxos deverão considerar segurança como requisito estrutural, e não como uma etapa posterior da implementação.

### Estado onde ele é necessário

A aplicação não buscará ser completamente stateless.

Informações relacionadas a sessões, revogações e processos temporários serão mantidas quando necessárias para garantir controle e segurança.

### Evolução incremental

A arquitetura deverá permitir que componentes sejam substituídos ou extraídos futuramente caso novos requisitos justifiquem essa mudança.

## Decisões relacionadas

As principais decisões arquiteturais serão registradas individualmente em `docs/decisions/`.

* [ADR-001 — Ciclo de vida e rotação de tokens](./decisions/ADR-001-token-lifetime-and-rotation.md)
* [ADR-002 — Arquitetura Modular Monolith](./decisions/ADR-002-modular-monolith.md)
