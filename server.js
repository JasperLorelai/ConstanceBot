const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("App running on port " + PORT);
});

// Add a handler for all application routes.
app.get("/", (request, response) => require("./bot").app.get("defaultRoute")(request, response));
app.get("/:route", (request, response) => {
    const route = request.params.route;
    if(require("./bot").app.has(route)) client.app.get(route)(request, response);
    else response.end();
});