# Contexto do Projeto

## Visão geral

Este projeto explora uma das abordagens possíveis para a construção de um sistema de autenticação seguro e reutilizável, capaz de ser utilizado como mecanismo de login para diferentes tipos de plataformas.

A proposta não é apenas implementar um fluxo de login, mas estudar e demonstrar as decisões técnicas envolvidas na construção de um sistema de autenticação, especialmente no gerenciamento e na revogação de tokens.

Neste projeto, será utilizada uma estratégia baseada em **blacklist de tokens**, permitindo que tokens previamente emitidos possam ser invalidados antes de sua expiração natural.

## Objetivo

O objetivo é construir uma plataforma de autenticação que permita ao usuário se autenticar de diferentes formas, mantendo como foco a segurança, o controle das sessões e a possibilidade de revogação de credenciais de acesso.

Além da implementação, o projeto busca documentar o raciocínio por trás das decisões arquiteturais, apresentando as alternativas consideradas, os motivos das escolhas e seus respectivos trade-offs.

## Estratégia de revogação

O projeto utilizará o conceito de **token blacklist** para controlar tokens que não devem mais ser considerados válidos.

Essa estratégia será utilizada para possibilitar cenários como logout e revogação de sessões, mesmo quando o token ainda não tiver atingido sua data de expiração.

A implementação e as decisões relacionadas à blacklist serão detalhadas posteriormente na documentação de arquitetura.
