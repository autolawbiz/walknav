function startNavigation(
    origin,
    destination
) {

    // Directions API を呼び出す
    fetch('getRoute.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            origin: origin,
            destination: destination
        })
    })
    .then(res => res.json())
    .then(data => {
        const route = data.routes[0].geometry;

        // 既存のルートを消す（再描画用）
        if (map.getSource('route')) {
            map.removeLayer('route');
            map.removeSource('route');
        }

        // ルートを追加
        map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: route
            }
        });

        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            paint: {
                'line-color': '#007AFF',
                'line-width': 5
            }
        });

        // ルート全体が見えるように自動ズーム
        const bounds = new mapboxgl.LngLatBounds();

        route.coordinates.forEach(coord => {
            bounds.extend(coord);
        });

        map.fitBounds(bounds, {
            padding: 50
        });

        const durationMin = Math.round(data.routes[0].duration / 60);
        const distanceMeters = data.routes[0].distance;

        let distanceText;
        if (distanceMeters < 1000) {
            distanceText = `${Math.round(distanceMeters)} m`;
        } else {
            distanceText = `${(distanceMeters / 1000).toFixed(1)} km`;
        }

        document.getElementById('route-info').style.display = 'block';
        document.getElementById('distance').textContent = `距離：${distanceText}`;
        document.getElementById('duration').textContent = `所要時間：${durationMin}分`;

        // Turn-by-Turn案内表示
        const steps = data.routes[0].legs[0].steps;
        const stepsList = document.getElementById("steps");

        // 既存カード削除
        stepsList.innerHTML = "";

        steps.forEach(step => {
            const stepElement = document.createElement('div');
            stepElement.className = 'step-card';

            stepElement.innerHTML = `
                <div class="step-instruction">
                    ${translateInstruction(
                        step.maneuver.instruction
                    )}
                </div>
                <div class="step-distance">
                    約 ${Math.round(step.distance)}m
                </div>
            `;
            stepsList.appendChild(stepElement);
        });
    });
}

const searchBtn =
    document.getElementById("search-btn");

searchBtn.addEventListener("click", async () => {

    const destinationInput =
        document.getElementById(
            "destination-input"
        ).value;

    const sessionToken =
        "123e4567-e89b-12d3-a456-426614174000";

    const url =
        `https://api.mapbox.com/search/searchbox/v1/suggest` +
        `?q=${encodeURIComponent(destinationInput)}` +
        `&language=ja` +
        `&country=jp` +
        `&session_token=${sessionToken}` +
        `&access_token=${mapboxgl.accessToken}`;

    const response =
        await fetch(url);

    const data =
        await response.json();

    const mapboxId =
        data.suggestions[0].mapbox_id;

    const retrieveUrl =
        `https://api.mapbox.com/search/searchbox/v1/retrieve/` +
        `${mapboxId}` +
        `?session_token=${sessionToken}` +
        `&access_token=${mapboxgl.accessToken}`;

    const retrieveResponse =
        await fetch(retrieveUrl);

    const retrieveData =
        await retrieveResponse.json();

    const lng =
        retrieveData.features[0]
            .geometry.coordinates[0];

    const lat =
        retrieveData.features[0]
            .geometry.coordinates[1];

    destination = [lng, lat];

    const DEV_MODE = true;

    if (DEV_MODE) {

        const origin = [
            139.630,
            35.450
        ];

        startNavigation(
            origin,
            destination
        );

    } else {

        navigator.geolocation
            .getCurrentPosition(
                (position) => {

                    const origin = [
                        position.coords.longitude,
                        position.coords.latitude
                    ];

                    startNavigation(
                        origin,
                        destination
                    );

                }
            );

    }
});