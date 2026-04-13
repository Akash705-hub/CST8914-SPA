// Replaced the empty template with a full initialization function for the SPA project
function knowledgeRunner() {
    // Added SPA navigation setup to support section switching without page reload
    setupSpaNavigation();

    // Added show/hide behavior for the event details textarea
    setupSpeakerToggle();

    // Added accessible switch behavior for email updates
    setupEmailSwitch();

    // Added accessible form validation and user feedback
    setupFormValidation();
}

// Added a helper object to map each SPA route to its section and page title
const routes = {
    home: {
        sectionId: "home",
        title: "Empower Ability Labs - Home",
        focusTargetId: "home-heading",
        path: "/"
    },
    services: {
        sectionId: "services",
        title: "Empower Ability Labs - Services",
        focusTargetId: "services-heading",
        path: "/services"
    },
    schedule: {
        sectionId: "schedule",
        title: "Empower Ability Labs - Schedule a Call",
        focusTargetId: "schedule-heading",
        path: "/schedule"
    }
};

// Added SPA navigation so the page behaves like a single-page application
function setupSpaNavigation() {
    const navLinks = document.querySelectorAll("[data-route]");

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const routeName = link.getAttribute("data-route");

            // Prevented default anchor behavior so navigation is handled by JavaScript
            event.preventDefault();

            // Added route change through custom function
            navigateTo(routeName, true);
        });
    });

    // Added browser Back/Forward support using popstate
    window.addEventListener("popstate", (event) => {
        const routeName = event.state?.route || getRouteFromPath() || "home";
        navigateTo(routeName, false);
    });

    // Added initial route detection when the page first loads
    const initialRoute = getRouteFromPath() || "home";
    navigateTo(initialRoute, false);
}

// Changed: Helper to read the current path and convert it into a valid route
function getRouteFromPath() {
    const path = window.location.pathname;

    // Find matching route by path
    for (const [routeName, routeData] of Object.entries(routes)) {
        if (routeData.path === path) {
            return routeName;
        }
    }

    // Default to home for root path or unknown paths
    if (path === "/" || path === "/index.html" || path === "/EmpowerAbilityLab.html") {
        return "home";
    }

    return null;
}

// Changed: Main SPA navigation logic using paths instead of hashes
function navigateTo(routeName, shouldPushState) {
    const route = routes[routeName] || routes.home;
    const allSections = document.querySelectorAll("main section");
    const allNavLinks = document.querySelectorAll("[data-route]");

    // Hid all sections except the active one
    allSections.forEach((section) => {
        section.hidden = section.id !== route.sectionId;
    });

    // Updated page title for each SPA view
    document.title = route.title;

    // Changed: Updated the URL using path instead of hash
    if (shouldPushState) {
        history.pushState({ route: routeName }, "", route.path);
    }

    // Updated aria-current so screen readers know which nav item is active
    allNavLinks.forEach((link) => {
        const isActive = link.getAttribute("data-route") === routeName;

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    // Only move focus when user clicks navigation (not on initial page load)
    if (shouldPushState) {
        const focusTarget = document.getElementById(route.focusTargetId);
        if (focusTarget) {
            focusTarget.setAttribute("tabindex", "-1");
            focusTarget.focus();
        }
    }
}

// Added logic to show or hide the event details textarea when the speaker checkbox changes
function setupSpeakerToggle() {
    const speakerCheckbox = document.getElementById("speaker-event");
    const eventDetailsGroup = document.getElementById("event-details-group");
    const eventDetails = document.getElementById("event-details");

    // Guard clause in case the required elements are missing
    if (!speakerCheckbox || !eventDetailsGroup || !eventDetails) {
        return;
    }

    // Added function to keep visibility and ARIA state in sync
    function updateEventDetailsVisibility() {
        const isChecked = speakerCheckbox.checked;

        eventDetailsGroup.hidden = !isChecked;
        speakerCheckbox.setAttribute("aria-expanded", String(isChecked));

        // Added focus movement to the textarea when it becomes visible
        if (isChecked) {
            eventDetails.focus();
        } else {
            eventDetails.value = "";
        }
    }

    // Attached the visibility logic to checkbox changes
    speakerCheckbox.addEventListener("change", updateEventDetailsVisibility);

    // Applied the correct initial state when the page loads
    updateEventDetailsVisibility();
}

// Added accessible switch behavior using Bootstrap form-switch
function setupEmailSwitch() {
    const emailSwitch = document.getElementById("email-updates-switch");
    // Guard clause in case the switch is missing
    if (!emailSwitch) {
        return;
    }
    // Native checkbox handles everything automatically
}

// Added complete accessible form validation and user feedback behavior
function setupFormValidation() {
    const form = document.getElementById("schedule-form");
    const businessName = document.getElementById("business-name");
    const phoneNumber = document.getElementById("phone-number");
    const email = document.getElementById("email");
    const topicCheckboxes = document.querySelectorAll('input[name="topic"]');
    const speakerCheckbox = document.getElementById("speaker-event");
    const eventDetails = document.getElementById("event-details");
    const formStatus = document.getElementById("form-status");
    const formErrors = document.getElementById("form-errors");
    const emailSwitch = document.getElementById("email-updates-switch");

    // Guard clause in case the form is missing
    if (!form || !email || !formStatus || !formErrors) {
        return;
    }

    // Added helper to validate a basic North American phone format when provided
    function isValidPhone(value) {
        if (!value.trim()) {
            return true;
        }

        const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
        return phonePattern.test(value.trim());
    }

    // Added helper to validate that at least one topic is selected
    function hasSelectedTopic() {
        return Array.from(topicCheckboxes).some((checkbox) => checkbox.checked);
    }

    // Added helper to clear previous error states before validating again
    function clearErrors() {
        formErrors.innerHTML = "";
        formErrors.hidden = true;
        formStatus.textContent = "";
        formStatus.hidden = true;

        [businessName, phoneNumber, email, eventDetails].forEach((field) => {
            if (field) {
                field.removeAttribute("aria-invalid");
                field.removeAttribute("aria-describedby");
            }
        });

        // Clear any previous error messages
        document.querySelectorAll('.field-error').forEach(el => el.remove());
    }

    // Added submit handler with accessible validation and focus management
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearErrors();

        const errors = [];
        let firstErrorField = null;

        // Added email required validation
        if (!email.value.trim()) {
            errors.push({ field: email, message: "Email is required." });
            email.setAttribute("aria-invalid", "true");
            if (!firstErrorField) firstErrorField = email;
        } else if (!email.validity.valid) {
            errors.push({ field: email, message: "Please enter a valid email address." });
            email.setAttribute("aria-invalid", "true");
            if (!firstErrorField) firstErrorField = email;
        }

        // Added phone validation for the required displayed format
        if (!isValidPhone(phoneNumber.value)) {
            errors.push({ field: phoneNumber, message: "Phone number must use the format 613-123-1234." });
            phoneNumber.setAttribute("aria-invalid", "true");
            if (!firstErrorField) firstErrorField = phoneNumber;
        }

        // Added topic selection validation
        if (!hasSelectedTopic()) {
            errors.push({ field: document.querySelector('input[name="topic"]'), message: "Please select at least one topic." });
            // First topic checkbox will get focus if this is the first error
            if (!firstErrorField) firstErrorField = document.querySelector('input[name="topic"]');
        }

        // Added conditional validation for the event details textarea
        if (speakerCheckbox && speakerCheckbox.checked && !eventDetails.value.trim()) {
            errors.push({ field: eventDetails, message: "Please tell us about your event." });
            eventDetails.setAttribute("aria-invalid", "true");
            if (!firstErrorField) firstErrorField = eventDetails;
        }

        // If errors exist, show them and focus the first error field
        if (errors.length > 0) {
            // Build error summary for screen readers
            const errorList = document.createElement("ul");
            errors.forEach(({ message }) => {
                const listItem = document.createElement("li");
                listItem.textContent = message;
                errorList.appendChild(listItem);
            });

            formErrors.innerHTML = `<p><strong>${errors.length} error${errors.length > 1 ? 's' : ''} found:</strong></p>`;
            formErrors.appendChild(errorList);
            formErrors.hidden = false;

            // Add inline error messages next to each field
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

            // Focus the first field with an error (WCAG 3.3.1 - Error Identification)
            if (firstErrorField) {
                firstErrorField.focus();
                
                // Scroll to the field if it's not in view
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Announce errors to screen readers
            const announcement = `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}. Please correct the errors and try again.`;
            announceToScreenReader(announcement);
            
            return;
        }

        // Success handling
        const emailUpdatesEnabled = emailSwitch && emailSwitch.checked;

        formStatus.textContent =
            `Thank you! Your request has been submitted successfully. ` +
            `We will contact you at ${email.value.trim()} soon.` +
            (emailUpdatesEnabled ? " You are also subscribed to updates and services emails." : "");

        formStatus.hidden = false;
        form.reset();

        // Reset dependent UI elements
        if (speakerCheckbox) {
            speakerCheckbox.setAttribute("aria-expanded", "false");
        }

        const eventDetailsGroup = document.getElementById("event-details-group");
        if (eventDetailsGroup) {
            eventDetailsGroup.hidden = true;
        }

        // Moved focus to the success message
        formStatus.setAttribute("tabindex", "-1");
        formStatus.focus();
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Helper function to announce messages to screen readers
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// Kept the final function call so the script runs after loading
knowledgeRunner();
