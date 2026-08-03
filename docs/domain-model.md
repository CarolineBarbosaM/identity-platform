# Modelo de Domínio — Identity

Este documento define os principais conceitos relacionados à identidade dos usuários da Identity Platform.

O objetivo é separar a identidade do usuário de suas diferentes formas de autenticação.

---

## User

`User` representa a identidade de uma pessoa dentro da Identity Platform.

O usuário é independente do mecanismo utilizado para autenticação.

Um mesmo usuário poderá possuir diferentes credenciais ou identidades externas associadas.

### Responsabilidades

* Representar a conta do usuário.
* Armazenar informações básicas da identidade.
* Controlar o estado da conta.
* Indicar o estado de verificação do e-mail.
* Servir como raiz para as relações de identidade e autenticação.

### Exemplo conceitual

```text id="z0w6s9"
User
├── id
├── name
├── email
├── status
├── emailVerifiedAt
├── createdAt
└── updatedAt
```

---

## Credential

`Credential` representa uma credencial utilizada para autenticar um usuário.

A identidade do usuário não depende diretamente de uma credencial específica.

Inicialmente, a plataforma suportará autenticação por senha.

### Exemplo conceitual

```text id="s3pf5j"
Credential
├── id
├── userId
├── type
├── passwordHash
├── createdAt
└── updatedAt
```

A senha nunca deverá ser armazenada em texto puro.

Apenas seu hash deverá ser persistido.

---

## ExternalIdentity

`ExternalIdentity` representa uma identidade fornecida por um provedor externo.

A plataforma poderá associar múltiplas identidades externas ao mesmo usuário.

### Provedores iniciais

* Google.
* Microsoft.
* OpenID Connect / SSO.

### Exemplo conceitual

```text id="g8d2aj"
ExternalIdentity
├── id
├── userId
├── provider
├── providerSubject
├── email
├── createdAt
└── updatedAt
```

### Provider Subject

A identidade externa deverá ser identificada utilizando o identificador fornecido pelo provedor, como o `sub` do OpenID Connect.

O e-mail não deverá ser utilizado como identificador único da identidade externa.

---

# Relações

Um usuário poderá possuir múltiplas credenciais e identidades externas.

```text id="x4g9kd"
                 User
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   Credentials       External Identities
        │                   │
        │             ┌─────┼─────┐
        │             │     │     │
        ▼             ▼     ▼     ▼
    Password       Google Microsoft OIDC
```

---

# Regra de vinculação

Quando uma autenticação externa for realizada, o sistema deverá verificar se a identidade externa já está associada a uma conta.

### Identidade existente

Se existir uma identidade correspondente ao provedor e ao identificador externo:

```text id="9q1w4c"
External Identity
        │
        ▼
      User
```

A autenticação continuará utilizando a conta existente.

### Identidade inexistente

Caso a identidade externa ainda não exista, o sistema deverá avaliar se existe uma conta local que possa ser vinculada de forma segura.

Se o vínculo puder ser realizado com segurança, a identidade externa será associada à conta existente.

Caso contrário, uma nova conta poderá ser criada.

---

# Princípio de identidade

A plataforma deverá tratar o `User` como a identidade central.

Credenciais e identidades externas são mecanismos de autenticação associados ao usuário, e não identidades independentes dentro da plataforma.

Isso permite que diferentes mecanismos de autenticação sejam adicionados sem duplicar contas de usuário.

---

# Segurança

* Senhas deverão ser armazenadas exclusivamente como hashes.
* Identificadores externos deverão ser tratados como dados de identidade.
* O vínculo automático de identidades deverá possuir regras explícitas de segurança.
* O e-mail não deverá ser utilizado isoladamente como prova de posse de uma identidade externa.
* A criação ou associação de uma identidade externa deverá ocorrer somente após validação da resposta do provedor.
