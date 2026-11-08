/* =====================================
   BINGWAHUB - CHECKOUT JAVASCRIPT
===================================== */

"use strict";

/* =====================================
   CONFIGURATION
===================================== */

const CHECKOUT_API_URL =
    (window.BINGWAHUB_API_URL || "") + "/api/orders";

const checkoutForm =
    document.getElementById("checkout-form");

const recipientInput =
    document.getElementById("recipient-phone");

const payerInput =
    document.getElementById("payer-phone");

const submitButton =
    document.getElementById("checkout-submit");

/* =====================================
   LOAD SELECTED OFFER
===================================== */

let selectedOffer = null;

function loadSelectedOffer() {
    const offerName =
        document.getElementById("checkout-offer-name");

    const offerPrice =
        document.getElementById("checkout-offer-price");

    try {
        selectedOffer = JSON.parse(
            sessionStorage.getItem("bingwahubSelectedOffer")
        );

    } catch (error) {
        selectedOffer = null;
    }

    if (
        !selectedOffer ||
        !selectedOffer.offer_id ||
        !selectedOffer.name ||
        !Number.isFinite(Number(selectedOffer.price))
    ) {
        offerName.textContent = "No offer selected";

        offerPrice.textContent = "--";

        submitButton.disabled = true;

        showMessage(
            "checkout-message",
            "Please select an offer before checking out.",
            "error"
        );

        return;
    }

    offerName.textContent = selectedOffer.name;

    offerPrice.textContent =
        formatKES(selectedOffer.price);
}

/* =====================================
   CREATE ORDER REFERENCE
===================================== */

function createOrderReference() {
    const random = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

    return "BH-" + Date.now() + "-" + random;
}

/* =====================================
   CHECKOUT SUBMISSION
===================================== */

if (checkoutForm) {

    checkoutForm.addEventListener("submit", async event => {

        event.preventDefault();

        if (!selectedOffer || !selectedOffer.offer_id) {
            showMessage(
                "checkout-message",
                "Please select a valid offer.",
                "error"
            );

            return;
        }

        const recipientPhone =
            normalizePhone(recipientInput.value);

        const payerPhone =
            normalizePhone(payerInput.value);

        if (!recipientPhone) {
            showMessage(
                "checkout-message",
                "Enter a valid recipient phone number.",
                "error"
            );

            recipientInput.focus();
            return;
        }

        if (!payerPhone) {
            showMessage(
                "checkout-message",
                "Enter a valid M-Pesa phone number.",
                "error"
            );

            payerInput.focus();
            return;
        }

        const referenceId = createOrderReference();

        const orderData = {
            offer_id: selectedOffer.offer_id,
            recipient_phone: recipientPhone,
            payer_phone: payerPhone,
            reference_id: referenceId
        };

        submitButton.disabled = true;

        submitButton.textContent =
            "Submitting Order...";

        showMessage(
            "checkout-message",
            "Please wait while we submit your order.",
            "info"
        );

        try {

            const response = await fetch(
                CHECKOUT_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(orderData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to create your order."
                );
            }

            sessionStorage.setItem(
                "bingwahubLastOrder",
                JSON.stringify({
                    reference_id: referenceId,
                    offer_name: selectedOffer.name,
                    amount: Number(selectedOffer.price),
                    status: "pending"
                })
            );

            showMessage(
                "checkout-message",
                "Order submitted successfully. Check your phone for the M-Pesa STK Push.",
                "success"
            );

            submitButton.textContent = "Order Submitted";

        } catch (error) {

            console.error("Checkout error:", error);

            showMessage(
                "checkout-message",
                error.message || "Something went wrong. Please try again.",
                "error"
            );

            submitButton.disabled = false;

            submitButton.textContent =
                "Continue to M-Pesa Payment";
        }

    });

}

/* =====================================
   INITIALIZE CHECKOUT
===================================== */

document.addEventListener("DOMContentLoaded", () => {
    if (checkoutForm) {
        loadSelectedOffer();
    }
});
