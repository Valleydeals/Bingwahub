
-- =====================================
-- BINGWAHUB DATABASE SCHEMA
-- =====================================

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,

    phone VARCHAR(20) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,

    reference_id VARCHAR(120) NOT NULL UNIQUE,

    provider_order_id UUID UNIQUE,

    customer_id BIGINT REFERENCES customers(id)
        ON DELETE SET NULL,

    offer_id UUID NOT NULL,

    offer_name VARCHAR(255) NOT NULL,

    recipient_phone VARCHAR(20) NOT NULL,

    payer_phone VARCHAR(20) NOT NULL,

    amount NUMERIC(12,2) NOT NULL
        CHECK (amount > 0),

    currency VARCHAR(3) NOT NULL DEFAULT 'KES',

    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (
            payment_status IN (
                'pending',
                'paid',
                'failed'
            )
        ),

    delivery_status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (
            delivery_status IN (
                'pending',
                'completed',
                'failed'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,

    order_id BIGINT NOT NULL REFERENCES orders(id)
        ON DELETE RESTRICT,

    mpesa_receipt VARCHAR(100) UNIQUE,

    amount NUMERIC(12,2) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'paid',
                'failed'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WEBHOOK EVENTS
CREATE TABLE IF NOT EXISTS webhook_events (
    id BIGSERIAL PRIMARY KEY,

    event_key VARCHAR(255) NOT NULL UNIQUE,

    event_type VARCHAR(100) NOT NULL,

    provider_order_id UUID,

    payload JSONB NOT NULL,

    processed BOOLEAN NOT NULL DEFAULT FALSE,

    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    processed_at TIMESTAMPTZ
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_customer
ON orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_orders_reference
ON orders(reference_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
ON orders(payment_status, delivery_status);

CREATE INDEX IF NOT EXISTS idx_orders_created
ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_order
ON payments(order_id);

CREATE INDEX IF NOT EXISTS idx_webhook_order
ON webhook_events(provider_order_id);
