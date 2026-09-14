/* =========================================
   WAYPOINT
   COMPLETE APP.JS
   Phase 5 + Phase 6 + Real Maps
========================================= */


/* =========================================
   MAP SETUP
========================================= */

const map = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 4,
    minZoom: 3,
    maxZoom: 19,
    zoomControl: true
});


/* =========================================
   BASEMAPS
========================================= */

/* Real street map */
const streetsLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }
);


/* Satellite imagery */
const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        maxZoom: 19,
        attribution:
            "Tiles &copy; Esri"
    }
);


/* Streets is the default */
streetsLayer.addTo(map);


/* Basemap selector */
L.control.layers(
    {
        "Streets": streetsLayer,
        "Satellite": satelliteLayer
    },
    null,
    {
        collapsed: true,
        position: "topright"
    }
).addTo(map);


/* =========================================
   APPLICATION STATE
========================================= */

const state = {

    locations: [],

    markers: [],

    selectedCoordinates: null,

    selectedLocationId: null,

    addingLocation: false,

    editingLocation: false,

    editingLocationId: null,

    filters: {

        danger: [],

        accessibility: [],

        category: "all",

        search: "",

        sort: "newest"

    }

};


/* =========================================
   DOM ELEMENTS
========================================= */

const sidebar =
    document.querySelector(".sidebar");

const sidebarToggle =
    document.getElementById(
        "sidebarToggle"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const resetFilters =
    document.getElementById(
        "resetFilters"
    );

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

const sortFilter =
    document.getElementById(
        "sortFilter"
    );

const locationCount =
    document.getElementById(
        "locationCount"
    );

const coordinates =
    document.getElementById(
        "coordinates"
    );

const locateBtn =
    document.getElementById(
        "locateBtn"
    );

const addLocationBtn =
    document.getElementById(
        "addLocationBtn"
    );


/* =========================================
   DIRECTORY
========================================= */

const locationList =
    document.getElementById(
        "locationList"
    );

const directoryCount =
    document.getElementById(
        "directoryCount"
    );


/* =========================================
   MODAL
========================================= */

const modal =
    document.getElementById(
        "locationModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const cancelLocation =
    document.getElementById(
        "cancelLocation"
    );

const locationForm =
    document.getElementById(
        "locationForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const locationName =
    document.getElementById(
        "locationName"
    );

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
   DETAILS PANEL
========================================= */

const detailsPanel =
    document.getElementById(
        "detailsPanel"
    );

const closeDetails =
    document.getElementById(
        "closeDetails"
    );

const detailsName =
    document.getElementById(
        "detailsName"
    );

const detailsCategory =
    document.getElementById(
        "detailsCategory"
    );

const detailsDanger =
    document.getElementById(
        "detailsDanger"
    );

const dangerDescription =
    document.getElementById(
        "dangerDescription"
    );

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
    document.getElementById(
        "detailsDate"
    );

const editLocationBtn =
    document.getElementById(
        "editLocationBtn"
    );

const deleteLocationBtn =
    document.getElementById(
        "deleteLocationBtn"
    );

const closeLocationBtn =
    document.getElementById(
        "closeLocationBtn"
    );


/* =========================================
   MOBILE
========================================= */

const mobileMenuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );

const mobileSidebarBackdrop =
    document.getElementById(
        "mobileSidebarBackdrop"
    );


/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY =
    "waypointLocations";


/* =========================================
   UTILITY FUNCTIONS
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function getCategoryLabel(category) {

    const labels = {

        outdoor:
            "Outdoor",

        indoor:
            "Indoor",

        recreation:
            "Recreation",

        historical:
            "Historical",

        natural:
            "Natural",

        other:
            "Other"

    };

    return (
        labels[category] ||
        "Other"
    );

}


function getDangerDescription(level) {

    const descriptions = {

        1:
            "Very Low",

        2:
            "Low",

        3:
            "Moderate",

        4:
            "High",

        5:
            "Extreme"

    };

    return (
        descriptions[
            Number(level)
        ] ||
        "Unknown"
    );

}


function getAccessibilityDescription(
    level
) {

    const descriptions = {

        1:
            "Easy access",

        2:
            "Limited access",

        3:
            "Difficult access",

        4:
            "Restricted",

        5:
            "No public access"

    };

    return (
        descriptions[
            Number(level)
        ] ||
        "Unknown"
    );

}


function formatDate(
    dateString
) {

    if (!dateString) {

        return "Unknown";

    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";

    }

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================
   LOCAL STORAGE
========================================= */

function loadLocations() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!saved) {

        state.locations = [];

        return;

    }

    try {

        const parsed =
            JSON.parse(saved);

        state.locations =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.error(
            "Unable to load saved locations.",
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
            "Unable to save locations.",
            error
        );

    }

}


/* =========================================
   FILTER LOGIC
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


    /* Danger */

    if (
        state.filters.danger.length > 0 &&
        !state.filters.danger.includes(
            danger
        )
    ) {

        return false;

    }


    /* Accessibility */

    if (
        state.filters.accessibility.length > 0 &&
        !state.filters.accessibility.includes(
            accessibility
        )
    ) {

        return false;

    }


    /* Category */

    if (
        state.filters.category !==
            "all" &&
        location.category !==
            state.filters.category
    ) {

        return false;

    }


    /* Search */

    if (
        state.filters.search
    ) {

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
                state.filters.search
            )
        ) {

            return false;

        }

    }


    return true;

}


/* =========================================
   SORTING
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
                    Number(b.danger) -
                    Number(a.danger)
            );

            break;


        case "danger-asc":

            sorted.sort(
                (a, b) =>
                    Number(a.danger) -
                    Number(b.danger)
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
   LOCATION COUNT
========================================= */

function updateLocationCount(
    visibleCount
) {

    const total =
        state.locations.length;


    if (!locationCount) {

        return;

    }


    if (total === 0) {

        locationCount.textContent =
            "0 locations mapped";

        return;

    }


    if (
        visibleCount === total
    ) {

        locationCount.textContent =
            total === 1
                ? "1 location mapped"
                : `${total} locations mapped`;

        return;

    }


    locationCount.textContent =
        `${visibleCount} of ${total} locations`;

}


/* =========================================
   MARKER HELPERS
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

            const selected =
                marker.locationId ===
                locationId;


            markerElement.classList.toggle(
                "selected-marker",
                selected
            );


            /*
             * Keep the selected marker
             * above nearby markers.
             */

            marker.setZIndexOffset(
                selected
                    ? 1000
                    : 0
            );

        }
    );

}


function clearMarkerHighlights() {

    state.markers.forEach(
        marker => {

            const element =
                marker.getElement();

            if (element) {

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

            marker.setZIndexOffset(
                0
            );

        }
    );

}


/* =========================================
   DIRECTORY HIGHLIGHT
========================================= */

function highlightDirectoryCard(
    locationId
) {

    if (!locationList) {

        return;

    }


    locationList
        .querySelectorAll(
            ".location-card"
        )
        .forEach(
            card => {

                const selected =
                    card.dataset.locationId ===
                    String(locationId);


                card.classList.toggle(
                    "selected-location-card",
                    selected
                );

            }
        );


    const selectedCard =
        locationList.querySelector(
            `[data-location-id="${CSS.escape(
                String(locationId)
            )}"]`
        );


    if (
        selectedCard
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
   CREATE MARKER
========================================= */

function createMarker(
    location
) {

    const danger =
        Number(
            location.danger
        ) || 1;


    const markerIcon =
        L.divIcon({

            className:
                "",

            html: `
                <div
                    class="waypoint-marker level-${danger}-marker"
                    title="${escapeHTML(
                        location.name
                    )}"
                ></div>
            `,

            iconSize:
                [26, 26],

            iconAnchor:
                [13, 13],

            popupAnchor:
                [0, -13]

        });


    const marker =
        L.marker(
            [
                Number(
                    location.latitude
                ),

                Number(
                    location.longitude
                )
            ],
            {
                icon:
                    markerIcon
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


    marker.addTo(map);

    state.markers.push(
        marker
    );


    return marker;

}


/* =========================================
   DIRECTORY
========================================= */

function renderLocationDirectory() {

    if (!locationList) {

        return;

    }


    const filtered =
        state.locations.filter(
            passesFilters
        );


    const visibleLocations =
        sortLocations(
            filtered
        );


    if (directoryCount) {

        directoryCount.textContent =
            visibleLocations.length;

    }


    locationList.innerHTML =
        "";


    if (
        visibleLocations.length === 0
    ) {

        const emptyState =
            document.createElement(
                "div"
            );

        emptyState.className =
            "location-list-empty";


        emptyState.textContent =
            state.locations.length === 0
                ? "No locations have been added yet."
                : "No locations match your filters.";


        locationList.appendChild(
            emptyState
        );

        return;

    }


    visibleLocations.forEach(
        location => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "location-card";


            if (
                state.selectedLocationId ===
                location.id
            ) {

                card.classList.add(
                    "selected-location-card"
                );

            }


            card.dataset.locationId =
                location.id;


            card.setAttribute(
                "role",
                "listitem"
            );


            card.setAttribute(
                "tabindex",
                "0"
            );


            card.setAttribute(
                "aria-label",
                location.name ||
                    "Unnamed location"
            );


            const danger =
                Number(
                    location.danger
                ) || 1;


            const accessibility =
                Number(
                    location.accessibility
                ) || 1;


            card.innerHTML = `

                <div class="location-card-header">

                    <div
                        class="location-card-name"
                        title="${escapeHTML(
                            location.name
                        )}"
                    >
                        ${escapeHTML(
                            location.name ||
                            "Unnamed Location"
                        )}
                    </div>

                    <div class="location-card-category">
                        ${escapeHTML(
                            getCategoryLabel(
                                location.category
                            )
                        )}
                    </div>

                </div>


                <div class="location-card-ratings">

                    <div
                        class="location-card-rating danger-${danger}"
                    >

                        <span
                            class="location-card-rating-label"
                        >
                            Danger
                        </span>

                        <span
                            class="location-card-rating-value"
                        >
                            ${danger}/5
                        </span>

                    </div>


                    <div
                        class="location-card-rating"
                    >

                        <span
                            class="location-card-rating-label"
                        >
                            Access
                        </span>

                        <span
                            class="location-card-rating-value"
                        >
                            ${accessibility}/5
                        </span>

                    </div>

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    focusLocation(
                        location.id
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
                            location.id
                        );

                    }

                }
            );


            locationList.appendChild(
                card
            );

        }
    );

}


/* =========================================
   NO RESULTS
========================================= */

function updateNoResults(
    visibleCount
) {

    let noResults =
        document.querySelector(
            ".no-results"
        );


    if (
        visibleCount > 0 ||
        state.locations.length === 0
    ) {

        if (noResults) {

            noResults.remove();

        }

        return;

    }


    if (!noResults) {

        noResults =
            document.createElement(
                "div"
            );


        noResults.className =
            "no-results";


        noResults.textContent =
            "No locations match your filters.";


        document
            .querySelector(
                ".map-container"
            )
            .appendChild(
                noResults
            );

    }

}


/* =========================================
   RENDER ALL LOCATIONS
========================================= */

function renderLocations() {

    /*
     * Remove old markers.
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
     * Get visible locations.
     */

    const visibleLocations =
        state.locations.filter(
            passesFilters
        );


    /*
     * Create markers.
     */

    visibleLocations.forEach(
        createMarker
    );


    /*
     * Update interface.
     */

    updateLocationCount(
        visibleLocations.length
    );


    updateNoResults(
        visibleLocations.length
    );


    renderLocationDirectory();


    /*
     * Restore selection.
     */

    if (
        state.selectedLocationId
    ) {

        highlightMarker(
            state.selectedLocationId
        );

        highlightDirectoryCard(
            state.selectedLocationId
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
     * If filters hide this location,
     * remove the filters first.
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


    /*
     * Wait briefly for Leaflet to
     * finish creating the marker DOM.
     */

    setTimeout(
        () => {

            highlightMarker(
                locationId
            );

        },
        100
    );


    openDetails(
        locationId
    );


    closeMobileSidebar();

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
        getCategoryLabel(
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
        getAccessibilityDescription(
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


    setTimeout(
        () => {

            highlightMarker(
                locationId
            );

        },
        50
    );

}


/* =========================================
   CLOSE DETAILS
========================================= */

function closeDetailsPanel() {

    detailsPanel.classList.remove(
        "visible"
    );


    state.selectedLocationId =
        null;


    clearMarkerHighlights();


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


closeDetails.addEventListener(
    "click",
    closeDetailsPanel
);


closeLocationBtn.addEventListener(
    "click",
    closeDetailsPanel
);


/* =========================================
   ADD LOCATION
========================================= */

addLocationBtn.addEventListener(
    "click",
    () => {

        closeDetailsPanel();

        closeMobileSidebar();


        state.addingLocation =
            true;


        state.selectedCoordinates =
            null;


        state.editingLocation =
            false;


        state.editingLocationId =
            null;


        map.getContainer()
            .classList.add(
                "adding-location"
            );


        addLocationBtn.innerHTML =
            "<span>⌖</span>Click Map";

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


        state.selectedCoordinates = {

            latitude:
                event.latlng.lat,

            longitude:
                event.latlng.lng

        };


        state.addingLocation =
            false;


        map.getContainer()
            .classList.remove(
                "adding-location"
            );


        addLocationBtn.innerHTML =
            "<span>＋</span>Add Location";


        state.editingLocation =
            false;


        state.editingLocationId =
            null;


        modalTitle.textContent =
            "Add Location";


        locationForm.reset();


        modalLatitude.textContent =
            event.latlng.lat.toFixed(6);


        modalLongitude.textContent =
            event.latlng.lng.toFixed(6);


        modal.classList.add(
            "visible"
        );


        setTimeout(
            () => {

                locationName.focus();

            },
            100
        );

    }
);


/* =========================================
   CLOSE MODAL
========================================= */

function closeLocationModal() {

    modal.classList.remove(
        "visible"
    );


    locationForm.reset();


    state.selectedCoordinates =
        null;


    state.addingLocation =
        false;


    state.editingLocation =
        false;


    state.editingLocationId =
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


modal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modal
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


        if (
            !state.selectedCoordinates
        ) {

            alert(
                "Please select a location on the map."
            );

            return;

        }


        const name =
            locationName.value.trim();


        if (!name) {

            locationName.focus();

            return;

        }


        /*
         * EDIT
         */

        if (
            state.editingLocation
        ) {

            const location =
                state.locations.find(
                    item =>
                        item.id ===
                        state.editingLocationId
                );


            if (!location) {

                return;

            }


            location.name =
                name;


            location.description =
                locationDescription
                    .value
                    .trim();


            location.category =
                locationCategory.value;


            location.danger =
                Number(
                    locationDanger.value
                );


            location.accessibility =
                Number(
                    locationAccessibility
                        .value
                );


            location.latitude =
                state.selectedCoordinates
                    .latitude;


            location.longitude =
                state.selectedCoordinates
                    .longitude;


            location.updatedAt =
                new Date()
                    .toISOString();


            saveLocations();

            closeLocationModal();

            renderLocations();


            focusLocation(
                location.id
            );


            return;

        }


        /*
         * CREATE
         */

        const newLocation = {

            id:
                crypto.randomUUID(),

            name,

            description:
                locationDescription
                    .value
                    .trim(),

            category:
                locationCategory.value,

            danger:
                Number(
                    locationDanger.value
                ),

            accessibility:
                Number(
                    locationAccessibility
                        .value
                ),

            latitude:
                state.selectedCoordinates
                    .latitude,

            longitude:
                state.selectedCoordinates
                .longitude,

            createdAt:
                new Date()
                    .toISOString(),

            updatedAt:
                null

        };


        state.locations.push(
            newLocation
        );


        saveLocations();

        closeLocationModal();

        renderLocations();


        state.selectedLocationId =
            newLocation.id;


        focusLocation(
            newLocation.id
        );

    }
);


/* =========================================
   EDIT LOCATION
========================================= */

editLocationBtn.addEventListener(
    "click",
    () => {

        const location =
            state.locations.find(
                item =>
                    item.id ===
                    state.selectedLocationId
            );


        if (!location) {

            return;

        }


        state.editingLocation =
            true;


        state.editingLocationId =
            location.id;


        state.selectedCoordinates = {

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


        modal.classList.add(
            "visible"
        );


        setTimeout(
            () => {

                locationName.focus();

            },
            100
        );

    }
);


/* =========================================
   DELETE LOCATION
========================================= */

deleteLocationBtn.addEventListener(
    "click",
    () => {

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
                `Delete "${location.name}"? This cannot be undone.`
            );


        if (!confirmed) {

            return;

        }


        state.locations =
            state.locations.filter(
                item =>
                    item.id !==
                    location.id
            );


        state.selectedLocationId =
            null;


        saveLocations();

        closeDetailsPanel();

        renderLocations();

    }
);


/* =========================================
   DANGER FILTERS
========================================= */

const dangerButtons =
    document.querySelectorAll(
        ".danger-filter"
    );


dangerButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const level =
                    Number(
                        button.dataset.level
                    );


                button.classList.toggle(
                    "active"
                );


                if (
                    button.classList.contains(
                        "active"
                    )
                ) {

                    if (
                        !state.filters.danger.includes(
                            level
                        )
                    ) {

                        state.filters.danger.push(
                            level
                        );

                    }

                } else {

                    state.filters.danger =
                        state.filters.danger.filter(
                            value =>
                                value !==
                                level
                        );

                }


                renderLocations();

            }
        );

    }
);


/* =========================================
   ACCESSIBILITY FILTERS
========================================= */

const accessibilityButtons =
    document.querySelectorAll(
        ".accessibility-filter"
    );


accessibilityButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const level =
                    Number(
                        button.dataset.level
                    );


                button.classList.toggle(
                    "active"
                );


                if (
                    button.classList.contains(
                        "active"
                    )
                ) {

                    if (
                        !state.filters
                            .accessibility
                            .includes(level)
                    ) {

                        state.filters
                            .accessibility
                            .push(level);

                    }

                } else {

                    state.filters.accessibility =
                        state.filters
                            .accessibility
                            .filter(
                                value =>
                                    value !==
                                    level
                            );

                }


                renderLocations();

            }
        );

    }
);


/* =========================================
   CATEGORY FILTER
========================================= */

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        () => {

            state.filters.category =
                categoryFilter.value;


            renderLocations();

        }
    );

}


/* =========================================
   SEARCH
========================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            state.filters.search =
                searchInput.value
                    .trim()
                    .toLowerCase();


            renderLocations();

        }
    );

}


/* =========================================
   SORT
========================================= */

if (sortFilter) {

    sortFilter.addEventListener(
        "change",
        () => {

            state.filters.sort =
                sortFilter.value;


            renderLocationDirectory();

        }
    );

}


/* =========================================
   RESET FILTERS
========================================= */

function clearFilters() {

    state.filters.danger =
        [];

    state.filters.accessibility =
        [];

    state.filters.category =
        "all";

    state.filters.search =
        "";

    state.filters.sort =
        "newest";


    dangerButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    accessibilityButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    if (categoryFilter) {

        categoryFilter.value =
            "all";

    }


    if (searchInput) {

        searchInput.value =
            "";

    }


    if (sortFilter) {

        sortFilter.value =
            "newest";

    }


    renderLocations();

}


if (resetFilters) {

    resetFilters.addEventListener(
        "click",
        clearFilters
    );

}


/* =========================================
   USER LOCATION
========================================= */

locateBtn.addEventListener(
    "click",
    () => {

        map.locate({

            setView:
                true,

            maxZoom:
                14

        });

    }
);


map.on(
    "locationfound",
    event => {

        L.circle(
            event.latlng,
            {
                radius:
                    event.accuracy,

                color:
                    "#ffffff",

                weight:
                    1,

                fillOpacity:
                    0.05
            }
        ).addTo(map);


        L.circleMarker(
            event.latlng,
            {
                radius:
                    6,

                color:
                    "#ffffff",

                weight:
                    2,

                fillColor:
                    "#6fa37c",

                fillOpacity:
                    1
            }
        )
            .addTo(map)
            .bindPopup(
                "Your approximate location"
            );

    }
);


map.on(
    "locationerror",
    () => {

        alert(
            "Unable to determine your location."
        );

    }
);


/* =========================================
   SIDEBAR DESKTOP
========================================= */

sidebarToggle.addEventListener(
    "click",
    () => {

        if (
            isMobileLayout()
        ) {

            closeMobileSidebar();

            return;

        }


        sidebar.classList.toggle(
            "collapsed"
        );


        if (
            sidebar.classList.contains(
                "collapsed"
            )
        ) {

            sidebarToggle.textContent =
                "›";

            sidebarToggle.title =
                "Open sidebar";

        } else {

            sidebarToggle.textContent =
                "‹";

            sidebarToggle.title =
                "Collapse sidebar";

        }


        setTimeout(
            () => {

                map.invalidateSize();

            },
            250
        );

    }
);


/* =========================================
   MOBILE LAYOUT
========================================= */

function isMobileLayout() {

    return window.matchMedia(
        "(max-width: 700px)"
    ).matches;

}


function openMobileSidebar() {

    if (
        !isMobileLayout()
    ) {

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

        mobileSidebarBackdrop.setAttribute(
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

    if (!sidebar) {

        return;

    }


    sidebar.classList.remove(
        "mobile-open"
    );


    if (
        mobileSidebarBackdrop
    ) {

        mobileSidebarBackdrop.classList.remove(
            "visible"
        );

        mobileSidebarBackdrop.setAttribute(
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


function toggleMobileSidebar() {

    if (
        !isMobileLayout()
    ) {

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
   ORIENTATION CHANGE
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
            modal &&
            modal.classList.contains(
                "visible"
            )
        ) {

            closeLocationModal();

            return;

        }


        if (
            detailsPanel &&
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
   MAP COORDINATES
========================================= */

map.on(
    "mousemove",
    event => {

        if (!coordinates) {

            return;

        }


        coordinates.textContent =
            `Lat: ${event.latlng.lat.toFixed(5)} | ` +
            `Lng: ${event.latlng.lng.toFixed(5)}`;

    }
);


map.on(
    "mouseout",
    () => {

        if (!coordinates) {

            return;

        }


        coordinates.textContent =
            "Lat: -- | Lng: --";

    }
);


/* =========================================
   INITIALIZE
========================================= */

loadLocations();

renderLocations();


setTimeout(
    () => {

        map.invalidateSize();

    },
    100
);


console.log(
    "Waypoint initialized."
);

console.log(
    `${state.locations.length} locations loaded.`
);
