const Client = require("../bot");
Client.on("invalidated", async () => {
    console.log("Token invalidated! Exited boot-loop gracefully.");
    Client.destroy();
});
