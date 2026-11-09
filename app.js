
// ==========================================
// WEATHERX - WEATHER APPLICATION
// ==========================================


// 1. SELECT HTML ELEMENTS
// ==========================================

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page-section");

const topSearchForm = document.getElementById("topSearchForm");
const topSearchInput = document.getElementById("topSearchInput");

const citySearchForm = document.getElementById("citySearchForm");
const citySearchInput = document.getElementById("citySearchInput");

const refreshButton = document.getElementById("refreshButton");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weatherCondition");
const feelsLike = document.getElementById("feelsLike");
const weatherIcon = document.getElementById("weatherIcon");
const currentDate = document.getElementById("currentDate");

const currentLocation = document.getElementById("currentLocation");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const windDirection = document.getElementById("windDirection");
const pressure = document.getElementById("pressure");

const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");

const temperatureUnit = document.getElementById("temperatureUnit");

const searchResult = document.getElementById("searchResult");

const mapCityName = document.getElementById("mapCityName");
const weatherMap = document.getElementById("weatherMap");


// 2. APPLICATION VARIABLES
// ==========================================

let currentWeatherData = null;

let currentCity = "Colombo";
let currentCountry = "Sri Lanka";

let currentLatitude = 6.9271;
let currentLongitude = 79.8612;

let selectedUnit =
    localStorage.getItem("weatherUnit") || "celsius";


// 3. NAVIGATION SYSTEM
// ==========================================

function showPage(pageName) {

    const selectedLink = document.querySelector(
        `.nav-link[data-page="${pageName}"]`
    );

    const selectedPage = document.getElementById(pageName);

    if (!selectedLink || !selectedPage) {
        pageName = "home";
    }

    // Remove active classes

    navLinks.forEach(link => {
        link.classList.remove("active");
    });

    pages.forEach(page => {
        page.classList.remove("active");
    });

    // Activate selected page

    document.querySelector(
        `.nav-link[data-page="${pageName}"]`
    ).classList.add("active");

    document.getElementById(pageName).classList.add("active");

    // Update URL

    if (window.location.hash !== `#${pageName}`) {
        history.pushState(null, "", `#${pageName}`);
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// Navigation click events

navLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        showPage(this.dataset.page);

    });

});


// Browser back and forward

window.addEventListener("popstate", () => {

    const pageName =
        window.location.hash.replace("#", "") || "home";

    showPage(pageName);

});


// 4. WEATHER CONDITIONS
// ==========================================

function getWeatherInfo(code) {

    const conditions = {

        0: ["Clear Sky", "fa-sun"],
        1: ["Mainly Clear", "fa-sun"],
        2: ["Partly Cloudy", "fa-cloud-sun"],
        3: ["Overcast", "fa-cloud"],

        45: ["Foggy", "fa-smog"],
        48: ["Rime Fog", "fa-smog"],

        51: ["Light Drizzle", "fa-cloud-rain"],
        53: ["Drizzle", "fa-cloud-rain"],
        55: ["Heavy Drizzle", "fa-cloud-showers-heavy"],

        61: ["Light Rain", "fa-cloud-rain"],
        63: ["Rain", "fa-cloud-showers-heavy"],
        65: ["Heavy Rain", "fa-cloud-showers-heavy"],

        71: ["Light Snow", "fa-snowflake"],
        73: ["Snow", "fa-snowflake"],
        75: ["Heavy Snow", "fa-snowflake"],

        80: ["Rain Showers", "fa-cloud-showers-heavy"],
        81: ["Heavy Showers", "fa-cloud-showers-heavy"],
        82: ["Violent Showers", "fa-cloud-showers-heavy"],

        95: ["Thunderstorm", "fa-bolt"],
        96: ["Thunderstorm", "fa-cloud-bolt"],
        99: ["Heavy Thunderstorm", "fa-cloud-bolt"]

    };

    return conditions[code] || ["Unknown", "fa-cloud"];

}


// 5. WEATHER ICON
// ==========================================

function updateIcon(element, code, isDay = 1) {

    const info = getWeatherInfo(code);

    let icon = info[1];

    if (code === 0 || code === 1) {

        icon = isDay ? "fa-sun" : "fa-moon";

    }

    if (code === 2 && !isDay) {

        icon = "fa-cloud-moon";

    }

    if (element.classList.contains("weather-icon")) {

        element.innerHTML =
            `<i class="fa-solid ${icon}"></i>`;

    } else {

        element.className = `fa-solid ${icon}`;

    }

}


// 6. TEMPERATURE CONVERSION
// ==========================================

function convertTemperature(value) {

    if (selectedUnit === "fahrenheit") {

        return Math.round((value * 9 / 5) + 32);

    }

    return Math.round(value);

}


function getTemperatureSymbol() {

    return selectedUnit === "fahrenheit" ? "°F" : "°C";

}


// 7. SEARCH CITY
// ==========================================

async function searchCity(cityQuery) {

    if (!cityQuery.trim()) {

        alert("Please enter a city name!");

        return false;

    }

    try {

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {

            throw new Error("City search failed.");

        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {

            throw new Error("City not found! Try another city.");

        }

        const place = geoData.results[0];

        const foundCity = place.name;
        const country = place.country || "";

        const latitude = place.latitude;
        const longitude = place.longitude;

        await getWeather(
            latitude,
            longitude,
            foundCity,
            country
        );

        showSearchResult(foundCity, country);

        return true;

    } catch (error) {

        console.error("WeatherX Error:", error);

        alert(error.message);

        return false;

    }

}


// 8. GET WEATHER DATA
// ==========================================

async function getWeather(latitude, longitude, city, country) {

    const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

    const response = await fetch(weatherURL);

    if (!response.ok) {

        throw new Error("Unable to get weather information.");

    }

    const data = await response.json();

    // Save weather information

    currentWeatherData = data;

    currentCity = city;
    currentCountry = country;

    currentLatitude = latitude;
    currentLongitude = longitude;

    // Update all sections

    updateCurrentWeather();

    updateHourlyForecast();

    updateDailyForecast();

    updateMap();

}


// 9. CURRENT WEATHER
// ==========================================

function updateCurrentWeather() {

    if (!currentWeatherData) return;

    const current = currentWeatherData.current;

    const weather = getWeatherInfo(current.weather_code);

    const symbol = getTemperatureSymbol();

    // City name

    cityName.innerHTML =
        `<i class="fa-solid fa-location-dot"></i>`;

    cityName.appendChild(
        document.createTextNode(" " + currentCity)
    );

    currentLocation.textContent =
        `${currentCity}, ${currentCountry}`;

    // Temperature

    temperature.innerHTML =
        `${convertTemperature(current.temperature_2m)}<span>${symbol}</span>`;

    // Weather condition

    weatherCondition.textContent = weather[0];

    // Feels like

    feelsLike.innerHTML =
        `<i class="fa-solid fa-temperature-half"></i>
        Feels like ${convertTemperature(current.apparent_temperature)}${symbol}`;

    // Weather icon

    updateIcon(
        weatherIcon,
        current.weather_code,
        current.is_day
    );

    // Date

    const date = new Date(current.time);

    currentDate.textContent =
        date.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    // Humidity

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    // Wind speed

    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;

    // Wind direction

    windDirection.textContent =
        getWindDirection(current.wind_direction_10m);

    // Pressure

    pressure.textContent =
        `${Math.round(current.surface_pressure)} hPa`;

}


// 10. WIND DIRECTION
// ==========================================

function getWindDirection(degrees) {

    const directions = [
        "N", "NE", "E", "SE",
        "S", "SW", "W", "NW"
    ];

    const index = Math.round(degrees / 45) % 8;

    return directions[index];

}


// 11. HOURLY FORECAST
// ==========================================

function updateHourlyForecast() {

    const hourly = currentWeatherData.hourly;

    const currentTime = currentWeatherData.current.time;

    let startIndex = hourly.time.findIndex(time =>

        time.slice(0, 13) === currentTime.slice(0, 13)

    );

    if (startIndex === -1) {

        startIndex = 0;

    }

    hourlyForecast.innerHTML = "";

    for (let i = startIndex; i < startIndex + 6; i++) {

        if (i >= hourly.time.length) break;

        const time = new Date(hourly.time[i]);

        const timeText = time.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true
        });

        const info = getWeatherInfo(hourly.weather_code[i]);

        const hourCard = document.createElement("div");

        hourCard.className = "hour";

        const timeElement = document.createElement("p");

        timeElement.textContent = timeText;

        const icon = document.createElement("i");

        icon.className = `fa-solid ${info[1]}`;

        const tempElement = document.createElement("h3");

        tempElement.textContent =
            `${convertTemperature(hourly.temperature_2m[i])}${getTemperatureSymbol()}`;

        hourCard.append(
            timeElement,
            icon,
            tempElement
        );

        hourlyForecast.appendChild(hourCard);

    }

}


// 12. FIVE DAY FORECAST
// ==========================================

function updateDailyForecast() {

    const daily = currentWeatherData.daily;

    dailyForecast.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(
            `${daily.time[i]}T12:00:00`
        );

        const dayText = date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });

        const info = getWeatherInfo(daily.weather_code[i]);

        const dayCard = document.createElement("div");

        dayCard.className = "day";

        const dateElement = document.createElement("p");

        dateElement.textContent = dayText;

        const icon = document.createElement("i");

        icon.className = `fa-solid ${info[1]}`;

        const tempElement = document.createElement("h3");

        const min = convertTemperature(
            daily.temperature_2m_min[i]
        );

        const max = convertTemperature(
            daily.temperature_2m_max[i]
        );

        tempElement.textContent =
            `${min}${getTemperatureSymbol()} / ${max}${getTemperatureSymbol()}`;

        dayCard.append(
            dateElement,
            icon,
            tempElement
        );

        dailyForecast.appendChild(dayCard);

    }

}


// 13. UPDATE MAP
// ==========================================

function updateMap() {

    const padding = 0.15;

    const bbox = [
        currentLongitude - padding,
        currentLatitude - padding,
        currentLongitude + padding,
        currentLatitude + padding
    ].join(",");

    weatherMap.src =
        `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${currentLatitude},${currentLongitude}`;

    mapCityName.textContent =
        `${currentCity}, ${currentCountry}`;

}


// 14. SEARCH RESULT
// ==========================================

function showSearchResult(city, country) {

    const current = currentWeatherData.current;

    const info = getWeatherInfo(current.weather_code);

    searchResult.innerHTML = "";

    const icon = document.createElement("i");

    icon.className = `fa-solid ${info[1]}`;

    const heading = document.createElement("h3");

    heading.textContent = `${city}, ${country}`;

    const description = document.createElement("p");

    description.textContent =
        `${convertTemperature(current.temperature_2m)}${getTemperatureSymbol()} - ${info[0]}`;

    const button = document.createElement("button");

    button.textContent = "View Weather Dashboard";

    button.addEventListener("click", () => {

        showPage("home");

    });

    searchResult.append(
        icon,
        heading,
        description,
        button
    );

}


// 15. TOP SEARCH
// ==========================================

topSearchForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const city = topSearchInput.value.trim();

    const success = await searchCity(city);

    if (success) {

        showPage("home");

        topSearchInput.value = "";

    }

});


// 16. SEARCH PAGE
// ==========================================

citySearchForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const city = citySearchInput.value.trim();

    await searchCity(city);

});


// 17. REFRESH WEATHER
// ==========================================

refreshButton.addEventListener("click", async function() {

    if (!currentWeatherData) return;

    try {

        refreshButton.classList.add("loading");

        await getWeather(
            currentLatitude,
            currentLongitude,
            currentCity,
            currentCountry
        );

    } catch (error) {

        alert(error.message);

    } finally {

        refreshButton.classList.remove("loading");

    }

});


// 18. TEMPERATURE SETTINGS
// ==========================================

temperatureUnit.value = selectedUnit;

temperatureUnit.addEventListener("change", function() {

    selectedUnit = this.value;

    localStorage.setItem("weatherUnit", selectedUnit);

    if (currentWeatherData) {

        updateCurrentWeather();

        updateHourlyForecast();

        updateDailyForecast();

    }

});


// 19. INITIAL PAGE
// ==========================================

const initialPage =
    window.location.hash.replace("#", "") || "home";

showPage(initialPage);


// 20. LOAD DEFAULT WEATHER
// ==========================================

searchCity("Colombo");


// ==========================================
// END OF WEATHERX
// ==========================================
