module.exports = async (request, response, client) => {
    const {util, config} = client;

    if (!request.query.uuid) {
        response.sendFile("/views/discordLinking/invalid.html", {root: "."});
        return;
    }
    if (!request.query.code) {
        response.redirect("https://discordapp.com/api/oauth2/authorize?client_id=579759958556672011&redirect_uri=" + encodeURI(client.webserver + "/link?uuid=" + request.query.uuid) + "&response_type=code&scope=identify");
        return;
    }

    const user = await util.discordAPI(request.query.code, client.webserver + "/support", config.discordapi.users);
    if(user) {
        // True?
        response.send(request.query.uuid + " \n " + client.base64.atob(request.query.uuid));
    }
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};
