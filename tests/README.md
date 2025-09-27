# Tests

This directory contains all tests for the Sustainability Intelligence Platform. It is organized by test type and project area so that each component can be tested independently and end-to-end.

## Structure

- `unit/` — Fast tests for isolated functions, classes, and small modules
- `integration/` — Tests that validate interactions between modules and services
- `e2e/` — End-to-end tests running through the system as a user would
- `backend/` — Backend-specific tests and helpers
- `frontend/` — Frontend-specific tests and helpers
- `database/` — Database migrations, schema, and query tests

## Getting Started

Populate the per-area and per-type folders as appropriate for your chosen test frameworks (e.g., Jest/Vitest for frontend, PyTest/Jest for backend depending on stack, and tools like Playwright/Cypress for e2e). Add any shared test utilities under `tests/shared/`.

As the tooling is introduced to the repository, include commands here for installing dependencies and running the test suites.


