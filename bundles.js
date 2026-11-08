/* =====================================
   BINGWAHUB - DYNAMIC BUNDLE CATALOGUE
===================================== */

"use strict";

const OFFERS_API_URL =
    (window.BINGWAHUB_API_URL || "") + "/api/offers";

let allOffers = [];
let activeCategory = "all";

/* =====================================
   DOM ELEMENTS
===================================== */

const offersContainer =
    document.getElementById("offers-container");

const searchInput =
    document.getElementById("bundle-search");

const filterButtons =
    document.querySelectorAll(".filter-btn");

/* =====================================
   LOAD OFFERS FROM BACKEND
===================================== */

async function loadOffers() {
    if (!offersContainer) return;

    try {
        offersContainer.innerHTML = `
            <div class="offers-message">
                <div class="loading-spinner"></div>
                <h3>Loading available offers...</h3>
                <p>Please wait.</p>
            </div>
        `;

        const response = await fetch(OFFERS_API_URL);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load offers."
            );
        }

        if (!Array.isArray(data.offers)) {
            throw new Error("Invalid offers response.");
        }

        allOffers = data.offers;

        displayOffers();

    } catch (error) {
        console.error("Offers loading error:", error);

        offersContainer.innerHTML = `
            <div class="offers-message">
                <h3>Unable to Load Offers</h3>
                <p></p>
            </div>
        `;

        offersContainer.querySelector("p").textContent =
            error.message || "Please try again later.";
    }
}

/* =====================================
   DISPLAY OFFERS
===================================== */

function displayOffers() {
    if (!offersContainer) return;

    offersContainer.replaceChildren();

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const filteredOffers = allOffers.filter(offer => {

        const categoryMatches =
            activeCategory === "all" ||
            String(offer.category).toLowerCase() === activeCategory;

        const searchableText = [
            offer.name,
            offer.category,
            offer.validity,
            offer.frequency
        ].filter(Boolean).join(" ").toLowerCase();

        const searchMatches =
            searchableText.includes(searchTerm);

        return categoryMatches && searchMatches;
    });

    if (filteredOffers.length === 0) {
        const message = document.createElement("div");
        message.className = "offers-message";

        const heading = document.createElement("h3");
        heading.textContent = "No Offers Found";

        const paragraph = document.createElement("p");
        paragraph.textContent =
            "Try another category or search term.";

        message.append(heading, paragraph);
        offersContainer.appendChild(message);

        return;
    }

    const grid = document.createElement("div");
    grid.className = "category-grid";

    filteredOffers.forEach(offer => {

        const card = document.createElement("div");
        card.className = "category-card";

        const heading = document.createElement("h3");
        heading.textContent = offer.name;

        const price = document.createElement("h2");
        price.textContent = formatKES(offer.price);

        const details = document.createElement("p");

        details.textContent = [
            offer.validity,
            offer.frequency
        ].filter(Boolean).join(" · ");

        const button = document.createElement("button");
        button.type = "button";
        button.className = "primary-button checkout-button";
        button.textContent = "Buy Now";

        button.addEventListener("click", () => {
            selectOffer(offer);
        });

        card.append(
            heading,
            price,
            details,
            button
        );

        grid.appendChild(card);
    });

    offersContainer.appendChild(grid);
}

/* =====================================
   SELECT OFFER
===================================== */

function selectOffer(offer) {
    if (!offer.offer_id) {
        alert("This offer cannot currently be selected.");
        return;
    }

    try {
        sessionStorage.setItem(
            "bingwahubSelectedOffer",
            JSON.stringify(offer)
        );

        window.location.href = "checkout.html";

    } catch (error) {
        console.error("Offer selection error:", error);
        alert("Unable to select this offer. Please try again.");
    }
}

/* =====================================
   CATEGORY FILTERING
===================================== */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        activeCategory = button.dataset.category;

        displayOffers();
    });
});

/* =====================================
   SEARCH OFFERS
===================================== */

if (searchInput) {
    searchInput.addEventListener("input", displayOffers);
}

/* =====================================
   INITIALIZE CATALOGUE
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const requestedCategory =
        new URLSearchParams(window.location.search)
            .get("category");

    const validCategories = [
        "data",
        "tunukiwa",
        "minutes",
        "sms"
    ];

    if (validCategories.includes(requestedCategory)) {
        activeCategory = requestedCategory;

        filterButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.category === activeCategory
            );
        });
    }

    loadOffers();
});
