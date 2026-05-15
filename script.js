/* ==========================================================================
   B&K Agency — JavaScript
   ========================================================================== */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================================================
    // PARTICLE BACKGROUND
    // ==========================================================================
    const ParticleSystem = {
        canvas: null, ctx: null, particles: [], mouse: { x: null, y: null }, animationId: null,
        config: {
            particleCount: 60,
            particleColor: 'rgba(129, 140, 248,',
            lineColor: 'rgba(99, 102, 241,',
            maxDistance: 150,
            particleSize: { min: 1, max: 2 },
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
            this.config.particleCount = window.innerWidth < 768 ? 20 : 50;
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
                    opacity: Math.random() * 0.4 + 0.05,
                });
            }
        },

        bindEvents() {
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => { this.resize(); this.createParticles(); }, 250);
            });
            window.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
            window.addEventListener('mouseout', () => { this.mouse.x = null; this.mouse.y = null; });
        },

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

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

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = this.config.particleColor + p.opacity + ')';
                this.ctx.fill();

                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < this.config.maxDistance) {
                        const opacity = (1 - dist / this.config.maxDistance) * 0.12;
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
    };

    // ==========================================================================
    // SCROLL REVEAL
    // ==========================================================================
    const ScrollReveal = {
        init() {
            if (prefersReducedMotion) {
                document.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
                return;
            }
            const observer = new IntersectionObserver(
                (entries) => entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                }),
                { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
            );
            document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
        },
    };

    // ==========================================================================
    // NAVIGATION
    // ==========================================================================
    const Navigation = {
        init() {
            const nav = document.getElementById('nav');
            const toggle = document.getElementById('nav-toggle');
            const menu = document.getElementById('nav-menu');
            if (!nav) return;

            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        nav.classList.toggle('nav--scrolled', window.scrollY > 50);
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            if (toggle) {
                toggle.addEventListener('click', () => {
                    toggle.classList.toggle('active');
                    menu.classList.toggle('active');
                    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
                });
            }

            document.querySelectorAll('.nav__link').forEach((link) => {
                link.addEventListener('click', () => {
                    toggle && toggle.classList.remove('active');
                    menu && menu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });

            nav.classList.toggle('nav--scrolled', window.scrollY > 50);
        },
    };

    // ==========================================================================
    // COUNTER ANIMATION
    // ==========================================================================
    const CounterAnimation = {
        init() {
            const counters = document.querySelectorAll('.stat__number[data-count]');
            if (!counters.length) return;

            const observer = new IntersectionObserver(
                (entries) => entries.forEach((entry) => {
                    if (entry.isIntersecting) { this.animate(entry.target); observer.unobserve(entry.target); }
                }),
                { threshold: 0.5 }
            );
            counters.forEach((el) => observer.observe(el));
        },

        animate(el) {
            const target = parseInt(el.getAttribute('data-count'), 10);
            if (prefersReducedMotion) { el.textContent = target; return; }
            const start = performance.now();
            const update = (now) => {
                const progress = Math.min((now - start) / 2000, 1);
                el.textContent = Math.round((1 - Math.pow(1 - progress, 3)) * target);
                if (progress < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        },
    };

    // ==========================================================================
    // SPOTLIGHT CARD EFFECT
    // ==========================================================================
    const SpotlightCards = {
        init() {
            if (prefersReducedMotion) return;
            const cards = document.querySelectorAll('[data-spotlight]');
            if (!cards.length) return;

            document.addEventListener('pointermove', (e) => {
                cards.forEach((card) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty('--spotlight-x', x + 'px');
                    card.style.setProperty('--spotlight-y', y + 'px');
                    const buffer = 50;
                    const isNear = e.clientX >= rect.left - buffer && e.clientX <= rect.right + buffer &&
                                   e.clientY >= rect.top - buffer && e.clientY <= rect.bottom + buffer;
                    card.style.setProperty('--spotlight-opacity', isNear ? '1' : '0');
                    card.style.setProperty('--border-glow-opacity', isNear ? '1' : '0');
                });
            });

            document.addEventListener('pointerleave', () => {
                cards.forEach((card) => {
                    card.style.setProperty('--spotlight-opacity', '0');
                    card.style.setProperty('--border-glow-opacity', '0');
                });
            });
        },
    };

    // ==========================================================================
    // FAQ ACCORDION
    // ==========================================================================
    const FAQ = {
        init() {
            document.querySelectorAll('.faq__question').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const item = btn.closest('.faq__item');
                    const isOpen = item.classList.contains('is-open');

                    document.querySelectorAll('.faq__item.is-open').forEach((open) => {
                        open.classList.remove('is-open');
                        open.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
                    });

                    if (!isOpen) {
                        item.classList.add('is-open');
                        btn.setAttribute('aria-expanded', 'true');
                    }
                });
            });
        },
    };

    // ==========================================================================
    // SMOOTH SCROLL
    // ==========================================================================
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(anchor.getAttribute('href'));
                    if (target) {
                        const y = target.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                    }
                });
            });
        },
    };

    // ==========================================================================
    // CONTACT FORM — Formspree AJAX
    // ==========================================================================
    const ContactForm = {
        init() {
            const form = document.getElementById('contact-form');
            if (!form) return;

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('.btn');
                const span = btn.querySelector('span');
                const original = span.textContent;

                span.textContent = 'Wird gesendet…';
                btn.disabled = true;
                btn.style.opacity = '0.7';

                try {
                    const response = await fetch('https://formspree.io/f/xpwqkpgo', {
                        method: 'POST',
                        headers: { 'Accept': 'application/json' },
                        body: new FormData(form),
                    });

                    if (response.ok) {
                        span.textContent = '✓ Nachricht gesendet!';
                        btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                        btn.style.color = '#fff';
                        setTimeout(() => {
                            span.textContent = original;
                            btn.disabled = false;
                            btn.style.opacity = '';
                            btn.style.background = '';
                            btn.style.color = '';
                            form.reset();
                        }, 3000);
                    } else {
                        throw new Error('Server error');
                    }
                } catch {
                    span.textContent = 'Fehler — bitte per E-Mail kontaktieren';
                    btn.style.opacity = '0.5';
                    setTimeout(() => {
                        span.textContent = original;
                        btn.disabled = false;
                        btn.style.opacity = '';
                    }, 3000);
                }
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
        FAQ.init();
        SmoothScroll.init();
        ContactForm.init();
    });
})();
