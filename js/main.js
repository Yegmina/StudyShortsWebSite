// StudyShorts Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initContactForm();
    initActiveNavOnScroll();
});

// Mobile Navigation Toggle
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

// Smooth Scrolling for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    // Add fade-in class to elements that should animate
    const animatedElements = document.querySelectorAll(
        '.value-prop, .feature-card, .team-member, .section-header, .story-text'
    );
    
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stagger animation for siblings
                const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
                siblings.forEach((sibling, index) => {
                    sibling.style.transitionDelay = `${index * 0.1}s`;
                });
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
}

// Active Navigation on Scroll
function initActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    function updateActiveNav() {
        const scrollPosition = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Initial check
}

// Contact Form Handler - Formspree Integration (duplicate submissions to both endpoints)
const FORMSPREE_CONTACT_ENDPOINTS = [
    'https://formspree.io/f/xzznwjvg',
    'https://formspree.io/f/xpqakezr'
]; // Both endpoints will receive the submission

function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Add loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Sending...';
            
            // Get form data
            const name = form.querySelector('#name').value.trim();
            const email = form.querySelector('#email').value.trim();
            const subject = form.querySelector('#subject').value.trim();
            const message = form.querySelector('#message').value.trim();
            
            // Prepare data for Formspree
            const formData = new FormData();
            formData.append('email', email);
            formData.append('name', name);
            formData.append('_subject', `Contact Form: ${subject}`);
            formData.append('message', `Contact Form Submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`);
            
            try {
                // Submit to all Formspree endpoints
                await sendContactToFormspree(FORMSPREE_CONTACT_ENDPOINTS, formData);
                
                // Success
                showFormMessage('success', 'Thank you! Your message has been sent successfully. We\'ll get back to you soon!');
                form.reset();
            } catch (error) {
                console.error('Contact form submission error:', error);
                showFormMessage('error', 'Oops! Something went wrong. Please try again or email us directly at hello@studyshorts.com');
            } finally {
                // Remove loading state
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
            }
        });
    }
}

// Show form message
function showFormMessage(type, message) {
    const form = document.getElementById('contactForm');
    
    // Remove existing messages
    const existingMessage = form.querySelector('.form-success, .form-error');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = type === 'success' ? 'form-success' : 'form-error';
    messageEl.textContent = message;
    
    // Insert at the beginning of the form
    form.insertBefore(messageEl, form.firstChild);
    
    // Scroll to message
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

// Submit contact form to multiple Formspree endpoints
async function sendContactToFormspree(endpoints, formData) {
    const responses = await Promise.all(
        endpoints.map(endpoint =>
            fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
        )
    );
    
    const failed = responses.filter(r => !r.ok);
    if (failed.length > 0) {
        const firstError = failed[0];
        let details = '';
        try {
            const data = await firstError.json();
            details = data.error || '';
        } catch (_) {
            // ignore parse errors
        }
        throw new Error(details || 'Submission failed');
    }
}

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Add parallax effect to hero image
window.addEventListener('scroll', function() {
    const heroImage = document.querySelector('.hero-image img');
    if (heroImage) {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero');
        const heroHeight = heroSection.offsetHeight;
        
        if (scrolled < heroHeight) {
            heroImage.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    }
});

// Counter animation for statistics (if added later)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility: Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


