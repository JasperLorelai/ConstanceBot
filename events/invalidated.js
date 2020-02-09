const client = require("../bot");
client.on("invalidated", async () => {
    console.log("Token invalidated! Exited boot-loop gracefully.");
    client.destroy();
});