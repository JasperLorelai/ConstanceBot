const express = require("express");
const app = express();

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log("App running on port " + PORT);
});

const client = require("./bot");

// Add a handler for all application routes.
app.get("/", (request, response) => client.app.get("defaultRoute")(request, response));
app.get("/:route", (request, response) => {
    const route = request.params.route;
    if(client.app.has(route)) client.app.get(route)(request, response);
    else response.end();
});