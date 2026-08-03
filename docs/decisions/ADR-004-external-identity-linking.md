# ADR-004 — Vinculação de identidades externas

## Status

Accepted

## Contexto

A Identity Platform permitirá autenticação por provedores externos, como Google, Microsoft e outros provedores compatíveis com OpenID Connect.

Uma identidade externa possui informações como e-mail e um identificador fornecido pelo próprio provedor.

Embora o e-mail possa ser utilizado para auxiliar na identificação de uma conta existente, ele não deve ser considerado, isoladamente, uma prova suficiente para vincular automaticamente uma nova identidade externa a uma conta local.

Um vínculo incorreto poderia permitir que uma identidade externa fosse associada a uma conta pertencente a outra pessoa.

## Decisão

A identidade externa será identificada primariamente pela combinação:

```text
provider + providerSubject
```

Onde:

* `provider` identifica o provedor de identidade.
* `providerSubject` representa o identificador estável da identidade fornecido pelo provedor.

Essa combinação deverá ser única dentro da plataforma.

## Identidade externa já existente

Quando o usuário realizar autenticação utilizando uma identidade externa já cadastrada:

```text
provider + providerSubject
        ↓
ExternalIdentity
        ↓
User
```

A identidade será associada diretamente ao usuário existente.

Nenhuma nova conta deverá ser criada.

## Identidade externa inexistente

Quando a identidade externa ainda não estiver cadastrada, o sistema deverá avaliar a possibilidade de associação com uma conta local.

### Caso não exista conta local correspondente

Uma nova conta poderá ser criada após a validação da identidade fornecida pelo provedor.

### Caso exista conta local com o mesmo e-mail

O sistema **não deverá vincular automaticamente** a identidade externa apenas com base na igualdade do e-mail.

O usuário deverá realizar uma etapa adicional que comprove controle sobre a conta local antes que o vínculo seja realizado.

A implementação específica dessa etapa será definida no fluxo de autenticação federada.

## Justificativa

O e-mail é um atributo da identidade, mas não deve ser tratado isoladamente como prova suficiente de posse da conta.

A separação entre:

```text
email
```

e:

```text
provider + providerSubject
```

permite distinguir a identidade fornecida pelo provedor da informação de contato associada a ela.

Essa abordagem reduz o risco de associação indevida de identidades externas.

## Consequências

### Positivas

* Reduz o risco de account takeover durante o vínculo.
* Permite múltiplas identidades externas por usuário.
* Mantém a identidade externa independente do e-mail.
* Permite alterar o e-mail sem necessariamente alterar a identidade fornecida pelo provedor.
* Evita criação desnecessária de contas duplicadas.

### Negativas

* O fluxo de vinculação se torna mais complexo.
* Usuários que possuem uma conta local e tentam utilizar um provedor externo poderão precisar realizar uma etapa adicional.
* O sistema precisará implementar um mecanismo seguro para comprovar controle da conta antes do vínculo.

## Regra

A igualdade entre e-mails **não será suficiente, por si só, para vincular automaticamente uma identidade externa a uma conta local existente**.
