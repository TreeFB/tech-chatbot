
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

// Usage example:
async function run() {
console.log('Before sleep');
await sleep(0); // Sleep for 2000 milliseconds (2 seconds)
console.log('After sleep');
}
