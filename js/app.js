// Add this to app.js or directly in a <script> tag
const wrapper = document.querySelector(".wrapper"),
      ssInput = wrapper.querySelector(".form input"),
      generateBtn = wrapper.querySelector(".form button"),
      ssImg = wrapper.querySelector(".ss-img img");

generateBtn.addEventListener("click", async () => {
    let ssValue = ssInput.value.trim();
    if (!ssValue) {
        alert("Please enter a valid URL");
        return;
    }

    generateBtn.innerText = "Generating Screenshot...";
    generateBtn.disabled = true; // Disable button to prevent multiple requests

    try {
        ssImg.src = `https://image.thum.io/get/width/1200/png/wait/1/${ssValue}`;
        ssImg.addEventListener("load", () => {
            wrapper.classList.add("active");
            generateBtn.innerText = "Generate Screenshot";
            generateBtn.disabled = false;
        });
    } catch (error) {
        console.error("Error generating screenshot:", error);
        alert("Failed to generate screenshot. Please try again.");
        generateBtn.innerText = "Generate Screenshot";
        generateBtn.disabled = false;
    }
});

ssInput.addEventListener("keyup", () => {
    if (!ssInput.value) {
        wrapper.classList.remove("active");
    }
});
