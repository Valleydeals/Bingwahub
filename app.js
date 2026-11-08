
/* =====================================
   BINGWAHUB - MAIN JAVASCRIPT
===================================== */

"use strict";

// Current year in footer
document.addEventListener("DOMContentLoaded", () => {
    const footer = document.querySelector(".site-footer");

    if (footer) {
        const paragraphs = footer.querySelectorAll("p");

        paragraphs.forEach(paragraph => {
            if (paragraph.textContent.includes("All rights reserved")) {
                paragraph.textContent =
                    `© ${new Date().getFullYear()} BINGWAHUB. All rights reserved.`;
            }
        });
    }
});

// Format Kenyan currency
function formatKES(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return "KSh 0";
    }

    return "KSh " + value.toLocaleString("en-KE");
}

// Normalize Kenyan phone numbers
function normalizePhone(phone) {
    let number = String(phone).replace(/\D/g, "");

    if (number.startsWith("0")) {
        number = "254" + number.substring(1);
    }

    if (number.startsWith("7") || number.startsWith("1")) {
        number = "254" + number;
    }

    return /^254[17]\d{8}$/.test(number)
        ? number
        : null;
}
