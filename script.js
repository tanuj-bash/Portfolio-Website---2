const initBtn = document.getElementById('init-btn');
const preloader = document.getElementById('preloader');
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

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

initBtn.addEventListener('click', () => {
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

function createTrail(e) {
    const currentTime = Date.now();
    
    if (currentTime - lastTrailTime < 20) return;
    lastTrailTime = currentTime;

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