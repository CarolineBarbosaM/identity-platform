# Ciclo de Vida da Conta

O estado da conta representa a condição operacional de um usuário dentro da Identity Platform.

O estado deverá ser tratado como parte do domínio e suas transições deverão obedecer às regras definidas pelo sistema.

## Estados

### PENDING_EMAIL_VERIFICATION

Estado inicial de uma conta criada através do cadastro.

A conta existe, mas o endereço de e-mail ainda não foi confirmado.

#### Características

* Não pode realizar login normalmente.
* Pode solicitar o reenvio do e-mail de confirmação.
* Não pode receber tokens de sessão.
* Pode concluir a verificação para transicionar para `ACTIVE`.

---

### ACTIVE

Estado normal de uma conta.

#### Características

* Pode realizar autenticação.
* Pode possuir sessões ativas.
* Pode utilizar autenticação de dois fatores.
* Pode vincular identidades externas.
* Pode utilizar os fluxos de recuperação de acesso.

---

### SUSPENDED

Indica que a conta foi desabilitada por uma decisão administrativa ou regra de negócio.

#### Características

* Novas autenticações devem ser bloqueadas.
* Sessões existentes devem ser revogadas.
* Tokens associados à conta devem deixar de ser aceitos.
* A conta poderá retornar a `ACTIVE` mediante uma ação autorizada.

---

### LOCKED

Indica que a conta foi bloqueada por uma condição relacionada à segurança.

Exemplos de eventos que podem resultar nesse estado:

* Detecção de comportamento suspeito.
* Excesso de tentativas de autenticação.
* Reutilização de Refresh Token.
* Violação de alguma política de segurança.

#### Características

* Novas autenticações devem ser bloqueadas.
* Sessões existentes poderão ser revogadas de acordo com a política de segurança.
* Tokens associados poderão ser invalidados.
* A liberação dependerá da regra que originou o bloqueio.

---

# Transições

## Cadastro

```text
NEW
 │
 ▼
PENDING_EMAIL_VERIFICATION
```

## Confirmação de e-mail

```text
PENDING_EMAIL_VERIFICATION
 │
 │ e-mail confirmado
 ▼
ACTIVE
```

## Suspensão

```text
ACTIVE
 │
 │ ação administrativa
 ▼
SUSPENDED
```

## Bloqueio de segurança

```text
ACTIVE
 │
 │ evento de segurança
 ▼
LOCKED
```

## Reativação

Uma conta `SUSPENDED` poderá retornar para `ACTIVE` mediante uma ação autorizada.

Uma conta `LOCKED` poderá retornar para `ACTIVE` somente após a condição que originou o bloqueio ser tratada de acordo com a política de segurança.

---

# Regras importantes

### Conta não verificada

Uma conta em `PENDING_EMAIL_VERIFICATION` não poderá receber tokens de autenticação de sessão.

### Conta suspensa

Uma conta em `SUSPENDED` não poderá iniciar novas sessões.

Sessões existentes deverão ser revogadas quando a suspensão ocorrer.

### Conta bloqueada

Uma conta em `LOCKED` não poderá iniciar novas sessões.

A resposta ao bloqueio deverá evitar expor informações que possam auxiliar um atacante a entender os mecanismos internos de segurança.

### Segurança

As transições de estado deverão ocorrer através de operações explícitas do domínio.

Não deverá ser permitido alterar o status da conta diretamente de qualquer ponto da aplicação.

---

# Princípio

O estado da conta representa uma condição de negócio ou segurança.

Ele não deve ser utilizado como substituto para estados temporários de autenticação, sessão ou 2FA.

Esses estados pertencem aos seus respectivos contextos.
