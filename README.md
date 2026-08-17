# EventHub

**EventHub** is a full-stack MERN platform for discovering, hosting, and managing events — built end-to-end with a real-time chat layer, QR-code ticketing, AI-assisted event creation, and a host analytics dashboard.

Attendees browse events, book tickets that generate a unique QR code, chat live with other attendees, and manage their bookings. Hosts create and publish events (with an AI writing assistant for descriptions), track registrations and revenue on an analytics dashboard, and check attendees in at the door with a camera-based QR scanner.

---
## Features

### For everyone
- Browse and search events by keyword, city, and state
- Rich event detail pages — schedule, location, pricing, capacity, tags
- Live per-event chat over Socket.IO, open to any signed-in user (not just ticket holders)
- JWT authentication (access + refresh tokens) stored in httpOnly cookies

### For attendees
- Register for events and instantly receive a unique **QR-code ticket**
- Track and manage bookings from **My Bookings**
- Cancel a booking up to **24 hours** before the event starts
- **Browser push notifications** for chat replies while the tab is backgrounded

### For hosts
- Create and edit events, with cover image upload via **Cloudinary**
- **AI-generated event descriptions** — describe a topic and let Google Gemini draft the copy
- **My Events** dashboard: every hosted event in one table, with Edit / Delete / View actions
- Per-event **registrations view** with individual check-in and a one-click **Check-in All**
- Live **camera QR scanner** to check attendees in at the door, with a manual code-entry fallback
- **Analytics dashboard** — registration trend chart, revenue-by-event chart, and a per-event breakdown table (registered, checked in, attendance rate, revenue), filterable by **1 Month / 3 Months / All Time**
- Historical analytics survive automatic event cleanup — see [Automated Jobs](#automated-jobs)

---

## Tech Stack

**Frontend**
| Tool | Purpose |
|---|---|
| React 19 + Vite | UI and build tooling |
| React Router | Client-side routing |
| Redux Toolkit | Auth/session state |
| Tailwind CSS | Styling |
| Socket.IO client | Real-time event chat |
| `qrcode.react` / `jsqr` | Ticket QR generation / camera QR scanning |
| `recharts` | Analytics charts |
| Browser Notification API | Chat push notifications |
| lucide-react | Icons |

**Backend**
| Tool | Purpose |
|---|---|
| Node.js + Express 5 | REST API |
| MongoDB + Mongoose | Database and ODM |
| Socket.IO | Real-time chat rooms |
| JWT + bcrypt | Authentication and password hashing |
| Multer + Cloudinary | Event cover image uploads |
| Google Gemini API | AI-generated event descriptions |
| `node-cron` | Scheduled cleanup of expired events |

---

## Project Structure

```
EVENT-HUB/
├── backend/
│   └── src/
│       ├── controllers/       # Route handlers (users, events, registrations, messages)
│       ├── models/            # Mongoose schemas: User, Event, Registration, Message, EventArchive
│       ├── routes/            # Express routers
│       ├── middlewares/       # Auth (JWT) and file upload (Multer)
│       ├── socket/            # Socket.IO event-chat rooms
│       ├── utils/             # Cloudinary, Gemini, API helpers, expired-event cleanup job
│       ├── db/                # MongoDB connection
│       ├── app.js
│       └── index.js           # Server entry point + cron schedule
├── frontend/
│   └── src/
│       ├── api/                # Axios/fetch wrappers per resource
│       ├── components/         # Header, Footer, Card, EventForm, QRScanner, EventChat, ConfirmModal...
│       ├── pages/               # Home, Explore, Event, Create, EditEvent, MyEvents, Analytics,
│       │                        # MyBookings, Profile, Login, SignUp
│       ├── layouts/             # PublicLayout, MainLayout
│       ├── store/               # Redux slices (auth)
│       ├── context/             # Toast notifications
│       └── socket.js
└── package.json                 # Root scripts to run both apps together
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (e.g. MongoDB Atlas)
- A Cloudinary account (for image uploads)
- A Google Gemini API key (for AI-generated descriptions)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd EVENT-HUB

npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment variables

See [Environment Variables](#environment-variables) below, then create `backend/.env` accordingly.

In `frontend/vite.config.js`, make sure the dev server proxy points requests starting with `/api` to your backend URL (e.g. `http://localhost:8000`).

### 3. Run in development

From the project root, this starts both the backend and frontend together:

```bash
npm run dev
```

Or run them individually:

```bash
npm run backend    # Express API on PORT (default 8000)
npm run frontend   # Vite dev server, typically on http://localhost:5173
```

### 4. Build for production

```bash
npm run build --prefix frontend
npm start --prefix backend
```

---

## Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=8000
CORS_ORIGIN=http://localhost:5173

MONGODB_URL=your_mongodb_connection_string   # remove the trailing "/" if copied from Atlas

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key
```

---

## API Reference

Base URL: `/api/v1`

| Resource | Endpoint | Description |
|---|---|---|
| Users | `POST /users/register` | Register as an Attendee or Host |
| Users | `POST /users/login` | Log in |
| Users | `POST /users/logout` | Log out |
| Users | `POST /users/refresh-token` | Rotate access token using refresh token |
| Users | `GET /users/me` | Get current authenticated user |
| Users | `PATCH /users/update-profile` | Update profile |
| Events | `GET /events` | List/search all events |
| Events | `POST /events/create` | Create an event (Host only, with cover image) |
| Events | `GET /events/:eventId` | Get event details |
| Events | `PATCH /events/:eventId` | Update an event (organizer only) |
| Events | `DELETE /events/:eventId` | Delete an event (organizer only) |
| Events | `GET /events/my-events` | List events created by the current host |
| Events | `POST /events/generate-description` | AI-generate an event description |
| Events | `GET /events/analytics?range=1m\|3m\|all` | Host analytics — trend, per-event stats, revenue (Host only) |
| Registrations | `POST /registrations/book/:eventId` | Book/register for an event |
| Registrations | `PATCH /registrations/cancel/:registrationId` | Cancel a booking |
| Registrations | `POST /registrations/check-in` | Check in an attendee by QR code (Host only) |
| Registrations | `GET /registrations/my-bookings` | List the current user's bookings |
| Registrations | `GET /registrations/event/:eventId` | List registrations for an event (organizer only) |
| Messages | `GET /messages/:eventId` | Get chat history for an event |
| Messages | `POST /messages/:eventId` | Post a chat message |

Real-time chat runs over Socket.IO, with clients joining a room per `eventId`.

---

## Data Models

- **User** — name, email, password hash, `userType` (`Attendee` \| `Host`)
- **Event** — title, description, category, mode (`Online` \| `Offline`), image, tags, start/end, venue/city or meetingLink, organizerId, ticketType (`Free` \| `Paid`), ticketPrice, capacity, registrationCount
- **Registration** — eventId, userId, unique `qrCode`, `checkedIn`, status (`Confirmed` \| `Cancelled`); one registration per user per event
- **Message** — eventId, userId, text, timestamp
- **EventArchive** — a permanent snapshot (organizerId, title, dates, capacity, ticketType, registrations, checkedIn, revenue) written for an event right before it's auto-deleted, so historical analytics survive the cleanup

---

## Automated Jobs

**Expired event cleanup** (`backend/src/utils/deleteExpiredEvents.js`) runs once on server startup and then every hour via `node-cron`:

1. Finds every event whose `end` time has passed.
2. Snapshots each one's stats (registrations, check-ins, revenue) into `EventArchive`.
3. Deletes the event's `Registration` and `Message` documents, then the `Event` itself.

This keeps the live `Event` collection limited to current/upcoming events, while the **Analytics dashboard** (`GET /events/analytics`) reads from both the live collection and `EventArchive`, so a host's revenue and attendance history remains available (filterable by 1 month / 3 months / all time) even after the underlying event is gone.

---

## Business Rules & Design Decisions

- Only users registered as a **Host** can create and manage events; only an event's organizer can edit, delete, or view its registrations.
- A user cannot register for the same event twice, and registration is blocked once an event reaches capacity.
- Bookings can only be cancelled up to **24 hours** before the event's start time.
- Event chat is open to any signed-in user, not only those with a confirmed booking.
- Revenue is **derived** (`ticketPrice × confirmed registrations`) rather than collected — there's no payment gateway integrated yet.
- Chat notifications use the browser's native Notification API rather than a full Web Push (service worker + VAPID) setup — they fire while the site is open in a background tab, not when the browser itself is closed.

---

## Future Enhancements

- **Payment gateway integration** (Razorpay/Stripe) for Paid events — the `ticketPrice` field already exists on the Event model, but there's no real payment flow yet
- **Email notifications** for booking confirmations and event reminders
- **Social login** via Google OAuth


