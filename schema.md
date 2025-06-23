# Restaurant Manager Database Schema

## Overview

This document defines the database schema for the Restaurant Reservations Manager system. The schema supports table management, reservation workflow, Telegram integration, automated reminders, and analytics.

## Database Tables

### 1. Tables

Represents the physical tables in the restaurant that can be reserved.

```sql
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,           -- e.g., "Patio Table 5", "Window Booth 2"
    capacity INTEGER NOT NULL CHECK (capacity > 0), -- Maximum number of guests
    location VARCHAR(200),                       -- e.g., "Patio", "Main Dining", "Private Room"
    status VARCHAR(20) DEFAULT 'available',      -- 'available', 'maintenance', 'reserved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_capacity ON tables(capacity);
```

### 2. Customers

Stores customer information for reservations and communication.

```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(320),                          -- Email for reminders (optional)
    phone VARCHAR(20),                          -- Phone for SMS reminders (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure at least one contact method is provided
    CONSTRAINT check_contact_info CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
```

### 3. Reservations

Core entity for managing table reservations throughout their lifecycle.

```sql
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'discarded', 'completed', 'no_show'
    special_requests TEXT,                       -- Optional notes from customer
    reminder_sent BOOLEAN DEFAULT FALSE,         -- Track if reminder was sent
    telegram_message_id INTEGER,                 -- Reference to Telegram message for this reservation
    confirmed_by INTEGER REFERENCES admins(id),  -- Which admin confirmed the reservation
    confirmed_at TIMESTAMP WITH TIME ZONE,      -- When it was confirmed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure party size doesn't exceed table capacity
    CONSTRAINT check_party_size_capacity 
        CHECK (party_size <= (SELECT capacity FROM tables WHERE id = table_id))
);

-- Indexes
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_date_time ON reservations(reservation_date, reservation_time);
CREATE INDEX idx_reservations_table_date ON reservations(table_id, reservation_date);
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_reservations_reminder ON reservations(reminder_sent, status, reservation_date, reservation_time);

-- Unique constraint to prevent double booking
CREATE UNIQUE INDEX idx_unique_table_datetime 
    ON reservations(table_id, reservation_date, reservation_time) 
    WHERE status IN ('pending', 'confirmed');
```

### 4. Admins

Admin users who can manage reservations and access the dashboard.

```sql
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,        -- Hashed password
    telegram_chat_id BIGINT,                    -- Telegram chat ID for notifications
    telegram_username VARCHAR(100),             -- Telegram username
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'admin',           -- 'admin', 'manager', 'staff'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_admins_telegram_chat_id ON admins(telegram_chat_id);
CREATE INDEX idx_admins_is_active ON admins(is_active);
```

### 5. Telegram Messages

Track Telegram notifications sent and their responses for audit purposes.

```sql
CREATE TABLE telegram_messages (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES admins(id),
    telegram_message_id INTEGER NOT NULL,       -- Telegram's message ID
    telegram_chat_id BIGINT NOT NULL,          -- Chat ID where message was sent
    message_type VARCHAR(50) DEFAULT 'reservation_notification', -- 'reservation_notification', 'reminder'
    message_content TEXT,                       -- Content of the message sent
    status VARCHAR(50) DEFAULT 'sent',          -- 'sent', 'delivered', 'failed', 'responded'
    response_action VARCHAR(50),                -- 'confirm', 'discard', null
    responded_at TIMESTAMP WITH TIME ZONE,     -- When admin responded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_telegram_messages_reservation ON telegram_messages(reservation_id);
CREATE INDEX idx_telegram_messages_admin ON telegram_messages(admin_id);
CREATE INDEX idx_telegram_messages_status ON telegram_messages(status);
CREATE INDEX idx_telegram_messages_telegram_id ON telegram_messages(telegram_message_id, telegram_chat_id);
```

### 6. System Settings

Store system-wide configuration and settings.

```sql
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('telegram_bot_token', '', 'Telegram Bot API Token'),
    ('default_admin_chat_id', '', 'Default Telegram Chat ID for notifications'),
    ('reminder_hours_before', '2', 'Hours before reservation to send reminder'),
    ('business_hours_start', '09:00', 'Restaurant opening time'),
    ('business_hours_end', '22:00', 'Restaurant closing time'),
    ('max_advance_booking_days', '30', 'Maximum days in advance for bookings'),
    ('reservation_duration_minutes', '120', 'Default reservation duration in minutes');
```

### 7. Audit Logs

Track important system events for analytics and debugging.

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,           -- 'reservation', 'table', 'customer', 'admin'
    entity_id INTEGER NOT NULL,                 -- ID of the affected entity
    action VARCHAR(50) NOT NULL,                -- 'create', 'update', 'delete', 'confirm', 'discard'
    old_values JSONB,                          -- Previous state (for updates)
    new_values JSONB,                          -- New state
    performed_by_type VARCHAR(50),              -- 'admin', 'system', 'customer'
    performed_by_id INTEGER,                    -- ID of who performed the action
    ip_address INET,                           -- IP address of the request
    user_agent TEXT,                           -- User agent string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by_type, performed_by_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## Views for Analytics

### Reservation Analytics View

```sql
CREATE VIEW reservation_analytics AS
SELECT 
    DATE_TRUNC('day', reservation_date) as date,
    COUNT(*) as total_reservations,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_reservations,
    COUNT(*) FILTER (WHERE status = 'discarded') as discarded_reservations,
    COUNT(*) FILTER (WHERE status = 'no_show') as no_shows,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_reservations,
    AVG(party_size) as avg_party_size,
    SUM(party_size) FILTER (WHERE status = 'confirmed') as total_confirmed_guests
FROM reservations
GROUP BY DATE_TRUNC('day', reservation_date);
```

### Peak Hours View

```sql
CREATE VIEW peak_hours_analytics AS
SELECT 
    EXTRACT(hour FROM reservation_time) as hour,
    COUNT(*) as reservation_count,
    AVG(party_size) as avg_party_size
FROM reservations
WHERE status IN ('confirmed', 'completed')
GROUP BY EXTRACT(hour FROM reservation_time)
ORDER BY hour;
```

### Table Utilization View

```sql
CREATE VIEW table_utilization AS
SELECT 
    t.id,
    t.name,
    t.capacity,
    COUNT(r.id) as total_reservations,
    COUNT(r.id) FILTER (WHERE r.status = 'confirmed') as confirmed_reservations,
    ROUND(
        COUNT(r.id) FILTER (WHERE r.status = 'confirmed')::numeric / 
        NULLIF(COUNT(r.id), 0) * 100, 2
    ) as confirmation_rate
FROM tables t
LEFT JOIN reservations r ON t.id = r.table_id
GROUP BY t.id, t.name, t.capacity;
```

## Relationships Summary

1. **Customers** → **Reservations** (One-to-Many)
2. **Tables** → **Reservations** (One-to-Many)
3. **Admins** → **Reservations** (One-to-Many, for confirmed_by)
4. **Reservations** → **Telegram Messages** (One-to-Many)
5. **Admins** → **Telegram Messages** (One-to-Many)

## Constraints and Business Rules

1. **Unique Table Bookings**: A table cannot have overlapping reservations with 'pending' or 'confirmed' status
2. **Party Size Validation**: Party size cannot exceed table capacity
3. **Contact Information**: Customers must have either email or phone number
4. **Status Transitions**: Reservations follow a specific status flow:
   - `pending` → `confirmed` or `discarded`
   - `confirmed` → `completed` or `no_show`
5. **Reminder Logic**: Reminders are only sent for 'confirmed' reservations
6. **Business Hours**: Reservations should only be accepted during business hours (enforced at application level)

## Indexes Strategy

- **Primary keys**: Automatic unique indexes
- **Foreign keys**: Indexes for join performance
- **Query patterns**: Indexes based on common query patterns:
  - Date/time lookups for reservations
  - Status filtering for reservations
  - Customer and table lookups
  - Telegram message tracking

## Data Integrity

- Foreign key constraints ensure referential integrity
- Check constraints validate business rules
- Unique constraints prevent data duplication
- Audit logs provide complete change tracking
