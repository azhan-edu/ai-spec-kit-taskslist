# Research: Task Manager TypeScript CLI

**Feature**: Task Manager  
**Date**: 2026-05-03  
**Phase**: Phase 0 - Research & Technical Decisions

## Decisions Made

### 1. TypeScript + Node.js Runtime

**Decision**: Use TypeScript 5.x with Node.js 18+  
**Rationale**: Mandated by constitution (TypeScript Mandatory principle). Node.js provides cross-platform CLI capabilities and strong TypeScript support.  
**Alternatives Considered**:  
- Python: Would violate constitution, not evaluated
- Go: Would violate constitution, not evaluated
- Rust: Would violate constitution, not evaluated

### 2. Jest for Unit Testing

**Decision**: Jest as primary test framework  
**Rationale**: Industry standard for TypeScript/Node.js, matches constitution requirement. Excellent developer experience with auto-mocking and snapshot testing.  
**Alternatives Considered**:  
- Mocha + Chai: More setup required, less integrated
- Vitest: Newer, less maturity than Jest for file I/O testing

### 3. Local File Storage (JSON)

**Decision**: tasks.json in app directory for persistence  
**Rationale**: Simplicity principle (no database complexity). Spec explicitly requires local tasks.json. Single-user assumption enables synchronous I/O.  
**Alternatives Considered**:  
- SQLite: Over-engineering for single-user local app
- In-memory storage: Violates persistence requirement
- Cloud storage: Out of scope, adds complexity

### 4. Feature-Sliced Design (FSD) Architecture

**Decision**: Implement with FSD slices: shared/, entities/, features/, widgets/  
**Rationale**: Constitution mandates FSD. Provides clear separation of concerns and independent feature testability.  
**Alternatives Considered**:  
- MVC: Violates FSD constitution
- Layered architecture: Less modular than FSD

### 5. Synchronous File I/O

**Decision**: Use synchronous fs API for local file operations  
**Rationale**: Single-user CLI app, operations expected to be fast (<100ms constraint). Simpler code, no async complexity needed.  
**Alternatives Considered**:  
- Async/await: Over-engineering for single file, adds complexity
- Streams: Not needed for small JSON files

### 6. CLI Argument Parsing Strategy

**Decision**: Simple yargs or process.argv parsing  
**Rationale**: Minimal complexity, no external dependencies unless complexity grows. Task manager has simple commands (add, list, complete).  
**Alternatives Considered**:  
- Commander.js: More features than needed currently
- Custom parsing: Reinvention if requirements grow

### 7. Error Handling Strategy

**Decision**: Graceful error messages to stderr, exit codes for scripting  
**Rationale**: Console interface principle requires proper error handling. Exit codes enable shell integration.  
**Alternatives Considered**:  
- Silent failures: Poor UX
- Exceptions: Not appropriate for CLI

## Research Summary

All technical decisions align with the constitution requirements and feature specification. No blocking issues identified. Ready to proceed to Phase 1 (Design & Contracts).

## Key Implementation Notes

- TypeScript strict mode enabled (tsconfig.json)
- Jest configured with automatic type detection
- No external data store needed (JSON file)
- Operations target <100ms performance (achievable with sync I/O)
- Single-user model simplifies concurrency concerns
