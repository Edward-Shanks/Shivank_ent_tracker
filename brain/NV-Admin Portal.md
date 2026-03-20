# NexaVerse Admin Portal (Admin Release + One-Time Flash Messaging)

## 1. Purpose
The Admin Portal lets an Admin:
1. Release/update the **global entertainment catalog** (anime, movies, games, genshin, websites, etc.) so users can add/select up-to-date entries.
2. Flash **one-time announcements** to users in the NexaVerse webapp (shown when the user opens their dashboard; auto-disappears after being seen).

This portal is for curators/operators to manage content without overwriting each user’s personal library.

---

## 2. Key Product Decisions (Aligned With Your Q&A)
### 2.1 Where should admin portal live?
**Inside the same Next.js app** under `/admin`.

Recommended route structure:
- `/admin` (Admin landing)
- `/admin/login` (Admin auth)
- `/admin/releases` (Publish catalog releases)
- `/admin/catalog` (Admin database manager / content editor)
- `/admin/announcements` (Flash messages management)
- `/admin/preview` (Preview what users will see)
- `/admin/audit` (Who changed what)

### 2.2 How should admin authentication work?
Use **dedicated admin credentials/auth** (separate from user accounts).
- Admins sign in to `/admin` using admin-only credentials.
- Enforce role/permission checks server-side for every admin API call.

### 2.3 “Release latest database” behavior
When Admin releases latest database, it should:
- Update a **global catalog** used when users add/select items.
- **Not overwrite/merge** users’ personal library items.
- Rationale: user “personal state” (status, watch progress, notes, etc.) must remain user-owned.

### 2.4 “Flash any information” behavior
User-facing flash should be:
- **One-time**: auto disappears after user opens the dashboard and the announcement is marked “seen”.
- Add optional expiry/activation controls, but “seen” drives disappearance.

---

## 3. Admin Portal User Flows

### 3.1 Admin Login Flow
1. Admin visits `/admin/login`
2. Admin authenticates using admin credentials
3. Browser stores session in a secure cookie (recommended)
4. Admin lands on `/admin`

### 3.2 Admin Releases Latest Catalog
1. Admin opens `/admin/releases`
2. Selects a category and/or inputs a new dataset version (or confirms current draft)
3. Admin runs optional validation checks:
   - required fields completeness
   - schema/format validation
   - image URL validity checks (optional)
4. Admin clicks **Publish Release**
5. System increments catalog version and marks it “active”

Users can then add/select items using this new catalog version.

### 3.3 Admin Flashes a One-Time Announcement to Users
1. Admin opens `/admin/announcements`
2. Clicks **Create Announcement**
3. Enters:
   - title, message body
   - target audience (e.g., all users, or plan=free/pro, optional)
   - target surface (dashboard for now)
   - activation window (optional)
4. Admin clicks **Send**
5. When users open their dashboard, the app fetches announcements and:
   - displays them
   - marks them as seen (one-time)
   - they auto disappear thereafter

---

## 4. Who Should Be Able To Do What (Roles)
Create RBAC roles. Minimum recommended:
1. **Super Admin**
   - full access: users + admins, releases, announcements, audit
2. **Catalog Editor**
   - edit global catalog drafts
   - trigger validations and create release drafts
3. **Release Operator**
   - publish releases (can’t edit catalog freely, only publish approved drafts)
4. **Comms Admin (Announcements Manager)**
   - create/send announcements only
5. **Read-only Auditor**
   - view audit log, release history, announcement history

This separation prevents accidental overwrites and helps compliance.

---

## 5. What To Make (Components / Modules)

## 5.1 Admin Authentication + Session
- Admin login UI (`/admin/login`)
- Admin auth middleware/guard protecting all `/admin/*`
- Admin API endpoints protected by server-side role checks

Recommended:
- HTTP-only cookies for session
- CSRF protection
- rate limiting for login

## 5.2 Admin Database Manager (Catalog Manager)
Admin UI for editing the global catalog (draft + publish pipeline):
- Anime catalog editor
- Shows/Movie/K-Drama catalog editor (or unified “shows”)
- Games catalog editor
- Genshin catalog editor (elements, character metadata)
- Website catalog editor (categories, url, favicon)

Best practice:
- Draft changes are saved to a **draft store**
- Publish creates an immutable **release snapshot**
- Users use **active release snapshot**

## 5.3 Release System (Versioning + Validation)
A release is:
- a named dataset snapshot
- with version number (e.g., `catalog.v12`)
- with category breakdown
- with changelog/audit metadata

Release workflow:
1. Draft -> Validate -> Publish
2. If publish fails validation, block
3. Keep rollback capability:
   - restore previous active release

## 5.4 Announcement / Flash System (One-Time)
Admin announcements must be stored in a way that supports one-time “seen” tracking.

Announcement types:
- “Global banner” announcements for dashboard
- (Later possible: announcements targeting specific routes/pages)

Data tracked:
- announcement id
- message content + metadata
- createdBy admin id
- activation window
- per-user seen state:
  - firstSeenAt or seenAt
  - source announcement id
  - user id

User experience:
- On dashboard open:
  - fetch announcements where:
    - active window is valid
    - user hasn’t seen it yet
  - display them
  - mark as seen immediately after fetch/render (or on close)

---

## 6. API Contract (High-Level Endpoints)
(Use these as guidance; exact names depend on your backend style.)

### 6.1 Admin Auth
- `POST /admin/api/login`
- `POST /admin/api/logout`
- `GET /admin/api/me` (returns roles/permissions)

### 6.2 Catalog Drafts
- `GET /admin/api/catalog/drafts/:category`
- `PUT /admin/api/catalog/drafts/:category`
- `POST /admin/api/catalog/drafts/:category/validate`

### 6.3 Releases
- `GET /admin/api/releases`
- `POST /admin/api/releases/publish`
- `POST /admin/api/releases/rollback`

### 6.4 Announcements
- `GET /admin/api/announcements`
- `POST /admin/api/announcements` (create)
- `POST /admin/api/announcements/:id/send`
- `PUT /admin/api/announcements/:id` (edit content)
- `POST /admin/api/announcements/:id/cancel`

### 6.5 User-facing flash
- `GET /api/dashboard/flash` (returns unseen announcements for that user)
- `POST /api/dashboard/flash/seen` (marks them as seen)
  - or combine into one endpoint to keep it simple

---

## 7. Data Model Recommendations (Conceptual)
Recommended entities:

1. **Admin**
   - id, email/username, password hash
   - role(s), createdAt

2. **CatalogDraft**
   - category (anime/shows/games/genshin/websites)
   - content payload (or normalized relational tables)
   - createdBy, updatedAt

3. **CatalogRelease**
   - releaseId
   - version
   - active status
   - createdAt, releasedBy
   - validation report
   - snapshot reference to draft

4. **Announcement**
   - announcementId
   - title, body, targetSurface
   - activeFrom, activeUntil (optional)
   - audience selector (optional)
   - createdBy, createdAt

5. **AnnouncementSeen**
   - announcementId
   - userId
   - seenAt
   - unique constraint (announcementId + userId)

---

## 8. UX Recommendations for the User Webapp
### 8.1 One-time behavior definition
“One-time” means:
- once the dashboard has loaded and the announcement has been fetched for the user,
- mark it as “seen”
- do not show it again on subsequent dashboard visits

### 8.2 Dashboard integration
Add an “Admin Release / Updates” section area on the dashboard page where announcements appear first.
- This can later grow into:
  - release changelog cards
  - “what’s new in the catalog”
  - feature announcements

---

## 9. Security & Reliability Recommendations
1. Protect every admin action with server-side auth + RBAC checks.
2. Never allow admin to “update personal libraries” directly.
3. Validate catalog data during publish.
4. Keep an audit log:
   - who published which release
   - what announcement was sent
   - what changed in drafts
5. Implement idempotency for “mark as seen”:
   - repeated calls should not duplicate seen entries.

---

## 10. Testing Plan (What to Verify)
### Admin Portal
- admin login works + protected routes deny unauthorized users
- role restrictions (catalog editor cannot publish; comms admin cannot publish)

### Release pipeline
- invalid data blocks publish
- publish creates new active release snapshot
- rollback returns to previous snapshot

### Flash system
- announcement appears on first dashboard open
- announcement disappears on next dashboard open
- seen marking works even with slow networks (no duplicate displays)
- expiry window hides announcements automatically

---

## 11. Next Questions (To Finalize Implementation Details)
1. Should “flash” be displayed only on `/` (dashboard), or also on other pages?
2. Should announcements be targeted by plan (`free/pro/premium`) or global-only?
3. Do you want “one-time” to mark as seen:
   - immediately on dashboard load, or
   - after user closes/dismisses the banner?
4. For catalog releases, do you want:
   - per-category releases, or
   - a single unified release covering all categories at once?
