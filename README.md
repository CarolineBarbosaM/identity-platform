# Identity Platform

A security-focused identity and authentication platform built to explore the architecture and engineering challenges behind centralized identity management.

The project is designed around a simple idea:

> Authentication should be a platform concern, not something every application has to reinvent.

Instead of embedding authentication logic inside each business application, the Identity Platform provides a dedicated boundary for identity, authentication, sessions, tokens, two-factor authentication and federated identity.

## Why this project?

Authentication starts simple.

A login endpoint, password validation and a token can be enough for a small application.

As the system grows, however, authentication becomes responsible for much more:

- Identity lifecycle
- Session management
- Token lifecycle and revocation
- Two-factor authentication
- External identity providers
- Security-sensitive temporary state
- Recovery and verification flows

Keeping these concerns inside individual applications can lead to duplicated logic, inconsistent security decisions and tightly coupled authentication flows.

The Identity Platform explores how these responsibilities can be organized into a dedicated service with clear module boundaries.

## Architecture

The project currently follows a **modular monolith** architecture.

The decision was intentional: the goal is to establish strong domain boundaries and independent responsibilities without introducing the operational complexity of microservices before it is actually necessary.

```text
                         ┌──────────────────────┐
                         │     Applications     │
                         │                      │
                         │   Business Systems   │
                         └──────────┬───────────┘
                                    │
                                    │ Authentication
                                    ▼
              ┌─────────────────────────────────────────┐
              │             IDENTITY PLATFORM            │
              │              Modular Monolith            │
              │                                         │
              │  ┌──────────────┐  ┌─────────────────┐  │
              │  │   Identity   │  │ Authentication  │  │
              │  └──────────────┘  └─────────────────┘  │
              │                                         │
              │  ┌──────────────┐  ┌─────────────────┐  │
              │  │   Sessions   │  │     Tokens      │  │
              │  └──────────────┘  └─────────────────┘  │
              │                                         │
              │  ┌──────────────┐  ┌─────────────────┐  │
              │  │ Two-Factor   │  │   Federation    │  │
              │  └──────────────┘  └─────────────────┘  │
              │                                         │
              └──────────────┬──────────────────┬───────┘
                             │                  │
                             ▼                  ▼
                    ┌────────────────┐   ┌─────────────────┐
                    │   PostgreSQL   │   │      Redis      │
                    │                │   │                 │
                    │ Persistent     │   │ Blacklist       │
                    │ identity data  │   │ Challenges      │
                    │                │   │ Temporary state │
                    └────────────────┘   └─────────────────┘
                             │
                             │
              ┌──────────────┴──────────────────────┐
              │                                     │
              ▼                                     ▼
       ┌───────────────┐                    ┌───────────────┐
       │ External      │                    │ Email Service │
       │ Identity      │                    │               │
       │ Providers     │                    │ Decoupled     │
       │               │                    │ delivery      │
       │ Google        │                    │               │
       │ Microsoft     │                    │               │
       │ OIDC          │                    │               │
       └───────────────┘                    └───────────────┘