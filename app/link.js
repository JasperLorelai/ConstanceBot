module.exports = async (request, response, client) => {
    const {util, config} = client;

    if (!request.query.code) {
        // If nothing was specified, exit.
        if (!request.query.uuid) {
            response.sendFile("/views/discordLinking/invalid.html", {root: "."});
            return;
        }

        // If uuid was specified, but not the code.
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
        // TODO: Save.
        response.send(uuid);
    }
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};
