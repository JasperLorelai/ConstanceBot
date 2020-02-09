const client = require("../server");
client.on("invalidated", async () => {
    console.log("Token invalidated! Exited boot-loop gracefully.");
    client.destroy();
});