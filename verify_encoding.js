const crypto = require('crypto');

// Implementation from the updated GithubService
function utf8ToBase64(str) {
    try {
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
        return btoa(binString);
    } catch (e) {
        console.error('Error encoding string to Base64:', e);
        throw new Error('Failed to encode content');
    }
}

function base64ToUtf8(base64) {
    try {
        const binString = atob(base64.replace(/\s/g, ''));
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
        return new TextDecoder().decode(bytes);
    } catch (e) {
        console.error('Error decoding Base64 to string:', e);
        throw new Error('Failed to decode content');
    }
}

// Polyfill for btoa/atob in Node.js (if older node versions, but Node 18+ has them globally)
if (typeof btoa === 'undefined') {
    global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof atob === 'undefined') {
    global.atob = (b64) => Buffer.from(b64, 'base64').toString('binary');
}

// Test Data
const testData = [
    {
        id: "simple",
        content: "Hello World"
    },
    {
        id: "emoji",
        content: "Hello World 🌍 😊"
    },
    {
        id: "special_chars",
        content: "Special: & < > \" ' \n \r \t"
    },
    {
        id: "quotes",
        content: "This contains \"quotes\" inside."
    }
];

console.log("Starting verification...");

let allPassed = true;

testData.forEach(item => {
    const jsonString = JSON.stringify(item, null, 2);
    try {
        const encoded = utf8ToBase64(jsonString);
        const decoded = base64ToUtf8(encoded);
        const parsed = JSON.parse(decoded);

        if (JSON.stringify(parsed) === JSON.stringify(item)) {
            console.log(`PASS: ${item.id}`);
        } else {
            console.error(`FAIL: ${item.id}`);
            console.error(`Original: ${JSON.stringify(item)}`);
            console.error(`Parsed:   ${JSON.stringify(parsed)}`);
            allPassed = false;
        }
    } catch (e) {
        console.error(`ERROR: ${item.id}`, e);
        allPassed = false;
    }
});

if (allPassed) {
    console.log("All tests passed!");
} else {
    console.error("Some tests failed.");
    process.exit(1);
}
