// Kalacore Studio · Main Engine
// Using standard library script tags (GSAP, Three.js, Lenis) loaded in index.html


let lenis; // Define globally so it can be accessed everywhere
// SAFETY FALLBACK: Force unlock scroll after 4s regardless of loader state
setTimeout(() => {
    if (typeof lenis !== 'undefined') lenis.start();
    const preloader = document.getElementById('preloader');
    if (preloader && preloader.style.display !== 'none') {
        if (typeof gsap !== 'undefined') {
            gsap.to(preloader, { opacity: 0, duration: 1, onComplete: () => preloader.style.display = 'none' });
        } else {
            preloader.style.display = 'none';
        }
    }
}, 4000);

// ─── CUSTOM CURSOR ───────────────────────────
const cursor = document.getElementById('cursorDot');
let mx = 0, my = 0;
let cursorVisible = false;

window.addEventListener('mousemove', (e) => { 
    mx = e.clientX; 
    my = e.clientY; 
    if (!cursorVisible && typeof gsap !== 'undefined' && cursor) {
        cursorVisible = true;
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
    }
});

// Added: Click feedback animation with paint splash
window.addEventListener('mousedown', (e) => {
    if (cursor) cursor.classList.add('active');
    createSplash(e.clientX, e.clientY);
});
window.addEventListener('mouseup', () => cursor ? cursor.classList.remove('active') : null);

function createSplash(x, y) {
    if (typeof gsap === 'undefined') return;
    const splash = document.createElement('div');
    splash.className = 'cursor-splash';
    document.body.appendChild(splash);
    
    gsap.set(splash, { 
        x: x, 
        y: y, 
        xPercent: -50, 
        yPercent: -50,
        scale: 0,
        opacity: 0.6,
        backgroundColor: ['#e63946', '#f4a261', '#2a9d8f'][Math.floor(Math.random() * 3)]
    });
    
    gsap.to(splash, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => splash.remove()
    });
}

const tickCursor = () => {
    if (typeof gsap === 'undefined' || !cursor) {
        requestAnimationFrame(tickCursor);
        return;
    }
    // We use xPercent and yPercent to align the brush tip (at ~38% x and ~20% y of the SVG)
    gsap.set(cursor, { 
        x: mx, 
        y: my,
        xPercent: -38,
        yPercent: -20
    });
    const drop = document.getElementById('cursorDrop');
    if (drop) {
        gsap.to(drop, {
            x: mx, 
            y: my, 
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto"
        });
        if (cursorVisible) gsap.set(drop, { opacity: 0.45 });
    }
    requestAnimationFrame(tickCursor);
};
requestAnimationFrame(tickCursor);

function refreshCursorHover() {
    document.querySelectorAll('a, button, .project-card, .text-block, .btn-pill, .video-card, .glimpse-card, .course-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
}
refreshCursorHover();

// ─── VIDEO SOUND TOGGLE (Play Icon = Unmute, Pause Icon = Mute) ───
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

// ─── NAV TIME UPDATE ────────────────────────
const timeDisplay = document.getElementById('localTime');
function updateTime() {
    if (!timeDisplay) return;
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
}
setInterval(updateTime, 1000);
updateTime();

// ─── AVAILABILITY BADGE (red on Sunday) ──────
const badge = document.getElementById('availBadge');
if (badge) {
    const day = new Date().getDay(); // 0 = Sunday
    if (day === 0) {
        badge.textContent = '✦ Unavailable';
        badge.classList.add('unavailable');
    }
}

// ─── HERO PARALLAX (Mouse) ───────────────────
const illusLeft  = document.getElementById('illusLeft');
const illusRight = document.getElementById('illusRight');
const studioCard = document.getElementById('videoCard');

let targetLX = 0, targetLY = 0;
let targetRX = 0, targetRY = 0;
let curLX = 0, curLY = 0;
let curRX = 0, curRY = 0;

window.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    // Left illus → pushed slightly opposite to cursor
    targetLX = -cx * 18;
    targetLY = -cy * 12;
    // Right illus → pushed same direction but mirrored
    targetRX =  cx * 18;
    targetRY = -cy * 12;

    // Studio card tilts slightly
    if (studioCard && typeof gsap !== 'undefined') {
        gsap.to(studioCard, {
            rotateX: cy * -4,
            rotateY: cx * 4,
            duration: 0.8,
            ease: 'power2.out'
        });
    }
});

const tickIllus = () => {
    curLX += (targetLX - curLX) * 0.06;
    curLY += (targetLY - curLY) * 0.06;
    curRX += (targetRX - curRX) * 0.06;
    curRY += (targetRY - curRY) * 0.06;

    // Use translateX/Y only — CSS handles the rotation
    if (illusLeft)  { illusLeft.style.translate  = `${curLX}px ${curLY}px`; }
    if (illusRight) { illusRight.style.translate = `${curRX}px ${curRY}px`; }

    requestAnimationFrame(tickIllus);
};
requestAnimationFrame(tickIllus);

// ─── MAIN ENGINE START ──────────────────────────
function initApp() {
    // ─── INITIALIZE LIBS SAFELY ──────────────────
    if (typeof gsap !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            syncTouch: true,
            wheelMultiplier: 1
        });

        // Drive Lenis via GSAP ticker
        function update(time) {
            if (lenis) lenis.raf(time * 1000);
        }
        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        // NAVBAR SCROLL STYLE 
        const navbar = document.getElementById('navbar');
        if (navbar) {
            lenis.on('scroll', ({ scroll }) => {
                navbar.style.boxShadow = scroll > 30 ? '0 4px 24px rgba(0,0,64,0.08)' : 'none';
            });
        }
        
        // Lock scroll initially for preloader
        lenis.stop();
    }

    // ─── MOBILE MENU TOGGLE ──────────────────────
    const menuToggle = document.querySelector('.nav-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // ─── UNIFIED TYPEWRITER ENGINE ───────────────
    const headline = document.getElementById('typewriterHeadline');
    let headlineSequence = [];

    if (headline) {
        const nodes = Array.from(headline.childNodes);
        headline.textContent = '';
        
        const cursor = document.createElement('div');
        cursor.className = 'typewriter-cursor';
        headline.cursor = cursor;
        
        nodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (text.trim() === '') {
                    // pure whitespace/newlines, keep them in DOM but don't animate
                    headline.appendChild(document.createTextNode(text));
                } else {
                    // Contains actual text. Wrap in a span to animate.
                    const span = document.createElement('span');
                    span.textContent = text;
                    span.className = 'headline-static-text'; 
                    span.style.opacity = '0'; // hidden initially
                    headline.appendChild(span);
                    headlineSequence.push({ type: 'static', el: span });
                }
            } else if (node.nodeName === 'BR') {
                headline.appendChild(document.createElement('br'));
            } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('handwritten')) {
                const wrapper = document.createElement('span');
                wrapper.className = 'handwritten';
                const text = node.textContent;
                const chars = [];
                [...text].forEach(char => {
                    const charSpan = document.createElement('span');
                    charSpan.textContent = char;
                    charSpan.className = 'char';
                    wrapper.appendChild(charSpan);
                    chars.push(charSpan);
                });
                headline.appendChild(wrapper);
                headlineSequence.push({ type: 'typewriter', el: wrapper, chars: chars });
            }
        });
    }

    // ─── PRELOADER ENGINE ──────
    const preloader = document.getElementById('preloader');
    const loadBar = document.getElementById('preloaderBar');
    const preloaderInteractive = document.getElementById('preloaderInteractive');
    const loadCounter = document.getElementById('preloaderCounter');
    
    // ─── HERO ENTRANCE ANIMATIONS ────────────────
    const heroTl = gsap.timeline({ paused: true, delay: 0.1 });

    if (preloader) {
        // Force preloader as flex and lock scroll initially
        if (typeof lenis !== 'undefined') lenis.stop();
        preloader.style.display = 'flex';
        
        // --- Liquid Splash Canvas Effect ---
        let cw = window.innerWidth, ch = window.innerHeight;
        let ctx = null;
        let splashes = [];
        let rAF_ID = null;
        const splashCanvas = document.getElementById('preloaderCanvas');

        if (splashCanvas) {
            ctx = splashCanvas.getContext('2d', { alpha: true });
            splashCanvas.width = cw; splashCanvas.height = ch;
            const colors = ['#FDE7CF', '#e63946', '#f4a261', '#2a9d8f'];
            
            const orbs = [];
            for (let i = 0; i < 6; i++) {
                orbs.push({
                    angle: Math.random() * Math.PI * 2,
                    radius: Math.random() * 150 + 50,
                    speed: (Math.random() * 0.015 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
                    r: Math.random() * 140 + 80,
                    color: colors[i % colors.length],
                    ox: (Math.random() - 0.5) * 100,
                    oy: (Math.random() - 0.5) * 100
                });
            }
            
            preloader.addEventListener('mousemove', (e) => {
                splashes.push({
                    x: e.clientX, y: e.clientY,
                    r: Math.random() * 50 + 30,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5
                });
            });

            const renderSplashes = () => {
                if (!ctx) return;
                // Luxury Navy background for the canvas itself
                ctx.fillStyle = '#000040';
                ctx.globalAlpha = 1;
                ctx.fillRect(0, 0, cw, ch);
                
                // 1) Continuous Fluid Orbs behind logo
                orbs.forEach(orb => {
                    orb.angle += orb.speed;
                    let nx = (cw / 2) + Math.cos(orb.angle) * orb.radius + orb.ox;
                    let ny = (ch / 2) + Math.sin(orb.angle) * orb.radius + orb.oy;
                    
                    ctx.beginPath();
                    ctx.arc(nx, ny, orb.r, 0, Math.PI * 2);
                    ctx.fillStyle = orb.color;
                    ctx.globalAlpha = 0.85; // Vibrant and premium
                    ctx.fill();
                });
                
                // 2) Cursor Splashes with trails
                for (let i = splashes.length - 1; i >= 0; i--) {
                    let p = splashes[i];
                    p.life -= 0.015;
                    if (p.life <= 0) { splashes.splice(i, 1); continue; }
                    p.x += p.vx; p.y += p.vy;
                    p.r += 1.2; // Faster expansion
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life * p.life * 0.8;
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
                
                if (preloader.style.display !== 'none') {
                    rAF_ID = requestAnimationFrame(renderSplashes);
                }
            };
            rAF_ID = requestAnimationFrame(renderSplashes);
            
            window.addEventListener('resize', () => {
                cw = splashCanvas.width = window.innerWidth;
                ch = splashCanvas.height = window.innerHeight;
            });
        }
        
        // --- Interactive Parallax  ---
        const updatePlax = (e) => {
            if (!preloaderInteractive || typeof gsap === 'undefined') return;
            const px = (e.clientX / window.innerWidth - 0.5) * 2;
            const py = (e.clientY / window.innerHeight - 0.5) * 2;
            gsap.to(preloaderInteractive, {
                x: px * 45, y: py * 30,
                rotateX: -py * 10, rotateY: px * 10,
                duration: 0.8, ease: "power3.out"
            });
        };
        preloader.addEventListener('mousemove', updatePlax);

        const loadProgress = { val: 0 };
        gsap.to(loadProgress, {
            val: 100,
            duration: 2, // Further reduced to 2s to keep total load under 3s
            ease: "none", // Linear fill for precision
            onUpdate: () => {
                const p = Math.round(loadProgress.val);
                if (loadBar) loadBar.style.width = p + '%';
                if (loadCounter) loadCounter.textContent = p + '%';
                
                const brand = document.getElementById('preloaderBrand');
                if (brand) {
                    const scale = 1 + (Math.sin(loadProgress.val * 0.1) * 0.02);
                    brand.style.transform = `scale(${scale})`;
                }
            },
            onComplete: () => {
                gsap.to(preloaderInteractive, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.8,
                    ease: "power2.inOut"
                });
                
                preloader.removeEventListener('mousemove', updatePlax);
                
                gsap.to(preloader, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: "expo.inOut",
                    delay: 0.1,
                    onComplete: () => {
                        preloader.style.display = 'none';
                        if (rAF_ID) cancelAnimationFrame(rAF_ID);
                        if (typeof lenis !== 'undefined') lenis.start();
                    }
                });
                gsap.delayedCall(0.5, () => heroTl.play());
            }
        });
    } else {
        heroTl.play();
        lenis.start();
    }

    heroTl
        .from('.video-card', {
            opacity: 0, scale: 0.8, y: 30,
            duration: 1, ease: 'back.out(1.4)'
        })
        .from('.hero-eyebrow', {
            opacity: 0, y: 10,
            duration: 0.7, ease: 'power2.out'
        }, '-=0.5');

    if (headline) {
        headlineSequence.forEach((item) => {
            if (item.type === 'static') {
                heroTl.to(item.el, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '+=0.1');
            } else if (item.type === 'typewriter') {
                // Add cursor just before starting to type this block
                heroTl.call(() => { item.el.prepend(headline.cursor); }, null, '+=0.05');
                item.chars.forEach((char) => {
                    heroTl.call(() => {
                        char.style.opacity = '1';
                        char.className = 'char reveal';
                        
                        // Reliably move cursor
                        if (char.nextSibling) {
                            char.parentNode.insertBefore(headline.cursor, char.nextSibling);
                        } else {
                            char.parentNode.appendChild(headline.cursor);
                        }
                    }, null, '+=0.06'); // Speed of handwriting effect
                });
                // Small pause after word finishes
                heroTl.set({}, {}, '+=0.3');
            }
        });
        
        // Hide cursor at the very end of typing
        heroTl.call(() => {
            if (headline.cursor) headline.cursor.style.display = 'none';
        }, null, '+=1.0');
    }

    heroTl.from('.hero-subtext', {
        opacity: 0, y: 16,
        duration: 0.8, ease: 'power2.out'
    }, '+=0.2')
    .from('.hero-cta-wrap', {
        opacity: 0, y: 16,
        duration: 0.7, ease: 'power2.out'
    }, '-=0.4')
    .from('.hero-tags .tag', {
        opacity: 0, y: 10, scale: 0.95,
        duration: 0.5, stagger: 0.08,
        ease: 'back.out(1.5)'
    }, '-=0.3')
    .from(['.hero-illus--left', '.hero-illus--right'], {
        opacity: 0, x: (i) => i === 0 ? -40 : 40,
        duration: 1.2, ease: 'expo.out', stagger: 0.1
    }, 0.4)
    .from('.scroll-cue', {
        opacity: 0, duration: 1, ease: 'power2.out'
    }, '-=0.3');

    // ─── COURSES SECTION ANIMATION ────────────────
    gsap.from('.course-card', {
        scrollTrigger: {
            trigger: '.courses-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // ─── STUDENT WORK SCROLL ANIMATION ──────────────────
    gsap.utils.toArray('.glimpse-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 60,
            duration: 1.2,
            ease: 'expo.out'
        });
    });

    // ─── REAL TALK SCROLL ANIMATION ─────────────────────
    const realTalkSection = document.querySelector('.real-talk-section');
    if (realTalkSection) {
        gsap.from(realTalkSection.querySelector('.real-talk-heading'), {
            scrollTrigger: {
                trigger: realTalkSection,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: 'expo.out'
        });
        gsap.from(realTalkSection.querySelector('.real-talk-subtext'), {
            scrollTrigger: {
                trigger: realTalkSection,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 1.2,
            delay: 0.1,
            ease: 'expo.out'
        });
        gsap.from(realTalkSection.querySelectorAll('.video-card-small'), {
            scrollTrigger: {
                trigger: realTalkSection,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out'
        });

        // ─── AGGRESSIVE HOVER-TO-SOUND LOGIC ──────────
        const talkCards = realTalkSection.querySelectorAll('.video-card-small');
        
        talkCards.forEach(card => {
            const v = card.querySelector('video');
            if (v) {
                v.muted = true; // Safe start
                v.pause();

                card.addEventListener('mouseenter', () => {
                    v.currentTime = 0; 
                    v.muted = false; // Demand sound
                    v.volume = 1.0;
                    
                    const playPromise = v.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {
                            // If audio is still blocked by browser, play muted so it's not broken
                            v.muted = true;
                            v.play();
                        });
                    }
                    if (typeof cursor !== 'undefined' && cursor) cursor.classList.add('hovered');
                });
                
                card.addEventListener('mouseleave', () => {
                    v.pause();
                    v.muted = true; 
                    if (typeof cursor !== 'undefined' && cursor) cursor.classList.remove('hovered');
                });
            }
        });

        // ─── THE AUDIO 'KEY' ───
        // Priming audio context on first user click anywhere - unblocks hover sound site-wide
        const primeAudio = () => {
            talkCards.forEach(card => {
                const v = card.querySelector('video');
                if (v) {
                    v.load(); 
                    v.play().then(() => { v.pause(); v.currentTime = 0; }).catch(() => {});
                }
            });
            window.removeEventListener('click', primeAudio);
            window.removeEventListener('touchstart', primeAudio);
        };
        window.addEventListener('click', primeAudio);
        window.addEventListener('touchstart', primeAudio);

        // ─── EDUCATION SECTION SPOTLIGHT JS ───
        const educationSection = document.querySelector('.hanging-gallery-container');
        if (educationSection) {
            educationSection.addEventListener('mousemove', (e) => {
                const rect = educationSection.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                educationSection.style.setProperty('--mouse-x', `${x}%`);
                educationSection.style.setProperty('--mouse-y', `${y}%`);
            });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Ensure ScrollTrigger refreshes when everything is ready
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

// ─── SCROLL FADE-IN ELEMENTS ─────────────────
document.querySelectorAll('.text-block, .project-card, .about-left, .lab-inner').forEach((el, i) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 1.0,
        delay: i * 0.05,
        ease: 'expo.out'
    });
});



// ─── HERO SCROLL PARALLAX ────────────────────
gsap.to('.hero-headline', {
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top', end: 'bottom top', scrub: 1
    },
    y: -80, opacity: 0.2
});

gsap.to('.hero-illus--left', {
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top', end: 'bottom top', scrub: 1
    },
    y: 80, x: -30, rotate: -10 
});

gsap.to('.hero-illus--right', {
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top', end: 'bottom top', scrub: 1
    },
    y: 120, x: 20, rotate: 10
});

// ─── WORK SECTION COUNTER ────────────────────
gsap.from('.project-num', {
    scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 0, y: 20,
    duration: 0.8, stagger: 0.15,
    ease: 'power2.out'
});

// ─── LAB SECTION (dark bg) ───────────────────
// Three.js canvas only on the lab section
(async () => {
    try {
        if (typeof THREE === 'undefined') return;
        const canvas = document.createElement('canvas');
        canvas.id = 'lab-canvas';
        canvas.style.cssText = `
            position:absolute;inset:0;width:100%;height:100%;
            pointer-events:none;opacity:0.35;
        `;
        const labSection = document.getElementById('experimental');
        if (!labSection) return;
        labSection.style.position = 'relative';
        labSection.style.overflow = 'hidden';
        labSection.prepend(canvas);

        const scene    = new THREE.Scene();
        const camera   = new THREE.PerspectiveCamera(60, labSection.offsetWidth / labSection.offsetHeight, 0.1, 200);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(labSection.offsetWidth, labSection.offsetHeight);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // Particles
        const geo = new THREE.BufferGeometry();
        const N   = 2000;
        const pos = new Float32Array(N * 3);
        for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 20;
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat   = new THREE.PointsMaterial({ color: 0xFDE7CF, size: 0.06, transparent: true, opacity: 0.7 });
        const pts   = new THREE.Points(geo, mat);
        scene.add(pts);

        // Floating icosahedra
        const items = [];
        const iMat  = new THREE.MeshStandardMaterial({ color: 0xFDE7CF, wireframe: true, transparent: true, opacity: 0.2 });
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));

        for (let i = 0; i < 20; i++) {
            const m = new THREE.Mesh(new THREE.IcosahedronGeometry(Math.random() * 0.3 + 0.08, 0), iMat);
            m.position.set((Math.random()-0.5)*14, (Math.random()-0.5)*8, (Math.random()-0.5)*8);
            m.userData = { oy: m.position.y, off: Math.random() * Math.PI * 2, rs: (Math.random()-0.5)*0.01 };
            scene.add(m); items.push(m);
        }

        let labMx = 0, labMy = 0;
        window.addEventListener('mousemove', (e) => {
            labMx = (e.clientX / innerWidth  - 0.5) * 2;
            labMy = (e.clientY / innerHeight - 0.5) * 2;
        });

        const tick = () => {
            const t = Date.now() * 0.001;
            pts.rotation.y += 0.0003;
            items.forEach(el => {
                el.rotation.x += el.userData.rs;
                el.rotation.y += el.userData.rs;
                el.position.y  = el.userData.oy + Math.sin(t + el.userData.off) * 0.3;
            });
            camera.position.x += (labMx * 0.6 - camera.position.x) * 0.04;
            camera.position.y += (labMy * 0.4 - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };
        tick();

        window.addEventListener('resize', () => {
            renderer.setSize(labSection.offsetWidth, labSection.offsetHeight);
            camera.aspect = labSection.offsetWidth / labSection.offsetHeight;
            camera.updateProjectionMatrix();
        });
    } catch(e) { console.error('Three.js failed'); }
})();

// ─── REGISTRATION FORM HANDLER ────────────────
const enrollForm = document.getElementById('enrollForm');
const formStatus = document.getElementById('formStatus');
const successOverlay = document.getElementById('successOverlay');
const closeSuccess = document.getElementById('closeSuccess');

// Google Apps Script URL provided by user
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxtlCVJtsRb4I1QPZjRDFpMy2pUSf7VYunslhMVhMzSHMqRDTilfJFyjvSv1aqCYRQ2ag/exec';

if (enrollForm) {
    enrollForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        // Visual Feedback
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>SENDING...</span>';
        
        const formData = new FormData(enrollForm);
        
        // For Google Apps Script, we use a simple POST. 
        // Note: 'no-cors' is used because GAS redirects (302) which fetch blocks in 'cors' mode.
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        })
        .then(() => {
            // Since it's no-cors, we assume success if the request was sent
            if (successOverlay) {
                successOverlay.classList.add('active');
                
                // Auto-close after 2 seconds as requested
                setTimeout(() => {
                    successOverlay.classList.remove('active');
                }, 2000);
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
    });
}

if (closeSuccess && successOverlay) {
    closeSuccess.addEventListener('click', () => {
        successOverlay.classList.remove('active');
    });
}
