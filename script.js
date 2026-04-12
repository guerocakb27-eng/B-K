/* ==========================================================================
   B&K Agency — JavaScript
   Particle Animation, Scroll Reveals, Navigation, Counter Animation
   ========================================================================== */

(function () {
    'use strict';

    // ---- Respect reduced motion ----
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================================================
    // PARTICLE BACKGROUND
    // Lightweight canvas-based particle system with connecting lines
    // Inspired by nodes.js / particles.js patterns
    // ==========================================================================
    const ParticleSystem = {
        canvas: null,
        ctx: null,
        particles: [],
        mouse: { x: null, y: null },
        animationId: null,
        config: {
            particleCount: 60,
            particleColor: 'rgba(255, 255, 255,',
            lineColor: 'rgba(255, 255, 255,',
            maxDistance: 150,
            particleSize: { min: 1, max: 2.5 },
            speed: 0.3,
            mouseRadius: 200,
        },

        init() {
            if (prefersReducedMotion) return;

            this.canvas = document.getElementById('particle-canvas');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.createParticles();
            this.bindEvents();
            this.animate();
        },

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            // Adjust particle count for mobile
            const isMobile = window.innerWidth < 768;
            this.config.particleCount = isMobile ? 30 : 60;
        },

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.config.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * this.config.speed,
                    vy: (Math.random() - 0.5) * this.config.speed,
                    size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
                    opacity: Math.random() * 0.5 + 0.1,
                });
            }
        },

        bindEvents() {
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.resize();
                    this.createParticles();
                }, 250);
            });

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            window.addEventListener('mouseout', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        },

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update & draw particles
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

                // Mouse repulsion
                if (this.mouse.x !== null) {
                    const dx = p.x - this.mouse.x;
                    const dy = p.y - this.mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < this.config.mouseRadius) {
                        const force = (this.config.mouseRadius - dist) / this.config.mouseRadius;
                        p.x += dx * force * 0.02;
                        p.y += dy * force * 0.02;
                    }
                }

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = this.config.particleColor + p.opacity + ')';
                this.ctx.fill();

                // Draw connecting lines
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.config.maxDistance) {
                        const opacity = (1 - dist / this.config.maxDistance) * 0.15;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = this.config.lineColor + opacity + ')';
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            }

            this.animationId = requestAnimationFrame(() => this.animate());
        },

        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        },
    };

    // ==========================================================================
    // SCROLL REVEAL
    // IntersectionObserver-based scroll animations
    // ==========================================================================
    const ScrollReveal = {
        init() {
            if (prefersReducedMotion) {
                // Show all elements immediately
                document.querySelectorAll('.reveal').forEach((el) => {
                    el.classList.add('revealed');
                });
                return;
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('revealed');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px',
                }
            );

            document.querySelectorAll('.reveal').forEach((el) => {
                observer.observe(el);
            });
        },
    };

    // ==========================================================================
    // NAVIGATION
    // Sticky nav with backdrop blur, mobile menu toggle
    // ==========================================================================
    const Navigation = {
        nav: null,
        toggle: null,
        menu: null,
        links: null,

        init() {
            this.nav = document.getElementById('nav');
            this.toggle = document.getElementById('nav-toggle');
            this.menu = document.getElementById('nav-menu');
            this.links = document.querySelectorAll('.nav__link');

            if (!this.nav) return;

            this.bindEvents();
            this.checkScroll();
        },

        bindEvents() {
            // Scroll effect
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.checkScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            // Mobile toggle
            if (this.toggle) {
                this.toggle.addEventListener('click', () => {
                    this.toggle.classList.toggle('active');
                    this.menu.classList.toggle('active');
                    document.body.style.overflow = this.menu.classList.contains('active') ? 'hidden' : '';
                });
            }

            // Close mobile menu on link click
            this.links.forEach((link) => {
                link.addEventListener('click', () => {
                    this.toggle.classList.remove('active');
                    this.menu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        },

        checkScroll() {
            if (window.scrollY > 50) {
                this.nav.classList.add('nav--scrolled');
            } else {
                this.nav.classList.remove('nav--scrolled');
            }
        },
    };

    // ==========================================================================
    // COUNTER ANIMATION
    // Animated number counting for stats section
    // ==========================================================================
    const CounterAnimation = {
        init() {
            const counters = document.querySelectorAll('.stat__number[data-count]');
            if (!counters.length) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            this.animateCounter(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.5 }
            );

            counters.forEach((counter) => observer.observe(counter));
        },

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-count'), 10);
            const duration = 2000;
            const start = performance.now();

            const update = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);

                element.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };

            if (prefersReducedMotion) {
                element.textContent = target;
            } else {
                requestAnimationFrame(update);
            }
        },
    };

    // ==========================================================================
    // SPOTLIGHT CARD EFFECT
    // Mouse-tracking glow effect on service cards (white, no color)
    // Inspired by 21st.dev spotlight-card component
    // ==========================================================================
    const SpotlightCards = {
        cards: [],

        init() {
            if (prefersReducedMotion) return;

            this.cards = document.querySelectorAll('[data-spotlight]');
            if (!this.cards.length) return;

            this.bindEvents();
        },

        bindEvents() {
            // Track mouse across entire document for smooth cross-card movement
            document.addEventListener('pointermove', (e) => {
                this.cards.forEach((card) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    card.style.setProperty('--spotlight-x', x + 'px');
                    card.style.setProperty('--spotlight-y', y + 'px');

                    // Check if cursor is near the card (within 50px buffer)
                    const buffer = 50;
                    const isNear = (
                        e.clientX >= rect.left - buffer &&
                        e.clientX <= rect.right + buffer &&
                        e.clientY >= rect.top - buffer &&
                        e.clientY <= rect.bottom + buffer
                    );

                    if (isNear) {
                        card.style.setProperty('--spotlight-opacity', '1');
                        card.style.setProperty('--border-glow-opacity', '1');
                    } else {
                        card.style.setProperty('--spotlight-opacity', '0');
                        card.style.setProperty('--border-glow-opacity', '0');
                    }
                });
            });

            // Hide glow when mouse leaves the window
            document.addEventListener('pointerleave', () => {
                this.cards.forEach((card) => {
                    card.style.setProperty('--spotlight-opacity', '0');
                    card.style.setProperty('--border-glow-opacity', '0');
                });
            });
        },
    };

    // ==========================================================================
    // SMOOTH SCROLL (for anchor links)
    // ==========================================================================
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href');
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        const offset = 80; // nav height
                        const y = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                    }
                });
            });
        },
    };

    // ==========================================================================
    // CONTACT FORM (basic frontend handling)
    // ==========================================================================
    const ContactForm = {
        init() {
            const form = document.getElementById('contact-form');
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const btn = form.querySelector('.btn');
                const originalText = btn.querySelector('span').textContent;

                // Simple animation feedback
                btn.querySelector('span').textContent = 'Wird gesendet...';
                btn.style.pointerEvents = 'none';

                setTimeout(() => {
                    btn.querySelector('span').textContent = 'Gesendet!';
                    btn.style.opacity = '0.7';

                    setTimeout(() => {
                        btn.querySelector('span').textContent = originalText;
                        btn.style.pointerEvents = '';
                        btn.style.opacity = '';
                        form.reset();
                    }, 2000);
                }, 1500);
            });
        },
    };

    // ==========================================================================
    // INIT
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        ParticleSystem.init();
        ScrollReveal.init();
        Navigation.init();
        CounterAnimation.init();
        SpotlightCards.init();
        SmoothScroll.init();
        ContactForm.init();
    });
})();
