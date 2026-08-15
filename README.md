# identity-platform
A security-focused identity and authentication platform exploring session management, token revocation, 2FA and federated identity.
# Identity Platform

A security-focused identity and authentication platform designed to centralize identity management and authentication concerns for multiple applications.

The project explores how authentication can be treated as an independent platform rather than as a responsibility embedded inside each business application.

## Why?

Authentication is often implemented as part of each application.

At first, this seems simple: a login endpoint, password validation, sessions and maybe an OAuth provider.

As the number of applications grows, however, authentication concerns tend to become duplicated:

- User identity is managed in multiple places
- Authentication rules are implemented differently across services
- Session and token management become inconsistent
- Security fixes need to be replicated across applications
- Integrations with identity providers are tightly coupled to business applications

The Identity Platform explores a different approach:

> **Authentication as a shared platform responsibility.**

Applications delegate identity and authentication concerns to a dedicated service and focus on their own business domains.

## Architecture

The platform is designed around a clear separation between **identity**, **authentication**, **authorization** and **business applications**.

```text
                    ┌──────────────────────┐
                    │    Application A     │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    Application B     │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    Application C     │
                    └──────────┬───────────┘
                               │
                               │ Authentication
                               ▼
              ┌─────────────────────────────────┐
              │        IDENTITY PLATFORM        │
              │                                 │
              │  ┌───────────────────────────┐  │
              │  │      Authentication       │  │
              │  │                           │  │
              │  │  Credentials              │  │
              │  │  Google SSO               │  │
              │  │  Sessions / Tokens        │  │
              │  └─────────────┬─────────────┘  │
              │                │                │
              │  ┌─────────────▼─────────────┐  │
              │  │       Authorization       │  │
              │  │                           │  │
              │  │  Users                    │  │
              │  │  Roles / Permissions      │  │
              │  └─────────────┬─────────────┘  │
              │                │                │
              │  ┌─────────────▼─────────────┐  │
              │  │        PostgreSQL         │  │
              │  └───────────────────────────┘  │
              └─────────────────────────────────┘
                               │
                               │ Federated Identity
                               ▼
                         ┌─────────────┐
                         │   Google    │
                         └─────────────┘