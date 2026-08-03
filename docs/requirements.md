# Requisitos

## Requisitos Funcionais

O sistema deverá disponibilizar mecanismos para gerenciamento de identidade, autenticação e sessões de usuários.

### RF01 — Cadastro de usuário

O sistema deverá permitir que novos usuários realizem seu cadastro utilizando suas credenciais.

### RF02 — Autenticação por credenciais

O sistema deverá permitir que usuários autenticados realizem login utilizando e-mail e senha.

### RF03 — Autenticação de dois fatores

O sistema deverá permitir a utilização de autenticação de dois fatores (2FA) como uma camada adicional de segurança durante o processo de autenticação.

### RF04 — Autenticação com Google

O sistema deverá permitir que usuários realizem autenticação utilizando uma conta Google.

### RF05 — Autenticação com Microsoft

O sistema deverá permitir que usuários realizem autenticação utilizando uma conta Microsoft.

### RF06 — Single Sign-On

O sistema deverá oferecer suporte a autenticação federada por meio de Single Sign-On (SSO).

### RF07 — Recuperação de senha

O sistema deverá permitir que usuários recuperem o acesso à conta por meio de um fluxo seguro de recuperação de senha.

### RF08 — Logout

O sistema deverá permitir que usuários encerrem sua sessão autenticada.

### RF09 — Revogação de tokens

O sistema deverá permitir a revogação de tokens de autenticação antes de sua expiração natural.

### RF10 — Blacklist de tokens

O sistema deverá manter uma estratégia de blacklist para identificar tokens que foram revogados e impedir sua utilização após a revogação.

### RF11 — Gerenciamento de dispositivos

O sistema deverá permitir que o usuário visualize os dispositivos associados às suas sessões autenticadas.

### RF12 — Gerenciamento de sessões

O sistema deverá manter informações necessárias para identificar e controlar as sessões autenticadas de um usuário.

---

## Requisitos Não Funcionais

Os requisitos não funcionais serão definidos e refinados conforme as decisões arquiteturais do projeto forem tomadas.

Inicialmente, o projeto terá como princípios:

* Segurança
* Manutenibilidade
* Testabilidade
* Observabilidade
* Escalabilidade
* Baixo acoplamento
* Clareza arquitetural

Esses princípios serão detalhados posteriormente na documentação de arquitetura e nas decisões arquiteturais (ADRs).
