module.exports = async (request, response, client) => {
    const gist = request.params["gist"];
    client.memberCount = gist ? gist : process.env.MEMBER_TRAFFIC;
    response.sendFile("/views/memberchart/index.html", {root: "."});
};
