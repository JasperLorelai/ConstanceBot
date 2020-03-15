module.exports = async (request, response, client) => {
    const {util, config} = client;
    if(!request.query.code) {
        response.sendFile("/views/redirect-suggest.html", {root: "."});
        return;
    }
    const user = await util.discordAPI(request.query.code, client.webserver + "/suggest", config.discordapi.users);
    if(user) response.redirect(config.app.forms.suggestions + user.id);
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};
