const fs = require('fs');

/*
Test the Flask app from JS using the Fetch API.
*/

// Function to convert PNG file to UTF-8 base64
function convertPngToBase64(filePath) {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const base64String = imageBuffer.toString('base64');
        return base64String;
    } catch (error) {
        console.error('Error converting PNG to base64:', error);
        return null;
    }
}

// Example usage: Replace 'path/to/your/screenshot.png' with actual PNG path
const screenshotBase64 = convertPngToBase64('./screenshots_testing/hard_rave_screenshot.png');

if (!screenshotBase64) {
    console.error('Failed to convert PNG to base64');
    process.exit(1);
}

const objective = "calculus";

const data = {
    screenshot: screenshotBase64,
    objective: objective
};

fetch('http://127.0.0.1:5000/check_relevance', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => {
    console.log('Response:', data);
})
.catch(error => {
    console.error('Error:', error);
});