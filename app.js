/* =========================================
   WAYPOINT
   app.js
========================================= */


/* =========================================
   MAP SETUP
========================================= */

const map = L.map("map", {
    zoomControl: true
}).setView(
    [35.4676, -97.5164],
    10
);


/* =========================================
   MAP TILES
========================================= */

L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
        attribution:
            '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 20
    }
).addTo(map);


/* =========================================
   DOM ELEMENTS
========================================= */

const sidebar =
    document.querySelector(".sidebar");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const addLocationBtn =
    document.getElementById("addLocationBtn");

const searchInput =
    document.getElementById("searchInput");

const locationCount =
    document.getElementById("locationCount");

const coordinates =
    document.getElementById("coordinates");

const locateBtn =
    document.getElementById("locateBtn");


/* Directory */

const locationList =
    document.getElementById("locationList");

const directoryCount =
    document.getElementById("directoryCount");

const sortFilter =
    document.getElementById("sortFilter");


/* Details Panel */

const detailsPanel =
    document.getElementById("detailsPanel");

const closeDetails =
    document.getElementById("closeDetails");

const closeLocationBtn =
    document.getElementById("closeLocationBtn");

const detailsName =
    document.getElementById("detailsName");

const detailsCategory =
    document.getElementById("detailsCategory");

const detailsDanger =
    document.getElementById("detailsDanger");

const dangerDescription =
    document.getElementById("dangerDescription");

const detailsAccessibility =
    document.getElementById(
        "detailsAccessibility"
    );

const accessDescription =
    document.getElementById(
        "accessDescription"
    );

const detailsDescription =
    document.getElementById(
        "detailsDescription"
    );

const detailsLatitude =
    document.getElementById(
        "detailsLatitude"
    );

const detailsLongitude =
    document.getElementById(
        "detailsLongitude"
    );

const detailsDate =
    document.getElementById("detailsDate");

const editLocationBtn =
    document.getElementById(
        "editLocationBtn"
    );

const deleteLocationBtn =
    document.getElementById(
        "deleteLocationBtn"
    );


/* Modal */

const locationModal =
    document.getElementById("locationModal");

const locationForm =
    document.getElementById("locationForm");

const modalTitle =
    document.getElementById("modalTitle");

const closeModal =
    document.getElementById("closeModal");

const cancelLocation =
    document.getElementById("cancelLocation");

const locationName =
    document.getElementById("locationName");

const locationDescription =
    document.getElementById(
        "locationDescription"
    );

const locationCategory =
    document.getElementById(
        "locationCategory"
    );

const locationDanger =
    document.getElementById(
        "locationDanger"
    );

const locationAccessibility =
    document.getElementById(
        "locationAccessibility"
    );

const modalLatitude =
    document.getElementById(
        "modalLatitude"
    );

const modalLongitude =
    document.getElementById(
        "modalLongitude"
    );


/* =========================================
   APPLICATION STATE
========================================= */

const state = {

    locations: [],

    markers: [],

    selectedLocationId: null,

    editingLocationId: null,

    addingLocation: false,

    pendingCoordinates: null,

    sidebarCollapsed: false,

    filters: {

        danger: [],

        accessibility: [],

        category: "all",

        search: "",

        sort: "newest"

    }

};


/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY =
    "waypointLocations";


function loadLocations() {

    try {

        const stored =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!stored) {

            state.locations = [];

            return;

        }

        const parsed =
            JSON.parse(stored);

        if (!Array.isArray(parsed)) {

            state.locations = [];

            return;

        }

        state.locations =
            parsed;

    } catch (error) {

        console.error(
            "Could not load locations:",
            error
        );

        state.locations = [];

    }

}


function saveLocations() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                state.locations
            )
        );

    } catch (error) {

        console.error(
            "Could not save locations:",
            error
        );

    }

}


/* =========================================
   ID GENERATION
========================================= */

function generateId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================
   DATE FORMATTING
========================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "Unknown";

    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";

    }

    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/* =========================================
   DANGER DESCRIPTIONS
========================================= */

function getDangerDescription(level) {

    const descriptions = {

        1: "Very Low",

        2: "Low",

        3: "Moderate",

        4: "High",

        5: "Extreme"

    };

    return (
        descriptions[level] ||
        "Unknown"
    );

}


/* =========================================
   ACCESSIBILITY DESCRIPTIONS
========================================= */

function getAccessDescription(level) {

    const descriptions = {

        1: "Easy",

        2: "Limited",

        3: "Difficult",

        4: "Restricted",

        5: "No Public Access"

    };

    return (
        descriptions[level] ||
        "Unknown"
    );

}


/* =========================================
   CATEGORY FORMATTING
========================================= */

function formatCategory(category) {

    if (!category) {

        return "Other";

    }

    return (
        category
            .charAt(0)
            .toUpperCase() +
        category.slice(1)
    );

}


/* =========================================
   SIDEBAR
========================================= */

sidebarToggle.addEventListener(
    "click",
    () => {

        /*
         * Mobile behavior is handled by
         * the Phase 6 section near the
         * bottom of this file.
         */

        if (
            window.matchMedia(
                "(max-width: 700px)"
            ).matches
        ) {

            return;

        }

        state.sidebarCollapsed =
            !state.sidebarCollapsed;

        if (
            state.sidebarCollapsed
        ) {

            sidebar.style.width = "0";

            sidebar.style.minWidth = "0";

            sidebar.style.overflow =
                "hidden";

        } else {

            sidebar.style.width = "";

            sidebar.style.minWidth = "";

            sidebar.style.overflow = "";

        }

        setTimeout(
            () => {

                map.invalidateSize();

            },
            260
        );

    }
);


/* =========================================
   MAP COORDINATES
========================================= */

map.on(
    "mousemove",
    event => {

        coordinates.textContent =
            `Lat: ${event.latlng.lat.toFixed(5)} | ` +
            `Lng: ${event.latlng.lng.toFixed(5)}`;

    }
);


map.on(
    "mouseout",
    () => {

        coordinates.textContent =
            "Lat: -- | Lng: --";

    }
);


/* =========================================
   USER LOCATION
========================================= */

locateBtn.addEventListener(
    "click",
    () => {

        if (!navigator.geolocation) {

            alert(
                "Location services are not supported by this browser."
            );

            return;

        }

        locateBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(

            position => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                map.flyTo(
                    [
                        latitude,
                        longitude
                    ],
                    14,
                    {
                        duration: 0.8
                    }
                );

                L.circleMarker(
                    [
                        latitude,
                        longitude
                    ],
                    {
                        radius: 7,

                        color:
                            "#ffffff",

                        weight: 2,

                        fillColor:
                            "#6fa37c",

                        fillOpacity:
                            1
                    }
                )
                    .addTo(map)
                    .bindTooltip(
                        "Your location"
                    );

                locateBtn.disabled =
                    false;

            },

            error => {

                console.error(
                    error
                );

                alert(
                    "Waypoint could not access your location."
                );

                locateBtn.disabled =
                    false;

            },

            {
                enableHighAccuracy:
                    true,

                timeout:
                    10000,

                maximumAge:
                    30000
            }

        );

    }
);


/* =========================================
   ADD LOCATION MODE
========================================= */

addLocationBtn.addEventListener(
    "click",
    () => {

        closeDetailsPanel();

        closeMobileSidebarSafe();

        state.addingLocation = true;

        state.editingLocationId =
            null;

        state.pendingCoordinates =
            null;

        map.getContainer()
            .classList.add(
                "adding-location"
            );

        addLocationBtn.textContent =
            "Click Map";

    }
);


/* =========================================
   MAP CLICK
========================================= */

map.on(
    "click",
    event => {

        if (
            !state.addingLocation
        ) {

            return;

        }

        state.pendingCoordinates = {

            latitude:
                event.latlng.lat,

            longitude:
                event.latlng.lng

        };

        openAddModal();

    }
);


/* =========================================
   OPEN ADD MODAL
========================================= */

function openAddModal() {

    if (
        !state.pendingCoordinates
    ) {

        return;

    }

    state.editingLocationId =
        null;

    modalTitle.textContent =
        "Add Location";

    locationName.value = "";

    locationDescription.value =
        "";

    locationCategory.value =
        "outdoor";

    locationDanger.value = "1";

    locationAccessibility.value =
        "1";

    modalLatitude.textContent =
        state.pendingCoordinates
            .latitude
            .toFixed(6);

    modalLongitude.textContent =
        state.pendingCoordinates
            .longitude
            .toFixed(6);

    locationModal.classList.add(
        "visible"
    );

    setTimeout(
        () => {

            locationName.focus();

        },
        100
    );

}


/* =========================================
   OPEN EDIT MODAL
========================================= */

function openEditModal(
    locationId
) {

    const location =
        state.locations.find(
            item =>
                item.id ===
                locationId
        );

    if (!location) {

        return;

    }

    state.editingLocationId =
        locationId;

    state.pendingCoordinates = {

        latitude:
            Number(
                location.latitude
            ),

        longitude:
            Number(
                location.longitude
            )

    };

    modalTitle.textContent =
        "Edit Location";

    locationName.value =
        location.name || "";

    locationDescription.value =
        location.description || "";

    locationCategory.value =
        location.category ||
        "other";

    locationDanger.value =
        String(
            location.danger || 1
        );

    locationAccessibility.value =
        String(
            location.accessibility ||
            1
        );

    modalLatitude.textContent =
        Number(
            location.latitude
        ).toFixed(6);

    modalLongitude.textContent =
        Number(
            location.longitude
        ).toFixed(6);

    locationModal.classList.add(
        "visible"
    );

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeLocationModal() {

    locationModal.classList.remove(
        "visible"
    );

    state.addingLocation =
        false;

    state.pendingCoordinates =
        null;

    map.getContainer()
        .classList.remove(
            "adding-location"
        );

    addLocationBtn.innerHTML =
        "<span>＋</span>Add Location";

}


closeModal.addEventListener(
    "click",
    closeLocationModal
);


cancelLocation.addEventListener(
    "click",
    closeLocationModal
);


locationModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            locationModal
        ) {

            closeLocationModal();

        }

    }
);


/* =========================================
   SAVE LOCATION
========================================= */

locationForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const name =
            locationName
                .value
                .trim();

        if (!name) {

            locationName.focus();

            return;

        }

        if (
            !state.pendingCoordinates
        ) {

            return;

        }

        const locationData = {

            name,

            description:
                locationDescription
                    .value
                    .trim(),

            category:
                locationCategory
                    .value,

            danger:
                Number(
                    locationDanger
                        .value
                ),

            accessibility:
                Number(
                    locationAccessibility
                        .value
                ),

            latitude:
                Number(
                    state
                        .pendingCoordinates
                        .latitude
                ),

            longitude:
                Number(
                    state
                        .pendingCoordinates
                        .longitude
                )

        };


        if (
            state.editingLocationId
        ) {

            const index =
                state.locations
                    .findIndex(
                        item =>
                            item.id ===
                            state
                                .editingLocationId
                    );

            if (index !== -1) {

                state.locations[index] = {

                    ...state.locations[
                        index
                    ],

                    ...locationData,

                    updatedAt:
                        new Date()
                            .toISOString()

                };

            }

        } else {

            const newLocation = {

                id:
                    generateId(),

                ...locationData,

                createdAt:
                    new Date()
                        .toISOString(),

                updatedAt:
                    null

            };

            state.locations.push(
                newLocation
            );

            state.selectedLocationId =
                newLocation.id;

        }


        const locationToFocus =
            state.editingLocationId ||
            state.selectedLocationId;


        saveLocations();

        closeLocationModal();

        renderLocations();


        if (locationToFocus) {

            setTimeout(
                () => {

                    focusLocation(
                        locationToFocus
                    );

                },
                50
            );

        }

    }
);


/* =========================================
   FILTER HELPERS
========================================= */

function passesFilters(
    location
) {

    const danger =
        Number(
            location.danger
        );

    const accessibility =
        Number(
            location.accessibility
        );


    if (
        state.filters.danger
            .length > 0 &&
        !state.filters.danger
            .includes(danger)
    ) {

        return false;

    }


    if (
        state.filters
            .accessibility
            .length > 0 &&
        !state.filters
            .accessibility
            .includes(
                accessibility
            )
    ) {

        return false;

    }


    if (
        state.filters.category !==
        "all" &&
        location.category !==
        state.filters.category
    ) {

        return false;

    }


    const search =
        state.filters.search
            .trim()
            .toLowerCase();


    if (search) {

        const searchableText = [

            location.name,

            location.description,

            location.category,

            location.latitude,

            location.longitude

        ]
            .join(" ")
            .toLowerCase();


        if (
            !searchableText.includes(
                search
            )
        ) {

            return false;

        }

    }


    return true;

}


/* =========================================
   GET FILTERED LOCATIONS
========================================= */

function getFilteredLocations() {

    return state.locations.filter(
        passesFilters
    );

}


/* =========================================
   SORT LOCATIONS
========================================= */

function sortLocations(
    locations
) {

    const sorted =
        [...locations];


    switch (
        state.filters.sort
    ) {

        case "oldest":

            sorted.sort(
                (a, b) =>
                    new Date(
                        a.createdAt || 0
                    ) -
                    new Date(
                        b.createdAt || 0
                    )
            );

            break;


        case "name-asc":

            sorted.sort(
                (a, b) =>
                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    )
            );

            break;


        case "name-desc":

            sorted.sort(
                (a, b) =>
                    String(
                        b.name || ""
                    ).localeCompare(
                        String(
                            a.name || ""
                        )
                    )
            );

            break;


        case "danger-desc":

            sorted.sort(
                (a, b) =>
                    Number(
                        b.danger
                    ) -
                    Number(
                        a.danger
                    )
            );

            break;


        case "danger-asc":

            sorted.sort(
                (a, b) =>
                    Number(
                        a.danger
                    ) -
                    Number(
                        b.danger
                    )
            );

            break;


        case "access-desc":

            sorted.sort(
                (a, b) =>
                    Number(
                        b.accessibility
                    ) -
                    Number(
                        a.accessibility
                    )
            );

            break;


        case "access-asc":

            sorted.sort(
                (a, b) =>
                    Number(
                        a.accessibility
                    ) -
                    Number(
                        b.accessibility
                    )
            );

            break;


        case "newest":
        default:

            sorted.sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            );

            break;

    }


    return sorted;

}

/* =========================================
   MARKER HELPERS
========================================= */

function getMarkerClass(level) {

    const numericLevel =
        Number(level);

    if (
        numericLevel >= 1 &&
        numericLevel <= 5
    ) {

        return `level-${numericLevel}-marker`;

    }

    return "level-1-marker";

}


/* =========================================
   CREATE MARKER
========================================= */

function createLocationMarker(
    location
) {

    const latitude =
        Number(
            location.latitude
        );

    const longitude =
        Number(
            location.longitude
        );


    if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
    ) {

        return null;

    }


    const marker =
        L.marker(
            [
                latitude,
                longitude
            ],
            {
                icon:
                    L.divIcon({

                        className:
                            "",

                        html:
                            `<div class="waypoint-marker ${getMarkerClass(
                                location.danger
                            )}" data-location-id="${escapeHTML(
                                location.id
                            )}"></div>`,

                        iconSize:
                            [26, 26],

                        iconAnchor:
                            [13, 13]

                    }),

                title:
                    location.name ||
                    "Waypoint"

            }
        );


    marker.locationId =
        location.id;


    marker.on(
        "click",
        () => {

            focusLocation(
                location.id
            );

        }
    );


    marker.bindTooltip(
        escapeHTML(
            location.name ||
            "Waypoint"
        ),
        {
            direction:
                "top",

            offset:
                [0, -12],

            opacity:
                0.95
        }
    );


    return marker;

}


/* =========================================
   GET MARKER BY LOCATION ID
========================================= */

function getMarkerByLocationId(
    locationId
) {

    return state.markers.find(
        marker =>
            marker.locationId ===
            locationId
    );

}


/* =========================================
   HIGHLIGHT MARKER
========================================= */

function highlightMarker(
    locationId
) {

    state.markers.forEach(
        marker => {

            const element =
                marker.getElement();

            if (!element) {

                return;

            }

            const markerElement =
                element.querySelector(
                    ".waypoint-marker"
                );

            if (!markerElement) {

                return;

            }

            markerElement.classList.toggle(
                "selected-marker",
                marker.locationId ===
                    locationId
            );

        }
    );

}


/* =========================================
   HIGHLIGHT DIRECTORY CARD
========================================= */

function highlightDirectoryCard(
    locationId
) {

    if (!locationList) {

        return;

    }


    const cards =
        locationList.querySelectorAll(
            ".location-card"
        );


    cards.forEach(
        card => {

            card.classList.toggle(
                "selected-location-card",
                card.dataset.locationId ===
                    String(locationId)
            );

        }
    );


    const selectedCard =
        locationList.querySelector(
            `.location-card[data-location-id="${CSS.escape(
                String(locationId)
            )}"]`
        );


    if (
        selectedCard &&
        typeof selectedCard.scrollIntoView ===
            "function"
    ) {

        selectedCard.scrollIntoView(
            {
                behavior:
                    "smooth",

                block:
                    "nearest"
            }
        );

    }

}


/* =========================================
   CLEAR HIGHLIGHTS
========================================= */

function clearLocationHighlights() {

    state.markers.forEach(
        marker => {

            const element =
                marker.getElement();

            if (!element) {

                return;

            }

            const markerElement =
                element.querySelector(
                    ".waypoint-marker"
                );

            if (
                markerElement
            ) {

                markerElement.classList.remove(
                    "selected-marker"
                );

            }

        }
    );


    if (locationList) {

        locationList
            .querySelectorAll(
                ".selected-location-card"
            )
            .forEach(
                card => {

                    card.classList.remove(
                        "selected-location-card"
                    );

                }
            );

    }

}


/* =========================================
   FOCUS LOCATION
========================================= */

function focusLocation(
    locationId
) {

    const location =
        state.locations.find(
            item =>
                item.id ===
                locationId
        );


    if (!location) {

        return;

    }


    /*
     * If the location is currently
     * hidden by filters, clear them
     * so the user can see it.
     */

    if (
        !passesFilters(location)
    ) {

        clearFilters();

    }


    state.selectedLocationId =
        locationId;


    const latitude =
        Number(
            location.latitude
        );

    const longitude =
        Number(
            location.longitude
        );


    if (
        !Number.isNaN(latitude) &&
        !Number.isNaN(longitude)
    ) {

        map.flyTo(
            [
                latitude,
                longitude
            ],
            Math.max(
                map.getZoom(),
                13
            ),
            {
                duration:
                    0.8
            }
        );

    }


    highlightDirectoryCard(
        locationId
    );


    highlightMarker(
        locationId
    );


    openDetails(
        locationId
    );

}


/* =========================================
   RENDER LOCATIONS
========================================= */

function renderLocations() {

    /*
     * Remove existing markers.
     */

    state.markers.forEach(
        marker => {

            if (
                map.hasLayer(marker)
            ) {

                map.removeLayer(
                    marker
                );

            }

        }
    );


    state.markers = [];


    /*
     * Build filtered marker set.
     */

    const filteredLocations =
        getFilteredLocations();


    filteredLocations.forEach(
        location => {

            const marker =
                createLocationMarker(
                    location
                );


            if (!marker) {

                return;

            }


            marker.addTo(map);


            state.markers.push(
                marker
            );

        }
    );


    /*
     * Update counts.
     */

    const total =
        state.locations.length;

    const visible =
        filteredLocations.length;


    if (locationCount) {

        if (
            total === visible
        ) {

            locationCount.textContent =
                `${total} ${
                    total === 1
                        ? "location"
                        : "locations"
                } mapped`;

        } else {

            locationCount.textContent =
                `${visible} of ${total} locations visible`;

        }

    }


    /*
     * Show / hide map no-results
     * message.
     */

    updateNoResultsState();


    /*
     * Render directory.
     */

    renderLocationDirectory();


    /*
     * Restore selected marker
     * and card.
     */

    if (
        state.selectedLocationId
    ) {

        highlightDirectoryCard(
            state.selectedLocationId
        );

        highlightMarker(
            state.selectedLocationId
        );

    }

}


/* =========================================
   RENDER DIRECTORY
========================================= */

function renderLocationDirectory() {

    if (!locationList) {

        return;

    }


    const filteredLocations =
        getFilteredLocations();


    const sortedLocations =
        sortLocations(
            filteredLocations
        );


    /*
     * Directory count.
     */

    if (directoryCount) {

        directoryCount.textContent =
            sortedLocations.length;

    }


    /*
     * Empty state.
     */

    if (
        sortedLocations.length === 0
    ) {

        locationList.innerHTML = `

            <div class="location-list-empty">

                No locations match
                your current filters.

            </div>

        `;

        return;

    }


    /*
     * Build cards.
     */

    locationList.innerHTML =
        sortedLocations
            .map(
                location => {

                    const danger =
                        Number(
                            location.danger
                        );

                    const access =
                        Number(
                            location.accessibility
                        );


                    return `

                        <div
                            class="location-card ${
                                state.selectedLocationId ===
                                location.id
                                    ? "selected-location-card"
                                    : ""
                            }"
                            data-location-id="${escapeHTML(
                                location.id
                            )}"
                            role="listitem"
                            tabindex="0"
                            aria-label="${escapeHTML(
                                location.name ||
                                "Unnamed location"
                            )}"
                        >

                            <div class="location-card-header">

                                <div
                                    class="location-card-name"
                                    title="${escapeHTML(
                                        location.name ||
                                        ""
                                    )}"
                                >
                                    ${escapeHTML(
                                        location.name ||
                                        "Unnamed location"
                                    )}
                                </div>

                                <div class="location-card-category">
                                    ${escapeHTML(
                                        formatCategory(
                                            location.category
                                        )
                                    )}
                                </div>

                            </div>


                            <div class="location-card-ratings">

                                <div
                                    class="location-card-rating danger-${danger}"
                                >

                                    <span class="location-card-rating-label">
                                        Danger
                                    </span>

                                    <span class="location-card-rating-value">
                                        ${danger}/5
                                    </span>

                                </div>


                                <div class="location-card-rating">

                                    <span class="location-card-rating-label">
                                        Access
                                    </span>

                                    <span class="location-card-rating-value">
                                        ${access}/5
                                    </span>

                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    /*
     * Attach card interactions.
     */

    locationList
        .querySelectorAll(
            ".location-card"
        )
        .forEach(
            card => {

                const locationId =
                    card.dataset.locationId;


                card.addEventListener(
                    "click",
                    () => {

                        focusLocation(
                            locationId
                        );

                    }
                );


                card.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key ===
                                "Enter" ||
                            event.key ===
                                " "
                        ) {

                            event.preventDefault();

                            focusLocation(
                                locationId
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================
   NO RESULTS STATE
========================================= */

function updateNoResultsState() {

    const existing =
        document.querySelector(
            ".no-results"
        );


    const filtered =
        getFilteredLocations();


    if (
        filtered.length === 0 &&
        state.locations.length > 0
    ) {

        if (!existing) {

            const message =
                document.createElement(
                    "div"
                );

            message.className =
                "no-results";

            message.textContent =
                "No locations match your filters.";

            document
                .querySelector(
                    ".map-container"
                )
                .appendChild(
                    message
                );

        }

    } else {

        if (existing) {

            existing.remove();

        }

    }

}


/* =========================================
   DETAILS PANEL
========================================= */

function openDetails(
    locationId
) {

    const location =
        state.locations.find(
            item =>
                item.id ===
                locationId
        );


    if (!location) {

        return;

    }


    state.selectedLocationId =
        locationId;


    detailsName.textContent =
        location.name ||
        "Unnamed Location";


    detailsCategory.textContent =
        formatCategory(
            location.category
        );


    const danger =
        Number(
            location.danger
        ) || 1;


    const accessibility =
        Number(
            location.accessibility
        ) || 1;


    detailsDanger.textContent =
        `${danger}/5`;


    dangerDescription.textContent =
        getDangerDescription(
            danger
        );


    detailsAccessibility.textContent =
        `${accessibility}/5`;


    accessDescription.textContent =
        getAccessDescription(
            accessibility
        );


    detailsDescription.textContent =
        location.description ||
        "No description provided.";


    detailsLatitude.textContent =
        Number(
            location.latitude
        ).toFixed(6);


    detailsLongitude.textContent =
        Number(
            location.longitude
        ).toFixed(6);


    detailsDate.textContent =
        formatDate(
            location.createdAt
        );


    detailsPanel.classList.add(
        "visible"
    );


    highlightDirectoryCard(
        locationId
    );


    highlightMarker(
        locationId
    );

}


/* =========================================
   CLOSE DETAILS PANEL
========================================= */

function closeDetailsPanel() {

    detailsPanel.classList.remove(
        "visible"
    );

    state.selectedLocationId =
        null;

    clearLocationHighlights();

}


/* =========================================
   DETAILS CLOSE BUTTONS
========================================= */

closeDetails.addEventListener(
    "click",
    closeDetailsPanel
);


closeLocationBtn.addEventListener(
    "click",
    closeDetailsPanel
);


/* =========================================
   EDIT LOCATION
========================================= */

editLocationBtn.addEventListener(
    "click",
    () => {

        if (
            !state.selectedLocationId
        ) {

            return;

        }

        const locationId =
            state.selectedLocationId;


        closeDetailsPanel();

        openEditModal(
            locationId
        );

    }
);


/* =========================================
   DELETE LOCATION
========================================= */

deleteLocationBtn.addEventListener(
    "click",
    () => {

        if (
            !state.selectedLocationId
        ) {

            return;

        }


        const location =
            state.locations.find(
                item =>
                    item.id ===
                    state.selectedLocationId
            );


        if (!location) {

            return;

        }


        const confirmed =
            window.confirm(
                `Delete "${location.name}"?`
            );


        if (!confirmed) {

            return;

        }


        const locationId =
            location.id;


        const marker =
            getMarkerByLocationId(
                locationId
            );


        if (marker) {

            map.removeLayer(
                marker
            );

        }


        state.locations =
            state.locations.filter(
                item =>
                    item.id !==
                    locationId
            );


        state.markers =
            state.markers.filter(
                item =>
                    item.locationId !==
                    locationId
            );


        state.selectedLocationId =
            null;


        saveLocations();

        renderLocations();

        closeDetailsPanel();

    }
);


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    () => {

        state.filters.search =
            searchInput.value;

        renderLocations();

    }
);


/* =========================================
   SORT
========================================= */

sortFilter.addEventListener(
    "change",
    () => {

        state.filters.sort =
            sortFilter.value;

        renderLocationDirectory();

    }
);


/* =========================================
   FILTER RESET
========================================= */

function clearFilters() {

    state.filters.danger = [];

    state.filters.accessibility =
        [];

    state.filters.category =
        "all";

    state.filters.search =
        "";

    state.filters.sort =
        "newest";


    if (searchInput) {

        searchInput.value = "";

    }


    if (sortFilter) {

        sortFilter.value =
            "newest";

    }


    document
        .querySelectorAll(
            ".filter-option.active"
        )
        .forEach(
            option => {

                option.classList.remove(
                    "active"
                );

            }
        );


    renderLocations();

}


/* =========================================
   FILTER BUTTONS
========================================= */

document
    .querySelectorAll(
        ".filter-option"
    )
    .forEach(
        option => {

            option.addEventListener(
                "click",
                () => {

                    const type =
                        option.dataset.filter;

                    const value =
                        option.dataset.value;


                    if (
                        type ===
                        "danger"
                    ) {

                        const numericValue =
                            Number(
                                value
                            );


                        const index =
                            state.filters
                                .danger
                                .indexOf(
                                    numericValue
                                );


                        if (
                            index === -1
                        ) {

                            state.filters
                                .danger
                                .push(
                                    numericValue
                                );

                            option.classList.add(
                                "active"
                            );

                        } else {

                            state.filters
                                .danger
                                .splice(
                                    index,
                                    1
                                );

                            option.classList.remove(
                                "active"
                            );

                        }

                    }


                    if (
                        type ===
                        "accessibility"
                    ) {

                        const numericValue =
                            Number(
                                value
                            );


                        const index =
                            state.filters
                                .accessibility
                                .indexOf(
                                    numericValue
                                );


                        if (
                            index === -1
                        ) {

                            state.filters
                                .accessibility
                                .push(
                                    numericValue
                                );

                            option.classList.add(
                                "active"
                            );

                        } else {

                            state.filters
                                .accessibility
                                .splice(
                                    index,
                                    1
                                );

                            option.classList.remove(
                                "active"
                            );

                        }

                    }


                    if (
                        type ===
                        "category"
                    ) {

                        document
                            .querySelectorAll(
                                '.filter-option[data-filter="category"]'
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        state.filters.category =
                            value;


                        option.classList.add(
                            "active"
                        );

                    }


                    renderLocations();

                }
            );

        }
    );


/* =========================================
   RESET FILTERS BUTTON
========================================= */

const resetFiltersBtn =
    document.querySelector(
        ".section-title button"
    );


if (resetFiltersBtn) {

    resetFiltersBtn.addEventListener(
        "click",
        clearFilters
    );

}


/* =========================================
   MOBILE NAVIGATION
========================================= */

const mobileMenuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );


const mobileSidebarBackdrop =
    document.getElementById(
        "mobileSidebarBackdrop"
    );


function isMobileLayout() {

    return window.matchMedia(
        "(max-width: 700px)"
    ).matches;

}


function openMobileSidebar() {

    if (!isMobileLayout()) {

        return;

    }


    sidebar.classList.add(
        "mobile-open"
    );


    if (
        mobileSidebarBackdrop
    ) {

        mobileSidebarBackdrop.classList.add(
            "visible"
        );

        mobileSidebarBackdrop
            .setAttribute(
                "aria-hidden",
                "false"
            );

    }


    if (
        mobileMenuBtn
    ) {

        mobileMenuBtn.classList.add(
            "active"
        );

        mobileMenuBtn.setAttribute(
            "aria-expanded",
            "true"
        );

        mobileMenuBtn.setAttribute(
            "aria-label",
            "Close Explore"
        );

        mobileMenuBtn.setAttribute(
            "title",
            "Close Explore"
        );

    }

}


function closeMobileSidebar() {

    sidebar.classList.remove(
        "mobile-open"
    );


    if (
        mobileSidebarBackdrop
    ) {

        mobileSidebarBackdrop.classList.remove(
            "visible"
        );

        mobileSidebarBackdrop
            .setAttribute(
                "aria-hidden",
                "true"
            );

    }


    if (
        mobileMenuBtn
    ) {

        mobileMenuBtn.classList.remove(
            "active"
        );

        mobileMenuBtn.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenuBtn.setAttribute(
            "aria-label",
            "Open Explore"
        );

        mobileMenuBtn.setAttribute(
            "title",
            "Open Explore"
        );

    }

}


function closeMobileSidebarSafe() {

    if (
        isMobileLayout()
    ) {

        closeMobileSidebar();

    }

}


function toggleMobileSidebar() {

    if (!isMobileLayout()) {

        return;

    }


    if (
        sidebar.classList.contains(
            "mobile-open"
        )
    ) {

        closeMobileSidebar();

    } else {

        openMobileSidebar();

    }

}


if (mobileMenuBtn) {

    mobileMenuBtn.addEventListener(
        "click",
        toggleMobileSidebar
    );

}


if (mobileSidebarBackdrop) {

    mobileSidebarBackdrop.addEventListener(
        "click",
        closeMobileSidebar
    );

}


/* =========================================
   MOBILE SIDEBAR CLOSE
========================================= */

sidebarToggle.addEventListener(
    "click",
    () => {

        if (
            isMobileLayout()
        ) {

            closeMobileSidebar();

        }

    }
);


/* =========================================
   MOBILE CARD / DETAILS HANDLING
========================================= */

const originalFocusLocation =
    focusLocation;


const originalOpenDetails =
    openDetails;


/*
 * Keep mobile drawer closed when
 * a location is selected.
 */

window.focusLocation =
    function(locationId) {

        closeMobileSidebar();

        originalFocusLocation(
            locationId
        );

    };


window.openDetails =
    function(locationId) {

        closeMobileSidebar();

        originalOpenDetails(
            locationId
        );

    };


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            locationModal.classList.contains(
                "visible"
            )
        ) {

            closeLocationModal();

            return;

        }


        if (
            detailsPanel.classList.contains(
                "visible"
            )
        ) {

            closeDetailsPanel();

            return;

        }


        if (
            isMobileLayout() &&
            sidebar.classList.contains(
                "mobile-open"
            )
        ) {

            closeMobileSidebar();

        }

    }
);


/* =========================================
   WINDOW RESIZE
========================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            !isMobileLayout()
        ) {

            closeMobileSidebar();

        }


        setTimeout(
            () => {

                map.invalidateSize();

            },
            150
        );

    }
);


/* =========================================
   INITIALIZATION
========================================= */

loadLocations();

renderLocations();

setTimeout(
    () => {

        map.invalidateSize();

    },
    100
);


/* =========================================
   MOBILE SAFE AREA
========================================= */

window.addEventListener(
    "orientationchange",
    () => {

        setTimeout(
            () => {

                map.invalidateSize();

            },
            250
        );

    }
);
