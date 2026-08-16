if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
document.body.style.overflow = 'hidden';

const initBtn = document.getElementById('init-btn');
const preloader = document.getElementById('preloader');
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
const idlePrompt = document.getElementById('idle-prompt');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*'.split('');
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = [];

for (let x = 0; x < columns; x++) { drops[x] = 1; }

function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.15)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        
        ctx.fillStyle = '#a68a00'; // Dimmer gold for the trail
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        ctx.fillStyle = '#FFEB73'; // Bright yellow/white for the leading character
        ctx.fillText(text, i * fontSize, (drops[i] + 1) * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

let idleStatePhase = 0;
let idleTimeout = setInterval(() => {
    idleStatePhase++;
    if(idleStatePhase === 1) {
        idlePrompt.style.opacity = '1';
        idlePrompt.innerHTML = '>>> AWAITING SYSTEM INITIALIZATION <span class="blink">_</span>';
    } else if (idleStatePhase === 3) {
        idlePrompt.innerHTML = '>>> WARNING: IDLE STATE DETECTED.<br>PRESS [ INITIALIZE SYSTEM ] TO CONTINUE <span class="blink">_</span>';
    }
}, 2000);

initBtn.addEventListener('click', async () => {
    clearInterval(idleTimeout);
    idlePrompt.style.opacity = '0';
    initBtn.style.display = 'none';
    canvas.style.opacity = '1';
    
    const matrixInterval = setInterval(drawMatrix, 35);

    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        document.body.style.overflow = '';
        setTimeout(() => { clearInterval(matrixInterval); }, 1000); 
        animateStats();
    }, 2500); 
});

// --- Smooth Scrolling Animation for Stats ---
const statElements = document.querySelectorAll('header:nth-of-type(1) > div:nth-of-type(4) > div:nth-of-type(2) .stat-num');
const statTargets = [];

if (statElements.length > 0) {
    statElements.forEach(stat => {
        statTargets.push(stat.innerText);
        const suffix = stat.innerText.replace(/[0-9]/g, '');
        const isPadded = stat.innerText.startsWith('0');
        stat.innerText = (isPadded ? '00' : '0') + suffix;
    });
}

function animateStats() {
    if (!statElements || statElements.length === 0) return;
    
    statElements.forEach((stat, index) => {
        const text = statTargets[index];
        const target = parseInt(text.replace(/[^0-9]/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        const isPadded = text.startsWith('0');
        
        let startTime = null;
        const duration = 2000;
        
        function update(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentNum = Math.floor(easeOut * target);
            
            let displayNum = currentNum.toString();
            if (isPadded && currentNum < 10) {
                displayNum = '0' + displayNum;
            }
            
            stat.innerText = displayNum + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                stat.innerText = text;
            }
        }
        
        requestAnimationFrame(update);
    });
}
// ---------------------------------------------

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


const globeContainer = document.getElementById('globe-container');

if (globeContainer) {
    
    // Generate connecting arcs (representing data flow/network)
    const N = 30;
    const arcsData = [...Array(N).keys()].map(() => ({
        startLat: (Math.random() - 0.5) * 180,
        startLng: (Math.random() - 0.5) * 360,
        endLat: (Math.random() - 0.5) * 180,
        endLng: (Math.random() - 0.5) * 360,
        color: ['rgba(255, 215, 0, 0.1)', 'rgba(255, 215, 0, 0.9)']
    }));

    const world = Globe({ animateIn: true })(globeContainer)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundColor('rgba(0,0,0,0)') 
        .width(globeContainer.clientWidth)
        .height(globeContainer.clientHeight)
        .showAtmosphere(true)
        .atmosphereColor('#FFD700')
        .atmosphereAltitude(0.1)
        
        // Feed the randomly generated array into the globe data
        .arcsData(arcsData)
        .arcColor('color')
        .arcDashLength(0.5)
        .arcDashGap(2)
        .arcDashInitialGap(() => Math.random() * 5)
        .arcDashAnimateTime(2000)
        .arcStroke(0.5)
        .pointOfView({ lat: 20, lng: 80, altitude: 2.2 }); 

    // Adjusting material for a more premium look
    const globeMaterial = world.globeMaterial();
    globeMaterial.shininess = 0.5;

    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.7;
    world.controls().enableZoom = false;

    window.addEventListener('resize', () => {
        world.width(globeContainer.clientWidth);
        world.height(globeContainer.clientHeight);
    });
}
// --- Audio Toggle for Videos ---
document.addEventListener('DOMContentLoaded', () => {
    const audioToggles = document.querySelectorAll('.audio-toggle');
    audioToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening/zooming if added later
            const video = toggle.previousElementSibling;
            if (video && video.tagName === 'VIDEO') {
                video.muted = !video.muted;
                if (video.muted) {
                    toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
                    toggle.style.color = "var(--text-light)";
                    toggle.style.borderColor = "rgba(255, 255, 255, 0.2)";
                } else {
                    toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
                    toggle.style.color = "var(--accent)";
                    toggle.style.borderColor = "var(--accent)";
                }
            }
        });
    });
});
