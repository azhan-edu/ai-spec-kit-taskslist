<!--
Sync Impact Report:
- Version change: N/A → 1.0.0
- Added principles: I. TypeScript Mandatory, II. Unit Testing First, III. Feature-Sliced Design, IV. Console Interface, V. Simplicity and Modularity
- Added sections: Technology Stack, Development Workflow
- Templates requiring updates: plan-template.md (constitution check gates)
- Follow-up TODOs: Update plan-template.md with specific constitution gates
-->
# TypeScript Console App Constitution

## Core Principles

### I. TypeScript Mandatory
All code must be written in TypeScript. Strict type checking enabled. No plain JavaScript allowed.

### II. Unit Testing First
Every feature must have comprehensive unit tests written before implementation. TDD approach enforced: tests → fail → implement → pass.

### III. Feature-Sliced Design
Architecture follows Feature-Sliced Design principles. Features are self-contained, layered properly with shared, entities, features, widgets, pages.

### IV. Console Interface
Application is a console app. Input via command line arguments and stdin, output to stdout, errors to stderr.

### V. Simplicity and Modularity
Keep code simple and modular. Follow YAGNI principles. Avoid over-engineering.

## Technology Stack

Node.js runtime, TypeScript compiler, Jest for unit testing, npm for package management.

## Development Workflow

Follow TDD cycle. Code reviews required for all changes. Unit tests must pass before merge.

## Governance

Constitution supersedes all other practices. Amendments require consensus and documentation. All code must comply with principles. Use README.md for runtime guidance.

**Version**: 1.0.0 | **Ratified**: 2026-05-03 | **Last Amended**: 2026-05-03
