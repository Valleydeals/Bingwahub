
"use strict";

require("dotenv").config();

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: true }
        : undefined,

    max: 10,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000
});

pool.on("error", error => {
    console.error(
        "Unexpected PostgreSQL error:",
        error.message
    );
});

async function testDatabaseConnection() {
    const client = await pool.connect();

    try {
        const result = await client.query(
            "SELECT NOW() AS current_time"
        );

        console.log(
            "PostgreSQL connected successfully:",
            result.rows[0].current_time
        );

        return true;

    } finally {
        client.release();
    }
}

module.exports = pool;
module.exports.testDatabaseConnection =
    testDatabaseConnection;
