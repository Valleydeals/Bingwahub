"use strict";

require("dotenv").config();

const API_BASE_URL =
    "https://kdqrvslykgwjeeldqqvr.supabase.co/functions/v1";

let cachedToken = null;
let tokenExpiresAt = 0;

async function authenticate() {
    if (
        cachedToken &&
        Date.now() < tokenExpiresAt - 60000
    ) {
        return cachedToken;
    }

    const clientId = process.env.DATA_API_CLIENT_ID;
    const clientSecret = process.env.DATA_API_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("AutoBundles credentials are missing.");
    }

    const response = await fetch(
        `${API_BASE_URL}/data-api-auth`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                grant_type: "client_credentials",
                client_id: clientId,
                client_secret: clientSecret
            }),
            signal: AbortSignal.timeout(15000)
        }
    );

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        throw new Error(
            data.message || "AutoBundles authentication failed."
        );
    }

    cachedToken = data.access_token;

    const expiresIn = Number(data.expires_in) || 300;

    tokenExpiresAt = Date.now() + expiresIn * 1000;

    return cachedToken;
}

// =====================================
// AUTHENTICATED API REQUEST
// =====================================

async function apiRequest(endpoint, options = {}) {
    const token = await authenticate();

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...options.headers
            },
            signal: AbortSignal.timeout(20000)
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        cachedToken = null;
        tokenExpiresAt = 0;
    }

    if (!response.ok) {
        throw new Error(
            data.message || "AutoBundles API request failed."
        );
    }

    return data;
}

// =====================================
// GET AVAILABLE OFFERS
// =====================================

async function getOffers() {
    return apiRequest("/data-api-offers");
}

// =====================================
// CREATE ORDER
// =====================================

async function createOrder(orderData) {
    return apiRequest("/data-api-orders", {
        method: "POST",
        body: JSON.stringify(orderData)
    });
}

// =====================================
// CHECK ORDER STATUS
// =====================================

async function getOrderStatus(orderId) {
    const endpoint =
        `/data-api-orders?id=${encodeURIComponent(orderId)}`;

    return apiRequest(endpoint);
}

module.exports = {
    authenticate,
    getOffers,
    createOrder,
    getOrderStatus
};
