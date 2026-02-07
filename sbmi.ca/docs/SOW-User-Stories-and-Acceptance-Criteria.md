# User Stories and Acceptance Criteria

> **Scope binding:** This file is the single source of truth for in-scope work. Features and behavior are limited to what is explicitly stated in the acceptance criteria. Changes require a formal update.

This document explains what we are building and how we decide when work is finished.

## Tools

- **User Stories** — Who something is for and what they need; written from the user's point of view. Format: *"As a [user], I want [something], so I can get a [result]."*
- **Acceptance Criteria** — When a user story is done. They must be clear, specific, testable, and either met or not met. If all criteria are met, the feature is finished.

## Boundaries

- Only what is written in the acceptance criteria is included. Anything not written is not included unless changed through a formal update.
- Unless explicitly stated in an acceptance criterion, this scope does **not** include: content creation, copywriting, translation, image licensing beyond royalty-free assets provided by SBMI, authentication system development, back-end workflow automation, or ongoing content management.
- Clear boundaries prevent scope creep.

---

## PROJECT SECTION: One-Page Welcome Website

### User Story 1. Public visitor overview
**As a** public visitor, **I want** to view a single-page welcome website that explains what the Iddir is, **so that** I can understand its purpose, history, and membership value before deciding to apply or log in.

**Acceptance criteria:**
- The welcome page is accessible via a public URL without authentication.
- The page consists of a single public-facing page with no additional subpages.
- The page displays informational content describing what the Iddir is, using text provided or explicitly approved by the client.
- The page includes a background section referencing Samuel Bete, using client-provided or approved content only.
- The page layout supports desktop and mobile viewing using responsive layout techniques, without custom device-specific behavior.
- No content management system, inline editing, or post-launch content update tooling is included.
- Copywriting, historical research, or content creation beyond formatting and layout of supplied text is excluded.
- Content revisions are limited to one review cycle; additional revisions require a change request.

### User Story 2. Membership value communication
**As a** prospective member, **I want** to see a concise list of membership benefits, **so that** I can quickly assess whether joining the Iddir is valuable to me.

**Acceptance criteria:**
- Membership benefits are displayed in a clearly formatted bulleted list.
- The list is visible without requiring authentication.
- The benefits list content is supplied or approved by the client prior to implementation.
- The list renders correctly on desktop and mobile devices.
- No benefit comparison logic, personalization, or dynamic content is included.
- Editing or reordering benefits after implementation is not included without a change request.

### User Story 3. Cultural representation through imagery
**As a** public visitor, **I want** to see culturally relevant Ethiopian imagery on the page, **so that** the Iddir's cultural identity is clearly represented.

**Acceptance criteria:**
- At least one Ethiopian-themed image is displayed on the page.
- Images load successfully and do not block page rendering.
- Images are visually integrated into the page layout, not broken or placeholder content.
- Images are optimized for web display and do not significantly degrade load performance.

### User Story 4. Optional membership application
**As a** prospective member, **I want** the option to submit a membership application directly from the page, **so that** I can express interest in joining without additional navigation.

**Acceptance criteria:**
- A membership application form is present at the bottom of the page if included in scope.
- The form includes clearly labeled required fields.
- The form can be submitted successfully without authentication.
- On successful submission, the user receives a clear confirmation message.
- Form submission errors are displayed clearly if required fields are missing or invalid.
- Submitted form data is stored or delivered to the designated destination as defined by the project.

### User Story 5. Login access
**As an** existing member, **I want** to access a login option from the welcome page, **so that** I can authenticate and access member-only areas.

**Acceptance criteria:**
- A login button or link is visible on the page.
- Clicking the login button navigates the user to the designated login destination.
- The welcome page itself does not require login to view.
- The login action does not interrupt or block access to public content.

---

## PROJECT SECTION: Login

### User Story 1. Accessing the Login Page
**As a** user, **I want** to access the login page either by typing the login URL directly or by clicking a link from the Iddir welcome page, **so that** I can authenticate and access secure areas.

**Acceptance criteria:**
- The login page is accessible via a direct URL without prior authentication.
- The login page is accessible from the Iddir public welcome page via a visible login link.
- The login page displays a **username field**, a **password field**, and a **"stay logged in" checkbox**.
- The login page layout is fixed and uses standard form controls only.
- No single sign-on, social login, or third-party identity providers are included.

### User Story 2. Login Validation and Privacy-Safe Errors
**As a** user, **I want** privacy-safe error handling during login, **so that** my personal information is protected.

**Acceptance criteria:**
- The username field **accepts email addresses only**.
- The email field has a **maximum length of 50 characters**.
- **Email format validation occurs only after the field loses focus**.
- If the email format is invalid, a clear and specific validation error is displayed.
- If the username or password is incorrect, a **generic error message** is displayed.
- The error message **does not reveal whether the email address exists** in the system.
- **On login failure, the page reloads and preserves the entered email address**.
- No user enumeration, diagnostic, or debug messaging is exposed to the user.

### User Story 3. Stay Logged In Option
**As a** user, **I want** the option to stay logged in, **so that** I do not need to log in again on the same device.

**Acceptance criteria:**
- A **"stay logged in" checkbox** is displayed on the login form.
- When selected, the user session **persists across browser restarts** on the same device.
- Session duration and behavior are fixed and not configurable by SBMI.
- No device management, session listing, or remote session invalidation is included.

### User Story 4. Forgot Password Request
**As a** user, **I want** to request a password reset if I forget my password, **so that** I can regain access securely.

**Acceptance criteria:**
- A **"forgot password" link** is visible on the login page.
- Selecting the link navigates the user to a **password reset request page**.
- The password reset page contains a **single email address input field**.
- The email field validates format only after losing focus.
- The email field has a maximum length of 50 characters.
- Submitting the form triggers an **email containing password reset instructions using a magic key link**.
- The page displays messaging that **email delivery may take time** and that **spam folders should be checked**.
- No resend button, countdown timer, or resend throttling interface is provided.
- Reloading the page allows the email address to be entered again.
- **The same confirmation message is shown regardless of whether the email exists** in the system.

### User Story 5. Password Reset Security
**As a** user, **I want** password reset instructions to be secure, **so that** my account is protected.

**Acceptance criteria:**
- Password reset is completed using a **single-use magic key link**.
- Magic key expiration duration is fixed and not configurable.
- No password strength rules beyond basic requirements are enforced unless explicitly defined elsewhere.
- No administrative password reset tools or override mechanisms are included.

### User Story 6. Two-Factor Authentication Code Entry
**As a** user, **I want** to complete two-factor authentication after login, **so that** access to the secure administrator back-end is protected.

**Acceptance criteria:**
- **After successful username and password validation**, the user is **routed to a two-factor authentication page**.
- The page displays a message stating that **a verification code has been sent by email**.
- A **single input field** is displayed for the authentication code.
- The code must be **exactly six alphanumeric characters**.
- The input field accepts **letters and numbers only**.
- The input field **does not accept more than six characters** for submission.
- The input field uses **large, spacious typography** suitable for copy and paste.
- When text is pasted, **non-alphanumeric characters are stripped automatically**.
- If more than six valid characters are pasted, **only the first six are retained**.
- Entering an incorrect code displays an error message and **reloads the page**.
- Entering the correct code **grants access to the secure administrator back-end**.
- No SMS-based codes, authenticator apps, backup codes, or recovery codes are included.

### User Story 7. Authentication Data Storage and Audit Fields
**As SBMI,** **I want** authentication data stored securely, **so that** user access is protected.

**Acceptance criteria:**
- Email addresses may be stored in plain text.
- Usernames and passwords are **encrypted at rest**.
- Authentication data is **encrypted in transit**.
- Credential comparison uses **secure, encrypted methods**.
- The user table includes a field for **the last successful login date**.
- The last successful login date **updates only after successful completion of two-factor authentication**.
- No audit logs beyond the last successful login date are included.
- No reporting, analytics, or administrative visibility into login history is included.
