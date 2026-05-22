# 📝 Blog Application — Backend

A fully-featured, production-ready **RESTful Blog API** built with **Node.js**, **Express**, and **MongoDB**. This backend powers a blogging platform that supports user authentication (with OTP email verification), session management, post CRUD, image uploads via Cloudinary, comments, likes, and bookmarks.

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [Environment Variables](#-environment-variables)
- [Database Models & Schemas](#-database-models--schemas)
- [API Endpoints Reference](#-api-endpoints-reference)
  - [Auth / User Routes](#1-auth--user-routes-apiv1auth)
  - [Post Routes](#2-post-routes-apiv1post)
  - [Comment Routes](#3-comment-routes-apiv1post)
  - [Like Routes](#4-like-routes-apiv1post)
  - [Bookmark Routes](#5-bookmark-routes-apiv1post)
- [Authentication Flow](#-authentication-flow)
- [OTP Email Verification Flow](#-otp-email-verification-flow)
- [Password Reset Flow](#-password-reset-flow)
- [Image Upload Flow](#-image-upload-flow)
- [Middlewares](#-middlewares)
- [Validation (Zod)](#-validation-zod)
- [Services](#-services)
- [Utilities](#-utilities)
- [Getting Started — Local Setup](#-getting-started--local-setup)
- [Scripts](#-scripts)
- [Request & Response Examples](#-request--response-examples)
- [Security Practices](#-security-practices)
- [Known Limitations & Future Improvements](#-known-limitations--future-improvements)

---

## 🌐 Overview

This is the **backend API** for a Blog Application. It handles:

- **User Registration & Email Verification** — Users sign up and receive a 6-digit OTP on their email for account verification.
- **JWT Authentication with Session Management** — Access tokens (15 min) + Refresh tokens (7 days) stored as HTTP-only cookies. Sessions are persisted in MongoDB and can be individually or globally revoked.
- **Blog Post CRUD** — Authenticated users can create, read, update, and delete their own posts. Posts support a `published` toggle (draft vs. live).
- **Cover Image & Profile Image Upload** — Files are uploaded in-memory via Multer (no disk storage) and streamed directly to Cloudinary.
- **Comments** — Authenticated users can comment on any post, edit their own comments, and delete them.
- **Likes** — Toggle-based like/unlike system per post per user.
- **Bookmarks** — Toggle-based save/unsave system. Users can retrieve all their saved posts.
- **Forget/Reset Password** — OTP-based password reset flow via email.
- **Pagination & Search** — Posts and comments support `?page`, `?limit`, `?search`, and `?sort` query parameters.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime (ESM modules, `"type": "module"`) |
| **Express v5** | HTTP web framework |
| **MongoDB + Mongoose** | Database + ODM |
| **bcrypt** | Password hashing (salt rounds: 10) |
| **jsonwebtoken (JWT)** | Access & Refresh token generation/verification |
| **crypto (built-in)** | SHA-256 hashing of OTPs and refresh tokens |
| **Nodemailer + Gmail OAuth2** | Sending OTP emails via Google's OAuth2 |
| **Cloudinary v2** | Cloud image storage for profile & cover images |
| **Multer** | In-memory file upload handling (no disk writes) |
| **streamifier** | Converts in-memory buffer to readable stream for Cloudinary upload |
| **Zod v4** | Schema-based request body & params validation |
| **dotenv** | Environment variable loading |
| **cookie-parser** | Parsing HTTP cookies (for refresh token) |
| **cors** | Cross-Origin Resource Sharing configuration |
| **nodemon** | Dev-mode auto-restart on file changes |

---

## 📁 Project Structure

```
BlogApplication-Backend/
│
├── src/
│   ├── server.js                  # Entry point — loads .env, connects DB, starts server
│   ├── app.js                     # Express app setup — middleware, CORS, route mounting
│   │
│   ├── config/
│   │   ├── db.config.js           # MongoDB connection via Mongoose
│   │   └── cloudinary.config.js   # Cloudinary SDK configuration
│   │
│   ├── models/                    # Mongoose schemas & models
│   │   ├── user.model.js          # User schema (name, email, password, isVerified, profileImage)
│   │   ├── session.model.js       # Session schema (userId, hash, ip, userAgent, revoked)
│   │   ├── otp.model.js           # OTP schema (user, email, hashedOtp, purpose)
│   │   ├── post.model.js          # Post schema (title, content, author, published, coverImage)
│   │   ├── comment.model.js       # Comment schema (content, author, post)
│   │   ├── like.model.js          # Like schema (user, post)
│   │   └── bookmark.model.js      # Bookmark schema (user, post)
│   │
│   ├── controllers/               # Business logic for each feature
│   │   ├── user.controller.js     # All user/auth operations (signup→deleteUser, 884 lines)
│   │   ├── post.controller.js     # All post operations (CRUD, publish toggle, cover image)
│   │   ├── comment.controller.js  # Comment CRUD
│   │   ├── like.controller.js     # Like toggle, count, check, list
│   │   └── bookmark.controller.js # Bookmark toggle & list
│   │
│   ├── routes/                    # Express routers
│   │   ├── user.routes.js         # /api/v1/auth/*
│   │   ├── post.routes.js         # /api/v1/post/*
│   │   ├── comment.routes.js      # /api/v1/post/:id/comment
│   │   ├── like.routes.js         # /api/v1/post/:id/like
│   │   └── bookmark.routes.js     # /api/v1/post/:id/bookmark
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT verification + session validation guard
│   │   └── upload.middleware.js   # Multer in-memory storage (max 5MB)
│   │
│   ├── services/
│   │   └── email.service.js       # Nodemailer transporter + sendEmail() via Gmail OAuth2
│   │
│   ├── validators/                # Zod validation schemas
│   │   ├── user.validator.js      # signup, login, verifyEmail, updateUser, changePassword, forget/reset password
│   │   ├── post.validator.js      # createPost, getById, updatePost, deletePost, togglePublish, validateId
│   │   └── comment.validator.js   # commentBody, postId, commentId
│   │
│   └── utils/
│       └── utils.js               # generateOtp() — 6-digit random OTP; getOtpHtml() — styled HTML email template
│
├── .env                           # Your local environment variables (DO NOT commit)
├── .env.example                   # Safe template for environment variables
├── .gitignore                     # Ignores node_modules and .env
├── package.json                   # Project metadata and dependencies
└── README.md                      # This file
```

---

## 🏗 Architecture & Design Decisions

### 1. ES Modules (`"type": "module"`)
The project uses **native ES Modules** (`import`/`export`) instead of CommonJS (`require`). All imports must include the `.js` file extension explicitly (e.g., `import foo from "./foo.js"`).

### 2. Dual-Token Authentication Strategy
- **Access Token** — Short-lived (15 min), sent in the response body as JSON. The client stores it in memory and sends it via `Authorization: Bearer <token>` header.
- **Refresh Token** — Long-lived (7 days), sent as an `httpOnly` cookie (invisible to JavaScript). Used to silently issue new access tokens without re-login.
- **Session-Bound** — Every login creates a `Session` document in MongoDB. The refresh token is never stored raw — its `SHA-256 hash` is stored. The access token payload includes `sessionId`, so every protected request verifies that the session still exists and is not revoked.

### 3. OTP Hashing
OTPs are **never stored in plaintext**. They are hashed using `crypto.createHash("sha256")` before being saved to MongoDB. On verification, the submitted OTP is hashed again and compared.

### 4. In-Memory File Upload → Cloudinary Stream
Files uploaded via `multipart/form-data` are held in **memory buffers** (Multer `memoryStorage`) and streamed directly to Cloudinary using `cloudinary.uploader.upload_stream()` + `streamifier.createReadStream()`. This avoids writing any temporary files to disk.

### 5. Old Image Cleanup
When a user **updates** their profile image or a post's cover image, the controller first calls `cloudinary.uploader.destroy(oldPublicId)` to delete the previous image from Cloudinary before uploading the new one. This prevents orphaned images from accumulating.

### 6. Route Grouping Strategy
All post-related sub-resources (comments, likes, bookmarks) are mounted on the same `/api/v1/post` base path but use separate Express routers. This keeps feature boundaries clean.

### 7. Authorization Guard Pattern
Every protected controller checks `post.author.toString() !== req.user.id` (or equivalent) before allowing modification. This ensures users can only mutate their own resources.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in all values.

```env
# ==============================
# Server Configuration
# ==============================
PORT=5000

# ==============================
# Database Configuration
# ==============================
MONGO_URI=mongodb://localhost:27017/blog-app

# ==============================
# JWT Authentication Secrets
# ==============================
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# ==============================
# Google OAuth / Gmail API
# ==============================
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
GOOGLE_USER_ID=your_gmail_address_here

# ==============================
# Cloudinary (Image Storage)
# ==============================
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ==============================
# Node Environment
# ==============================
NODE_ENV=development   # Set to "production" on live server
```

> **Note:** `NODE_ENV` affects cookie security. In `production`, cookies are set with `secure: true` and `sameSite: "none"` (required for cross-origin requests). In `development`, `secure: false` and `sameSite: "strict"` are used.

### How to get Google OAuth2 credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Gmail API**
3. Create **OAuth 2.0 Client ID** credentials (Desktop app type)
4. Use [OAuth Playground](https://developers.google.com/oauthplayground/) to get the refresh token for `https://mail.google.com/` scope
5. Paste `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, and `GOOGLE_USER_ID` (your Gmail address) into `.env`

---

## 🗄 Database Models & Schemas

### `User`
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `email` | String | Required, Unique |
| `password` | String | Required, bcrypt-hashed |
| `isVerified` | Boolean | Default: `false`. Must be `true` to login |
| `profileImage.url` | String | Cloudinary secure URL |
| `profileImage.public_id` | String | Cloudinary public ID (used for deletion) |
| `createdAt` / `updatedAt` | Date | Auto-managed by `timestamps: true` |

---

### `Session`
Each login creates one Session document. Logout revokes it. "Logout from all devices" revokes all sessions for the user.

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | The authenticated user |
| `hash` | String | SHA-256 hash of the refresh token |
| `ip` | String | Client IP at time of login |
| `userAgent` | String | Browser/client info at login |
| `revoked` | Boolean | Default: `false`. Set to `true` on logout |
| `createdAt` / `updatedAt` | Date | Auto |

---

### `OTP`
Temporary, single-use documents. Deleted after successful verification or expiry.

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Owner |
| `email` | String | Unique, Required |
| `hashedOtp` | String | SHA-256 hash of the plain OTP |
| `purpose` | String | Enum: `"email-verification"` or `"password-reset"` |
| `createdAt` / `updatedAt` | Date | Auto |

> ⚠️ **Note:** An `expiresAt` check is performed in controllers (`otpDoc.expiresAt < new Date()`). To make OTPs auto-expire in MongoDB, add a TTL index on the `createdAt` field in the schema (future improvement).

---

### `Post`
| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `content` | String | Required |
| `author` | ObjectId → User | Required, populated as `{ name, email }` |
| `published` | Boolean | Default: `false` (draft mode) |
| `coverImage.url` | String | Cloudinary URL |
| `coverImage.public_id` | String | Cloudinary ID for deletion |
| `createdAt` / `updatedAt` | Date | Auto |

---

### `Comment`
| Field | Type | Notes |
|---|---|---|
| `content` | String | Required |
| `author` | ObjectId → User | Required |
| `post` | ObjectId → Post | Required |
| `createdAt` / `updatedAt` | Date | Auto |

---

### `Like`
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Required |
| `post` | ObjectId → Post | Required |
| `createdAt` / `updatedAt` | Date | Auto |

> A like is toggled — if a `Like` document with `{ user, post }` already exists, it is deleted (unlike). Otherwise a new one is created.

---

### `Bookmark`
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Required |
| `post` | ObjectId → Post | Required |
| `createdAt` / `updatedAt` | Date | Auto |

> Same toggle pattern as Like.

---

## 📡 API Endpoints Reference

**Base URL:** `http://localhost:5000/api/v1`

### Legend
- 🔒 = Requires `Authorization: Bearer <accessToken>` header
- 🌐 = Public (no auth required)

---

### 1. Auth / User Routes — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | 🌐 | Register a new user. Sends OTP email for verification |
| `POST` | `/verify` | 🌐 | Verify account using the 6-digit OTP sent to email |
| `POST` | `/login` | 🌐 | Login with email & password. Returns access token + sets refresh token cookie |
| `GET` | `/refresh-token` | 🌐 | Exchange valid refresh token cookie for a new access token + rotates refresh token |
| `POST` | `/logout` | 🔒 | Logout from current device. Revokes current session |
| `POST` | `/logout-all` | 🔒 | Logout from ALL devices. Revokes all sessions for the user |
| `GET` | `/me` | 🔒 | Get current authenticated user's profile (excludes password) |
| `PATCH` | `/me` | 🔒 | Update current user's name |
| `PATCH` | `/change-password` | 🔒 | Change password (requires old password verification) |
| `POST` | `/forget-password` | 🌐 | Send OTP to email for password reset |
| `POST` | `/reset-password` | 🌐 | Reset password using OTP from email |
| `PATCH` | `/me/profile-image` | 🔒 | Upload profile image for the first time (multipart/form-data, field: `profileImage`) |
| `PATCH` | `/me/newprofile-image` | 🔒 | Replace existing profile image (deletes old from Cloudinary) |
| `DELETE` | `/users/me` | 🔒 | Permanently delete the authenticated user's account and all related data |

---

### 2. Post Routes — `/api/v1/post`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/create` | 🔒 | Create a new blog post (starts as unpublished/draft) |
| `GET` | `/` | 🌐 | Get all posts with pagination, search, and sort. Supports `?page`, `?limit`, `?search`, `?sort=latest\|oldest` |
| `GET` | `/:id` | 🌐 | Get a single post by ID (populates author name & email) |
| `PUT` | `/:id` | 🔒 | Update a post's title and content (only post author can update) |
| `DELETE` | `/:id` | 🔒 | Delete a post and its Cloudinary cover image (only author) |
| `GET` | `/me/post` | 🔒 | Get all posts created by the logged-in user |
| `PATCH` | `/publish/:id` | 🔒 | Toggle a post between published and draft (only author) |
| `PATCH` | `/:id/cover-image` | 🔒 | Upload a new cover image for a post (field: `coverImage`) |
| `PATCH` | `/:id/newcover-image` | 🔒 | Replace existing cover image (deletes old from Cloudinary) |

---

### 3. Comment Routes — `/api/v1/post`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/:id/comment` | 🔒 | Add a comment to a post |
| `GET` | `/:id/comment` | 🔒 | Get all comments for a post (paginated, newest first). Supports `?page`, `?limit` |
| `PUT` | `/comment/:id` | 🔒 | Update a comment's content (only comment author) |
| `DELETE` | `/comment/:id` | 🔒 | Delete a comment (only comment author) |

---

### 4. Like Routes — `/api/v1/post`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/:id/like` | 🔒 | Toggle like/unlike on a post |
| `GET` | `/:id/likes/count` | 🌐 | Get total like count for a post |
| `GET` | `/:id/liked` | 🔒 | Check if the authenticated user has liked a specific post (returns `{ liked: true/false }`) |
| `GET` | `/liked/me` | 🔒 | Get all posts liked by the authenticated user |

---

### 5. Bookmark Routes — `/api/v1/post`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/:id/bookmark` | 🔒 | Toggle save/remove bookmark for a post |
| `GET` | `/bookmarks/me` | 🔒 | Get all bookmarked posts for the authenticated user (paginated) |

---

## 🔄 Authentication Flow

```
┌─────────────┐         POST /signup          ┌──────────────────┐
│   Client    │ ─────────────────────────────▶│   Server         │
│             │                               │                  │
│             │◀────── 200 OK (OTP sent) ─────│  Creates User    │
│             │                               │  Hashes OTP      │
│             │                               │  Sends Email     │
│             │  POST /verify (otp + email)   │                  │
│             │ ─────────────────────────────▶│                  │
│             │◀──── 200 OK (verified) ───────│  isVerified=true │
│             │                               │  Deletes OTP doc │
│             │                               │                  │
│             │  POST /login (email+password) │                  │
│             │ ─────────────────────────────▶│                  │
│             │◀── accessToken (in body)  ────│  Creates Session │
│             │◀── refreshToken (cookie)  ────│  Hashes RT       │
│             │                               │                  │
│             │  GET /me (Authorization:      │                  │
│             │           Bearer <AT>)        │                  │
│             │ ─────────────────────────────▶│  Verifies AT JWT │
│             │◀── 200 OK (user data) ────────│  Checks Session  │
│             │                               │  (not revoked)   │
│             │                               │                  │
│             │  GET /refresh-token           │                  │
│             │  (cookie auto-sent)           │                  │
│             │ ─────────────────────────────▶│  Verifies RT JWT │
│             │◀── new accessToken (body) ────│  Rotates RT hash │
│             │◀── new refreshToken (cookie)  │  in Session doc  │
└─────────────┘                               └──────────────────┘
```

---

## 📧 OTP Email Verification Flow

```
1. User calls POST /signup with { name, email, password }
2. Server validates with Zod → checks email not already taken
3. Hashes password with bcrypt (10 rounds) → creates User document
4. Generates 6-digit OTP via generateOtp()
5. Hashes OTP with SHA-256 → stores in OTP collection with purpose="email-verification"
6. Sends styled HTML email with the plain OTP via Nodemailer + Gmail OAuth2
7. User receives email → calls POST /verify with { otp, email }
8. Server hashes submitted OTP → looks up matching OTP doc
9. Checks OTP doc expiry (expiresAt field)
10. Sets user.isVerified = true → deletes all OTP docs for that user
```

---

## 🔑 Password Reset Flow

```
1. User calls POST /forget-password with { email }
2. Server finds user by email → generates new OTP
3. Deletes any existing "password-reset" OTPs for that email
4. Creates new OTP doc with purpose="password-reset"
5. Sends OTP email to user
6. User calls POST /reset-password with { email, otp, newPassword }
7. Server hashes submitted OTP → finds matching doc with purpose="password-reset"
8. Checks expiry → finds user → hashes newPassword with bcrypt
9. Updates user.password → deletes the OTP doc
```

---

## 🖼 Image Upload Flow

Files are uploaded using `multipart/form-data`. No file is written to disk — everything stays in memory.

```
Client (multipart/form-data)
        │
        ▼
Multer middleware (memoryStorage, max 5MB)
        │  stores file in req.file.buffer
        ▼
Controller
        │  creates a Promise wrapping cloudinary.uploader.upload_stream()
        │
        ├── streamifier.createReadStream(req.file.buffer)
        │           │
        │           └──▶ .pipe(cloudinaryStream)
        │
        ▼
Cloudinary returns { secure_url, public_id }
        │
        ▼
Saved to MongoDB (user.profileImage or post.coverImage)
```

**Cloudinary Folders:**
- Profile images → `profile-images/`
- Post cover images → `post-cover-image/`

---

## 🛡 Middlewares

### `UserAuthMiddleware` — `src/middlewares/auth.middleware.js`

Applied to all protected routes. Performs:
1. Extracts the Bearer token from the `Authorization` header
2. Verifies the JWT using `ACCESS_TOKEN_SECRET`
3. Fetches the `Session` document by `decoded.sessionId`
4. Rejects if session doesn't exist or `session.revoked === true`
5. Attaches `req.user = { id, sessionId }` for downstream controllers

```js
// How to use in a route:
router.get("/me", UserAuthMiddleware, getCurrentUser);
```

---

### `upload` — `src/middlewares/upload.middleware.js`

Configured Multer instance with:
- **Storage:** `memoryStorage()` — files stored in RAM, not disk
- **File size limit:** 5 MB (`5 * 1024 * 1024` bytes)

```js
// Usage for a single file upload with form field name "profileImage":
router.patch("/me/profile-image", UserAuthMiddleware, upload.single("profileImage"), profileImageUpload);
```

---

## ✅ Validation (Zod)

All request bodies and route params are validated using **Zod schemas** before reaching the business logic. If validation fails, a `400` or `411` response is returned immediately.

### User Validators (`user.validator.js`)

| Schema | Validates |
|---|---|
| `signupPostRequestBodySchema` | `name` (non-empty), `email` (valid email), `password` (min 6 chars) |
| `loginPostRequestBodySchema` | `email`, `password` (min 6 chars) |
| `verifyEmailPostRequestBodySchema` | `otp` (exactly 6 chars), `email` |
| `updateCurrentUserRequestBodySchema` | `updatedName` (non-empty string) |
| `changePasswordPostBodySchema` | `oldPassword` (min 6), `newPassword` (min 6) |
| `forgotPasswordEmailBodySchema` | `email` (valid email format) |
| `resetPasswordBodySchema` | `email`, `otp` (6 digits), `newPassword` (min 3 chars) |

### Post Validators (`post.validator.js`)

| Schema | Validates |
|---|---|
| `createPostRequestBodySchema` | `title` (min 3 chars), `content` (min 10 chars) |
| `getPostByIdSchema` | `id` (valid 24-char MongoDB ObjectId hex) |
| `updatePostIdSchema` | `id` (valid ObjectId) |
| `updatePostDataSchema` | `title` (min 3), `content` (min 10) |
| `deletePostIdSchema` | `id` (valid ObjectId) |
| `togglePublishSchema` | `id` (valid ObjectId) |
| `validatePostIdSchema` | `id` (valid ObjectId) |

### Comment Validators (`comment.validator.js`)

| Schema | Validates |
|---|---|
| `commentPostBodySchema` | `content` (min 3 chars, max 350 chars) |
| `postIdSchema` | `id` (valid 24-char MongoDB ObjectId) |
| `commentIdSchema` | `id` (valid 24-char MongoDB ObjectId) |

---

## 📨 Services

### `email.service.js` — `src/services/email.service.js`

Creates a Nodemailer transporter using **Gmail with OAuth2** (not app password). This avoids the security risks of plain SMTP credentials.

```js
export const sendEmail = async (to, subject, text, html) => { ... }
```

- Called during signup (OTP for email verification)
- Called during forget-password (OTP for password reset)
- Verifies connection on app startup and logs status

---

## 🔧 Utilities

### `utils.js` — `src/utils/utils.js`

**`generateOtp()`**
```js
// Returns a random 6-digit number as a string
// Example: "847291"
Math.floor(100000 + Math.random() * 900000).toString()
```

**`getOtpHtml(otp)`**
- Returns a fully styled HTML email template with the OTP displayed in a gradient badge
- Used directly as the `html` parameter in `sendEmail()`

---

## 🚀 Getting Started — Local Setup

### Prerequisites
- **Node.js** v18+ (for native ESM support)
- **MongoDB** running locally (`mongodb://localhost:27017`) or a **MongoDB Atlas** URI
- **Cloudinary** account (free tier works)
- **Google Cloud** project with Gmail API enabled + OAuth2 credentials

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd BlogApplication-Backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Now open .env and fill in all the values

# 4. Start the development server
npm run dev
```

The server will start on the port specified in `.env` (default: `5000`).

You should see:
```
MongoDB is Connected Successfully ✅ : DB Host localhost
Email server is Ready to sent the verification message
Server is up and running on PORT 5000
```

---

## 📜 Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `nodemon src/server.js` | Start dev server with auto-restart on changes |

---

## 📬 Request & Response Examples

### POST `/api/v1/auth/signup`
```json
// Request Body
{
  "name": "Shiv Codes",
  "email": "shiv@example.com",
  "password": "mypassword123"
}

// Response 200
{
  "status": "success",
  "msg": "User created Successfully",
  "user": {
    "name": "Shiv Codes",
    "email": "shiv@example.com",
    "Verified": false
  }
}
```

### POST `/api/v1/auth/login`
```json
// Request Body
{
  "email": "shiv@example.com",
  "password": "mypassword123"
}

// Response 200
{
  "status": true,
  "message": "Login Successfull",
  "user": { "name": "Shiv Codes", "email": "shiv@example.com", "id": "...", "isVerified": true },
  "token": "<accessToken>"
}
// + httpOnly cookie: refreshToken=<refreshToken>
```

### GET `/api/v1/post?page=1&limit=5&search=nodejs&sort=latest`
```json
// Response 200
{
  "status": true,
  "message": "Here are your all the posts Enjoy !!!",
  "allPost": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPage": 4,
    "totalPost": 18,
    "limit": 5
  }
}
```

### POST `/api/v1/post/:id/like` (Toggle)
```json
// Response 200 (when liked)
{ "status": true, "message": "You liked this Post !" }

// Response 200 (when unliked)
{ "status": true, "message": "You disliked this post !" }
```

---

## 🔒 Security Practices

| Practice | Implementation |
|---|---|
| **Password Hashing** | bcrypt with 10 salt rounds — passwords are never stored in plaintext |
| **OTP Hashing** | SHA-256 hashing via Node's built-in `crypto` module — OTPs never stored in plaintext |
| **Refresh Token Hashing** | Refresh tokens stored as SHA-256 hashes in Session documents |
| **HTTP-Only Cookies** | Refresh token delivered via `httpOnly` cookie (immune to XSS `document.cookie` attacks) |
| **Short-lived Access Tokens** | Access tokens expire in 15 minutes, minimising the window of exploitation |
| **Session Revocation** | Logout revokes the session in DB — even a stolen token becomes useless |
| **Global Logout** | `logout-all` revokes every active session for the user |
| **Authorization Checks** | Every mutating operation checks that `resource.author === req.user.id` |
| **Zod Validation** | All inputs validated before any DB operations — prevents malformed data |
| **CORS Configuration** | Origin locked to `http://localhost:3000` with explicit allowed methods and headers |
| **Cloudinary Old-Image Cleanup** | Old images are deleted from Cloudinary when replaced to prevent orphaned file accumulation |

---

## 🔮 Known Limitations & Future Improvements

| Area | Current State | Suggested Improvement |
|---|---|---|
| **OTP Expiry** | `expiresAt` is checked in code but TTL index not set on the OTP model | Add `{ expiresAt: 1 }` TTL index in `otp.model.js` for automatic MongoDB cleanup |
| **Error Handling** | Each controller has its own try-catch with hardcoded status codes | Add a centralized Express error-handling middleware |
| **Rate Limiting** | No rate limiting on auth routes | Add `express-rate-limit` on `/signup`, `/login`, `/forget-password` |
| **Post Filtering** | `getAllPost` returns all posts (published & drafts) | Filter by `published: true` for the public endpoint |
| **CORS Origin** | Hardcoded to `http://localhost:3000` | Move origin to an environment variable |
| **Pagination on `myPost`** | `myPost` returns all posts without pagination | Add pagination support |
| **File Type Validation** | Multer only limits file size, not file type | Add `fileFilter` to allow only image MIME types |
| **Helmet** | No HTTP security headers set | Add `helmet` middleware to `app.js` |
| **Logging** | Uses `console.log` / `console.error` | Integrate `winston` or `morgan` for structured logging |
| **Tests** | No automated tests | Add Jest + Supertest integration tests for all routes |

---

## 📄 License

ISC — See `package.json`

---

> Built with ❤️ as a deep-dive into Node.js, Express, JWT authentication, session management, and cloud integrations.
