const client = require("../bot");
const {util, config} = client;
module.exports = async (request, response) => {
    if(!request.query.code) {
        response.sendFile("/views/redirect-support.html", {root: "."});
        return;
    }
    const user = await util.discordAPI(request.query.code, request.protocol + "://" + request.hostname + "/" + __filename, config.discordapi.users);
    response.redirect(config.app.form.supportticket + user.id);
};