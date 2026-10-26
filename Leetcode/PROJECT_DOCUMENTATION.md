# LeetCode Platform Documentation

This document describes the LeetCode-style coding platform in this repository. It covers the frontend, backend, authentication, problem management, code execution, editorial videos, AI chat, database models, API routes, setup, and troubleshooting.

## 1. Project overview

The project is a full-stack coding practice platform with:

- User registration, login, logout, and cookie-based authentication.
- Admin-only problem creation, editing, and deletion.
- Problem browsing with difficulty and tag filters.
- A coding workspace with:
  - Monaco code editor.
  - C++, JavaScript, Python, and Java starter code.
  - Visible test-case execution.
  - Hidden test-case submission.
  - Submission history.
- Editorial solution videos hosted on Cloudinary.
- An AI DSA tutor powered by Google Gemini.
- MongoDB persistence.
- Redis token blocklisting after logout.
- Judge0 integration for compiling and running submitted code.

## 2. Repository structure

```text
Leetcode/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   ├── .env
│   └── package.json
├── frontend/
│   └── vite-project/
│       ├── src/
│       │   ├── pages/
│       │   ├── slice/
│       │   ├── store/
│       │   ├── utils/
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
└── PROJECT_DOCUMENTATION.md
```

## 3. Technology stack

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit and React Redux
- React Hook Form
- Zod
- Axios
- Monaco Editor
- React Markdown and remark-gfm
- Tailwind CSS and DaisyUI styling
- Oxlint

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- Redis
- JWT
- bcrypt
- Axios
- Judge0
- Google Gemini through `@google/genai`
- Cloudinary
- cookie-parser
- CORS

## 4. Running the project

### 4.1 Install dependencies

Open two terminals.

```powershell
cd "Leetcode\backend"
npm install
```

```powershell
cd "Leetcode\frontend\vite-project"
npm install
```

### 4.2 Start the backend

```powershell
cd "Leetcode\backend"
npm start
```

The backend listens on the port configured by `Port`, normally:

```text
http://localhost:7000
```

For development with automatic restart:

```powershell
cd "Leetcode\backend"
npm run dev
```

### 4.3 Start the frontend

```powershell
cd "Leetcode\frontend\vite-project"
npm run dev
```

The Vite frontend normally runs at:

```text
http://localhost:5173
```

### 4.4 Production build

```powershell
cd "Leetcode\frontend\vite-project"
npm run build
```

### 4.5 Linting

```powershell
cd "Leetcode\frontend\vite-project"
npm run lint
```

The project currently has no automated backend test suite. Backend syntax and route imports can be checked with:

```powershell
cd "Leetcode\backend"
node --check src/index.js
node --check src/controller/userproblem.js
node --check src/controller/submit_problem.js
```

## 5. Environment variables

Create `Leetcode/backend/.env`. Do not commit real credentials.

```dotenv
Port=7000
DB_string=<MongoDB connection string>
JWT_Key=<JWT signing secret>
Redis_key=<Redis password>
GEMINI_KEY=<Google Gemini API key>
GEMINI_MODEL=gemini-3.8-flash
CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
CLOUDINARY_API_KEY=<Cloudinary API key>
CLOUDINARY_API_SECRET=<Cloudinary API secret>
JUDGE0_URL=http://127.0.0.1:2358
```

### Variable usage

| Variable | Used for |
|---|---|
| `Port` | Express server port |
| `DB_string` | MongoDB connection |
| `JWT_Key` | JWT verification in middleware |
| `Redis_key` | Redis token blocklist authentication |
| `GEMINI_KEY` | AI tutor requests |
| `GEMINI_MODEL` | Gemini model; defaults to `gemini-3.8-flash` |
| `CLOUDINARY_*` | Editorial video upload and deletion |
| `JUDGE0_URL` | Judge0 submission endpoint |

The frontend Axios client currently uses `http://localhost:7000` as its API base URL in [axios.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/utils/axios.js>).

## 6. Application startup flow

1. [main.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/main.jsx>) creates the React root.
2. Redux is provided through the store.
3. [App.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/App.jsx>) dispatches `checkAuth()` on startup.
4. The app waits while authentication is loading.
5. Authenticated users are routed to the homepage.
6. Admin users are allowed into `/admin` routes.
7. The backend loads environment variables, connects to MongoDB and Redis, mounts routers, and starts Express.

## 7. Frontend routing

Routes are configured in [App.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/App.jsx>).

| Route | Page | Access |
|---|---|---|
| `/` | Homepage | Authenticated users |
| `/login` | Login | Logged-out users |
| `/signup` | Signup | Logged-out users |
| `/admin` | Redirects to admin dashboard | Admin users |
| `/admin/dashboard` | Admin dashboard | Admin users |
| `/admin/problem/create` | Create problem | Admin users |
| `/admin/problem/update` | Update problem | Admin users |
| `/admin/problem/delete` | Delete problem | Admin users |
| `/admin/video` | Editorial video management | Admin users |
| `/admin/upload/:problemId` | Upload or replace editorial video | Admin users |
| `/problem/:problemid` | Coding workspace | Authenticated users |

The frontend route guards improve user experience, but backend middleware remains the actual security boundary.

## 8. Frontend pages

### 8.1 Homepage

File: [Homepage.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/Homepage.jsx>)

Responsibilities:

- Loads all problems from `/problem/get_All_Problem`.
- Loads the current user’s solved problems.
- Filters problems by:
  - All or solved status.
  - Difficulty.
  - Tag.
- Links each problem to `/problem/:id`.
- Displays the authenticated user menu.
- Shows **Admin Panel** only when `user.role === "admin"`.
- Keeps **Logout** available for all authenticated users.

### 8.2 Login

File: [Login.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/Login.jsx>)

Responsibilities:

- Validates email and password with Zod.
- Dispatches `loginUser`.
- Stores the returned user in Redux.
- Redirects admins to `/admin/dashboard`.
- Redirects regular users to `/`.
- Supports password visibility toggling.

### 8.3 Signup

File: [Signup.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/Signup.jsx>)

Responsibilities:

- Collects first name, email, and password.
- Validates password strength:
  - At least 8 characters.
  - Uppercase letter.
  - Lowercase letter.
  - Number.
  - Special character.
- Dispatches `registerUser`.
- New public registrations receive the normal `user` role from the backend.

### 8.4 Admin dashboard

File: [Admin.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/Admin/Admin.jsx>)

Provides links to:

- Create problem.
- Update problem.
- Delete problem.
- Manage editorial videos.

The dashboard route is restricted to users whose role is `admin`.

### 8.5 Create problem

File: [createProblem.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/Admin/createProblem.jsx>)

The form creates a complete problem document containing:

- Title.
- Description (`discription` in the current schema).
- Difficulty.
- Tag.
- Visible test cases.
- Hidden test cases.
- Starter code by language.
- Verified reference solutions by language.

Before saving, the backend executes every reference solution against every visible test case through Judge0. A problem is saved only if all reference tests pass.

Dynamic form operations:

- Add test case.
- Remove test case, while preserving at least one item.
- Add starter code.
- Add reference solution.
- Select language.

### 8.6 Update problem

File: [Update_problem.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/Admin/Update_problem.jsx>)

Workflow:

1. Enter a MongoDB problem ID.
2. Fetch the problem.
3. Edit its fields and arrays.
4. Submit the update.
5. Backend re-verifies reference solutions before saving.

The page supports direct problem responses and older nested response formats.

### 8.7 Delete problem

File: [delete_problem.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/Admin/delete_problem.jsx>)

Workflow:

1. Enter a problem ID.
2. Search for the problem.
3. Review ID, title, description, difficulty, and tag.
4. Confirm deletion.
5. Delete the problem.

The backend also removes the linked editorial video record and attempts to remove its Cloudinary asset.

### 8.8 Editorial video management

File: [AdminVideo.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/Admin/AdminVideo.jsx>)

For each problem, an admin can:

- Open the upload page.
- Upload or replace an editorial video.
- Delete the editorial video.

File: [AdminUpload.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/Admin/AdminUpload.jsx>)

Upload flow:

1. Request a signed Cloudinary upload payload.
2. Upload the selected video directly to Cloudinary.
3. Send the resulting Cloudinary metadata to the backend.
4. Save the video record in MongoDB.

The form validates:

- Video MIME type.
- Maximum file size of 100 MB.
- Upload progress.

Only one editorial video is kept per problem. A new upload replaces the existing one.

## 9. Problem workspace

Main file: [ProblemPage.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/submission_page/ProblemPage.jsx>)

The workspace has:

- Left problem panel.
- Right Monaco editor.
- Bottom testcase and result panel.
- User profile dropdown.

### Problem loading

The page requests:

```text
GET /problem/problem_getById/:id
```

It accepts:

- A direct problem document.
- `data.problem`.
- `data.getProblemById`.

### Description panel

File: [ProblemDiscription.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/submission_page/component/ProblemDiscription.jsx>)

Tabs:

- Description.
- Editorial.
- Solutions.
- Submissions.
- Chat AI.

Description:

- Renders Markdown with GitHub-flavored Markdown support.
- Displays title, difficulty, tag, constraints, and up to three visible examples.

Editorial:

- Displays the [Editorial.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/submission_page/component/Editorial.jsx>) video player when a video exists.

Solutions:

- Displays reference solutions.
- Formats compact one-line code into readable blocks.

Submissions:

- Loads the current user’s submissions on demand.
- Shows status, language, runtime, memory, test counts, and errors.

Chat AI:

- Renders [chatAi.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/submission_page/component/chatAi.jsx>).

### AI chat

The chat sends:

```text
POST /ai/chat
```

Payload fields:

- `messages`
- `title`
- `description`
- `testCases`
- `startCode`

The backend sends the conversation to Gemini as DSA tutor context. Chat history uses Gemini roles:

- `user`
- `model`

The frontend displays safe backend error messages when the AI service is unavailable.

### Code editor

File: [CodeEditor_panel.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/submission_page/component/CodeEditor_panel.jsx>)

Features:

- Monaco syntax highlighting.
- Language selection.
- Starter-code reset.
- Font-size settings.
- Word wrap.
- Bookmark state.
- Expand/collapse editor.
- Escape key to close expanded editor.

### Language and starter-code helpers

File: [ProblemUtils.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/submission_page/component/ProblemUtils.js>)

Responsibilities:

- Defines supported languages.
- Normalizes aliases such as `cpp`, `c++`, `js`, and `py`.
- Provides fallback starter code.
- Finds language-specific starter code.
- Normalizes visible test cases.

### Testcase panel

File: [TestCasePanel.jsx](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/pages/submission_page/component/TestCasePanel.jsx>)

Features:

- Select visible test cases.
- Display input and expected output.
- Run code.
- Submit code.
- Display Judge0 output, status, compiler output, and runtime errors.

### Run and submit behavior

Run uses:

```text
POST /problem/run/:id
```

It executes against visible test cases.

Submit uses:

```text
POST /problem/submit/:id
```

It executes against hidden test cases and stores a submission. Accepted submissions add the problem to the user’s solved-problem list.

## 10. Redux state

Files:

- [authSlice.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/slice/authSlice.js>)
- [editorSlice.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/slice/editorSlice.js>)
- [store.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/store/store.js>)

### Authentication slice

Async actions:

- `registerUser`
- `loginUser`
- `checkAuth`
- `logoutUser`

State:

```js
{
  user,
  loading,
  isAuthenticated,
  error
}
```

Authentication uses an HTTP cookie named `token`. The Axios client enables `withCredentials`.

### Editor slice

The editor slice keeps code independently for each problem and programming language:

```js
{
  codeByProblem: {
    [problemId]: {
      [language]: "..."
    }
  }
}
```

Its actions are:

- `initializeCode`: Adds starter code only when that problem/language does not already have saved code.
- `setCode`: Stores the latest Monaco editor contents for a problem and language.
- `resetCode`: Replaces the saved code with the selected starter code.

The problem workspace uses this slice to preserve code while switching languages or moving between problem views during the current session. The editor slice is registered as `state.editor` in the Redux store.

## 11. Axios client

File: [axios.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/frontend/vite-project/src/utils/axios.js>)

Configuration:

- Base URL: `http://localhost:7000`
- Credentials enabled.
- JSON content type.

The response interceptor normalizes plain-text responses into:

```js
{ message: "..." }
```

This lets frontend pages consistently read `response.data.message`.

## 12. Backend startup and middleware

File: [index.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/index.js>)

Startup sequence:

1. Load `.env`.
2. Create Express app.
3. Enable JSON parsing.
4. Enable cookies.
5. Enable CORS for `http://localhost:5173`.
6. Mount routers.
7. Connect MongoDB and Redis.
8. Start listening on `Port`.

Mounted route prefixes:

```text
/user
/problem
/ai
/video
```

## 13. Backend authentication middleware

### User middleware

File: [userMiddleware.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/middleware/userMiddleware.js>)

Checks:

1. Token cookie exists.
2. JWT is valid.
3. User exists in MongoDB.
4. Token is not blocklisted in Redis.

The authenticated user is assigned to `req.result`.

### Admin middleware

File: [adminMiddleware.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/middleware/adminMiddleware.js>)

Performs the user checks and additionally requires:

```text
req.result.role === "admin"
```

## 14. Backend API routes

### Authentication routes

File: [userAuth.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/routes/userAuth.js>)

| Method | Endpoint | Middleware | Purpose |
|---|---|---|---|
| POST | `/user/register` | None | Register normal user |
| POST | `/user/login` | None | Login and issue JWT cookie |
| POST | `/user/logout` | User | Block token and clear cookie |
| POST | `/user/admin/register` | Admin | Create admin user |
| DELETE | `/user/deleteProfile` | User | Delete current user |
| GET | `/user/check` | User | Return authenticated user |

### Problem routes

File: [problem_route.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/routes/problem_route.js>)

| Method | Endpoint | Middleware | Purpose |
|---|---|---|---|
| POST | `/problem/create` | Admin | Create and verify a problem |
| PUT | `/problem/update/:id` | Admin | Update and re-verify a problem |
| POST | `/problem/delete/:id` | Admin | Delete a problem |
| GET | `/problem/problem_getById/:id` | User | Fetch one problem |
| GET | `/problem/get_All_Problem` | User | Fetch paginated problem list |
| GET | `/problem/submittedProblem/:id` | User | Fetch user submissions for a problem |
| GET | `/problem/solvedProblem` | User | Fetch solved problems |

### Code execution routes

File: [submit_route.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/routes/submit_route.js>)

| Method | Endpoint | Middleware | Purpose |
|---|---|---|---|
| POST | `/problem/run/:id` | User | Run code against visible tests |
| POST | `/problem/submit/:id` | User | Submit code against hidden tests |

### AI route

File: [aiChatting.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/routes/aiChatting.js>)

| Method | Endpoint | Middleware | Purpose |
|---|---|---|---|
| POST | `/ai/chat` | User | Ask the DSA tutor |

### Video routes

File: [videoCreator.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/routes/videoCreator.js>)

| Method | Endpoint | Middleware | Purpose |
|---|---|---|---|
| GET | `/video/create/:problemId` | Admin | Create signed Cloudinary upload parameters |
| POST | `/video/save` | Admin | Verify and save uploaded video metadata |
| DELETE | `/video/delete/:problemId` | Admin | Delete Cloudinary video and database record |

## 15. Backend controllers

### User authentication controller

File: [userAuthen.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/controller/userAuthen.js>)

Responsibilities:

- Validate registration.
- Hash passwords with bcrypt.
- Create JWT cookies.
- Return user identity and role.
- Block logged-out tokens in Redis.
- Return authentication information after refresh.

### Problem controller

File: [userproblem.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/controller/userproblem.js>)

Responsibilities:

- Create problems.
- Verify reference solutions through Judge0.
- Update problems.
- Delete problems.
- Fetch one problem and attach editorial video metadata.
- Fetch paginated problem lists.
- Fetch submissions and solved problems.

### Submission controller

File: [submit_problem.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/controller/submit_problem.js>)

Responsibilities:

- Validate code submissions.
- Convert language names to Judge0 IDs.
- Encode source code and test input with Base64.
- Execute visible or hidden tests.
- Aggregate accepted, wrong-answer, and runtime/compiler error states.
- Store submission metrics.
- Mark accepted problems as solved.

### AI controller

File: [solveDoubt.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/controller/solveDoubt.js>)

Responsibilities:

- Validate incoming messages.
- Normalize messages for Gemini.
- Add problem context to the system instruction.
- Restrict the tutor to DSA assistance.
- Return an AI response.
- Return a safe error if Gemini is unavailable.

### Video controller

File: [videoSection.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/controller/videoSection.js>)

Responsibilities:

- Generate signed Cloudinary upload parameters.
- Verify uploaded video metadata through Cloudinary.
- Save video metadata in MongoDB.
- Replace an existing video for the same problem.
- Delete videos from Cloudinary and MongoDB.

## 16. Database models

### User

File: [user.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/models/user.js>)

Important fields:

- `firstName`
- `lastName`
- `emailid`
- `password`
- `role`: `user` or `admin`
- `problemSolved`: references to solved problems
- timestamps

### Problem

File: [problem_Schema.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/models/problem_Schema.js>)

Important fields:

- `title`
- `discription`
- `difficulty`
- `tag`
- `visible_testcases`
- `hidden_testcases`
- `start_code`
- `ref_solution`
- `problem_creator`

The spelling `discription` is part of the current database contract and is used throughout the application.

### Submission

File: [submit.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/models/submit.js>)

Important fields:

- `userId`
- `problemId`
- `code`
- `language`
- `runtime`
- `memory`
- `status`
- `errorMessage`
- `testCasesPassed`
- `testCasesTotal`

### Solution video

File: [SolutionVideo.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/models/SolutionVideo.js>)

Important fields:

- `problemId`
- `userId`
- `cloudinaryPublicId`
- `secureUrl`
- `thumbnailUrl`
- `duration`
- timestamps

## 17. External service integrations

### MongoDB

Configured in [db.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/config/db.js>).

The connection string is read from `DB_string`.

### Redis

Configured in [redis.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/config/redis.js>).

Redis stores blocked JWT tokens after logout. The token block entry expires when the JWT would have expired.

### Judge0

Implemented in [problem_utility.js](<C:/Users/91991/OneDrive/Desktop/CODER ARMY WEB DEV/Leetcode/backend/src/utils/problem_utility.js>).

Judge0 is required for:

- Creating problems with verified reference solutions.
- Updating problems with verified reference solutions.
- Running visible tests.
- Submitting hidden tests.

If Judge0 is not running, the application reports that it is unavailable at the configured `JUDGE0_URL`.

### Cloudinary

Used for editorial video storage. The browser uploads directly to Cloudinary using a backend-generated signature. The backend stores only verified metadata and removes the Cloudinary asset when a video or problem is deleted.

### Gemini

Used by the Chat AI tab. The backend controls the model and system instruction so the assistant remains focused on the current DSA problem.

## 18. Important data conventions

The application currently supports both legacy and normalized response shapes in several frontend places:

```js
data.getProblemById || data.problem || data
```

Problem field aliases:

```js
problem.discription
problem.description

problem.visible_testcases
problem.visibleTestCases

problem.start_code
problem.startCode
```

New backend code should prefer the existing database names unless a migration is planned.

## 19. Troubleshooting

### `ECONNREFUSED 127.0.0.1:2358`

Judge0 is not running. Start Judge0 or configure a reachable `JUDGE0_URL`.

### AI returns an error

Check:

- `GEMINI_KEY` exists.
- `GEMINI_MODEL` is available to the API key.
- Backend was restarted after changing `.env`.
- The request includes at least one valid message.

### Admin Panel does not appear

Check:

- The logged-in user has `role: "admin"` in MongoDB.
- `/user/check` returns the role.
- The browser has a valid authentication cookie.
- Redis has not blocklisted the token.

### Problem page is empty

Check:

- The problem ID is a valid MongoDB ObjectId.
- Backend and MongoDB are running.
- `SolutionVideo` is imported by the problem controller.
- The response contains a direct problem document or a supported wrapper.

### Create or update problem fails

Check:

- Judge0 is running.
- Every reference solution compiles.
- Visible test-case input and output are correct.
- Language names are supported: C++, Java, JavaScript, or Python.

### Video upload fails

Check:

- Cloudinary environment variables are set.
- The user is an admin.
- The file is a video.
- The file is at most 100 MB.
- The Cloudinary upload URL returned by the backend is reachable.

## 20. Security notes

- Never commit `.env` files or API credentials.
- Keep JWT secrets private.
- Keep Cloudinary API secrets on the backend only.
- Do not trust frontend role checks as authorization; backend middleware must enforce roles.
- Validate uploaded file type and size.
- Use a production-specific CORS origin instead of allowing development origins in production.
- Consider rotating any credentials that have been exposed during development.

## 21. Recommended future improvements

- Add a backend test suite.
- Add frontend component tests.
- Move the Axios base URL to a Vite environment variable.
- Add pagination controls to the admin video and problem lists.
- Replace the `discription` field with `description` through a controlled migration.
- Add request schemas with Zod or Joi on the backend.
- Add rate limiting to authentication and AI endpoints.
- Add a dedicated video listing endpoint instead of inferring video availability from problem documents.
- Add transactional cleanup for problem, submission, and editorial-video deletion.
- Fix remaining lint warnings and legacy comments.
- Add structured logging instead of console-only diagnostics.
