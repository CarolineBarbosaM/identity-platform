# Arquitetura em Camadas

A Identity Platform utilizará uma abordagem de **Clean Architecture / Hexagonal Architecture pragmática** dentro dos módulos do sistema.

O objetivo não é aplicar padrões arquiteturais de forma dogmática, mas manter as regras de negócio independentes de detalhes de infraestrutura e permitir que componentes externos sejam substituídos com baixo impacto.

## Estrutura

Cada módulo poderá ser organizado utilizando as seguintes camadas:

```text
module/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

Nem todos os módulos precisarão obrigatoriamente possuir todas as camadas.

A estrutura deverá refletir as necessidades reais do módulo.

---

## Domain

A camada de domínio contém as regras de negócio e conceitos fundamentais do módulo.

Ela não deverá depender de:

* NestJS.
* HTTP.
* PostgreSQL.
* Redis.
* JWT.
* Provedores externos.

### Exemplos

Dependendo do módulo, podem existir:

* Entidades.
* Value Objects.
* Domain Services.
* Domain Errors.
* Regras de negócio.

O domínio deve representar **o que o sistema é**, e não como ele é implementado.

---

## Application

A camada de aplicação representa os casos de uso do sistema.

Ela é responsável por coordenar as operações necessárias para executar uma determinada ação de negócio.

### Exemplos

* Login.
* Cadastro.
* Verificação de e-mail.
* Recuperação de senha.
* Logout.
* Revogação de sessão.
* Renovação de tokens.
* Validação de 2FA.

A camada de aplicação poderá depender de contratos definidos para acessar recursos externos, mas não deverá depender diretamente de suas implementações concretas.

---

## Infrastructure

A camada de infraestrutura contém implementações relacionadas a tecnologias e serviços externos.

### Exemplos

* PostgreSQL.
* Redis.
* JWT.
* Serviço de e-mail.
* Google.
* Microsoft.
* OpenID Connect.

Exemplos de implementações:

```text
PostgresUserRepository
RedisTokenBlacklist
RedisSessionRepository
JwtTokenService
GoogleIdentityProvider
MicrosoftIdentityProvider
EmailProvider
```

Essas implementações deverão cumprir contratos definidos pelas camadas internas.

---

## Presentation

A camada de apresentação representa as interfaces através das quais clientes interagem com a aplicação.

Inicialmente, a principal interface será HTTP.

### Exemplos

```text
POST /auth/login
POST /auth/refresh
POST /auth/logout

POST /users
POST /users/recovery

GET /sessions
DELETE /sessions/:id
```

A camada de apresentação será responsável por:

* Controllers.
* DTOs.
* Validação de entrada.
* Guards.
* Mapeamento de requisições e respostas.

As regras de negócio não deverão ser implementadas diretamente nos controllers.

---

# Regra de dependência

As dependências deverão apontar para dentro.

```text
Presentation
     │
     ▼
Application
     │
     ▼
Domain
```

A infraestrutura deverá implementar contratos utilizados pelas camadas internas:

```text
        Application
             │
             ▼
        Repository
        Interface
             ▲
             │
     Infrastructure
```

Dessa forma, a aplicação poderá depender de uma abstração de persistência sem conhecer diretamente PostgreSQL.

---

# Princípio de substituição

Componentes externos deverão poder ser substituídos sem alterar as regras centrais do domínio.

Por exemplo, a aplicação deverá depender de um contrato de envio de e-mail:

```text
EmailProvider
```

e não diretamente de um fornecedor específico.

Isso permite utilizar diferentes implementações, como:

```text
DevelopmentEmailProvider
ProductionEmailProvider
```

sem alterar os casos de uso que precisam enviar e-mails.

---

# Pragmatismo

A arquitetura não deverá criar abstrações sem necessidade.

Interfaces, adapters, services e outras abstrações deverão existir quando contribuírem para:

* isolamento de infraestrutura;
* testabilidade;
* substituição de dependências;
* clareza de responsabilidade;
* redução de acoplamento.

A quantidade de camadas ou abstrações não será utilizada como métrica de qualidade arquitetural.

A qualidade será avaliada pela clareza das responsabilidades e pelo baixo acoplamento entre as partes do sistema.
