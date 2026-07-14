# Security policy

## Reporting

Do not open public issues for vulnerabilities or privacy incidents. Use
GitHub's private vulnerability reporting feature for this repository.

Include the affected contract or site route, reproduction steps, impact, and
any suggested mitigation. Maintainers will acknowledge a report within seven
days and coordinate disclosure after a fix is available.

## Scope

This repository contains specifications and a static publication site. The
future product architecture described here is not a deployed service.
Security-relevant specification defects—especially authorization ambiguity,
unsafe asset handling, cross-tenant access, or game-session integrity—are in
scope.

## Dependency note

The static publication build currently inherits a moderate PostCSS advisory
through Next.js 16.2.9. The affected package runs during trusted-source builds
and is not shipped as a server runtime. No non-breaking stable Next.js upgrade
is available as of 2026-06-28; Dependabot and regular audits track the upstream
fix.
