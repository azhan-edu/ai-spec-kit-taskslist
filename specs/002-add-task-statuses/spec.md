# Feature Specification: Extended Task Statuses with Color Coding

**Feature Branch**: `002-add-task-statuses`  
**Created**: 2026-05-03  
**Status**: Draft  
**Input**: User description: "I want to add a new list item statuses - `canceled` and `failed`. User can switch to this state-of-the-art only from pending status. User can't switch from these statuses to any other one. We need to colorize each status. Pending status has current color style. Completed items should be green. Canceled - yellow, Failed - Red."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cancel a Pending Task (Priority: P1)

As a user, I want to mark a pending task as canceled so that I can indicate I decided not to do it.

**Why this priority**: Introduces the first new terminal status. Most common use case when a user changes their mind about a task.

**Independent Test**: Can be fully tested by canceling a pending task and verifying its status updates to canceled and persists across restarts.

**Acceptance Scenarios**:

1. **Given** a task in pending status, **When** I cancel it by ID, **Then** its status changes to canceled
2. **Given** a task already in canceled status, **When** I try to cancel it, **Then** an error is shown indicating the transition is not allowed
3. **Given** a task in done status, **When** I try to cancel it, **Then** an error is shown indicating the transition is not allowed

---

### User Story 2 - Fail a Pending Task (Priority: P2)

As a user, I want to mark a pending task as failed so that I can record that I attempted but could not complete it.

**Why this priority**: Second new terminal status. Provides a way to distinguish between tasks not started (canceled) and tasks that were attempted but unsuccessful (failed).

**Independent Test**: Can be fully tested by marking a pending task as failed and verifying status updates to failed and persists.

**Acceptance Scenarios**:

1. **Given** a task in pending status, **When** I mark it as failed by ID, **Then** its status changes to failed
2. **Given** a task already in failed status, **When** I try to mark it as failed, **Then** an error is shown indicating the transition is not allowed
3. **Given** a task in done status, **When** I try to mark it as failed, **Then** an error is shown indicating the transition is not allowed

---

### User Story 3 - View Colorized and Emoji-Prefixed Task List (Priority: P3)

As a user, I want each task status to display a colored emoji circle alongside its color-coded label in the list so that I can instantly identify task states at a glance.

**Why this priority**: Enhances usability of the list view without adding new functionality.

**Independent Test**: Can be tested by listing tasks containing all four statuses and verifying each appears in the correct color.

**Acceptance Scenarios**:

1. **Given** tasks with statuses pending, done, canceled, and failed, **When** I list all tasks, **Then** each status displays its emoji circle prefix alongside its ANSI color
2. **Given** a terminal that does not support colors, **When** I list tasks, **Then** status labels are still readable in plain text without visual corruption (emoji circles remain visible as Unicode)

---

### Edge Cases

- What happens when trying to cancel or fail a non-existent task ID?
- What happens when trying to cancel or fail a task that is already done?
- What happens when trying to cancel or fail a task that is already in a terminal status (canceled or failed)?
- How does the task list render in terminals without ANSI color support?

## Clarifications

### Session 2026-05-03

- Q: Should status emojis appear alongside existing ANSI color coding or replace it? → A: Alongside — emoji prefix + ANSI color on status text
- Q: Which emoji represents each status? → A: 🔵 pending, 🟢 done, 🟡 canceled, 🔴 failed
- Q: Where should the emoji appear relative to the status text? → A: Before the status label (prefix), e.g. `🟢 done`

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow marking a task in pending status as canceled
- **FR-002**: System MUST allow marking a task in pending status as failed
- **FR-003**: System MUST prevent transitioning a task from canceled status to any other status
- **FR-004**: System MUST prevent transitioning a task from failed status to any other status
- **FR-005**: System MUST prevent transitioning a task from done status to canceled or failed
- **FR-006**: System MUST display a clear error message when an invalid status transition is attempted
- **FR-007**: System MUST display done tasks as `🟢 done` (emoji prefix + green color) when listing
- **FR-008**: System MUST display canceled tasks as `🟡 canceled` (emoji prefix + yellow color) when listing
- **FR-009**: System MUST display failed tasks as `🔴 failed` (emoji prefix + red color) when listing
- **FR-010**: System MUST display pending tasks as `🔵 pending` (emoji prefix + existing color style) when listing
- **FR-011**: System MUST persist canceled and failed statuses to storage so they survive application restarts

### Key Entities

- **Task**: Extended entity with four possible statuses — pending, done, canceled, failed
- **Status Transition Rules**: Valid transitions are pending → done, pending → canceled, pending → failed; no transitions are allowed from done, canceled, or failed

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can mark a pending task as canceled or failed in a single action
- **SC-002**: All four task statuses are visually distinguishable through both emoji circle prefix and color coding in the task list
- **SC-003**: Invalid status transition attempts are rejected with a clear, human-readable error message 100% of the time
- **SC-004**: Canceled and failed status changes persist and are correctly restored across application restarts
- **SC-005**: Existing task workflows (add, list, complete) are unaffected by this change

## Assumptions

- The existing "done" status represents "completed" and will be displayed in green
- Color output degrades gracefully to plain text in terminals that do not support ANSI colors
- No new permanent data migration is required; the storage format extends naturally to support two additional status values
- A task can only ever hold one status at a time
- The canceled and failed statuses are terminal — once set, they cannot be changed by the user
