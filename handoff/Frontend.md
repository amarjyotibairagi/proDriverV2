# Frontend

## Purpose

This file reverse engineers the current Next.js frontend so EuclidPro can be planned from the actual user/admin surfaces rather than from assumptions.

## Frontend Architecture

The frontend is a Next.js App Router application with two main experiences:

- User experience under `app/(user)`.
- Admin experience under `app/admin`.

Most interactive screens are client components under:

- `components/user-dashboard`
- `components/admin-dashboard`
- `components/ui`

Server pages fetch initial data with server actions, then pass it into client components.

## Global Layouts

### Root Layout

File: `app/layout.tsx`

Responsibilities:

- Imports `app/user-globals.css`.
- Loads Geist Sans and Geist Mono.
- Adds `NextTopLoader`.
- Adds `sonner` toaster.
- Sets metadata:
  - Title: `ProDriver - Safety Command Center`
  - Description: `Premium HSSE Training Dashboard`
  - Icons: `/icon.svg`, `/apple-icon.png`
- Sets viewport:
  - `maximumScale: 1`
  - `userScalable: false`
- Body classes:
  - Geist fonts.
  - Antialiased.
  - Dark slate/teal background style.

### User Layout

File: `app/(user)/layout.tsx`

Responsibilities:

- Imports `app/user-globals.css`.
- Reads session through `getSession`.
- If session contains impersonation metadata, renders `ImpersonationBanner`.
- Renders child route.

### Admin Layout

File: `app/admin/layout.tsx`

Responsibilities:

- Imports `app/admin-globals.css`.
- Renders admin child route.

## User Experience

### User Language Gateway

Route: `/`

File: `app/(user)/page.tsx`

Main components:

- `Header`
- `HeroTitle`
- `LanguageSelector`
- `UserDynamicBackground`

Page content:

- Full-screen dark animated background.
- Header with HSSE/Department text, logo, notifications/profile language controls.
- Centered `PRODRIVER` hero.
- Language selector card/list.
- Footer metadata: `Language Selection`.

Primary action:

- Select a language and continue to `/login?lang={code}`.

### Language Selector

File: `components/user-dashboard/language-selector.tsx`

Behavior:

- Uses `LANGUAGES` from `lib/languages.ts`.
- Displays all available language options.
- Tracks selected language.
- Button text: `NEXT`.
- Helper text: `Please select a language to continue`.
- Routes to `/login?lang=...`.

Languages:

- English, Arabic, Hindi, Urdu, Bengali, Filipino/Tagalog, Nepali, Malayalam, Tamil, Telugu, Kannada, Odia, Sinhala, Pashto, Romanian, Chinese, Swahili.

RTL languages:

- Arabic, Urdu, Pashto.

### Login and Signup

Route: `/login`

File: `app/(user)/login/page.tsx`

Main components:

- `Header`
- `HeroTitle`
- `LoginForm`
- `UserDynamicBackground`

Behavior:

- Reads `lang` from search params.
- Applies direction from the selected language.
- Renders localized login/signup form.

### LoginForm Structure

File: `components/user-dashboard/login-form.tsx`

Modes:

- `LOGIN`
- `SIGN UP`

Login fields:

- Employee ID.
- Password.
- Show/hide password.

Login actions:

- Calls `setLanguageCookie`.
- Calls `loginUser`.
- Redirects:
  - `ADMIN` -> `/admin`
  - `BASIC` -> `/dashboard?lang={lang}`
- Displays animated loading percentage for about 5 seconds.

Forgot password:

- Opens support modal.
- Shows WhatsApp support link:
  - `https://wa.me/97466700820`
  - number displayed as `+974 66700820`.

Signup fields:

- Employee ID.
- Qatar ID.
- Company:
  - Mowasalat.
  - Others.
  - Custom company input when needed.
- Designation.
- Team.
- Depot/home location.
- Assigned area.
- Full name.
- Email.
- Mobile.
- Password.
- Confirm password.

Signup data connections:

- `getSignupOptions` fetches designation, team, depot, and assigned-area dropdowns.
- `getUserDetailsForSignup` debounced autofills data where possible.
- `registerUser` creates user and signs in.

Signup validations:

- Required fields.
- Password strength:
  - uppercase.
  - lowercase.
  - number.
  - special character.
  - minimum 6 characters.
- Confirm password match.

Existing user state:

- If employee id already exists and is active, opens `User Already Exists` modal with `Login Now`.

### User Header

File: `components/user-dashboard/header.tsx`

Visible content:

- Left brand text:
  - `HSSE`
  - `DEPARTMENT`
- Center logo:
  - `/mowasalat-logo.png`
- Notification icon/dropdown.
- Language selector modal trigger.
- User profile pill.

Language modal:

- Lists all `LANGUAGES`.
- Updates `lang` search param.
- Closes on selection or close button.

Profile:

- Opens `UserProfilePopup`.

### User Profile Popup

File: `components/user-dashboard/user-profile-popup.tsx`

Tabs/views:

- Profile.
- Edit profile.
- Change password.

Profile fields:

- Employee ID.
- Name.
- Company.
- Mobile.
- Location.
- Designation.

Actions:

- Edit profile.
- Change password.
- Sign out.

Note:

- Sign out currently routes to login rather than consistently calling the server-side `logoutUser`.

### User Dashboard

Route: `/dashboard`

File: `app/(user)/dashboard/page.tsx`

Server behavior:

- `force-dynamic`.
- Calls `getSession`.
- Redirects to `/login` if no session.
- Uses `session.userId` as `employee_id`.
- Looks up the user record.
- Calls `getDriverTrainings(user.id)`.
- Uses selected language from search params or `NEXT_LOCALE`.

Main components:

- `Header` from `components/user-dashboard/header`.
- `HeroTitle` from `components/user-dashboard/dashboard/hero-title`.
- `MainContent` from `components/user-dashboard/main-content`.
- `FooterAction` from `components/user-dashboard/dashboard/footer-action`.

Dashboard hero content:

- Badge: `HSSE Training Module`.
- Title: `PRODRIVER`.
- Welcome text from translations:
  - `welcomeDashboard`
  - fallback: `Welcome to your Training Dashboard`.

Footer action:

- Gold safety button:
  - Icon: alert triangle.
  - Text: `Safety Alert`.

### User Dashboard MainContent

File: `components/user-dashboard/main-content.tsx`

Section header:

- Localized `hsseModules`.
- Fallback: `Training Modules`.

Tabs:

- `Pending ({count})`
- `Completed ({count})`

Pending logic:

- Any assignment where training is not `COMPLETED` or test is not `PASSED`/`FAILED`.

Completed logic:

- Training is `COMPLETED` and test is `PASSED` or `FAILED`.

Empty states:

- Pending: `No pending training`.
- Completed: `No completed history`.

Risk:

- Component checks `completed_date`, but the Prisma model uses `completion_date`. This can cause completed dates to render as fallback text.

### Module Cards

File: `components/user-dashboard/module-card.tsx`

Pending card:

- Localized title from module content translations.
- Training status badge:
  - Not Started.
  - In Progress.
- Buttons:
  - Training.
  - Test.

Test gating:

- Test button is blocked until training is completed.
- Blocking uses an alert.

Completed card:

- Shows completion state.
- Shows test score if available.
- Shows failed/attempt-failed styling when test failed.

Links:

- Training: `/play/{moduleId}?mode=training&lang={lang}`
- Test: `/play/{moduleId}?mode=test&lang={lang}`

### Training/Test Player

Route: `/play/[moduleId]`

File: `app/(user)/play/[moduleId]/page.tsx`

Server behavior:

- `force-dynamic`.
- Reads `moduleId`, `mode`, and `lang`.
- Calls `getModule`.
- Chooses slides:
  - `content.training.slides` for training.
  - `content.assessment.slides` for test.
- Passes title, translations, mode, and marks into `ModulePlayer`.

File: `components/user-dashboard/module-player.tsx`

Player shell:

- Full-screen mobile-like training player.
- Header with:
  - Home/back control.
  - Module title.
  - Mode indicator.
  - Audio settings.
  - Language dropdown.
- Start overlay:
  - `Tap to Start`
  - `Turn up your volume`
- Success/failure finish states.

Audio controls:

- Voice volume slider.
- Ambience volume slider.
- Background ambience from `/background.mp3`.
- Slide audio from R2.

R2 slide audio path:

```text
{R2_PUBLIC_DOMAIN}/{moduleId}/{mode}/audio/{slideIndex}_{LANG}.mp3
```

Translations:

- Looks up language-specific slide text.
- Can split translated content across multiple text/quiz elements.
- Falls back to English/current element content.

Supported element types:

- `text`: text/list rendering.
- `image`: URL image or `icon:` pseudo-source through `IconRenderer`.
- `video`: media player.
- `quiz`: question/options, correct/incorrect feedback.
- `image-slider`: previous/next image slides, description, dots.
- `sequence-sorter`: draggable sequence ordering with `Check Order`.
- `split-second`: scenario media plus A/B decision and feedback.

Progression gate:

- Slide can advance only after:
  - audio ended or audio failed.
  - animations done.
  - training mode or all quizzes answered.
  - all sequences correct.

Completion:

- Training mode calls `completeTrainingAction`.
- Test mode calculates score and calls `completeTestAction`.

Finish states:

- Passed:
  - congratulatory success.
  - score display.
  - confetti.
  - dashboard/home action.
- Failed:
  - assessment failed.
  - score and pass marks.
  - attend training again.
  - return home.

## Admin Experience

### Admin Shell

Most admin pages render:

- `DynamicBackground`
- `Sidebar`
- page content with left margin for desktop sidebar
- `Header` or `SectionHeader`

### Admin Sidebar

File: `components/admin-dashboard/sidebar.tsx`

Brand:

- `ProDriver`
- status text: `System Operational`

Navigation items:

- Dashboard: `/admin`
- Users: `/admin/users`
- Modules: `/admin/modules`
- Assignments: `/admin/assignments`
- Reports: `/admin/reports`
- Audit Logs: `/admin/audit`
- Master Data: `/admin/master-data`

Commented/disabled:

- Settings.

Footer:

- `Administrator Profile`
- `Verified Access`
- Opens `AdminProfilePopup` for `ADMIN001`.

### Admin Header

File: `components/admin-dashboard/header.tsx`

Visible content:

- `Administrative Overview`.
- `Command Center`.
- `Data Status: Online`.
- `Real-time Fleet Performance Data`.
- Current date.
- Admin notifications.
- Mowasalat logo.

Optional company filter tabs:

- `Internal (Mowasalat)` -> `company=MOWASALAT`
- `Contractors` -> `company=CONTRACTORS`
- `Unified View` -> `company=ALL`

### Admin Profile Popup

File: `components/admin-dashboard/admin-profile-popup.tsx`

Views:

- Profile.
- Edit.
- Security.
- Shadow account portal.

Profile content:

- `Administrator Portal`.
- Employee ID.
- Contact.
- Primary Location.
- Sector Unit.

Actions:

- Modify.
- Security.
- Shadow Account Portal.
- Log Out.

Shadow-account actions:

- Fetch shadow accounts.
- Create shadow account.
- Switch into shadow account.
- Return handled by user-side `ImpersonationBanner`.

Note:

- Log out currently pushes `/login`; it does not consistently invoke `logoutUser`.

### Notifications Dropdown

File: `components/admin-dashboard/notifications-dropdown.tsx`

Behavior:

- Polls every 30 seconds.
- Shows unread dot/count.
- Title: `Notifications`.
- Empty state: `No updates yet`.
- Notification types:
  - `CRITICAL`
  - `OPERATIONAL`
  - `INFO`
- Click:
  - marks as read.
  - navigates to notification link if present.

### Admin Dynamic Background

File: `components/admin-dashboard/dynamic-background.tsx`

Visual pieces:

- Animated orbital glows.
- Grid layer.
- Scanlines.
- Noise/grain.
- Vignette.

Potential missing asset:

- References `/grid.svg`, not present in current `public/` inventory.

## Admin Dashboard

Route: `/admin`

File: `app/admin/page.tsx`

Server behavior:

- `force-dynamic`.
- Reads company filter from query.
- Calls `getAdminStats(companyFilter)`.

Components:

- `Sidebar`
- `Header(showFilter=true)`
- `KPICards`
- `IncidentsChart`
- `RiskRadar`
- `TrainingChart`
- `RecentActivity`
- `DynamicBackground`

KPI cards:

- Active Workforce.
- Completion Rate.
- Pending Assessments.
- Active Assignments.

Charts:

- `IncidentsChart` is actually a training analytics area chart.
  - Tabs:
    - Activity: `Training Volume`.
    - Performance: `Retention Index`.
    - Compliance: `Safeguard Rating`.
- `RiskRadar` subjects:
  - Knowledge Gap.
  - Compliance.
  - Test Failures.
  - Backlog.
  - Recency/Stagnation.
- `TrainingChart`:
  - Workforce progress vertical bar chart.
  - Completed.
  - Ongoing.
  - Not Started.

Recent activity:

- Activity Feed.
- `View Full History`.
- Data is currently mocked in `getAdminStats`.

## Admin Users

Route: `/admin/users`

File: `app/admin/users/page.tsx`

Server behavior:

- Loads active users, pending users, and form options in parallel.
- Uses initial tab from query.

Section header:

- Title: `User Management`.
- Description: `Manage workforce access and verify user credentials.`

Main component:

- `UsersTable`.

### UsersTable

File: `components/admin-dashboard/users/users-table.tsx`

Tabs:

- Active.
- Pending.

Search:

- Name.
- Employee ID.
- Email.

Filters:

- Role.
- Team.
- Designation.
- Primary hub/home location.
- Work/assigned location.

Toolbar:

- Export.
- Pending tab has Import CSV.
- Add User.

Table columns:

- Personnel.
- Contact.
- Organization.
- Logistics.
- Training Progress for active users.
- Actions.

Actions:

- View Profile.
- Training Record.
- Reset Password for active users.

### Add User Popup

Fields:

- Staff ID.
- Full Name.
- Email.
- Command Company.
- Mobile Number.
- Access Level:
  - Driver Status / Basic.
  - Commander / Admin.
- Team.
- Designation.
- Assigned Location.
- Home Location.

Backend:

- Calls `createUser`.
- Default password: `Welcome@123`.

### CSV Import Wizard

Steps:

- Upload.
- Mapping.
- Preview.
- Processing.
- Complete.

Mappable fields:

- Employee ID.
- Full name.
- Email.
- Mobile number.
- Company.
- Role.
- Team.
- Designation.
- Location.
- Home location.

Flow:

- Uploads CSV to R2 first.
- Allows column mapping.
- Shows preview.
- Creates inactive/pending user accounts.

### User Details Popup

Fields:

- Employee ID.
- Company.
- Email.
- Mobile.
- Team.
- Designation.
- Home Depot.
- Assigned Site.

### User Trainings Popup

Displays:

- Training record list.
- Module title.
- Assigned date.
- Completed date.
- Score percent.
- Status icons.

Risk:

- Uses `completed_date` naming in places while database field is `completion_date`.

## Admin Modules Repository

Route: `/admin/modules`

File: `app/admin/modules/page.tsx`

Metadata:

- `Module Repository | ProDriver`

Section header:

- Title: `Training Modules`.

Main component:

- `ModuleManager`.

### ModuleManager

File: `components/admin-dashboard/modules/module-manager.tsx`

Modes:

- Existing Repository.
- Provision Module.

Important behavior:

- `Existing Repository` loads module list and analytics.
- `Provision Module` is a link to `/admin/modules/provision`, opened in a new tab.
- Refresh reloads modules.
- Download exports module analytics CSV.

Left panel:

- `Instruction Catalog`.
- Module list.

Right panel:

- `Telemetry Analysis`.
- Selected module analytics.

### ModuleList

Each module row shows:

- Title.
- Duration minutes.
- Total marks/points.
- Active/archived badge.
- Edit icon linking to `/admin/modules/provision?id={module.id}`.
- Selection chevron.

Empty state:

- `No modules found.`

### ModuleStats

Analytics charts:

- Team allocation.
- Depot allocation.
- Assigned Site allocation.

Footer:

- `Aggregate Teams`
- `{analytics.total} Global Users`

Empty state:

- `Propel a module to reveal deep segment architecture`.

## Admin Module Maker / Training Generator

Route: `/admin/modules/provision`

Files:

- `app/admin/modules/provision/page.tsx`
- `app/admin/modules/provision/types.ts`
- `app/admin/modules/provision/loader.ts`
- components under `components/admin-dashboard/module-editor`

This is the training generator/module authoring area.

### Top-Level Editor States

No module selected:

- Header: `Module Maker`.
- Status: `Pending Selection`.
- Buttons:
  - Load Module.
  - Create New.
- Welcome dialog:
  - Get Started.
  - Open Existing.
  - Create New.
  - footer: `Module Provisioning Interface // SafeDoc Admin`.
- Main empty state:
  - `No Module Selected`.
  - `Please select or create a module...`.
- Right fake phone preview.

Existing module selected:

- Header: `Module Editor / {title}`.
- Shows module ID.
- Title input.
- Mode switch:
  - Training.
  - Assessment.
- Assessment fields:
  - Total marks.
  - Pass marks.
- Actions:
  - Load.
  - ZIP export to `/api/modules/export?id={id}`.
  - Save.
  - Publish.

### Layout

File: `ModuleEditorLayout`

Structure:

- Full-width header.
- Two-column workspace.
- Left: authoring controls.
- Right: `MobileSimulator`.
- Roughly 50/50 split.

### Module Content Schema

File: `app/admin/modules/provision/types.ts`

Element types:

- `text`
- `image`
- `quiz`
- `video`
- `image-slider`
- `sequence-sorter`
- `split-second`

Element style fields include:

- top.
- left.
- width.
- height.
- font size.
- color.
- background color.
- bold/italic.
- alignment.
- opacity.
- border radius.

Module content sections:

- `training`
- `assessment`
- `translations`

Module metadata includes:

- id.
- title.
- slug.
- description.
- file source.
- thumbnail.
- total marks.
- pass marks.
- duration.
- publish/active state.
- type.
- linked module.

Risk:

- `ModuleData.type` includes `'TE'`, likely a typo or legacy artifact.

### Slide Navigator

File: `SlideNavigator`

Content:

- Slides header.
- Add slide button.
- List of slide number/title.
- Move up.
- Move down.
- Delete.
- Active slide selection.

### Slide Editor

File: `components/admin-dashboard/module-editor/slide-manager.tsx` (exports `SlideEditor`; the file is named `slide-manager` but the exported component is `SlideEditor`)

Panel: `Content Blocks`.

Add buttons:

- Add Text.
- Add Image.
- Add Video.
- Add Quiz, only in test/assessment mode.
- Image Slider.
- Sequence Sorter.
- Split Second.

Layer list:

- Shows slide elements/layers.
- Selects active element for editing.

Text properties:

- Textarea.
- Font size slider.
- Bold.
- Italic.
- List.
- Alignment:
  - left.
  - center.
  - right.
  - justify.
- Text color.
- Background color.
- Element-level audio.

Quiz properties:

- Question.
- Marks input.
- Options.
- Correct answer toggle.
- Add option.
- Delete option.

Media properties:

- Image upload.
- Video upload.
- Audio upload.
- Remove media.
- Icon mode with `ICON_MAP`.
- Color picker for icons.

Image/video sizing:

- Width.
- Height.

Image slider properties:

- Upload image per slide.
- Description per slide.
- Add/delete slider item.

Sequence sorter properties:

- Procedural steps.
- Add/delete step.

Split-second properties:

- Scenario media.
- Option A text.
- Option B text.
- Feedback text.
- Correct option.

### Media Uploader

File: `components/admin-dashboard/module-editor/media-uploader.tsx`

This is a standalone extracted component (not inline in SlideEditor). Imported by `slide-manager.tsx`.

Behavior:

- Drag/click upload.
- Uses `uploadModuleAssetAction`.
- Supports image, video, audio.
- Shows preview.
- Remove asset action.
- Icon mode using `ICON_MAP`.
- Uses module context:
  - module id.
  - training/test mode.
  - slide id.

### Icon System

File: `icon-mapper.tsx`

Icon categories include:

- general: check, x, alerts, user, home, settings, search, bell, calendar, phone, mail.
- actions: upload, download, trash, edit, save, plus, minus.
- ratings: star, heart, thumbs.
- transport: car, truck, bus.
- safety/security: shield, lock, traffic, construction, fuel, gauge.
- work/learning: briefcase, graduation, award.
- hazard/medical: fire extinguisher, flame, droplets, thermometer, stethoscope, heart pulse, siren, megaphone, radio, hard hat, glasses, ear, eye, skull, biohazard, radiation, zap off, ban, cigarette, life buoy, anchor, stop, triangle, octagon.

### Translation Manager

File: `TranslationManager`

Panel:

- `Translations & Audio`.

Translation behavior:

- Extracts text from text and quiz elements.
- Builds export metadata.
- Includes all `LANGUAGES`.
- Calls `generateModuleTranslations`.
- Can recover translations from cloud.

Visible action:

- `Generate Translation - GPT4o-mini`

Backend reality:

- Server uses `OPENAI_MODEL`.

Translation tabs:

- One tab per supported language.
- Shows slide content indicators.
- Shows audio indicators.

Audio generation:

- Batch action: `Generate All Audio Assets`.
- Can stop generation.
- Element audio path:

```text
{moduleId}/{mode}/audio/{slideIndex}_{elementId}_{LANG}.mp3
```

### Audio Generator

File: `AudioGenerator`

Role:

- Older component for audio generation.
- Uses `generateAudioAssets`.
- Has hardcoded language list.
- Appears less integrated than `TranslationManager`.

### Mobile Simulator

File: `MobileSimulator`

Role:

- Right-side phone preview of the current training/test slide.
- Renders slide elements in a mobile aspect frame.
- Gives the author immediate visual feedback.

### Publish Dialog

File: `PublishDialog`

Title:

- `Secure Publish`

Flow:

- Requires current password verification through `verifyCurrentPassword`.
- Checks:
  - slides.
  - translations.
  - audio.
- Allows publishing with warnings.
- Confirm publish action calls save/publish path.

### Create Module Dialog

File: `CreateModuleDialog`

Behavior:

- Title input.
- Creates a default module with an introduction slide.
- Calls `saveModule` with a new module payload.

### Load Module Dialog

File: `LoadModuleDialog`

Behavior:

- Command/search UI.
- Search by title/id.
- Sort ID ascending/descending.
- Selecting routes to `/admin/modules/provision?id={id}`.

### Loader and Recovery

File: `app/admin/modules/provision/loader.ts`

Recovery behavior:

- Loads module through `getModule`.
- Normalizes old direct `slides` content into `training` or `assessment`.
- Ensures both `training` and `assessment` sections exist.
- Recovers linked assessment module if missing.
- Recovers content/translations from R2:
  - `content.json`.
  - legacy `Tmp_EN.js`.
  - legacy `Languages.js`.

## Admin Assignments

Route: `/admin/assignments`

File: `app/admin/assignments/page.tsx`

Section header:

- Title: `Training Assignments`.

Main component:

- `AssignmentManager`.

### AssignmentManager

Modes:

- `Assignment Overview`.
- `New Assignment`.

Toolbar:

- Export assignments CSV.
- Refresh.

Shared filters:

- Search.
- Team (UI state variable `selectedDepts` maps to `teamIds` in the action call — a partial rename).
- Designation (added alongside the team rename fix; `selectedDesignations` state → `designationIds` filter).
- Home Depot.
- Operational Zone.

Overview-only filters:

- Status.
- Modules.

Status options:

- Not Started.
- Ongoing.
- Completed.

Reset button:

- Tooltip: `Flush Spectrum Analysis`.

Assign mode selection toolbar:

- `Selected Users: {count}`.
- Clear selection.
- Assign Modules button.

### AssignmentTable

Columns:

- User Name.
- Module.
- Department.
- Dates.
- Status.
- Action.

Row content:

- User full name and employee id.
- Module title and module ref.
- Department and home location.
- Assigned date.
- Due date.
- Training status badge.

Empty state:

- `No Assignments Found`.
- `Please adjust your filters`.

### UserSelectionTable

Columns:

- Checkbox.
- User Name.
- Department.
- Location.
- Status.

Selection:

- Row click toggles user.
- Header checkbox selects all current users.
- Status badge:
  - Selected.
  - Available.

Empty state:

- `No Users Found`.
- `Please adjust your filters`.

### AssignModulePopup

Title:

- `Finalize Assignment`.

Content:

- Available modules grid.
- Module title.
- Description.
- Duration.
- Marks.
- Selection check.

Due date:

- Optional date input.
- Presets:
  - +7 Days.
  - +14 Days.
  - +30 Days.

Warning:

- Selected users will be notified.
- Duplicate assignments are ignored.

Actions:

- Confirm Assignment of `{count}` Modules.
- Cancel.

### Assignment User Details Popup

Sections:

- Employment Details.
- Contact Information.
- Training Assignments.

Employment fields:

- Employee ID.
- Company.
- Language.
- Department.
- Home Location.
- Assigned Location.

Contact fields:

- Email.
- Mobile.

Assignment cards:

- Module title.
- Training status.
- Progress bar.
- Score.
- Delete assignment.
- Assigned date.
- Deadline.

## Admin Reports

Route: `/admin/reports`

File: `app/admin/reports/page.tsx`

Query filters:

- `from`
- `to`
- `depotId`
- `teamId`
- `designationId`

Section header:

- Title: `Training Reports`.

Main component:

- `ReportsDashboard`.

### ReportsDashboard

Header:

- `Training Analytics`.
- `Fleet Performance Reports`.
- Description: comprehensive analytics overview of workforce training progress and performance metrics.

Filters:

- Date range picker.
- All Depots.
- All Teams.
- All Designations.

Download:

- `Download Report (PDF)`.
- Uses `html-to-image` and `jspdf`.

Summary cards:

- Total Workforce.
- Avg Test Score.
- Pass Rate.
- Module Efficiency.

Charts:

- Training Progress pie.
- Test Results pie.
- Depot-wise Completion bar.
- Team Performance bar.
- Designation Performance bar (data from `designationStats` added in reports action).
- Module Efficiency bar.

Drill-down:

- Pie cells call `getDrillDownData`.
- Opens `DrillDownModal`.

### DrillDownModal

Header:

- Dynamic title.
- `Loading data...` or `{count} records found`.

Table columns:

- Driver.
- Module.
- Status.
- Score.
- Date.

Footer:

- `Export List` button.

Risk:

- Export List button has UI but no connected export behavior in the observed component.
- Backend drill-down implementation covers some categories but not every chart category equally.

## Admin Audit Logs

Route: `/admin/audit`

File: `app/admin/audit/page.tsx`

Section header:

- Title: `Audit Logs`.

Main component:

- `AuditDashboard`.

### AuditDashboard

Filters:

- Search.
- Start date.
- End date.

Search placeholder:

- `Scan Directive, Originator, or Target Node ID...`

Actions:

- Reset Vector.
- Export Log.

Table columns:

- Temporal Ref.
- Originator.
- Directive.
- Target Matrix.

Pagination:

- 20 records per page.
- Shows range and total trace logs.
- Uses previous/next controls.

Empty state:

- `Null Event Buffer`.
- `No activity signatures detected in current sector.`

## Admin Master Data

Route: `/admin/master-data`

File: `app/admin/master-data/page.tsx`

Section header:

- Title: `Master Data`.
- Description: configures structural designations, hub locations, and operational sites.

Main component:

- `MasterDataManager`.

### MasterDataManager

Tabs:

- Teams.
- Designations.
- Depots.
- Work-Zones.

Tab configurations:

- Teams:
  - Title: `Operational Teams`.
  - Description: `Manage high-level organizational units and driver team definitions.`
- Designations:
  - Title: `Staff Designations`.
  - Description: `Define official roles and professional titles for the workforce.`
- Depots:
  - Title: `Central Depot Repository`.
  - Description: `Configure primary home base coordinates for the fleet.`
  - Location type: `HOME`.
- Work-Zones:
  - Title: `Operational Work-Sites`.
  - Description: `Define specific dispatch areas and active operations zones.`
  - Location type: `ASSIGNED`.

Actions:

- Add Item.
- Edit item.
- Delete item.

### MasterDataTable

Search placeholder:

- `Scan {type} records...`

Columns:

- Object Identity.
- Type, for locations.
- Linked Users.
- Directives.

Object identity:

- Name.
- Registry ref.
- Icon by type.

Location type badges:

- Home Depot.
- Assigned Site.

Empty state:

- `Zero match results in current quadrant.`

### ManageItemPopup

Title:

- Add/Modify Item.

Fields:

- Label Designation.
- Spatial Classification for generic locations:
  - Central Depot.
  - Operational Site.

Actions:

- Abort.
- Create Item.
- Save Changes.

Validation:

- Requires name.

## Error Screens

### Global Error

File: `app/error.tsx`

Content:

- `Something went wrong!`
- `Application encountered a critical error.`
- Try again button.

### User Error

File: `app/(user)/error.tsx`

Content:

- `Dashboard Error`
- `We couldn't load your dashboard data.`
- Retry button.

## Active Public Assets

Used assets:

- `/mowasalat-logo.png`
- `/background.mp3`
- `/icon.svg`
- `/apple-icon.png`
- placeholders.

Potential missing:

- `/grid.svg`

## Legacy or Mixed Frontend Areas

### `components/user-dashboard/dashboard`

Contains older/static dashboard components:

- `header.tsx`
- `main-content.tsx`
- `module-card.tsx`
- `user-profile-popup.tsx`

The active `/dashboard` route uses only:

- `dashboard/hero-title.tsx`
- `dashboard/footer-action.tsx`

The route uses data-driven root components for:

- `components/user-dashboard/header.tsx`
- `components/user-dashboard/main-content.tsx`

EuclidPro should remove or clearly mark stale dashboard subfolder files.

### `reference_only`

Contains older dashboards and earlier route/API implementations. Treat as reference only.

## Frontend Improvement Opportunities for EuclidPro

- Define a single route protection strategy for user and admin surfaces.
- Split product shells cleanly:
  - user shell.
  - admin shell.
  - authoring shell.
- Replace direct server-action imports in many client components with narrower API/service hooks.
- Standardize field names from backend to UI, especially `completion_date`.
- Remove stale components and reference projects from active source.
- Make module player and module editor share a typed content schema package.
- Replace dynamic Tailwind class string construction with explicit class maps.
- Make notification and logout flows consistently call server actions.
- Separate module repository analytics from module authoring responsibilities.
- Consider server-side report/PDF generation for reliable enterprise reporting.
