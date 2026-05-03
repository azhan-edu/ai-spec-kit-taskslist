<!-- SPECKIT START -->
## Current Feature: Extended Task Statuses with Color Coding

**Status**: Phase 1 Design Complete  
**Branch**: 002-add-task-statuses  

### Key Documentation

- **Specification**: [specs/002-add-task-statuses/spec.md](specs/002-add-task-statuses/spec.md)
- **Implementation Plan**: [specs/002-add-task-statuses/plan.md](specs/002-add-task-statuses/plan.md)
- **Research Decisions**: [specs/002-add-task-statuses/research.md](specs/002-add-task-statuses/research.md)
- **Data Model**: [specs/002-add-task-statuses/data-model.md](specs/002-add-task-statuses/data-model.md)
- **CLI Contracts**: [specs/002-add-task-statuses/contracts/cli-commands.md](specs/002-add-task-statuses/contracts/cli-commands.md)
- **Developer Guide**: [specs/002-add-task-statuses/quickstart.md](specs/002-add-task-statuses/quickstart.md)

### Architecture

**Technology Stack**: TypeScript 5.x + Node.js 18+ + Jest  
**Pattern**: Feature-Sliced Design (FSD)  
**Storage**: Local tasks.json file (backwards-compatible, no format change)  
**Commands**: add, list, complete, cancel, fail  

### For Additional Context

Read [specs/002-add-task-statuses/plan.md](specs/002-add-task-statuses/plan.md) for technical context, architecture decisions, and project structure.

<!-- SPECKIT END -->

## Git Conventions

- Commit messages must include the spec name or ID (e.g., `[002-add-task-statuses]` or `[Spec Kit 002]`).
