/* =============================================
   main.js — Portfolio Interactions
   ============================================= */

// ── Scroll-triggered fade-in ─────────────────────────────────────
const fadeCandidates = document.querySelectorAll('.fade-in-up');

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

fadeCandidates.forEach((el) => observer.observe(el));


// ── Count-up animation ───────────────────────────────────────────
const countEl = document.querySelector('.hero__count');
let counted = false;

function countUp(el, target, duration = 1200) {
    const start = performance.now();
    const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

const heroObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !counted) {
                counted = true;
                countUp(countEl, 10);
                heroObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.5 }
);

if (countEl) heroObserver.observe(countEl);


// ── Nav: scroll class & hamburger ───────────────────────────────
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');
const navLinks = navList ? navList.querySelectorAll('.nav__link') : [];

window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 10);
}, { passive: true });

navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close menu on link click
navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        navList.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
        navList.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
    }
});


// ── Smooth scroll (handles nav-height offset) ────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});


// ── Works accordion ──────────────────────────────────────────────
document.querySelectorAll('.work-card__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.work-card');
        const detail = card.querySelector('.work-card__detail');
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
            // Close
            detail.style.maxHeight = detail.scrollHeight + 'px';
            requestAnimationFrame(() => {
                detail.style.transition = 'max-height 0.35s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.25s ease';
                detail.style.maxHeight = '0';
                detail.style.opacity = '0';
            });
            detail.addEventListener('transitionend', () => {
                detail.hidden = true;
                detail.style.maxHeight = '';
                detail.style.opacity = '';
                detail.style.transition = '';
            }, { once: true });
            btn.setAttribute('aria-expanded', 'false');
        } else {
            // Open
            detail.hidden = false;
            detail.style.maxHeight = '0';
            detail.style.opacity = '0';
            requestAnimationFrame(() => {
                detail.style.transition = 'max-height 0.45s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.35s ease';
                detail.style.maxHeight = detail.scrollHeight + 'px';
                detail.style.opacity = '1';
            });
            detail.addEventListener('transitionend', () => {
                detail.style.maxHeight = '';
                detail.style.transition = '';
            }, { once: true });
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

// Also allow clicking the whole header to toggle
document.querySelectorAll('.work-card__header').forEach((header) => {
    header.addEventListener('click', (e) => {
        // avoid double-fire when clicking the button itself
        if (e.target.closest('.work-card__toggle')) return;
        const btn = header.querySelector('.work-card__toggle');
        if (btn) btn.click();
    });
});


// ── Subtle parallax on hero orbs ────────────────────────────────
const orb1 = document.querySelector('.hero__orb--1');
const orb2 = document.querySelector('.hero__orb--2');

window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    if (orb1) orb1.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
    if (orb2) orb2.style.transform = `translate(${-x * 0.4}px, ${-y * 0.4}px)`;
}, { passive: true });

// ── Hero Card Stack Interaction ────────────────────────────────
const heroCards = Array.from(document.querySelectorAll('.hcard'));
if (heroCards.length === 3) {
    // Initial state matches CSS classes: 0=back, 1=mid, 2=front (array index)
    // We'll manage their classes dynamically on click.
    const classes = ['hcard--pos-back', 'hcard--pos-mid', 'hcard--pos-front'];

    // Set initial positional classes instead of hardcoded ones in HTML
    heroCards.forEach((card, index) => {
        card.classList.add(classes[index]);

        card.addEventListener('click', () => {
            // Find current index of clicked card in the stack order
            const currentPos = classes.findIndex(cls => card.classList.contains(cls));

            // If clicked the front card, do nothing
            if (currentPos === 2) return;

            // We want to bring the clicked card to 'front' (pos-front), 
            // push the current front to 'mid', and current mid to 'back'.
            // Basically, we cycle the classes among the elements based on what was clicked.

            const elBack = document.querySelector('.hcard--pos-back');
            const elMid = document.querySelector('.hcard--pos-mid');
            const elFront = document.querySelector('.hcard--pos-front');

            // Remove old classes
            elBack.classList.remove('hcard--pos-back');
            elMid.classList.remove('hcard--pos-mid');
            elFront.classList.remove('hcard--pos-front');

            if (currentPos === 0) {
                // Clicked Back -> Back becomes Front, Mid becomes Back, Front becomes Mid
                card.classList.add('hcard--pos-front');
                elMid.classList.add('hcard--pos-back');
                elFront.classList.add('hcard--pos-mid');
            } else if (currentPos === 1) {
                // Clicked Mid -> Mid becomes Front, Front becomes Back, Back becomes Mid
                card.classList.add('hcard--pos-front');
                elFront.classList.add('hcard--pos-back');
                elBack.classList.add('hcard--pos-mid');
            }
        });
    });
}

