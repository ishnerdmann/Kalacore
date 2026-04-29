console.log('MainEngine: Script loading v1.5...');
let lenis; // Define globally


// ─── ENTRANCE ANIMATIONS ───
const initEntranceAnimations = () => {
    if (typeof gsap === 'undefined') return;
    console.log('MainEngine: Starting entrance animations');
    
    gsap.from('.video-card', { opacity: 0, scale: 0.8, y: 30, duration: 1, ease: 'back.out(1.4)' });
    gsap.from('.hero-eyebrow', { opacity: 0, y: 10, duration: 0.7, delay: 0.3 });
    gsap.from('.hero-headline', { opacity: 0, y: 20, duration: 0.8, delay: 0.5 });
    gsap.from('.hero-subtext', { opacity: 0, y: 15, duration: 0.8, delay: 0.7 });
    gsap.from('.hero-cta-wrap', { opacity: 0, y: 15, duration: 0.7, delay: 0.9 });
};

// ─── APP INITIALIZATION ───
function initApp() {
    console.log('MainEngine: App Initialization triggered');
    
    // Start entrance animations immediately
    initEntranceAnimations();

    // Try initializing libraries
    try {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
    } catch(e) { console.error('GSAP Init Error', e); }

    try {
        if (typeof Lenis !== 'undefined') {
            lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
            function update(time) { if (lenis) lenis.raf(time * 1000); }
            if (typeof gsap !== 'undefined') gsap.ticker.add(update);
            // lenis is automatically started, no need to stop it
        }
    } catch(e) { console.error('Lenis Init Error', e); }

    // Floating Parallax (Mouse)
    window.addEventListener('mousemove', (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;
        const illusLeft = document.getElementById('illusLeft');
        const illusRight = document.getElementById('illusRight');
        if (illusLeft) gsap.to(illusLeft, { x: -cx * 15, y: -cy * 10, duration: 0.8 });
        if (illusRight) gsap.to(illusRight, { x: cx * 15, y: -cy * 10, duration: 0.8 });
    });

    // Mobile Menu
    const menuToggle = document.querySelector('.nav-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // Scroll Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        document.querySelectorAll('.glimpse-card, .course-card, .about-layout, .lab-inner').forEach(el => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 30, duration: 0.8
            });
        });
    }
}

// ─── BOOTSTRAP ───
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ─── NAV TIME ───
function updateTime() {
    const timeDisplay = document.getElementById('localTime');
    if (!timeDisplay) return;
    timeDisplay.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
setInterval(updateTime, 1000);
updateTime();
