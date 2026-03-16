// Waitlist Modal, Beta Registration API, and Formspree legacy notifier

// Legacy Formspree configuration (keep existing email notifications active)
const FORMSPREE_ENDPOINTS = [
    'https://formspree.io/f/xzznwjvg',
    'https://formspree.io/f/xpqakezr'
];

// Backend registration endpoint (can be overridden before this script loads)
const REGISTRATION_ENDPOINT =
    window.STUDYSHORTS_REGISTRATION_ENDPOINT || '/api/v1/registrations';
const REGISTRATION_SOURCE = 'website_waitlist';

// Open Waitlist Modal
function openWaitlistModal() {
    const modal = document.getElementById('waitlistModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Waitlist Modal
function closeWaitlistModal() {
    const modal = document.getElementById('waitlistModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        resetWaitlistForm();
    }
}

function resetWaitlistForm() {
    const form = document.getElementById('waitlistForm');
    if (form) {
        form.reset();
        syncOptionalFieldVisibility(form);
    }

    const message = document.getElementById('waitlist-message');
    if (message) {
        message.style.display = 'none';
        message.className = 'waitlist-message';
    }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('waitlistModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeWaitlistModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.getElementById('waitlistModal');
            if (activeModal && activeModal.classList.contains('active')) {
                closeWaitlistModal();
            }
        }
    });

    initWaitlistForm();
});

// Initialize Waitlist Form
function initWaitlistForm() {
    const form = document.getElementById('waitlistForm');

    if (!form) {
        return;
    }

    const otherCheckbox = form.querySelector('#waitlist-os-other-check');
    if (otherCheckbox) {
        otherCheckbox.addEventListener('change', function() {
            syncOptionalFieldVisibility(form);
        });
    }
    const countryOtherCheckbox = form.querySelector('#waitlist-country-other-check');
    if (countryOtherCheckbox) {
        countryOtherCheckbox.addEventListener('change', function() {
            syncOptionalFieldVisibility(form);
        });
    }
    syncOptionalFieldVisibility(form);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const messageEl = document.getElementById('waitlist-message');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Joining...';
        if (messageEl) {
            messageEl.style.display = 'none';
            messageEl.className = 'waitlist-message';
        }

        const email = form.querySelector('#waitlist-email').value.trim();
        const name = form.querySelector('#waitlist-name').value.trim();
        const osUsed = getSelectedOsValues(form);
        const otherOsText = getOtherOsText(form, osUsed);
        const countriesOfStudies = getSelectedValues(form, 'country_of_studies');
        const otherCountryOfStudies = getConditionalTextValue(
            form,
            '#waitlist-country-other-text',
            countriesOfStudies,
            'other'
        );
        const timestamp = new Date().toISOString();
        const normalizedName = name || 'Not provided';

        if (!email) {
            showWaitlistMessage('error', 'Please enter your email.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        if (osUsed.length === 0) {
            showWaitlistMessage('error', 'Please select at least one option in OS Used.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        const registrationPayload = {
            email: email,
            name: normalizedName,
            os_used: osUsed,
            other_os_text: otherOsText,
            source: REGISTRATION_SOURCE
        };

        const legacyFormData = new FormData();
        legacyFormData.append('email', email);
        legacyFormData.append('name', normalizedName);
        legacyFormData.append('os_used', osUsed.join(', '));
        legacyFormData.append('other_os_text', otherOsText || '');
        legacyFormData.append('country_of_studies', countriesOfStudies.join(', '));
        legacyFormData.append('other_country_of_studies', otherCountryOfStudies || '');
        legacyFormData.append('_subject', 'New Waitlist Signup - StudyShorts');
        legacyFormData.append(
            'message',
            `New waitlist signup:\n\nEmail: ${email}\nName: ${normalizedName}\nOS Used: ${osUsed.join(', ')}\nOther OS Text: ${otherOsText || 'Not provided'}\nCountry of Studies: ${countriesOfStudies.length > 0 ? countriesOfStudies.join(', ') : 'Not provided'}\nOther Country of Studies: ${otherCountryOfStudies || 'Not provided'}\nTimestamp: ${timestamp}\nSource: ${REGISTRATION_SOURCE}`
        );

        try {
            await submitRegistration(registrationPayload);

            try {
                // Keep legacy email notifier but do not fail registration if this path fails.
                await sendToFormspree(FORMSPREE_ENDPOINTS, legacyFormData);
            } catch (legacyError) {
                console.warn('Legacy Formspree notification failed:', legacyError);
            }

            showWaitlistMessage('success', 'Thank you! You\'ve been added to our waitlist. We\'ll notify you when we launch!');
            form.reset();
            syncOptionalFieldVisibility(form);
        } catch (error) {
            console.error('Waitlist registration error:', error);
            showWaitlistMessage('error', getWaitlistErrorMessage(error));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

function syncOptionalFieldVisibility(form) {
    toggleConditionalTextInput(
        form,
        '#waitlist-os-other-check',
        '#waitlist-os-other-text'
    );
    toggleConditionalTextInput(
        form,
        '#waitlist-country-other-check',
        '#waitlist-country-other-text'
    );
}

function toggleConditionalTextInput(form, checkboxSelector, inputSelector) {
    const otherCheckbox = form.querySelector(checkboxSelector);
    const otherTextInput = form.querySelector(inputSelector);
    if (!otherCheckbox || !otherTextInput) {
        return;
    }

    if (otherCheckbox.checked) {
        otherTextInput.style.display = 'block';
    } else {
        otherTextInput.style.display = 'none';
        otherTextInput.value = '';
    }
}

function getSelectedValues(form, fieldName) {
    const values = new Set();
    const checked = form.querySelectorAll(`input[name="${fieldName}"]:checked`);
    checked.forEach(function(input) {
        const value = input.value.trim().toLowerCase();
        if (value) {
            values.add(value);
        }
    });
    return Array.from(values);
}

function getSelectedOsValues(form) {
    return getSelectedValues(form, 'os_used');
}

function getOtherOsText(form, osUsed) {
    return getConditionalTextValue(
        form,
        '#waitlist-os-other-text',
        osUsed,
        'other'
    );
}

function getConditionalTextValue(form, inputSelector, selectedValues, triggerValue) {
    const otherTextInput = form.querySelector(inputSelector);
    if (!otherTextInput) {
        return null;
    }

    if (!selectedValues.includes(triggerValue)) {
        otherTextInput.value = '';
        return null;
    }

    const value = otherTextInput.value.trim();
    return value ? value : null;
}

async function submitRegistration(payload) {
    const response = await fetch(REGISTRATION_ENDPOINT, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    let data = null;
    try {
        data = await response.json();
    } catch (_) {
        // Ignore non-JSON payloads
    }

    if (!response.ok) {
        const error = new Error(buildApiErrorMessage(response.status, data));
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data || {};
}

function buildApiErrorMessage(status, data) {
    if (data && typeof data.message === 'string') {
        if (
            status === 422 &&
            Array.isArray(data.errors) &&
            data.errors.length > 0
        ) {
            const first = data.errors[0];
            if (typeof first === 'string') {
                return first;
            }
            if (first && typeof first === 'object') {
                if (typeof first.message === 'string') {
                    return first.message;
                }
                if (typeof first.msg === 'string') {
                    return first.msg;
                }
            }
        }
        return data.message;
    }

    if (status === 422) {
        return 'Please check your details and try again.';
    }

    if (status >= 500) {
        return 'The registration service is temporarily unavailable. Please try again.';
    }

    return 'Could not save your registration. Please try again.';
}

function getWaitlistErrorMessage(error) {
    if (error && typeof error.message === 'string' && error.message.trim()) {
        return error.message;
    }
    return 'Oops! Something went wrong. Please try again.';
}

// Show waitlist message
function showWaitlistMessage(type, message) {
    const messageEl = document.getElementById('waitlist-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `waitlist-message ${type}`;
        messageEl.style.display = 'block';
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Submit to multiple Formspree endpoints
async function sendToFormspree(endpoints, formData) {
    const responses = await Promise.all(
        endpoints.map(function(endpoint) {
            return fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
        })
    );

    const failed = responses.filter(function(response) { return !response.ok; });
    if (failed.length > 0) {
        const firstError = failed[0];
        let details = '';
        try {
            const data = await firstError.json();
            details = data.error || '';
        } catch (_) {
            // Ignore parse errors
        }
        throw new Error(details || 'Legacy Formspree submission failed');
    }
}

// Export functions for global access
window.openWaitlistModal = openWaitlistModal;
window.closeWaitlistModal = closeWaitlistModal;
