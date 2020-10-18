AmCharts.makeChart("chart", {
    "type": "pie",
    "angle": 12,
    "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
    "depth3D": 15,
    "tabIndex": 1,
    "titleField": "category",
    "valueField": "players",
    "accessibleTitle": "",
    "theme": "dark",
    "allLabels": [],
    "balloon": {},
    "legend": {
        "enabled": true,
        "align": "center",
        "markerType": "circle"
    },
    "titles": [
        {
            "id": "Location",
            "size": 18,
            "tabIndex": 0,
            "text": "Location Pie Chart (18th October 2020)"
        }
    ],
    "dataProvider": [
        {
            "category": "North America",
            "players": 403
        },
        {
            "category": "Europe",
            "players": 213
        },
        {
            "category": "Oceania",
            "players": 22
        },
        {
            "category": "Asia",
            "players": 30
        },
        {
            "category": "South America",
            "players": 19
        },
        {
            "category": "Africa",
            "players": 8
        }
    ]
});