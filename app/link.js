module.exports = async (request, response, Client) => {
    const {Util, Config, keyv} = Client;
    let db = await keyv.get("minecraft") || {};

    if (!request.query.code) {
        // If nothing was specified, exit.
        if (!request.query["uuid"]) {
            response.sendFile("/views/discordLinking/invalid.html", {root: "."});
            return;
        }

        // If uuid was specified, but not the code.
        const user = db.getKeyByValue(Client.atob(request.query["uuid"]));
        if (user) {
            response.sendFile("/views/discordLinking/clone.html", {root: "."});
            return;
        }

        if (!Client.discordLink) Client.discordLink = {};
        Client.discordLink[request.sessionID] = request.query["uuid"];
        response.redirect(Config.urls.discordAPI.oauth2 + "authorize?client_id=579759958556672011&redirect_uri=" + encodeURI(Client.webserver + "/link") + "&response_type=code&scope=identify");
        return;
    }

    // If the code was found.
    // Safeguard.
    if (!Client.discordLink) {
        request.session.destroy();
        response.sendFile("/views/discordLinking/invalid.html", {root: "."});
        return;
    }
    const uuid = Client.discordLink[request.sessionID];
    if (!uuid) {
        request.session.destroy();
        response.sendFile("/views/discordLinking/invalid.html", {root: "."});
        return;
    }

    request.session.destroy();
    const user = await Util.discordAPI(request.query.code, Client.webserver + "/link", Config.urls.discordAPI.users);
    if (user && !user.error) {
        // Save user.
        db[user.id] = Client.atob(uuid);
        keyv.set("minecraft", db);
        response.sendFile("/views/discordLinking/linked.html", {root: "."});
    }
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};
