# UI/UX Checklist: Task Manager CLI

**Purpose**: Validate that CLI user interaction and user experience requirements are complete, clear, consistent, accessible, and measurable. Tests requirement quality, not implementation.

**Created**: 2026-05-03

**Feature**: [specs/001-task-manager/spec.md](../spec.md)

**Scope**: Core + Errors + Accessibility + Performance (Comprehensive)

**Audience**: Author, Peer Reviewers, QA at all phases (Pre-commit through Release Gate)

**Risk Emphasis**: Balanced - Completeness + Clarity + Consistency

---

## Requirement Completeness

- [ ] CHK001 - Are input modes (command-line argument vs. interactive stdin) defined for each command? [Gap, Spec §CLI-Contracts]
- [ ] CHK002 - Are all output states documented for `add` command (success, empty title error, file error)? [Completeness, Spec §CLI-Contracts §add]
- [ ] CHK003 - Are all output states documented for `list` command (empty list, populated list, file error)? [Completeness, Spec §CLI-Contracts §list]
- [ ] CHK004 - Are all output states documented for `complete` command (success, not found error, file error)? [Completeness, Spec §CLI-Contracts §complete]
- [ ] CHK005 - Is help/usage message output defined for commands? [Gap, Spec §CLI-Contracts]
- [ ] CHK006 - Are "no arguments provided" scenarios documented for each command? [Gap, Spec §CLI-Contracts]
- [ ] CHK007 - Are loading/processing states defined? [Gap]
- [ ] CHK008 - Is the behavior documented when adding a task while file is being read? [Gap, Exception Flow]
- [ ] CHK009 - Are all numeric/string boundary conditions specified (e.g., max title length 500 chars)? [Completeness, Spec §FR-001]

---

## Requirement Clarity

- [ ] CHK010 - Is the exact list output format (table layout with columns) explicitly specified? [Clarity, Spec §CLI-Contracts §list]
- [ ] CHK011 - Are table column widths or alignment rules defined for `list` output? [Ambiguity, Spec §CLI-Contracts §list]
- [ ] CHK012 - Is error message phrasing ("Error: Task title cannot be empty") standardized? [Ambiguity, Spec §CLI-Contracts §add]
- [ ] CHK013 - Is the success message format quantified (e.g., "✓ Task added:" vs other indicators)? [Clarity, Spec §CLI-Contracts §add]
- [ ] CHK014 - Is the exact ID format specified with examples (sequential integers vs. UUID)? [Ambiguity/Conflict, Spec §ID-Format & §CLI-Contracts examples]
- [ ] CHK015 - Are exit codes (0, 1, 2) defined with explicit mappings for all scenarios? [Completeness, Spec §CLI-Contracts]
- [ ] CHK016 - Is "Task not found" message format explicitly defined? [Clarity, Spec §CLI-Contracts §complete]
- [ ] CHK017 - Is the title character limit (1-500) documented as a user-facing constraint? [Clarity, Spec §CLI-Contracts §add]
- [ ] CHK018 - Is the behavior for whitespace-only titles specified? [Clarity, Spec §Edge Cases]

---

## Requirement Consistency

- [ ] CHK019 - Do success indicators match across all three commands (consistent use of "✓")? [Consistency, Spec §CLI-Contracts]
- [ ] CHK020 - Do error message formats match across all commands (consistent "Error:" prefix)? [Consistency, Spec §CLI-Contracts]
- [ ] CHK021 - Is exit code usage consistent across all error scenarios? [Consistency, Spec §CLI-Contracts exit-codes]
- [ ] CHK022 - Do output messages use consistent capitalization and punctuation? [Consistency, Spec §CLI-Contracts]
- [ ] CHK023 - Is the output destination (stdout vs. stderr) consistent for all message types? [Consistency, Spec §CLI-Contracts §I/O-Protocol]
- [ ] CHK024 - Do the example outputs in CLI contracts match the documented format specifications? [Conflict, Spec §CLI-Contracts examples]
- [ ] CHK025 - Is terminology consistent across spec and contracts (e.g., "pending/done" vs. other status names)? [Consistency, Spec §FR-002]
- [ ] CHK026 - Is the ID reference format consistent between spec and contracts (sequential integers vs. UUIDs)? [Conflict, Spec vs. Spec §Clarifications vs. §CLI-Contracts examples]

---

## Accessibility & Non-Visual Interaction

- [ ] CHK027 - Are color dependencies documented (e.g., does "✓" green check reliance exclude colorblind users)? [Gap, Spec §CLI-Contracts]
- [ ] CHK028 - Are terminal limitations documented (no colors, no graphics)? [Clarity, Spec §CLI-Contracts]
- [ ] CHK029 - Is screen reader compatibility specified (e.g., is text-only output required)? [Gap, Spec §CLI-Contracts]
- [ ] CHK030 - Is keyboard-only operation fully supported and documented? [Gap, Spec §CLI-Contracts]
- [ ] CHK031 - Are command abbreviations documented or explicitly excluded? [Gap, Spec §CLI-Contracts]
- [ ] CHK032 - Is the behavior for Tab/autocomplete documented? [Gap, Spec §CLI-Contracts]
- [ ] CHK033 - Are escape character or special character handling requirements documented? [Gap, Spec §CLI-Contracts]

---

## Error Message Quality & Recovery

- [ ] CHK034 - Does each error message include actionable recovery steps? [Completeness, Spec §CLI-Contracts §Error-Handling]
- [ ] CHK035 - Are error messages user-friendly (not technical)? [Clarity, Spec §CLI-Contracts]
- [ ] CHK036 - Is the "Task not found" message clear about whether ID format was wrong vs. ID doesn't exist? [Clarity, Spec §CLI-Contracts §complete]
- [ ] CHK037 - Is file system error messaging actionable (e.g., "Cannot write tasks.json: Permission denied")? [Clarity, Spec §CLI-Contracts §System-Errors]
- [ ] CHK038 - Are suggestions provided in error messages (e.g., "Try: app list")? [Gap]
- [ ] CHK039 - Is error message consistency tested across all three commands? [Consistency]

---

## Output Format & Presentation

- [ ] CHK040 - Is the separator between table columns (tabs, spaces, pipes) explicitly defined? [Ambiguity, Spec §CLI-Contracts §list]
- [ ] CHK041 - Is truncation behavior specified for long task titles in `list` output? [Gap, Spec §CLI-Contracts §list]
- [ ] CHK042 - Is sorting order specified for `list` output (by ID, by creation time, by status)? [Gap, Spec §CLI-Contracts §list]
- [ ] CHK043 - Is the "No tasks found" message position/format consistent with table format? [Consistency, Spec §CLI-Contracts §list]
- [ ] CHK044 - Are multi-line task titles supported or explicitly excluded? [Gap, Spec §CLI-Contracts §add]
- [ ] CHK045 - Is the newline behavior specified for output (each row ends with newline)? [Gap, Spec §CLI-Contracts]

---

## Performance & Scalability

- [ ] CHK046 - Are performance requirements defined for adding a task? [Gap, Spec §Success-Criteria §SC-001 mentions "under 5 seconds" but should clarify for single add operation]
- [ ] CHK047 - Are performance requirements defined for listing tasks with 100+ items? [Gap]
- [ ] CHK048 - Is the maximum task list size documented or tested? [Gap, Spec §Assumptions]
- [ ] CHK049 - Is the output rendering performance requirement (time to display list) specified? [Gap]

---

## Command Help & Documentation

- [ ] CHK050 - Is a `--help` or `-h` flag documented for the main app or each command? [Gap, Spec §CLI-Contracts]
- [ ] CHK051 - Is usage syntax displayed when arguments are missing or incorrect? [Gap, Spec §CLI-Contracts]
- [ ] CHK052 - Are examples provided for each command? [Completeness, Spec §CLI-Contracts examples exist but not in main flow]

---

## Interactive Input Mode

- [ ] CHK053 - Is the prompt text for interactive title input defined? [Gap, Spec §CLI-Contracts §add §Input-Modes]
- [ ] CHK054 - Is the prompt text for interactive ID input defined? [Gap, Spec §CLI-Contracts §complete §Input-Modes]
- [ ] CHK055 - Is backspace/line editing support required? [Gap, Spec §CLI-Contracts]
- [ ] CHK056 - Is Ctrl+C / signal handling behavior documented? [Gap]

---

## Edge Cases & Boundary Conditions

- [ ] CHK057 - Are very long titles (approaching 500 char limit) handled gracefully? [Gap, Spec §CLI-Contracts §add]
- [ ] CHK058 - Is behavior defined for unicode/emoji in task titles? [Gap]
- [ ] CHK059 - Is behavior defined for very large task lists (>10,000 items)? [Gap]
- [ ] CHK060 - Is the behavior for completing the same task twice documented? [Clarity, Spec §Edge-Cases]
- [ ] CHK061 - Is the behavior when tasks.json is deleted between commands documented? [Gap, Spec §Edge-Cases]
- [ ] CHK062 - Is the behavior when tasks.json is edited externally documented? [Gap]

---

## Success Criteria Measurability

- [ ] CHK063 - Is "Users can add a task in under 5 seconds" quantified (does this mean from command start or just the prompt)? [Ambiguity, Spec §SC-001]
- [ ] CHK064 - Is "All tasks are displayed correctly" quantified with pass/fail criteria? [Ambiguity, Spec §SC-002]
- [ ] CHK065 - Is "Task completion updates status immediately" quantified (synchronous operation or async)? [Ambiguity, Spec §SC-003]

---

## Notes

**Critical Conflicts Detected**:
- **Conflict**: CLI contracts examples reference UUIDs (550e8400-e29b-41d4...) but spec clarification and assumption state sequential integers (1, 2, 3). This must be resolved before implementation.
- **Gap**: ID format examples in contracts do not match specification clarification. Update contracts or re-clarify.

**High-Priority Items**:
- CHK010, CHK011: `list` output format needs more specific definition
- CHK014, CHK024, CHK026: ID format conflict across documents
- CHK042: Sorting order for list output undefined
- CHK050, CHK051: Help/usage documentation missing

**Deferred to Design Phase** (Better suited for implementation planning):
- CHK047-CHK049: Large dataset performance testing strategy
- CHK061-CHK062: File system race condition handling
