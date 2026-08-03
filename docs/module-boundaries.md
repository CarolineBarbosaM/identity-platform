# Fronteiras dos Módulos

Este documento define as responsabilidades e limites dos principais módulos da Identity Platform.

O objetivo é evitar que responsabilidades de diferentes contextos sejam concentradas em um único módulo e reduzir o acoplamento entre as partes do sistema.

---

## Identity

### Responsabilidade

Gerenciar a identidade e o estado da conta do usuário.

### Responsabilidades

* Cadastro de usuários.
* Dados da conta.
* Credenciais locais.
* E-mail.
* Estado da conta.
* Verificação de e-mail.
* Recuperação relacionada à identidade.
* Associação de identidades externas à conta.

### Não é responsabilidade

* Gerar tokens.
* Validar Access Tokens.
* Gerenciar blacklist.
* Criar ou revogar sessões.
* Validar 2FA.
* Implementar integrações com provedores externos.

---

## Authentication

### Responsabilidade

Orquestrar o processo de autenticação e determinar quando uma identidade pode ser considerada autenticada.

### Responsabilidades

* Login com credenciais locais.
* Coordenação dos fatores de autenticação.
* Criação do contexto temporário de autenticação.
* Coordenação da autenticação federada.
* Conclusão da autenticação.
* Solicitação de criação da sessão após autenticação concluída.
* Solicitação de emissão dos tokens após autenticação concluída.

### Não é responsabilidade

* Implementar a geração dos tokens.
* Implementar a blacklist.
* Persistir diretamente informações de sessão.
* Implementar os mecanismos específicos de 2FA.
* Implementar integrações específicas com provedores externos.

---

## Sessions

### Responsabilidade

Gerenciar o ciclo de vida das sessões autenticadas.

### Responsabilidades

* Criar sessões.
* Consultar sessões.
* Identificar dispositivos.
* Controlar estado das sessões.
* Expirar sessões.
* Revogar sessões.
* Encerrar sessões individualmente.
* Associar sessões aos usuários.

### Não é responsabilidade

* Validar senhas.
* Implementar 2FA.
* Gerar JWTs.
* Implementar autenticação Google/Microsoft.
* Implementar a lógica da blacklist.

---

## Tokens

### Responsabilidade

Gerenciar o ciclo de vida das credenciais utilizadas para autenticação.

### Responsabilidades

* Geração de Access Tokens.
* Geração de Refresh Tokens.
* Validação de tokens.
* Controle de expiração.
* Refresh Token Rotation.
* Identificação por `jti`.
* Revogação de tokens.
* Consulta à blacklist.

### Não é responsabilidade

* Determinar regras de negócio relacionadas à autenticação.
* Gerenciar usuários.
* Gerenciar dispositivos.
* Validar credenciais locais.
* Implementar provedores externos.

---

## Two-Factor Authentication

### Responsabilidade

Gerenciar o segundo fator de autenticação.

### Responsabilidades

* Configuração do 2FA.
* Geração de challenges.
* Validação do segundo fator.
* Controle do estado temporário do segundo fator.

### Não é responsabilidade

* Criar sessões.
* Gerar Access Tokens.
* Gerar Refresh Tokens.
* Gerenciar usuários.
* Implementar autenticação federada.

---

## Federation

### Responsabilidade

Gerenciar autenticação por meio de provedores externos de identidade.

### Responsabilidades

* Google.
* Microsoft.
* OpenID Connect.
* Single Sign-On.
* Validação das respostas dos provedores.
* Normalização das identidades externas.
* Associação de identidades externas às contas locais.

### Não é responsabilidade

* Gerenciar sessões.
* Gerar tokens internos da aplicação.
* Implementar blacklist.
* Validar credenciais locais.
* Gerenciar o ciclo de vida dos usuários.

---

# Relações entre módulos

Os módulos deverão se comunicar por meio de contratos bem definidos.

Um fluxo de autenticação local poderá ser representado conceitualmente como:

```text
Authentication
      │
      ├──► Identity
      │       └── valida credenciais
      │
      ├──► Two-Factor
      │       └── valida segundo fator
      │
      ├──► Sessions
      │       └── cria sessão
      │
      └──► Tokens
              └── emite tokens
```

Um fluxo federado poderá ser representado como:

```text
Authentication
      │
      └──► Federation
              │
              └── valida identidade externa
                       │
                       ▼
                    Identity
                       │
                       ▼
                  conta local
                       │
                       ▼
                  Authentication
                       │
                 ┌─────┴─────┐
                 ▼           ▼
              Sessions     Tokens
```

## Princípio de dependência

Um módulo não deverá acessar diretamente detalhes internos de outro módulo.

A comunicação deverá ocorrer por meio de contratos explícitos, permitindo que a implementação interna de um módulo seja alterada sem exigir alterações desnecessárias nos consumidores.

## Regra de arquitetura

A existência de uma dependência entre módulos deverá ser justificada pela responsabilidade compartilhada entre eles.

Não deverão ser criadas dependências apenas por conveniência de implementação.
