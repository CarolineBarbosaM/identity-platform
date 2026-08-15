# Identity Platform

A security-focused identity and authentication platform built to explore the architecture and engineering challenges behind centralized identity management.

The project is designed around a simple idea:

> **Authentication should be a platform concern, not something every application has to reinvent.**

Instead of embedding authentication concerns inside each business application, the Identity Platform provides a dedicated boundary for identity, authentication, sessions, tokens, two-factor authentication and federated identity.

---

## Why this project?

Authentication starts simple.

A login endpoint, password validation and a token can be enough for a small application.

As the system grows, however, authentication becomes responsible for much more:

- Identity lifecycle
- Session management
- Token lifecycle and revocation
- Two-factor authentication
- External identity providers
- Temporary authentication state
- Account verification and recovery

Keeping these concerns inside individual applications can lead to duplicated logic, inconsistent security decisions and tightly coupled authentication flows.

The Identity Platform explores a different approach:

> **Centralize identity and authentication while keeping the architecture modular and simple to operate.**

---

## Architecture

The platform is being built as a **Modular Monolith using NestJS**.

It runs as a single deployable application while maintaining clear boundaries between its main responsibilities:

- Identity
- Authentication
- Sessions
- Tokens
- Two-Factor Authentication
- Federation

The architecture deliberately avoids introducing microservices prematurely. The goal is to maintain operational simplicity while preserving boundaries that allow individual components to evolve or be extracted later if the system actually requires it.

For more details, see the [Architecture Documentation](./docs/architecture.md).

### High-level architecture

```text
                         ┌─────────────────────┐
                         │       Clients       │
                         │ Web / Mobile / APIs │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Identity Platform  │
                         │      NestJS API     │
                         │   Modular Monolith  │
                         │                     │
                         │ ┌────────┐ ┌──────┐ │
                         │ │Identity│ │ Auth │ │
                         │ └────────┘ └──────┘ │
                         │                     │
                         │ ┌────────┐ ┌──────┐ │
                         │ │Sessions│ │Tokens│ │
                         │ └────────┘ └──────┘ │
                         │                     │
                         │ ┌────────┐ ┌──────┐ │
                         │ │  2FA   │ │Feder.│ │
                         │ └────────┘ └──────┘ │
                         └─────────┬───────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              PostgreSQL        Redis       External Providers
                                             Google / Microsoft
                                                  / OIDC

                                   │
                                   ▼
                              E-mail Service
```

---

## Core Concepts

### Identity

Responsible for the user's identity and account lifecycle.

This includes:

- User registration
- Account data
- Account state
- Email verification
- Local credentials
- Account recovery

### Authentication

Responsible for the authentication process itself.

It orchestrates credential validation and the authentication context without taking ownership of token storage or lifecycle management.

### Sessions

Responsible for the lifecycle of authenticated sessions.

A session represents the persistent context of an authentication performed by a specific device or client.

This includes:

- Session creation
- Device identification
- Session state
- Expiration
- Revocation
- Session listing
- Individual device revocation

### Tokens

Responsible for the lifecycle of authentication credentials.

The current strategy defines:

- Access Token: **15 minutes**
- Refresh Token: **30 days**
- Refresh Token Rotation
- Token expiration
- Token revocation
- Token blacklist

### Two-Factor Authentication

Responsible for the second stage of authentication.

When 2FA is enabled, successful password validation is not sufficient to complete authentication.

Authentication tokens are only issued after successful second-factor validation.

Temporary challenges and authentication state are handled separately from persistent identity data.

### Federation

Responsible for integration with external identity providers.

The architecture is designed to support:

- Google
- Microsoft
- OpenID Connect
- Single Sign-On
- External identity validation
- Association between external and local identities

---

## Infrastructure

### PostgreSQL

The primary persistent datastore.

It stores domain data such as:

- Users
- Credentials
- External identities
- Sessions
- Authentication configuration
- Account recovery and verification data

### Redis

Used for fast-access and temporary state.

Current use cases include:

- Token blacklist
- Temporary authentication contexts
- 2FA challenges
- Temporary authentication state

Blacklist entries use a TTL compatible with the remaining validity of the revoked token.

### External Identity Providers

Federated authentication is designed around external identity providers such as:

- Google
- Microsoft
- OpenID Connect-compatible providers

### E-mail Service

Email delivery is kept behind an abstraction so authentication flows remain independent from a specific email provider.

Current use cases include:

- Email verification
- Password recovery

---

## Security

Security is treated as an architectural concern rather than a layer added after implementation.

The project explores:

- Secure authentication flows
- Session lifecycle
- Token expiration
- Refresh Token Rotation
- Token revocation
- Token blacklist
- Two-factor authentication
- Authentication challenges
- Federated identity
- Temporary security state
- Account verification and recovery

---

## Testing

Authentication systems have a large number of failure scenarios, which makes automated testing an important part of the project.

The project includes unit and end-to-end tests covering identity and authentication flows.

---

## Engineering Questions

This project is driven by engineering questions rather than only by feature requirements.

### Where should authentication live?

Should every application own its own authentication logic, or should identity become a platform-level responsibility?

### How much should an authentication module know about tokens?

Authentication establishes identity, but token lifecycle has its own security and lifecycle concerns.

Where should that boundary exist?

### Why keep Sessions separate from Tokens?

A token and a session are related, but they represent different concepts.

How can separating their responsibilities make authentication easier to reason about and revoke?

### When should authentication state be persistent?

A completely stateless architecture can be attractive, but revocation, sessions and temporary authentication flows introduce cases where maintaining state is a security requirement.

### What belongs in PostgreSQL and what belongs in Redis?

Persistent identity data and short-lived security state have different characteristics.

How should that distinction influence the architecture?

### How should external identity providers fit into the system?

Google, Microsoft and OIDC should not dictate the internal identity model.

How can federation remain an integration concern instead of leaking provider-specific rules into the rest of the system?

### Why a Modular Monolith instead of microservices?

Having multiple responsibilities does not automatically mean having multiple deployable services.

The project explores whether strong module boundaries can provide the desired separation while keeping operational complexity low.

### When is it actually worth extracting a module into a separate service?

The architecture is designed to allow future extraction if scaling, ownership, deployment or other requirements justify it — rather than introducing distribution as a default.

These questions are part of the engineering process and are documented alongside the implementation through Architecture Decision Records (ADRs).

---

## Architectural Principles

The project follows a few principles:

- **Separation of responsibilities** — each module has a clear responsibility.
- **Low coupling** — modules communicate through well-defined contracts.
- **Infrastructure independence** — business rules should avoid unnecessary coupling to infrastructure technologies.
- **Security by default** — security is treated as a structural requirement.
- **State where necessary** — the system is not forced to be completely stateless when state improves control and security.
- **Incremental evolution** — components can be replaced or extracted when future requirements justify it.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| **NestJS** | Backend framework |
| **TypeScript** | Application language |
| **Fastify** | HTTP adapter |
| **PostgreSQL** | Persistent storage |
| **TypeORM** | Data access |
| **Redis** | Temporary and security-sensitive state |
| **Jest** | Unit and E2E testing |

---

## Architecture Decision Records

Important architectural decisions are documented as ADRs:

- [ADR-001 — Token Lifetime and Rotation](./docs/decisions/ADR-001-token-lifetime-and-rotation.md)
- [ADR-002 — Modular Monolith](./docs/decisions/ADR-002-modular-monolith.md)

---

## Project Status

🚧 **Work in progress**

The Identity Platform is being developed incrementally.

The focus is not only on implementing authentication features, but on exploring the architectural decisions, security trade-offs and boundaries required to build a maintainable identity platform.

---

## Author

**Caroline Barbosa Martins**

Software Engineer focused on backend development, architecture and building reliable systems.

---

> **Identity should be a platform concern, not something every application has to reinvent.**