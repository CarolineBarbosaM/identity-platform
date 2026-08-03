# ADR-003 — Clean Architecture / Hexagonal Architecture Pragmática

## Status

Accepted

## Contexto

A Identity Platform possui diferentes integrações externas e componentes de infraestrutura, como PostgreSQL, Redis, provedores de identidade, serviço de e-mail e mecanismos de emissão de tokens.

As regras de negócio não devem ficar diretamente acopladas a essas tecnologias.

Ao mesmo tempo, aplicar uma implementação excessivamente rígida de Clean Architecture poderia introduzir abstrações desnecessárias e aumentar a complexidade do projeto sem benefícios proporcionais.

## Alternativas consideradas

### Arquitetura tradicional do NestJS

Utilizar diretamente a estrutura de módulos, services, controllers e repositories fornecida pelo framework.

**Vantagens:**

* Simplicidade.
* Menor quantidade de código.
* Curva de aprendizado reduzida.

**Desvantagens:**

* Maior possibilidade de acoplamento entre regras de negócio e infraestrutura.
* Substituição de dependências externas pode exigir alterações em vários pontos.
* Limites entre domínio e infraestrutura podem ficar pouco claros.

### Clean Architecture / Hexagonal estrita

Aplicar todas as camadas e abstrações de forma rigorosa.

**Vantagens:**

* Forte isolamento do domínio.
* Alta testabilidade.
* Infraestrutura desacoplada.

**Desvantagens:**

* Maior complexidade.
* Grande quantidade de abstrações.
* Risco de criar interfaces e adapters sem necessidade real.

### Clean/Hexagonal pragmática

Aplicar os princípios de isolamento e inversão de dependência somente onde eles agregam valor.

**Vantagens:**

* Mantém o domínio desacoplado.
* Facilita testes.
* Permite substituir infraestrutura.
* Evita abstrações artificiais.
* Mantém a implementação compreensível.

## Decisão

A Identity Platform utilizará uma abordagem **Clean Architecture / Hexagonal pragmática** dentro dos módulos.

Os módulos poderão ser organizados em:

```text
module/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

Nem todos os módulos precisarão obrigatoriamente possuir todas as camadas.

A estrutura deverá acompanhar as necessidades reais de cada contexto.

## Regras

### Domain

Não deverá depender diretamente de frameworks ou tecnologias externas.

### Application

Deverá representar casos de uso e coordenar as regras necessárias para executá-los.

### Infrastructure

Deverá conter implementações relacionadas a tecnologias externas.

### Presentation

Deverá lidar com os mecanismos de entrada e saída da aplicação, inicialmente através de HTTP.

### Inversão de dependência

Quando uma regra de negócio depender de um recurso externo, deverá depender de um contrato, e não diretamente da implementação concreta.

Por exemplo:

```text
Application
    │
    ▼
EmailProvider
    ▲
    │
    └── Infrastructure
         ├── DevelopmentEmailProvider
         └── ProductionEmailProvider
```

## Justificativa

A escolha permite manter as regras de autenticação independentes de tecnologias específicas sem transformar o projeto em uma implementação excessivamente abstrata.

O objetivo é utilizar arquitetura como ferramenta para controlar complexidade, e não como um fim em si mesma.

## Consequências

### Positivas

* Maior isolamento das regras de negócio.
* Facilidade para testes unitários.
* Menor acoplamento com infraestrutura.
* Facilidade para substituir integrações externas.
* Estrutura mais clara para evolução do projeto.

### Negativas

* Maior quantidade de código em comparação com uma arquitetura NestJS tradicional.
* Necessidade de definir contratos entre camadas.
* Maior responsabilidade do desenvolvedor para manter os limites arquiteturais.

## Critério para novas abstrações

Uma abstração deverá ser criada quando contribuir para pelo menos um dos seguintes objetivos:

* Isolar uma dependência externa.
* Permitir substituição de implementação.
* Facilitar testes.
* Representar uma regra ou conceito relevante do domínio.
* Reduzir acoplamento.

A criação de interfaces ou adapters apenas para aumentar a quantidade de abstrações deverá ser evitada.
