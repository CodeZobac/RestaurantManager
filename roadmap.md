Excellent. Dividing the tasks between a frontend and a backend specialist is a standard and effective way to manage a project. Here is the comprehensive roadmap, reorganized with clear responsibilities for Afonso (Frontend) and Luis (Backend).

### Project Overview: Restaurant Reservations Manager

Afonso will be responsible for building the user-facing Next.js application, focusing on user experience, interactivity, and real-time UI updates. Luis will build the robust FastAPI backend, handling all business logic, database interactions, and third-party integrations like Telegram and scheduled jobs.

---

### High-Level Roadmap

The project phases remain the same, but the tasks within each phase are now assigned.

*   **Phase 1: Foundation & Core MVP**
    *   **Goal:** Establish the project structure and build the essential features for table and reservation management.
    *   **Collaboration Focus:** Defining the initial REST API contracts for tables and reservations.

*   **Phase 2: Real-time Admin Workflow & Telegram Integration**
    *   **Goal:** Implement the Telegram notification/action loop and make the frontend dashboard update in real-time.
    *   **Collaboration Focus:** Defining the WebSocket protocol and the data structure for real-time messages.

*   **Phase 3: Client Experience & Automation**
    *   **Goal:** Automate client reminders to reduce no-shows.
    *   **Collaboration Focus:** Minimal collaboration needed; this is primarily a backend task.

*   **Phase 4: Polish, Analytics & Deployment**
    *   **Goal:** Add analytics and prepare the application for production.
    *   **Collaboration Focus:** Defining the API endpoints for aggregated analytics data.

---

### Detailed User Stories by Role & Phase

### **Phase 1: Foundation & Core MVP**

#### **Backend Tasks (Luis)**

**User Story 1.1 (Backend): API for Table Management**
**As** Luis, the Backend Developer,
**I need to** create secure CRUD API endpoints for managing restaurant tables (`/tables`),
**so that** the frontend can create, retrieve, update, and delete table data.

**Acceptance Criteria:**
-   `POST /tables`: Creates a new table record in the database.
-   `GET /tables`: Retrieves a list of all tables.
-   `PUT /tables/{table_id}`: Updates a specific table's details (e.g., capacity).
-   `DELETE /tables/{table_id}`: Deletes a table.
-   Database schema for `Table` (id, name, capacity, status) is defined using SQLAlchemy.
-   Pydantic models are used for request body validation and response serialization.

**Tech Stack:** FastAPI, Pydantic, SQLAlchemy, PostgreSQL/SQLite.

**Context:** This is the foundational API for the admin dashboard. The API contract (URL structure, JSON payload) must be clearly defined and shared with Afonso.

---

**User Story 1.2 (Backend): API for Reservation Logic**
**As** Luis, the Backend Developer,
**I need to** implement the reservation creation and availability logic via API endpoints,
**so that** the client-facing frontend can request a booking.

**Acceptance Criteria:**
-   An endpoint `POST /reservations` is created.
-   It accepts `client_name`, `client_contact` (phone/email), `reservation_time`, and `party_size`.
-   The endpoint logic checks for available tables that match the criteria (time, party size).
-   If a table is available, a `Reservation` record is created with `status: "pending"`.
-   The API responds with a success message or an appropriate error (e.g., "No tables available").

**Tech Stack:** FastAPI, Pydantic, SQLAlchemy, Python's `datetime` module.

**Context:** This is the core business logic of the application. It's the engine that powers the booking system. Luis must define the exact request and response formats for Afonso.

#### **Frontend Tasks (Afonso)**

**User Story 1.1 (Frontend): UI for Table Management**
**As** Afonso, the Frontend Developer,
**I need to** build an admin interface for managing tables,
**so that** the restaurant admin can visually interact with their table setup.

**Acceptance Criteria:**
-   A `/admin/tables` page is created.
-   The page fetches and displays all tables by calling Luis's `GET /tables` endpoint.
-   A form exists to create a new table, which calls the `POST /tables` endpoint on submission.
-   Each table in the list has "Edit" and "Delete" buttons, which trigger calls to the corresponding `PUT` and `DELETE` endpoints.
-   The UI provides feedback on success or failure of these operations.

**Tech Stack:** Next.js 15, React, State Management (Zustand/Valtio), `fetch`/`axios` for API calls.

**Context:** This is the admin's primary tool for configuring the restaurant layout. It must be intuitive and provide clear feedback.

---

**User Story 1.2 (Frontend): UI for Client Reservation**
**As** Afonso, the Frontend Developer,
**I need to** create the client-facing reservation form and booking flow,
**so that** customers have a simple way to make a reservation request.

**Acceptance Criteria:**
-   A public page (`/reserve`) contains the reservation form (date, time, party size, name, contact).
-   Client-side validation is implemented for all fields.
-   On form submission, the page calls Luis's `POST /reservations` endpoint with the form data.
-   The UI displays a "Your request is pending confirmation" message on success.
-   The UI displays a clear error message if the backend responds that no tables are available.

**Tech Stack:** Next.js 15, React Server Components (for initial page load), Client Components (for form interactivity).

**Context:** This is the main entry point for revenue generation. The user experience must be smooth and straightforward to maximize conversions.

---

**User Story 1.3 (Frontend): Admin's Visual Dashboard**
**As** Afonso, the Frontend Developer,
**I need to** build the visual dashboard that shows table status using a color-coded grid,
**so that** the admin has an at-a-glance view of the restaurant's occupancy.

**Acceptance Criteria:**
-   An `/admin/dashboard` page is created with a date selector.
-   When a date is selected, the frontend calls a backend endpoint (e.g., `GET /dashboard-status?date=...`) that Luis will create.
-   The UI renders tables as a grid of colored squares/circles.
-   Table color is determined by the `status` field in the API response: green (`available`), yellow (`pending`), red (`confirmed`).
-   UI is responsive and displays well on different screen sizes.

**Tech Stack:** Next.js 15, CSS (Tailwind CSS/Styled Components) for styling, a date-picker library.

**Context:** This is the admin's command center. **Collaboration Point:** Afonso and Luis must agree on the exact JSON structure of the `/dashboard-status` endpoint response.

### **Phase 2: Real-time Admin Workflow & Telegram Integration**

#### **Backend Tasks (Luis)**

**User Story 2.1 (Backend): Telegram Notification & Action Webhook**
**As** Luis, the Backend Developer,
**I need to** integrate with the Telegram Bot API to send notifications and process admin actions,
**so that** reservations can be managed remotely and instantly.

**Acceptance Criteria:**
-   On new reservation creation (`status: "pending"`), a background task sends a formatted message to a configured Telegram chat.
-   The message includes two inline buttons ("Confirm", "Discard"), each containing the unique reservation ID in its callback data.
-   A secure webhook endpoint (`POST /telegram/webhook`) is created to receive callback queries from Telegram.
-   The webhook logic validates the request, finds the reservation by its ID, and updates its status to `confirmed` or `discarded`.
-   The original Telegram message is updated to show the action was completed.

**Tech Stack:** FastAPI (Background Tasks, Webhook Endpoint), `python-telegram-bot`, Pydantic, Environment variables for secrets.

**Context:** This is a core feature requirement. It's almost entirely a backend task, but its outcome directly impacts the frontend via the next user story.

---

**User Story 2.2 (Backend): WebSocket Server for Real-time Updates**
**As** Luis, the Backend Developer,
**I need to** implement a WebSocket server that broadcasts status changes,
**so that** Afonso's frontend dashboard can update in real-time.

**Acceptance Criteria:**
-   A WebSocket endpoint is created (e.g., `/ws/dashboard`).
-   After a reservation status is updated (e.g., via the Telegram webhook), the backend broadcasts a JSON message to all connected WebSocket clients.
-   The message must contain the necessary information for the frontend, e.g., `{ "table_id": 12, "new_status": "confirmed" }`.
-   The implementation should be robust enough to handle client connects and disconnects gracefully.

**Tech Stack:** FastAPI (WebSockets support).

**Context:** This provides the real-time communication channel. **Collaboration Point:** Luis and Afonso must agree on the exact structure of the WebSocket messages.

#### **Frontend Tasks (Afonso)**

**User Story 2.3 (Frontend): Real-time Dashboard Updates via WebSockets**
**As** Afonso, the Frontend Developer,
**I need to** connect the admin dashboard to the WebSocket server and update the UI based on incoming messages,
**so that** the admin sees status changes instantly without refreshing the page.

**Acceptance Criteria:**
-   When the `/admin/dashboard` page loads, it establishes a WebSocket connection to Luis's `/ws/dashboard` endpoint.
-   The frontend listens for incoming messages from the WebSocket.
-   When a message like `{ "table_id": 12, "new_status": "confirmed" }` is received, the frontend finds the corresponding table in the UI.
-   The state of that table is updated, causing its color to change from yellow to red automatically.
-   The WebSocket connection logic includes reconnection attempts if the connection is lost.

**Tech Stack:** Next.js 15, Browser WebSocket API, State Management (Zustand/Valtio) to handle state changes without re-rendering the entire page.

**Context:** This feature delivers a modern, "live" feel to the application and is the payoff for the backend's Telegram and WebSocket work.

### **Phase 3: Client Experience & Automation**

#### **Backend Tasks (Luis)**

**User Story 3.1 (Backend): Scheduled Reservation Reminders**
**As** Luis, the Backend Developer,
**I need to** create a scheduled job that sends automated reminders to clients,
**so that** the restaurant can minimize no-shows and lost revenue.

**Acceptance Criteria:**
-   A recurring background job is configured to run at a set interval (e.g., every 15 minutes).
-   The job queries the database for "confirmed" reservations scheduled to happen in approximately 2 hours.
-   For each found reservation, it sends a reminder via a pre-configured channel (e.g., email using SendGrid or SMS using Twilio).
-   A flag `reminder_sent` is set on the reservation record to avoid sending duplicates.
-   The job must be resilient to errors (e.g., API failure for one message shouldn't stop the whole job).

**Tech Stack:** Celery & Redis (for robust scheduling), `fastapi-mail` or `httpx` to call third-party APIs (Twilio, SendGrid).

**Context:** A high-value business feature that runs entirely on the backend. No frontend work is needed for this story.

### **Phase 4: Polish, Analytics & Deployment**

#### **Backend Tasks (Luis)**

**User Story 4.1 (Backend): API for Analytics Data**
**As** Luis, the Backend Developer,
**I need to** create API endpoints that provide aggregated reservation data,
**so that** the frontend can display analytics charts.

**Acceptance Criteria:**
-   An endpoint like `GET /analytics/reservations-over-time?start=...&end=...` is created to return daily/weekly counts.
-   An endpoint like `GET /analytics/peak-hours` is created to return reservation counts grouped by the hour of the day.
-   The SQL queries behind these endpoints are optimized for performance, using indexes and proper aggregation.
-   The API response formats are clear and designed for easy consumption by charting libraries.

**Tech Stack:** FastAPI, SQLAlchemy (for complex queries), Pydantic.

**Context:** Provides the data foundation for business intelligence. **Collaboration Point:** Luis must work with Afonso to define the exact data structures needed for the charts Afonso will build.

#### **Frontend Tasks (Afonso)**

**User Story 4.1 (Frontend): Analytics Dashboard UI**
**As** Afonso, the Frontend Developer,
**I need to** build a new analytics dashboard page with charts and stats,
**so that** the admin can gain insights into their business performance.

**Acceptance Criteria:**
-   A new `/admin/analytics` page is created.
-   The page includes a date range filter that re-fetches data from Luis's analytics endpoints.
-   A line chart displays reservations over time.
-   A bar chart shows peak reservation hours.
-   Key stats (e.g., total reservations, confirmation rate) are displayed as simple text cards.
-   The page is visually clean and the data is easy to interpret.

**Tech Stack:** Next.js 15, a charting library (`Recharts`, `Chart.js`), `fetch`/`axios`.

**Context:** This feature turns the application from a simple operational tool into a valuable source of business insights.