
"use strict";

const express = require("express");
const router = express.Router();

const autoBundles = require("../services/autobundles");

// =====================================
// GET ALL AVAILABLE OFFERS
// =====================================

router.get("/", async (req, res) => {
    try {
        const providerResponse =
            await autoBundles.getOffers();

        // Preserve the original provider response.
        // We will normalize its structure after
        // inspecting the actual API response.

        res.json({
            success: true,
            provider_response: providerResponse
        });

    } catch (error) {
        console.error(
            "Offers API error:",
            error.message
        );

        res.status(502).json({
            success: false,
            message: "Unable to retrieve available offers."
        });
    }
});

module.exports = router;
