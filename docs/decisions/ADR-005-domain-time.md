# ADR-005 — Controle de tempo no domínio

## Status

Accepted

## Contexto

Algumas regras da entidade `User` dependem do momento em que uma determinada operação acontece.

Atualmente, a entidade utiliza diretamente `new Date()` para definir informações como:

* `emailVerifiedAt`;
* `updatedAt`.

Embora essa abordagem seja simples, ela cria uma dependência implícita do relógio do sistema dentro do domínio.

Isso dificulta principalmente os testes automatizados, pois o resultado passa a depender do horário real em que o teste é executado.

Além disso, conforme novas regras forem adicionadas ao sistema, outras operações poderão depender de tempo, como:

* expiração de sessões;
* expiração de tokens;
* bloqueios temporários;
* recuperação de senha;
* códigos de 2FA;
* validade de links de confirmação;
* controle de tentativas de autenticação.

Precisamos, portanto, de uma forma consistente de obter o horário atual sem acoplar as regras de negócio diretamente ao relógio do sistema.

## Decisão

O domínio utilizará uma abstração de relógio (`Clock`) para obter o momento atual.

A abstração será responsável apenas por fornecer a data/hora atual:

```typescript
interface Clock {
  now(): Date;
}
```

A implementação utilizada em produção será responsável por obter o horário real do sistema.

Nos testes, poderemos utilizar uma implementação controlada, permitindo definir explicitamente o instante utilizado pelo cenário.

### Produção

```text
SystemClock
     │
     ▼
  system time
```

### Testes

```text
FakeClock
     │
     ▼
controlled time
```

A entidade de domínio não deverá depender diretamente de `new Date()` para regras que dependam do tempo.

## Motivações

### Testabilidade

Permite testar comportamentos relacionados ao tempo de forma determinística.

Por exemplo:

```text
Given:
  current time = 2026-08-03 10:00

When:
  user verifies the email

Then:
  emailVerifiedAt = 2026-08-03 10:00
```

O teste não dependerá do horário real da máquina.

### Previsibilidade

Operações relacionadas a tempo passam a utilizar uma única fonte de referência.

Isso reduz diferenças entre ambientes de desenvolvimento, testes e produção.

### Evolução do domínio

A arquitetura preparada para abstração de tempo facilita a implementação futura de regras como expiração de tokens e sessões sem espalhar chamadas diretas ao relógio do sistema pelo domínio.

## Alternativas consideradas

### Utilizar `new Date()` diretamente

**Não adotado.**

É simples, mas cria acoplamento direto ao relógio do sistema e dificulta testes determinísticos.

### Utilizar bibliotecas de data diretamente no domínio

**Não adotado neste momento.**

Bibliotecas podem ser úteis para cálculos complexos de datas, mas não resolvem por si só o problema de abstração da fonte de tempo.

A necessidade atual é controlar a origem do instante atual, e não introduzir uma biblioteca adicional.

### Mock global de `Date`

**Não adotado.**

Mocks globais podem resolver testes específicos, mas alteram o comportamento global do ambiente de teste e tornam a dependência temporal menos explícita.

## Consequências

### Positivas

* Testes determinísticos.
* Menor acoplamento entre domínio e infraestrutura.
* Uma estratégia consistente para regras temporais.
* Facilita futuras regras de expiração.

### Negativas

* Introdução de uma abstração adicional.
* Algumas entidades ou casos de uso precisarão receber acesso ao `Clock`.
* Pequeno aumento de complexidade para operações simples.

## Diretriz

A abstração `Clock` deve ser utilizada quando uma regra de negócio depender do instante atual.

Ela não deve ser introduzida indiscriminadamente em operações que não possuem dependência temporal.

## Próximo passo

Implementar a abstração `Clock` e uma implementação controlada para testes antes de adicionar regras de domínio dependentes de tempo.
