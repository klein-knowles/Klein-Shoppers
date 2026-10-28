// Keep the legacy `node app.js` command on the same application server as npm start.
const app = require("./server");

if (require.main === module) {
    app.startServer().catch(error => {
        console.error("Klein Shoppers could not start:", error.code || error.message || "startup error");
        process.exitCode = 1;
    });
}

module.exports = app;
