// Redirects user from 404
(function () {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect != location.href) {
        history.replaceState(null, null, redirect);
    }
})();

/**
 * Main initialization function that sets up all interactive components
 * for the Single Page Application
 */
function knowledgeRunner() {
    setupSpaNavigation();
    setupSpeakerToggle();
    setupFormValidation();
}

/**
 * Route configuration mapping for the SPA
 * Defines section IDs, page titles, and URL paths for each route
 */
const routes = {
    home: {
        sectionId: "home",
        title: "Empower Ability Labs - Home",
        path: "/"
    },
    services: {
        sectionId: "services",
        title: "Empower Ability Labs - Services",
        path: "/services"
    },
    schedule: {
        sectionId: "schedule",
        title: "Empower Ability Labs - Schedule a Call",
        path: "/schedule"
    }
};

/**
 * Sets up Single Page Application navigation
 * Handles click events on navigation links, browser back/forward buttons,
 * and initial page load routing
 */
function setupSpaNavigation() {
    const navLinks = document.querySelectorAll("[data-route]");

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const routeName = link.getAttribute("data-route");
            event.preventDefault();
            navigateTo(routeName, true);
        });
    });

    window.addEventListener("popstate", (event) => {
        const routeName = event.state?.route || getRouteFromPath() || "home";
        navigateTo(routeName, false);
    });

    const initialRoute = getRouteFromPath() || "home";
    navigateTo(initialRoute, false);
}

/**
 * Extracts the route name from the current URL pathname
 * @returns {string|null} The route name or null if not found
 */
function getRouteFromPath() {
    const path = window.location.pathname;

    for (const [routeName, routeData] of Object.entries(routes)) {
        if (routeData.path === path) {
            return routeName;
        }
    }

    if (path === "/" || path === "/index.html" || path === "/EmpowerAbilityLab.html") {
        return "home";
    }

    return null;
}

/**
 * Navigates to the specified route by showing/hiding sections,
 * updating the page title, URL, and aria-current attributes
 * @param {string} routeName - The name of the route to navigate to
 * @param {boolean} shouldPushState - Whether to add a new history entry
 */
function navigateTo(routeName, shouldPushState) {
    const route = routes[routeName] || routes.home;
    const allSections = document.querySelectorAll("main section");
    const allNavLinks = document.querySelectorAll("[data-route]");

    allSections.forEach((section) => {
        section.hidden = section.id !== route.sectionId;
    });

    document.title = route.title;

    if (shouldPushState) {
        history.pushState({ route: routeName }, "", route.path);
    }

    allNavLinks.forEach((link) => {
        const isActive = link.getAttribute("data-route") === routeName;

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

/**
 * Manages show/hide behavior for the event details textarea
 * based on the speaker event checkbox state
 */
function setupSpeakerToggle() {
    const speakerCheckbox = document.getElementById("speaker-event");
    const eventDetailsGroup = document.getElementById("event-details-group");
    const eventDetails = document.getElementById("event-details");

    if (!speakerCheckbox || !eventDetailsGroup || !eventDetails) {
        return;
    }

    function updateEventDetailsVisibility() {
        const isChecked = speakerCheckbox.checked;

        eventDetailsGroup.hidden = !isChecked;
        speakerCheckbox.setAttribute("aria-expanded", String(isChecked));

        if (isChecked) {
            eventDetails.focus();
        } else {
            eventDetails.value = "";
        }
    }

    speakerCheckbox.addEventListener("change", updateEventDetailsVisibility);
    updateEventDetailsVisibility();
}

/**
 * Validates phone number format (613-123-1234)
 * @param {string} value - The phone number to validate
 * @returns {boolean} True if valid or empty, false otherwise
 */
function isValidPhone(value) {
    if (!value.trim()) {
        return true;
    }

    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    return phonePattern.test(value.trim());
}

/**
 * Clears all error states and messages from the form
 * @param {HTMLElement} formErrors - The error summary container
 * @param {HTMLElement} formStatus - The success message container
 * @param {Array<HTMLElement>} fields - Array of form fields to clear
 */
function clearFormErrors(formErrors, formStatus, fields) {
    formErrors.innerHTML = "";
    formErrors.hidden = true;
    formStatus.textContent = "";
    formStatus.hidden = true;

    fields.forEach((field) => {
        if (field) {
            field.removeAttribute("aria-invalid");
            field.removeAttribute("aria-describedby");
        }
    });

    document.querySelectorAll('.field-error').forEach(el => el.remove());
}

/**
 * Announces messages to screen readers using aria-live regions
 * @param {string} message - The message to announce
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Auto-formats phone number input as user types
 * Converts raw digits to 613-123-1234 format
 * @param {HTMLInputElement} phoneField - The phone number input element
 */
function setupPhoneFormatting(phoneField) {
    if (!phoneField) {
        return;
    }

    phoneField.addEventListener("input", (event) => {
        let value = event.target.value.replace(/\D/g, '');
        value = value.substring(0, 10);
        
        if (value.length > 6) {
            value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
        } else if (value.length > 3) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        }
        
        event.target.value = value;
    });
}

/**
 * Sets up accessible form validation with error handling and user notifications
 */
function setupFormValidation() {
    const form = document.getElementById("schedule-form");
    const phoneNumber = document.getElementById("phone-number");
    const email = document.getElementById("email");
    const speakerCheckbox = document.getElementById("speaker-event");
    const eventDetails = document.getElementById("event-details");
    const formStatus = document.getElementById("form-status");
    const formErrors = document.getElementById("form-errors");
    const emailSwitch = document.getElementById("email-updates-switch");

    if (!form || !email || !formStatus || !formErrors) {
        return;
    }

    setupPhoneFormatting(phoneNumber);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearFormErrors(formErrors, formStatus, [phoneNumber, email, eventDetails]);

        const errors = [];
        let firstErrorField = null;

        if (!email.value.trim()) {
            errors.push({ field: email, message: "Email is required." });
            email.setAttribute("aria-invalid", "true");
            if (!firstErrorField) firstErrorField = email;
        } else if (!email.validity.valid) {
            errors.push({ field: email, message: "Please enter a valid email address." });
            email.setAttribute("aria-invalid", "true");
            if (!firstErrorField) firstErrorField = email;
        }

        if (!isValidPhone(phoneNumber.value)) {
            errors.push({ field: phoneNumber, message: "Please enter a complete 10-digit phone number." });
            phoneNumber.setAttribute("aria-invalid", "true");
            if (!firstErrorField) firstErrorField = phoneNumber;
        }

        if (speakerCheckbox && speakerCheckbox.checked && !eventDetails.value.trim()) {
            errors.push({ field: eventDetails, message: "Please tell us about your event." });
            eventDetails.setAttribute("aria-invalid", "true");
            if (!firstErrorField) firstErrorField = eventDetails;
        }

        if (errors.length > 0) {
            const errorList = document.createElement("ul");
            errors.forEach(({ message }) => {
                const listItem = document.createElement("li");
                listItem.textContent = message;
                errorList.appendChild(listItem);
            });

            formErrors.innerHTML = `<p><strong>${errors.length} error${errors.length > 1 ? 's' : ''} found:</strong></p>`;
            formErrors.appendChild(errorList);
            formErrors.hidden = false;

            errors.forEach(({ field, message }) => {
                if (field && field.parentElement) {
                    const errorSpan = document.createElement('span');
                    errorSpan.className = 'field-error text-danger small d-block mt-1';
                    errorSpan.id = `${field.id}-error`;
                    errorSpan.textContent = message;
                    errorSpan.setAttribute('role', 'alert');
                    
                    field.parentElement.appendChild(errorSpan);
                    field.setAttribute('aria-describedby', `${field.id}-error`);
                }
            });

            if (firstErrorField) {
                firstErrorField.focus();
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            const announcement = `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}. Please correct the errors and try again.`;
            announceToScreenReader(announcement);
            
            return;
        }

        const emailUpdatesEnabled = emailSwitch && emailSwitch.checked;

        formStatus.textContent =
            `Thank you! Your request has been submitted successfully. ` +
            `We will contact you at ${email.value.trim()} soon.` +
            (emailUpdatesEnabled ? " You are also subscribed to update and service emails." : "");

        formStatus.hidden = false;
        form.reset();

        if (speakerCheckbox) {
            speakerCheckbox.setAttribute("aria-expanded", "false");
        }

        const eventDetailsGroup = document.getElementById("event-details-group");
        if (eventDetailsGroup) {
            eventDetailsGroup.hidden = true;
        }

        formStatus.setAttribute("tabindex", "-1");
        formStatus.focus();
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

knowledgeRunner();
