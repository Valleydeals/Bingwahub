"use strict";

const express = require("express");
const router = express.Router();

const autoBundles = require("../services/autobundles");

// =====================================
// CREATE ORDER
// =====================================

router.post("/", async (req, res) => {
    try {
        const {
            offer_id,
            recipient_phone,
            payer_phone,
            reference_id
        } = req.body;

        if (
            !offer_id ||
            !recipient_phone ||
            !payer_phone ||
            !reference_id
        ) {
            return res.status(400).json({
                success: false,
                message: "All order fields are required."
            });
        }

        const order = await autoBundles.createOrder({
            offer_id,
            recipient_phone,
            payer_phone,
            reference_id
        });

        return res.status(201).json({
            success: true,
            message: "Your payment request has been submitted.",
            provider_response: order
        });

    } catch (error) {
        console.error("Order creation error:", error.message);

        return res.status(502).json({
            success: false,
            message: "Unable to initiate your order. Please try again."
        });
    }
});

module.exports = router;
