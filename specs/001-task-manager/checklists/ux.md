# UI/UX Checklist: Task Manager CLI

**Purpose**: Validate that CLI user interaction and user experience requirements are complete, clear, consistent, accessible, and measurable. Tests requirement quality, not implementation.

**Created**: 2026-05-03  
**Updated**: 2026-05-03  

**Feature**: [specs/001-task-manager/spec.md](../spec.md)

**Scope**: Core + Errors + Accessibility + Performance (Comprehensive)

**Audience**: Author, Peer Reviewers, QA at all phases (Pre-commit through Release Gate)

**Risk Emphasis**: Balanced - Completeness + Clarity + Consistency

---

## Requirement Completeness

- [x] CHK001 - Are input modes (command-line argument vs. interactive stdin) defined for each command? [v1: CLI args only; interactive stdin deferred — contracts §Overview]
- [x] CHK002 - Are all output states documented for `add` command (success, empty title error, file error)? [Covered — contracts §add]
- [x] CHK003 - Are all output states documented for `list` command (empty list, populated list, file error)? [Covered — contracts §list]
- [x] CHK004 - Are all output states documented for `complete` command (success, not found error, file error)? [Covered — contracts §complete]
- [x] CHK005 - Is help/usage message output defined for commands? [Covered — contracts §Usage Output: print to stderr, exit 1]
- [x] CHK006 - Are "no arguments provided" scenarios documented for each command? [Covered — contracts §Usage Output and §Validation Errors]
- [x] CHK007 - Are loading/processing states defined? [v1: out of scope — synchronous CLI has no async loading states]
- [x] CHK008 - Is the behavior documented when adding a task while file is being read? [v1: out of scope — single-user, no concurrency]
- [x] CHK009 - Are all numeric/string boundary conditions specified (e.g., max title length 500 chars)? [Covered — contracts §add, §Edge Cases]

---

## Requirement Clarity

- [x] CHK010 - Is the exact list output format (table layout with columns) explicitly specified? [Covered — contracts §list Output Format]
- [x] CHK011 - Are table column widths or alignment rules defined for `list` output? [Covered — contracts §list: ID 4 chars right-aligned, Status 10 chars left-aligned, two-space separator]
- [x] CHK012 - Is error message phrasing ("Error: Task title cannot be empty") standardized? [Covered — contracts §add §complete §Error Handling]
- [x] CHK013 - Is the success message format quantified (e.g., "✓ Task added:" vs other indicators)? [Covered — contracts §add §complete]
- [x] CHK014 - Is the exact ID format specified with examples (sequential integers vs. UUID)? [Covered — sequential integers, resolved in data-model.md and contracts]
- [x] CHK015 - Are exit codes (0, 1, 2) defined with explicit mappings for all scenarios? [Covered — contracts §add §list §complete §Error Handling]
- [x] CHK016 - Is "Task not found" message format explicitly defined? [Covered — contracts §complete]
- [x] CHK017 - Is the title character limit (1-500) documented as a user-facing constraint? [Covered — contracts §add, §Edge Cases]
- [x] CHK018 - Is the behavior for whitespace-only titles specified? [Covered — contracts §Edge Cases: trimmed then rejected if empty]

---

## Requirement Consistency

- [x] CHK019 - Do success indicators match across all three commands (consistent use of "✓")? [Covered — contracts §I/O Protocol: ✓ prefix for success]
- [x] CHK020 - Do error message formats match across all commands (consistent "Error:" prefix)? [Covered — contracts §I/O Protocol: "Error:" prefix for errors]
- [x] CHK021 - Is exit code usage consistent across all error scenarios? [Covered — contracts §Error Handling table]
- [x] CHK022 - Do output messages use consistent capitalization and punctuation? [Covered — contracts §I/O Protocol]
- [x] CHK023 - Is the output destination (stdout vs. stderr) consistent for all message types? [Covered — contracts §I/O Protocol: success+info→stdout, errors+usage→stderr]
- [x] CHK024 - Do the example outputs in CLI contracts match the documented format specifications? [Covered — contracts examples updated to use integer IDs]
- [x] CHK025 - Is terminology consistent across spec and contracts (e.g., "pending/done" vs. other status names)? [Covered — "pending"/"done" used consistently throughout]
- [x] CHK026 - Is the ID reference format consistent between spec and contracts (sequential integers vs. UUIDs)? [Resolved — data-model.md updated to sequential integers; contracts use integer examples]

---

## Accessibility & Non-Visual Interaction

- [x] CHK027 - Are color dependencies documented (e.g., does "✓" green check reliance exclude colorblind users)? [v1: out of scope — plain text output only, no ANSI colour codes in v1]
- [x] CHK028 - Are terminal limitations documented (no colors, no graphics)? [v1: out of scope — plain text, no colours]
- [x] CHK029 - Is screen reader compatibility specified (e.g., is text-only output required)? [v1: out of scope — text-only output by default]
- [x] CHK030 - Is keyboard-only operation fully supported and documented? [v1: out of scope — CLI is inherently keyboard-operated]
- [x] CHK031 - Are command abbreviations documented or explicitly excluded? [v1: out of scope — no abbreviations in v1]
- [x] CHK032 - Is the behavior for Tab/autocomplete documented? [v1: out of scope — shell autocomplete not configured in v1]
- [x] CHK033 - Are escape character or special character handling requirements documented? [v1: out of scope — Node.js string handling covers standard cases]

---

## Error Message Quality & Recovery

- [x] CHK034 - Does each error message include actionable recovery steps? [Covered — contracts §Error Handling: "Usage: add <title>", "Hint: Run \`list\`..." added]
- [x] CHK035 - Are error messages user-friendly (not technical)? [Covered — contracts use plain language; file errors include specific reason]
- [x] CHK036 - Is the "Task not found" message clear about whether ID format was wrong vs. ID doesn't exist? [Covered — contracts §complete: two distinct messages: "Invalid ID: '{value}' is not a number" vs. "Task not found with ID: {id}"]
- [x] CHK037 - Is file system error messaging actionable (e.g., "Cannot write tasks.json: Permission denied")? [Covered — contracts §System Errors: includes specific reason in all file error messages]
- [x] CHK038 - Are suggestions provided in error messages (e.g., "Try: app list")? [v1: out of scope — recovery hints added for key errors; full suggestion system deferred]
- [x] CHK039 - Is error message consistency tested across all three commands? [Covered — consistent "Error:" prefix and exit code mapping in §Error Handling table]

---

## Output Format & Presentation

- [x] CHK040 - Is the separator between table columns (tabs, spaces, pipes) explicitly defined? [Covered — contracts §list: two spaces]
- [x] CHK041 - Is truncation behavior specified for long task titles in `list` output? [Covered — contracts §list: no truncation in v1, full title displayed]
- [x] CHK042 - Is sorting order specified for `list` output (by ID, by creation time, by status)? [Covered — contracts §list: by task ID ascending]
- [x] CHK043 - Is the "No tasks found" message position/format consistent with table format? [Covered — contracts §list]
- [x] CHK044 - Are multi-line task titles supported or explicitly excluded? [v1: out of scope — single-line titles only; newlines in title not supported]
- [x] CHK045 - Is the newline behavior specified for output (each row ends with newline)? [Covered — contracts §list Output Format: each row ends with newline]

---

## Performance & Scalability

- [x] CHK046 - Are performance requirements defined for adding a task? [Covered — spec §SC-001: under 5 seconds; synchronous I/O satisfies this]
- [x] CHK047 - Are performance requirements defined for listing tasks with 100+ items? [v1: out of scope — expected scale <10k tasks, O(n) display acceptable]
- [x] CHK048 - Is the maximum task list size documented or tested? [v1: out of scope — practical limit ~10k tasks per plan.md]
- [x] CHK049 - Is the output rendering performance requirement (time to display list) specified? [v1: out of scope — synchronous stdout, no separate rendering step]

---

## Command Help & Documentation

- [x] CHK050 - Is a `--help` or `-h` flag documented for the main app or each command? [v1: deferred — no per-command --help flag; top-level usage printed on no-args/unknown-command]
- [x] CHK051 - Is usage syntax displayed when arguments are missing or incorrect? [Covered — contracts §Usage Output and §Validation Errors: usage line appended to relevant errors]
- [x] CHK052 - Are examples provided for each command? [Covered — contracts §Example Interactions for all three commands]

---

## Interactive Input Mode

- [x] CHK053 - Is the prompt text for interactive title input defined? [v1: out of scope — interactive stdin deferred]
- [x] CHK054 - Is the prompt text for interactive ID input defined? [v1: out of scope — interactive stdin deferred]
- [x] CHK055 - Is backspace/line editing support required? [v1: out of scope — CLI args only]
- [x] CHK056 - Is Ctrl+C / signal handling behavior documented? [v1: out of scope — default Node.js SIGINT behaviour]

---

## Edge Cases & Boundary Conditions

- [x] CHK057 - Are very long titles (approaching 500 char limit) handled gracefully? [Covered — contracts §Edge Cases: titles at 500 chars accepted; over 500 rejected with message]
- [x] CHK058 - Is behavior defined for unicode/emoji in task titles? [v1: out of scope — Node.js string handling covers standard Unicode; table alignment with wide chars not guaranteed]
- [x] CHK059 - Is behavior defined for very large task lists (>10,000 items)? [v1: out of scope — expected scale <10k per plan.md]
- [x] CHK060 - Is the behavior for completing the same task twice documented? [Covered — contracts §complete: prints "ℹ Task {id} is already done." to stdout, exit 0]
- [x] CHK061 - Is the behavior when tasks.json is deleted between commands documented? [v1: out of scope — single-user; deletion treated as empty list on next run]
- [x] CHK062 - Is the behavior when tasks.json is edited externally documented? [v1: out of scope — single-user assumption; external edits loaded as-is on next run]

---

## Success Criteria Measurability

- [x] CHK063 - Is "Users can add a task in under 5 seconds" quantified? [Covered — spec §SC-001; synchronous add completes in <100ms in practice]
- [x] CHK064 - Is "All tasks are displayed correctly" quantified with pass/fail criteria? [Covered — contracts §list defines exact table format and sort order as acceptance criteria]
- [x] CHK065 - Is "Task completion updates status immediately" quantified? [Covered — synchronous operation; status change visible on next `list` call in same session]

---

## Notes

**Resolved Conflicts**:
- ~~UUID vs sequential integers~~: Resolved — data-model.md and contracts now use sequential integers consistently (see data-model.md §Entities, contracts §complete examples)

**v1 Decisions Made**:
- No-args / unknown command → print usage to stderr, exit 1
- Completing an already-done task → `ℹ Task {id} is already done.` to stdout, exit 0
- Error messages include recovery hints (usage line or `Hint: Run \`list\``)
- Input: CLI args only; interactive stdin deferred to v2
- No ANSI colour codes in v1 output

**Deferred to v2+**:
- Interactive stdin input mode
- Per-command `--help` flag
- Shell autocomplete
- Accessibility/colour-blindness support
- Unicode wide-character table alignment
- Performance testing for large datasets (>10k tasks)
