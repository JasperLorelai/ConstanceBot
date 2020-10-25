module.exports = async (request, response, Client) => {
    const gist = request.params["gist"];
    if (!gist) {
        response.end("Please provide a valid Gist ID in the URL.");
        return;
    }
    if (gist.toLowerCase() === "whatgistid") Client.memberCount = process.env.MEMBER_TRAFFIC;
    else if (!gist.includes(".")) Client.memberCount = gist;
    response.sendFile("/views/memberchart/indexFile.html", {root: "."});
};
