module.exports = async (request, response) => {
    const gist = request.params["gist"];
    client.memberCount = gist ? gist : process.env.MEMBER_TRAFFIC;
    response.sendFile("/views/memberchart/index.html", {root: "."});
};
