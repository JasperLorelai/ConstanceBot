module.exports = async (request, response, client) => {
    const {util, config, keyv} = client;
    let db = await keyv.get("minecraft") || {};

    if (!request.query.code) {
        // If nothing was specified, exit.
        if (!request.query.uuid) {
            response.sendFile("/views/discordLinking/invalid.html", {root: "."});
            return;
        }

        // If uuid was specified, but not the code.
        const uuid = client.atob(request.query.uuid);
        const user = util.getKeyByValue(db, uuid);
        if (user) {
            response.sendFile("/views/discordLinking/clone.html", {root: "."});
            return;
        }

        if (!client.discordLink) client.discordLink = {};
        client.discordLink[request.sessionID] = request.query.uuid;
        response.redirect("https://discordapp.com/api/oauth2/authorize?client_id=579759958556672011&redirect_uri=" + encodeURI(client.webserver + "/link") + "&response_type=code&scope=identify");
        return;
    }

    // If the code was found.
    // Safeguard.
    if (!client.discordLink) {
        request.session.destroy();
        response.sendFile("/views/discordLinking/invalid.html", {root: "."});
        return;
    }
    const uuid = client.atob(client.discordLink[request.sessionID]);
    if (!uuid) {
        request.session.destroy();
        response.sendFile("/views/discordLinking/invalid.html", {root: "."});
        return;
    }

    request.session.destroy();
    const user = await util.discordAPI(request.query.code, client.webserver + "/link", config.discordapi.users);
    if(user) {
        // Save user.
        db[user.id] = uuid;
        keyv.set("minecraft", db);
        response.sendFile("/views/discordLinking/linked.html", {root: "."});
    }
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};
