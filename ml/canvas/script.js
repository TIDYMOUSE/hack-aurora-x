const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startDrawingBtn = document.getElementById('startDrawing');
const passwordDisplay = document.getElementById('passwordDisplay');
const synth = window.speechSynthesis;

// Set canvas size
canvas.width = 640;
canvas.height = 640;

let password = [];
let isDrawing = false;
let canvasActive = false;
let currentMouseX = 0;
let currentMouseY = 0;
let lastProcessedChar = null;
let verificationTimer = null;
let lastMouseMoveTime = null;

// Track mouse position and movement across the entire document
document.addEventListener('mousemove', (event) => {
    const oldX = currentMouseX;
    const oldY = currentMouseY;
    currentMouseX = event.clientX;
    currentMouseY = event.clientY;

    // If we're waiting for character verification and mouse moves significantly
    if (lastProcessedChar && (Math.abs(currentMouseX - oldX) > 5 || Math.abs(currentMouseY - oldY) > 5)) {
        // Clear the verification timer
        if (verificationTimer) {
            clearTimeout(verificationTimer);
            verificationTimer = null;
        }
        
        // Remove the last character and announce it
        if (password.length > 0 && lastProcessedChar) {
            // password.pop();
            passwordDisplay.textContent = `Password so far: ${password.join('')}`;
            const utterThis = new SpeechSynthesisUtterance("Character cancelled. Please redraw.");
            synth.speak(utterThis);
            lastProcessedChar = null;
            initializeCanvas();
            currentMouseX = event.clientX;
            currentMouseY = event.clientY;
            positionCanvas(currentMouseX + 80, currentMouseY + 80);
        }
    }

    lastMouseMoveTime = Date.now();
});

// Function to position canvas at mouse coordinates
function positionCanvas(mouseX, mouseY) {
    const canvasX = mouseX - canvas.width / 2;
    const canvasY = mouseY - canvas.height / 2;
    
    const maxX = window.innerWidth - canvas.width;
    const maxY = window.innerHeight - canvas.height;
    
    canvas.style.position = 'fixed';
    canvas.style.left = `${Math.min(Math.max(0, canvasX), maxX)}px`;
    canvas.style.top = `${Math.min(Math.max(0, canvasY), maxY)}px`;
}

// Initialize canvas with white background
function initializeCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Start Drawing
startDrawingBtn.addEventListener('click', (event) => {
    event.preventDefault();
    positionCanvas(event.clientX, event.clientY);
    canvas.hidden = false;
    initializeCanvas();
    canvasActive = true;
    password = [];
    passwordDisplay.textContent = '';
    canvas.focus();
    const utterThis = new SpeechSynthesisUtterance("Canvas ready. Right click and hold to draw.");
    synth.speak(utterThis);
});

// Handle right-click drawing start
canvas.addEventListener('contextmenu', (event) => {
    if (!canvasActive) return;
    
    event.preventDefault();
    isDrawing = true;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
});

// Handle drawing
canvas.addEventListener('mousemove', (event) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.lineTo(x, y);
    ctx.stroke();
});

// Handle drawing end and character recognition
canvas.addEventListener('mouseup', async (event) => {
    if (!isDrawing) return;
    isDrawing = false;
    
    try {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 28;
        tempCanvas.height = 28;
        
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        
        tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 28, 28);
        
        const imageData = tempCanvas.toDataURL('image/png');
        
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }

        // Store the character but wait for verification
        lastProcessedChar = result.character;
        
        // Announce the recognized character
        const utterThis = new SpeechSynthesisUtterance(result.character);
        synth.speak(utterThis);

        // Set timer for character verification
        if (verificationTimer) {
            clearTimeout(verificationTimer);
        }

        verificationTimer = setTimeout(() => {
            if (lastProcessedChar) {
                password.push(lastProcessedChar);
                passwordDisplay.textContent = `Password so far: ${password.join('')}`;
                const utterThis = new SpeechSynthesisUtterance("Character confirmed");
                synth.speak(utterThis);
                lastProcessedChar = null;
                
                // Move canvas for next character
                initializeCanvas();
                positionCanvas(currentMouseX + 80, currentMouseY + 80);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error:', error);
        const utterThis = new SpeechSynthesisUtterance("Error processing character. Please try again.");
        synth.speak(utterThis);
    }
});

// Handle left click to end password entry
canvas.addEventListener('click', (event) => {
    if (!canvasActive) return;
    
    if (event.button === 0 && !isDrawing) {
        if (password.length > 0) {
            const finalPassword = password.join('');
            const utterThis = new SpeechSynthesisUtterance(`Password completed: ${finalPassword}`);
            synth.speak(utterThis);
            passwordDisplay.textContent = `Final Password: ${finalPassword}`;
        }
        
        initializeCanvas();
        password = [];
        canvasActive = false;
        canvas.hidden = true;
    }
});

// Add keyboard support for canvas movement
document.addEventListener('keydown', (event) => {
    if (!canvasActive) return;
    
    const step = 10;
    const rect = canvas.getBoundingClientRect();
    
    switch(event.key) {
        case 'ArrowUp':
            positionCanvas(rect.left + canvas.width/2, rect.top + canvas.height/2 - step);
            break;
        case 'ArrowDown':
            positionCanvas(rect.left + canvas.width/2, rect.top + canvas.height/2 + step);
            break;
        case 'ArrowLeft':
            positionCanvas(rect.left + canvas.width/2 - step, rect.top + canvas.height/2);
            break;
        case 'ArrowRight':
            positionCanvas(rect.left + canvas.width/2 + step, rect.top + canvas.height/2);
            break;
    }
});