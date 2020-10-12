module.exports = async (request, response, client) => {
    const gist = request.params["gist"];
    if (!gist) {
        response.end("Please provide a valid Gist ID in the URL.");
        return;
    }
    if (gist.toLowerCase() === "whatgistid") client.memberCount = process.env.MEMBER_TRAFFIC;
    else if (!gist.includes(".")) client.memberCount = gist;
    response.sendFile("/views/memberchart/indexFile.html", {root: "."});
};
