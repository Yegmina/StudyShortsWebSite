// Waitlist Modal and Formspree Integration

// Formspree Configuration
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xzznwjvg';

// Open Waitlist Modal
function openWaitlistModal() {
    const modal = document.getElementById('waitlistModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

// Close Waitlist Modal
function closeWaitlistModal() {
    const modal = document.getElementById('waitlistModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        // Reset form
        const form = document.getElementById('waitlistForm');
        if (form) {
            form.reset();
            const message = document.getElementById('waitlist-message');
            if (message) {
                message.style.display = 'none';
                message.className = 'waitlist-message';
            }
        }
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
            const modal = document.getElementById('waitlistModal');
            if (modal && modal.classList.contains('active')) {
                closeWaitlistModal();
            }
        }
    });
    
    // Initialize waitlist form
    initWaitlistForm();
});

// Initialize Waitlist Form
function initWaitlistForm() {
    const form = document.getElementById('waitlistForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            const messageEl = document.getElementById('waitlist-message');
            
            // Disable form and show loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Joining...';
            if (messageEl) {
                messageEl.style.display = 'none';
                messageEl.className = 'waitlist-message';
            }
            
            // Get form data
            const email = form.querySelector('#waitlist-email').value.trim();
            const name = form.querySelector('#waitlist-name').value.trim() || 'Not provided';
            const timestamp = new Date().toISOString();
            
            // Prepare data for Formspree
            const formData = new FormData();
            formData.append('email', email);
            formData.append('name', name);
            formData.append('_subject', `New Waitlist Signup - StudyShorts`);
            formData.append('message', `New waitlist signup:\n\nEmail: ${email}\nName: ${name}\nTimestamp: ${timestamp}\nSource: Website Waitlist`);
            
            try {
                // Submit to Formspree
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Success
                    showWaitlistMessage('success', 'Thank you! You\'ve been added to our waitlist. We\'ll notify you when we launch!');
                    form.reset();
                } else {
                    // Formspree returned an error
                    const data = await response.json();
                    throw new Error(data.error || 'Submission failed');
                }
            } catch (error) {
                console.error('Waitlist submission error:', error);
                showWaitlistMessage('error', 'Oops! Something went wrong. Please try again or contact us directly.');
            } finally {
                // Re-enable form
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
}

// Show waitlist message
function showWaitlistMessage(type, message) {
    const messageEl = document.getElementById('waitlist-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `waitlist-message ${type}`;
        messageEl.style.display = 'block';
        
        // Scroll to message
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Export functions for global access
window.openWaitlistModal = openWaitlistModal;
window.closeWaitlistModal = closeWaitlistModal;
