module.exports = async (request, response, client) => {
    const gist = request.params["gist"];
    if (!gist) {
        response.end("Please provide a valid Gist ID in the URL.");
        return;
    }
    if (gist.toLowerCase() === "whatgistid") client.memberCount = process.env.MEMBER_TRAFFIC;
    else client.memberCount = gist;
    response.sendFile("/views/memberchartView/index.html", {root: "."});
};
