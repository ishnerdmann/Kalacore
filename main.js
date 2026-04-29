console.log('MainEngine: Script loading v1.5...');
let lenis; // Define globally

// ─── SAFETY FALLBACK (Aggressive) ───
// This ensures the preloader is ALWAYS removed, even if GSAP or other scripts fail.
const forceHidePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader && preloader.style.display !== 'none') {
        console.warn('MainEngine: Forcing preloader hide via safety fallback');
        preloader.style.transition = 'opacity 0.8s ease, visibility 0.8s';
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.style.overflow = 'auto'; // Fallback if Lenis failed
        }, 800);
    }
};
const safetyTimeout = setTimeout(forceHidePreloader, 4000);

// ─── SIMPLE PROGRESS BAR (Independent of GSAP) ───
const startProgress = () => {
    const loadBar = document.getElementById('preloaderBar');
    const loadCounter = document.getElementById('preloaderCounter');
    if (!loadBar || !loadCounter) return;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            console.log('MainEngine: Progress reached 100%');
            // Trigger the actual reveal if GSAP didn't do it
            setTimeout(revealSite, 100);
        }
        loadBar.style.width = progress + '%';
        loadCounter.textContent = Math.round(progress) + '%';
    }, 150);
};

// ─── REVEAL SITE ───
const revealSite = () => {
    const preloader = document.getElementById('preloader');
    const preloaderInteractive = document.getElementById('preloaderInteractive');
    
    if (!preloader || preloader.style.display === 'none') return;
    
    console.log('MainEngine: Executing Reveal...');
    clearTimeout(safetyTimeout);

    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({
            onComplete: () => {
                preloader.style.display = 'none';
                if (typeof lenis !== 'undefined' && lenis) lenis.start();
                initEntranceAnimations();
            }
        });
        tl.to(preloaderInteractive, { opacity: 0, y: -20, duration: 0.4 })
          .to(preloader, { yPercent: -100, duration: 0.6, ease: "expo.inOut" }, "-=0.2");
    } else {
        forceHidePreloader();
    }
};

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
    
    // Start progress immediately
    startProgress();

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
            lenis.stop();
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
