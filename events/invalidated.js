const Client = require("../Client");
Client.on("invalidated", async () => {
    console.log("Token invalidated! Exited boot-loop gracefully.");
    Client.destroy();
});
