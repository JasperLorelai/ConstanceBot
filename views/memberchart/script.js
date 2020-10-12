function createGraph(name) {
    return {
        "balloonText": "[[value]] ([[category]])",
        "bullet": "round",
        "bulletBorderThickness": 3,
        "bulletHitAreaSize": -1,
        "customMarker": "",
        "gapPeriod": 3,
        "id": name,
        "labelText": "[[value]]",
        "tabIndex": -2,
        "title": name,
        "type": "smoothedLine",
        "urlField": "",
        "valueField": name,
        "xAxis": "Member count"
    };
}

async function onLoad() {
    const servers = await fetch("https://mhaprodigy.uk/restapi?getMemberChart").then(y => y.json());

    // Compile the data.
    const data = [];
    let serverNames = [];
    for (const date of Object.keys(servers)) {
        const obj = servers[date];
        serverNames.push(Object.keys(obj));
        obj.category = date;
        data.push(obj);
    }
    serverNames = [... new Set(serverNames.flat())];
    const graphs = serverNames.map(chart => createGraph(chart));

    AmCharts.makeChart("chart",{
        "type": "serial",
        "categoryField": "category",
        "startDuration": 1,
        "theme": "dark",
        "categoryAxis": {
            "gridPosition": "start",
            "labelFrequency": 4,
            "title": "Weeks"
        },
        "chartCursor": {
            "enabled": true,
            "bulletsEnabled": true,
            "leaveCursor": true
        },
        "trendLines": [],
        "graphs": graphs,
        "guides": [],
        "valueAxes": [
            {
                "id": "Member count",
                "integersOnly": true,
                "title": "Member count"
            }
        ],
        "allLabels": [],
        "balloon": {},
        "legend": {
            "enabled": true,
            "useGraphSettings": true
        },
        "titles": [
            {
                "id": "Traffic",
                "size": 18,
                "tabIndex": 0,
                "text": "Member Traffic Chart"
            }
        ],
        "dataProvider": data
    });
}
