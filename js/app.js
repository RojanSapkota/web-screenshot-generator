const wrapper = document.querySelector(".wrapper"),
      ssInput = wrapper.querySelector(".inputtext"),
      generateBtn = wrapper.querySelector(".generate-btn"),
      ssImg = wrapper.querySelector(".ss-img img"),
      downloadBtn = wrapper.querySelector(".download-btn");

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
