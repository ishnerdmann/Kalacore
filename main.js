console.log('MainEngine: Script loading v1.9...');
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

// ─── CUSTOM CURSOR ───────────────────────────
const cursor = document.getElementById('cursorDot');
const cursorDrop = document.getElementById('cursorDrop');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let dropX = 0, dropY = 0;
let isMoving = false;
let moveTimeout;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Wake up dot immediately
    if (cursor) {
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        cursor.classList.add('active');
    }
    
    // Spawn small droplets randomly while moving
    if (Math.random() > 0.85) {
        const drop = document.createElement('div');
        drop.className = 'cursor-splash';
        drop.style.left = mouseX + 'px';
        drop.style.top = mouseY + 'px';
        document.body.appendChild(drop);
        setTimeout(() => drop.remove(), 600);
    }

    isMoving = true;
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
        isMoving = false;
        if (cursor) cursor.classList.remove('active');
    }, 150);
});

const tickCursor = () => {
    // Smooth trailing for the ink drop
    dropX += (mouseX - dropX) * 0.15;
    dropY += (mouseY - dropY) * 0.15;
    
    if (cursorDrop) {
        cursorDrop.style.transform = `translate(${dropX}px, ${dropY}px)`;
        
        // Stretch effect based on velocity
        const velX = mouseX - dropX;
        const velY = mouseY - dropY;
        const speed = Math.sqrt(velX*velX + velY*velY);
        const angle = Math.atan2(velY, velX) * 180 / Math.PI;
        
        if (speed > 5) {
            cursorDrop.style.width = Math.min(30 + speed * 0.3, 60) + 'px';
            cursorDrop.style.height = Math.max(30 - speed * 0.1, 15) + 'px';
            cursorDrop.style.transform += ` rotate(${angle}deg)`;
        } else {
            cursorDrop.style.width = '30px';
            cursorDrop.style.height = '30px';
        }
    }
    
    requestAnimationFrame(tickCursor);
};
requestAnimationFrame(tickCursor);

function refreshCursorHover() {
    document.querySelectorAll('a, button, .project-card, .text-block, .btn-pill, .video-card, .glimpse-card, .course-card, .product-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hovered'));
    });
}
refreshCursorHover();

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
        }
    } catch(e) { console.error('Lenis Init Error', e); }

    // Floating Parallax (Mouse)
    window.addEventListener('mousemove', (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;
        const illusLeft = document.getElementById('illusLeft');
        const illusRight = document.getElementById('illusRight');
        const stickerSkill = document.getElementById('stickerSkill');
        const stickerNsdpi = document.getElementById('stickerNsdpi');

        if (illusLeft) gsap.to(illusLeft, { x: -cx * 15, y: -cy * 10, duration: 0.8 });
        if (illusRight) gsap.to(illusRight, { x: cx * 15, y: -cy * 10, duration: 0.8 });
        if (stickerSkill) gsap.to(stickerSkill, { x: -cx * 25, y: cy * 15, duration: 1.2 });
        if (stickerNsdpi) gsap.to(stickerNsdpi, { x: cx * 25, y: cy * 15, duration: 1.2 });
    });

    // Mobile Menu
    const menuToggle = document.querySelector('.nav-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // Scroll Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        document.querySelectorAll('.glimpse-card, .course-card, .about-layout, .lab-inner, .product-card, .custom-order-banner, .registration-grid').forEach(el => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 30, duration: 0.8
            });
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('index.html') && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') return; 
            
            e.preventDefault();
            const targetId = href.startsWith('index.html') ? href.split('#')[1] : href.substring(1);
            if (!targetId || targetId === '#') return;
            
            const targetElement = document.getElementById(targetId) || document.querySelector(href);
            if (targetElement && lenis) {
                lenis.scrollTo(targetElement, { offset: -80 });
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // Video Sound Toggle (Home Page)
    const videoEl = document.getElementById('heroVideo');
    const playBtn = document.getElementById('videoToggle');
    if (videoEl && playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            videoEl.muted = !videoEl.muted;
            const pi = playBtn.querySelector('.play-icon');
            const psi = playBtn.querySelector('.pause-icon');
            if (videoEl.muted) {
                if (pi) pi.classList.remove('hidden');
                if (psi) psi.classList.add('hidden');
            } else {
                if (pi) pi.classList.add('hidden');
                if (psi) psi.classList.remove('hidden');
            }
        });
    }

    // Student Talk Videos (Hover Play/Pause)
    document.querySelectorAll('.video-card-small').forEach(card => {
        const v = card.querySelector('video');
        if (v) {
            v.pause();
            card.addEventListener('mouseenter', () => {
                v.currentTime = 0;
                v.muted = false;
                v.volume = 1.0;
                v.play().catch(() => { v.muted = true; v.play(); });
                if (cursor) cursor.classList.add('hovered');
            });
            card.addEventListener('click', () => { v.muted = !v.muted; });
            card.addEventListener('mouseleave', () => {
                v.pause();
                v.muted = true;
                if (cursor) cursor.classList.remove('hovered');
            });
        }
    });

    // Registration Form Handler
    const enrollForm = document.getElementById('enrollForm');
    if (enrollForm) {
        enrollForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const formStatus = document.getElementById('formStatus');
            const successOverlay = document.getElementById('successOverlay');
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxtlCVJtsRb4I1QPZjRDFpMy2pUSf7VYunslhMVhMzSHMqRDTilfJFyjvSv1aqCYRQ2ag/exec';
            
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>SENDING...</span>';
                
                const formData = new FormData(enrollForm);
                fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: formData })
                .then(() => {
                    if (successOverlay) {
                        successOverlay.classList.add('active');
                        setTimeout(() => successOverlay.classList.remove('active'), 4000);
                    }
                    enrollForm.reset();
                    if (formStatus) formStatus.textContent = '';
                })
                .catch(error => {
                    console.error('Submission Error:', error);
                    if (formStatus) {
                        formStatus.textContent = '✕ Error in sending. Please try again.';
                        formStatus.style.color = '#e63946';
                    }
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                });
            }
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
