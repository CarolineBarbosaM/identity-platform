# ADR-002 — Arquitetura Modular Monolith

## Status

Accepted

## Contexto

A Identity Platform possui diferentes responsabilidades relacionadas à identidade e autenticação, incluindo cadastro de usuários, autenticação, gerenciamento de sessões, 2FA, tokens e autenticação federada.

Essas responsabilidades precisam possuir limites claros para evitar que a aplicação se transforme em um único componente fortemente acoplado.

Ao mesmo tempo, o projeto não possui, neste momento, requisitos que justifiquem a complexidade operacional de uma arquitetura baseada em múltiplos microserviços.

## Alternativas consideradas

### Monólito tradicional

Uma aplicação com todas as responsabilidades agrupadas em módulos com baixo isolamento entre seus domínios.

**Vantagem:** menor complexidade inicial.

**Desvantagem:** maior risco de acoplamento entre responsabilidades e dificuldade de evolução dos limites do sistema.

### Microservices

Separação das responsabilidades em serviços independentes.

**Vantagens:**

* Independência de deploy.
* Escalabilidade independente.
* Isolamento entre serviços.

**Desvantagens:**

* Maior complexidade operacional.
* Comunicação distribuída.
* Necessidade de observabilidade distribuída.
* Maior complexidade para desenvolvimento e testes.
* Overhead desnecessário para o estágio atual do projeto.

### Modular Monolith

Uma única aplicação com módulos internamente isolados e responsabilidades bem definidas.

**Vantagens:**

* Mantém a simplicidade operacional de uma aplicação única.
* Permite definir limites claros entre os domínios.
* Facilita testes e desenvolvimento local.
* Permite evolução gradual da arquitetura.
* Possibilita a extração futura de módulos caso exista uma necessidade real.

## Decisão

A Identity Platform será inicialmente implementada como um **Modular Monolith utilizando NestJS**.

Os módulos serão organizados de acordo com responsabilidades e limites de domínio, evitando dependências desnecessárias entre eles.

A infraestrutura será compartilhada quando fizer sentido, mas as regras de negócio deverão permanecer isoladas de detalhes de infraestrutura.

## Diretrizes

Os módulos deverão:

* possuir responsabilidades bem definidas;
* evitar acesso direto às estruturas internas de outros módulos;
* expor contratos claros para comunicação;
* manter regras de negócio independentes de infraestrutura sempre que possível;
* evitar dependências circulares.

## Consequências

### Positivas

* Menor complexidade operacional.
* Desenvolvimento e execução simplificados.
* Separação clara de responsabilidades.
* Facilidade para testes.
* Possibilidade de evolução para uma arquitetura distribuída no futuro.

### Negativas

* Todos os módulos compartilham o mesmo processo de aplicação.
* Falhas em determinadas partes podem afetar a aplicação como um todo.
* Escalabilidade inicialmente ocorre no nível da aplicação.
* Exige disciplina arquitetural para evitar que o monólito se torne fortemente acoplado.

## Evolução futura

A extração de um módulo para um serviço independente somente deverá ocorrer caso exista uma necessidade técnica ou de negócio que justifique essa decisão.

A arquitetura não será distribuída apenas com o objetivo de utilizar microservices.
