const initBtn = document.getElementById('init-btn');
const preloader = document.getElementById('preloader');
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

let audioCtx; // Audio context for binary sound

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*'.split('');
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = [];

for (let x = 0; x < columns; x++) { drops[x] = 1; }

function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.1)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFD700'; 
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

initBtn.addEventListener('click', async () => {
    // Initialize AudioContext on user interaction
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
    
    initBtn.style.display = 'none';
    canvas.style.opacity = '1';
    
    const matrixInterval = setInterval(drawMatrix, 35);

    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => { clearInterval(matrixInterval); }, 1000); 
    }, 2500); 
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const trailChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>[]{}|+'; 
let lastTrailTime = 0;
let lastSoundTime = 0;

function playBinarySound() {
    if (!audioCtx) return;
    
    // If suspended by browser policy, try to resume
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
        return; // Skip playing this specific beep while it resumes
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    // Random high frequency for data sound
    osc.frequency.setValueAtTime(800 + Math.random() * 2000, audioCtx.currentTime);
    
    // Very short and quiet beep (slightly boosted volume for deployed sites)
    gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function createTrail(e) {
    const currentTime = Date.now();
    
    if (currentTime - lastTrailTime < 20) return;
    lastTrailTime = currentTime;

    if (currentTime - lastSoundTime > 60) {
        lastSoundTime = currentTime;
        playBinarySound();
    }

    const pageX = e.pageX || (e.touches && e.touches[0].pageX);
    const pageY = e.pageY || (e.touches && e.touches[0].pageY);
    
    for (let i = 0; i < 4; i++) {
        const trail = document.createElement('span');
        trail.className = 'matrix-trail-char';
        trail.innerText = trailChars[Math.floor(Math.random() * trailChars.length)];
        
        trail.style.left = pageX + 'px'; 
        trail.style.top = pageY + 'px';
        document.body.appendChild(trail);

        const spreadX = (Math.random() - 0.5) * 120; 
        const spreadY = (Math.random() * 80) + 20; 
        const scale = Math.random() * 0.6 + 0.4; 

        void trail.offsetWidth; 

        trail.style.opacity = '0';
        trail.style.transform = `translate(${spreadX}px, ${spreadY}px) scale(${scale})`;

        setTimeout(() => { trail.remove(); }, 800); 
    }
}
document.addEventListener('mousemove', createTrail);
document.addEventListener('touchmove', createTrail, { passive: true });

const globeContainer = document.getElementById('globe-container');

if (globeContainer) {
    
    // Generate 10 completely random arcs (Change the '10' below to adjust the amount)
    const randomArcs = [];
    for (let i = 0; i < 10; i++) {
        randomArcs.push({
            startLat: (Math.random() - 0.5) * 180,
            startLng: (Math.random() - 0.5) * 360,
            endLat: (Math.random() - 0.5) * 180,
            endLng: (Math.random() - 0.5) * 360,
            color: ['#FFD700', '#FFD700']
        });
    }

    const world = Globe({ animateIn: true })(globeContainer)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .backgroundColor('rgba(0,0,0,0)') 
        .width(globeContainer.clientWidth)
        .height(globeContainer.clientHeight)
        
        // Feed the randomly generated array into the globe data
        .arcsData(randomArcs)
        .arcColor('color')
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(1500)
        .arcStroke(1)
        .pointOfView({ lat: 20, lng: 80, altitude: 2 }); 

    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 1.0;
    world.controls().enableZoom = false;

    window.addEventListener('resize', () => {
        world.width(globeContainer.clientWidth);
        world.height(globeContainer.clientHeight);
    });
}