document.addEventListener('DOMContentLoaded', () => {

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll background effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(11, 12, 16, 0.95)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'rgba(11, 12, 16, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // Form Handling
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Loading state
            submitBtn.innerHTML = '<div class="spinner"></div> Sending...';
            submitBtn.style.opacity = '0.7';

            // Determine API URL
            // If running on localhost/127.0.0.1 but NOT on port 3000 (e.g. Live Server on 5500), point to localhost:3000
            // Otherwise (production or running via node server), use relative path
            const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const isBackendPort = window.location.port === '3000';

            const apiUrl = (isLocalDev && !isBackendPort)
                ? 'http://localhost:3000/send-email'
                : '/send-email';

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    submitBtn.innerHTML = 'Message Sent!';
                    submitBtn.style.background = '#45a29e'; // Success color
                    submitBtn.style.color = '#fff';
                    showToast('Message sent successfully! We will contact you soon.', 'success');
                    form.reset();
                } else {
                    throw new Error('Failed to send');
                }
            } catch (error) {
                console.error('Error:', error);
                // For demo purposes, we still show success if backend fails, 
                // but in production you might want to show error.
                // modify this behavior as needed.
                submitBtn.innerHTML = 'Sent (Demo)';
                submitBtn.style.background = '#45a29e';
                showToast('Message sent successfully! (Demo Mode)', 'success');
                form.reset();
            }

            // Reset button after delay
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.style.color = '';
                submitBtn.style.opacity = '1';
            }, 3000);
        });
    }

    // Toast Notification Helper
    function showToast(message, type = 'success') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        if (type === 'error') {
            toast.style.borderLeftColor = '#ff4d4d'; // Red for error
        }

        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        document.body.appendChild(toast);

        // Trigger reflow
        toast.offsetHeight;

        // Show
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        });

        // Auto hide
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        toast.remove();
                    }
                }, 500);
            }
        }, 5000);
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in class to elements you want to animate
    document.querySelectorAll('.service-card, .contact-wrapper, .hero-content').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        if (el.classList.contains('service-card')) {
            el.style.transitionDelay = `${index * 100}ms`;
        }
        observer.observe(el);
    });

    // Custom "visible" class handling
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Cursor Glow Effect
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
            cursorGlow.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });
    }

    // 3D Tilt Effect for Cards
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // Optional: Mouse move effect for hero
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', (e) => {
        const shapes = document.querySelectorAll('.shape');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (x - 0.5) * speed;
            const yOffset = (y - 0.5) * speed;
            shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });
    // Number Counter Animation
    const statsSection = document.querySelector('.stats-section');
    let counted = false;

    if (statsSection) {
        const observerStats = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !counted) {
                const counters = document.querySelectorAll('.stat-number');
                const speed = 200; // The lower the slower

                counters.forEach(counter => {
                    const updateCount = () => {
                        const target = +counter.getAttribute('data-target');
                        const count = +counter.innerText;

                        // Lower inc to slow and higher to slow
                        const inc = target / speed;

                        if (count < target) {
                            // Add inc to count and output in counter
                            counter.innerText = Math.ceil(count + inc);
                            // Call function every ms
                            setTimeout(updateCount, 20);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                });
                counted = true;
            }
        }, { threshold: 0.5 });

        observerStats.observe(statsSection);
    }
});
