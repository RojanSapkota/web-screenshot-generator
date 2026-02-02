const wrapper = document.querySelector(".wrapper"),
      ssInput = wrapper.querySelector(".inputtext"),
      generateBtn = wrapper.querySelector(".generate-btn"),
      ssImg = wrapper.querySelector(".ss-img img"),
      downloadBtn = wrapper.querySelector(".download-btn"),
      copyBtn = wrapper.querySelector(".copy-btn"),
      recentUrlsContainer = document.querySelector(".recent-urls"),
      recentUrlsList = document.querySelector(".recent-urls-list"),
      clearHistoryBtn = document.querySelector(".clear-history");

// URL History Management
const MAX_HISTORY = 5;

function getUrlHistory() {
    const history = localStorage.getItem('urlHistory');
    return history ? JSON.parse(history) : [];
}

function saveToHistory(url) {
    let history = getUrlHistory();
    // Remove if already exists
    history = history.filter(item => item !== url);
    // Add to beginning
    history.unshift(url);
    // Keep only MAX_HISTORY items
    history = history.slice(0, MAX_HISTORY);
    localStorage.setItem('urlHistory', JSON.stringify(history));
    displayUrlHistory();
}

function clearHistory() {
    localStorage.removeItem('urlHistory');
    displayUrlHistory();
    showNotification("History cleared", "info");
}

function displayUrlHistory() {
    const history = getUrlHistory();
    
    if (history.length === 0) {
        recentUrlsContainer.style.display = 'none';
        return;
    }
    
    recentUrlsContainer.style.display = 'block';
    recentUrlsList.innerHTML = history.map(url => `
        <div class="recent-url-item" data-url="${url}">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="recent-url-text">${url}</span>
        </div>
    `).join('');
    
    // Add click listeners to recent URL items
    document.querySelectorAll('.recent-url-item').forEach(item => {
        item.addEventListener('click', () => {
            ssInput.value = item.dataset.url;
            generateBtn.click();
        });
    });
}

// Initialize history display
displayUrlHistory();

// Clear history button
clearHistoryBtn.addEventListener("click", clearHistory);

// Auto-format URL
ssInput.addEventListener("blur", () => {
    let url = ssInput.value.trim();
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        ssInput.value = "https://" + url;
    }
});

// Generate screenshot on Enter key
ssInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        generateBtn.click();
    }
});

// Generate screenshot
generateBtn.addEventListener("click", async () => {
    let ssValue = ssInput.value.trim();
    
    // Validate URL
    if (!ssValue) {
        showNotification("Please enter a URL", "error");
        ssInput.focus();
        return;
    }
    
    // Auto-add https if not present
    if (!ssValue.startsWith("http://") && !ssValue.startsWith("https://")) {
        ssValue = "https://" + ssValue;
        ssInput.value = ssValue;
    }
    
    // Basic URL validation
    try {
        new URL(ssValue);
    } catch (e) {
        showNotification("Please enter a valid URL", "error");
        ssInput.focus();
        return;
    }

    // Show loading state
    generateBtn.classList.add("loading");
    generateBtn.disabled = true;
    wrapper.classList.remove("active");

    try {
        // Generate screenshot URL
        const screenshotUrl = `https://image.thum.io/get/width/1200/crop/900/png/wait/1/noanimate/${ssValue}`;
        
        // Pre-load image
        const img = new Image();
        
        img.onload = () => {
            ssImg.src = screenshotUrl;
            wrapper.classList.add("active");
            generateBtn.classList.remove("loading");
            generateBtn.disabled = false;
            saveToHistory(ssValue); // Save to history
            showNotification("Screenshot generated successfully!", "success");
        };
        
        img.onerror = () => {
            throw new Error("Failed to load screenshot");
        };
        
        img.src = screenshotUrl;
        
    } catch (error) {
        console.error("Error generating screenshot:", error);
        showNotification("Failed to generate screenshot. Please try again.", "error");
        generateBtn.classList.remove("loading");
        generateBtn.disabled = false;
    }
});

// Copy to clipboard
copyBtn.addEventListener("click", async () => {
    try {
        const imageSrc = ssImg.src;
        if (!imageSrc) return;
        
        // Show loading state
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Copying...
        `;
        copyBtn.disabled = true;
        
        // Fetch the image
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        
        // Copy to clipboard using Clipboard API
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);
        
        // Show success state
        copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Copied!
        `;
        
        showNotification("Screenshot copied to clipboard!", "success");
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error("Error copying to clipboard:", error);
        showNotification("Failed to copy. Try downloading instead.", "error");
        
        // Reset button
        copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Copy
        `;
        copyBtn.disabled = false;
    }
});

// Download screenshot
downloadBtn.addEventListener("click", async () => {
    try {
        const imageSrc = ssImg.src;
        if (!imageSrc) return;
        
        // Show loading state
        downloadBtn.textContent = "Downloading...";
        downloadBtn.disabled = true;
        
        // Fetch the image
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `screenshot-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Reset button
        downloadBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Download
        `;
        downloadBtn.disabled = false;
        
        showNotification("Screenshot downloaded successfully!", "success");
    } catch (error) {
        console.error("Error downloading screenshot:", error);
        showNotification("Failed to download screenshot", "error");
        downloadBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Download
        `;
        downloadBtn.disabled = false;
    }
});

// Clear result when input is cleared
ssInput.addEventListener("input", () => {
    if (!ssInput.value.trim()) {
        wrapper.classList.remove("active");
    }
});

// Notification system
function showNotification(message, type = "info") {
    // Remove existing notification
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles dynamically
    const style = document.createElement("style");
    if (!document.querySelector("#notification-styles")) {
        style.id = "notification-styles";
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                border-radius: 12px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
                backdrop-filter: blur(10px);
            }
            .notification-success {
                background: rgba(16, 185, 129, 0.9);
            }
            .notification-error {
                background: rgba(239, 68, 68, 0.9);
            }
            .notification-info {
                background: rgba(99, 102, 241, 0.9);
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateX(400px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Zoom Modal Functionality
const zoomModal = document.querySelector('.zoom-modal');
const zoomOverlay = document.querySelector('.zoom-overlay');
const zoomImage = document.querySelector('.zoom-image');
const zoomClose = document.querySelector('.zoom-close');
const zoomInBtn = document.querySelector('.zoom-in');
const zoomOutBtn = document.querySelector('.zoom-out');
const zoomResetBtn = document.querySelector('.zoom-reset');

let currentZoom = 1;
const zoomStep = 0.25;
const minZoom = 0.5;
const maxZoom = 3;

// Open zoom modal
ssImg.addEventListener('click', () => {
    if (ssImg.src && ssImg.src !== window.location.href) {
        zoomImage.src = ssImg.src;
        zoomModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentZoom = 1;
        zoomImage.style.transform = `scale(${currentZoom})`;
    }
});

// Close zoom modal
function closeZoomModal() {
    zoomModal.classList.remove('active');
    document.body.style.overflow = '';
    currentZoom = 1;
}

zoomClose.addEventListener('click', closeZoomModal);
zoomOverlay.addEventListener('click', closeZoomModal);

// Zoom in
zoomInBtn.addEventListener('click', () => {
    if (currentZoom < maxZoom) {
        currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
        zoomImage.style.transform = `scale(${currentZoom})`;
    }
});

// Zoom out
zoomOutBtn.addEventListener('click', () => {
    if (currentZoom > minZoom) {
        currentZoom = Math.max(currentZoom - zoomStep, minZoom);
        zoomImage.style.transform = `scale(${currentZoom})`;
    }
});

// Reset zoom
zoomResetBtn.addEventListener('click', () => {
    currentZoom = 1;
    zoomImage.style.transform = `scale(${currentZoom})`;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (zoomModal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeZoomModal();
        } else if (e.key === '+' || e.key === '=') {
            zoomInBtn.click();
        } else if (e.key === '-') {
            zoomOutBtn.click();
        } else if (e.key === '0') {
            zoomResetBtn.click();
        }
    }
});

// Mouse wheel zoom
zoomImage.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        // Scroll up - zoom in
        if (currentZoom < maxZoom) {
            currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
            zoomImage.style.transform = `scale(${currentZoom})`;
        }
    } else {
        // Scroll down - zoom out
        if (currentZoom > minZoom) {
            currentZoom = Math.max(currentZoom - zoomStep, minZoom);
            zoomImage.style.transform = `scale(${currentZoom})`;
        }
    }
});

// Drag to pan when zoomed
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;
const container = document.querySelector('.zoom-image-container');

zoomImage.addEventListener('mousedown', (e) => {
    if (currentZoom > 1) {
        isDragging = true;
        zoomImage.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        startY = e.pageY - container.offsetTop;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    container.scrollLeft = scrollLeft - walkX;
    container.scrollTop = scrollTop - walkY;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    if (currentZoom > 1) {
        zoomImage.style.cursor = 'grab';
    }
});

