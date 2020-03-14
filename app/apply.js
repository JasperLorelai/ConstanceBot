module.exports = async (request, response, client) => {
    const {util, config} = client;
    if(!request.query.code) {
        response.sendFile("/views/redirect-staffapp.html", {root: "."});
        return;
    }
    const user = await util.discordAPI(request.query.code, client.webserver + "/" + __filename, config.discordapi.users);
    response.redirect(config.app.forms.staffapp + user.id);
};
