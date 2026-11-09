
// =====================================
// 1. GET HTML ELEMENTS
// =====================================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");


const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feelsLike");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");


// =====================================
// 2. WEATHER DESCRIPTION
// =====================================

function getWeatherDescription(code) {

    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 57) return "Drizzle";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Rain Showers";
    if (code <= 86) return "Snow Showers";
    if (code >= 95) return "Thunderstorm";

    return "Unknown Weather";
}


// =====================================
// 3. SEARCH CITY
// =====================================

async function searchWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name!");
        return;
    }

    try {

        searchBtn.disabled = true;

        // Find city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Location search failed");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found!");
            return;
        }

        const location = geoData.results[0];

        // Get weather using coordinates
        await getWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country
        );

    }

    catch (error) {

        console.log(error);
        alert("Something went wrong. Check your internet connection.");

    }

    finally {
        searchBtn.disabled = false;
    }

}


// =====================================
// 4. GET WEATHER DATA
// =====================================

async function getWeather(lat, lon, name, country) {

    const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

    const response = await fetch(weatherURL);

    if (!response.ok) {
        throw new Error("Weather data unavailable");
    }

    const data = await response.json();

    // Update city name
    cityName.textContent = `${name}, ${country}`;

    // Update temperature
    temperature.textContent =
        Math.round(data.current.temperature_2m) + "°C";

    // Update description
    description.textContent =
        getWeatherDescription(data.current.weather_code);

    // Update feels like
    feelsLike.textContent =
        "Feels like " +
        Math.round(data.current.apparent_temperature) + "°C";

    // Update humidity
    humidity.textContent =
        data.current.relative_humidity_2m + "%";

    // Update wind
    wind.textContent =
        data.current.wind_speed_10m + " km/h";

    // Update pressure
    pressure.textContent =
        data.current.pressure_msl + " hPa";

    // Update visibility
    visibility.textContent = "Not available";

    // Update sunrise
    sunrise.textContent =
        new Date(data.daily.sunrise[0]).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
        );

    // Update sunset
    sunset.textContent =
        new Date(data.daily.sunset[0]).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
        );

    // Update date
    document.getElementById("date").textContent =
        new Date(data.current.time).toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    // Update 5 day forecast
    updateForecast(data.daily);

}


// =====================================
// 5. UPDATE 5 DAY FORECAST
// =====================================

function updateForecast(daily) {

    const forecastGrid =
        document.querySelector(".forecast-grid");

    forecastGrid.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const day = new Date(daily.time[i]);

        const dayName = day.toLocaleDateString(
            "en-US",
            { weekday: "long" }
        );

        const weather = getWeatherDescription(
            daily.weather_code[i]
        );

        const maxTemp = Math.round(
            daily.temperature_2m_max[i]
        );

        const minTemp = Math.round(
            daily.temperature_2m_min[i]
        );

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <p>${dayName}</p>
            <i class="fa-solid fa-cloud-sun"></i>
            <h3>${maxTemp}°C</h3>
            <p>${weather}</p>
            <small>${minTemp}°C Min</small>
        `;

        forecastGrid.appendChild(card);

    }

}


// =====================================
// 6. SEARCH BUTTON
// =====================================

searchBtn.addEventListener("click", searchWeather);


// Enter key
cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchWeather();
    }

});


// =====================================
// 7. CURRENT LOCATION
// =====================================

locationBtn.addEventListener("click", function() {

    if (!navigator.geolocation) {

        alert("Location is not supported by your browser.");
        return;

    }

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {

                await getWeather(
                    lat,
                    lon,
                    "Your Current Location",
                    ""
                );

            }

            catch (error) {

                alert("Unable to get weather data.");

            }

        },

        function() {

            alert("Please allow location permission.");

        }

    );

});


// =====================================
// 8. DEFAULT WEATHER
// =====================================

// Load Colombo weather when app opens

getWeather(
    6.9271,
    79.8612,
    "Colombo",
    "Sri Lanka"
).catch(error => {

    console.log("Weather loading failed:", error);

});
