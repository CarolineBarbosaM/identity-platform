# ADR-006 — Hashing de senhas

## Status

Accepted

## Contexto

A plataforma precisa permitir autenticação por senha.

Senhas não devem ser armazenadas em texto puro nem utilizando algoritmos de hash inadequados para credenciais, como SHA-256 ou outros hashes rápidos e genéricos.

O armazenamento de uma senha precisa dificultar ataques de força bruta e ataques de recuperação de credenciais caso o banco de dados seja comprometido.

Além disso, o domínio não deve depender diretamente de uma biblioteca ou implementação específica de hashing.

## Decisão

As senhas serão armazenadas exclusivamente como hashes utilizando **Argon2id**.

A senha em texto puro será utilizada somente durante o processo de autenticação ou cadastro e nunca será persistida.

O domínio dependerá de uma abstração para hashing:

```typescript
interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
```

A implementação concreta ficará na camada de infraestrutura.

### Fluxo de cadastro

```text
Password
    │
    ▼
PasswordHasher
    │
    ▼
Argon2id hash
    │
    ▼
PasswordCredential
```

### Fluxo de autenticação

```text
Password
    │
    ▼
PasswordHasher.compare()
    │
    ├── válido ──► autenticação continua
    │
    └── inválido ─► autenticação rejeitada
```

## Motivações

### Segurança

Argon2id é projetado especificamente para hashing de senhas e permite configurar custo de memória, tempo e paralelismo, tornando ataques de força bruta mais caros.

### Separação de responsabilidades

O domínio não precisa conhecer a biblioteca utilizada para realizar o hashing.

A regra de negócio depende apenas do comportamento necessário:

```text
PasswordHasher
```

e não de uma implementação concreta.

### Evolução

A abstração permite substituir ou atualizar a implementação de hashing sem alterar as regras do domínio.

Também permite alterar os parâmetros de custo do Argon2id conforme os requisitos de segurança e capacidade da infraestrutura evoluírem.

## Alternativas consideradas

### SHA-256

**Não adotado.**

SHA-256 é um hash criptográfico geral e extremamente rápido. Essa característica é desejável para muitos usos criptográficos, mas inadequada para armazenamento de senhas, pois permite que grandes quantidades de tentativas sejam realizadas rapidamente.

### bcrypt

**Não adotado como primeira opção.**

bcrypt é adequado para armazenamento de senhas e continua sendo uma alternativa válida. Entretanto, Argon2id oferece uma configuração explícita de custo de memória, além de tempo e paralelismo, tornando-o a escolha preferencial para este projeto.

### Armazenamento de senha em texto puro

**Não adotado.**

É uma prática insegura e não será permitida em nenhuma camada do sistema.

## Consequências

### Positivas

* Senhas não são armazenadas em texto puro.
* Maior resistência a ataques de força bruta.
* Domínio desacoplado da biblioteca de hashing.
* Implementação pode ser substituída sem alterar as regras de negócio.
* Parâmetros de custo podem evoluir ao longo do tempo.

### Negativas

* Hashing e comparação são operações computacionalmente mais custosas.
* A implementação exige configuração adequada dos parâmetros do Argon2id.
* Introduz uma abstração adicional entre domínio e infraestrutura.

## Regras de segurança

* Senhas nunca devem ser registradas em logs.
* Senhas nunca devem ser armazenadas em texto puro.
* Senhas nunca devem ser retornadas por APIs.
* O hash da senha não deve ser exposto em respostas públicas.
* O algoritmo e seus parâmetros devem ser revisados conforme os requisitos de segurança evoluírem.

## Próximo passo

Implementar a abstração `PasswordHasher`, uma implementação baseada em Argon2id e uma entidade `PasswordCredential` responsável por representar a credencial de senha do usuário.
