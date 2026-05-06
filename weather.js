const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityinput");
const dashboard = document.querySelector(".dashboard");
const city = document.querySelector(".city");
const update = document.querySelector(".update");
const temp = document.querySelector(".temp");
const condition = document.querySelector(".condition");
const smallCards = document.querySelectorAll(".small-card p");
const dayCards = document.querySelectorAll(".day-card");
const apiKey = "5d276a73124b7b292d257db888e60b5e";
weatherForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const cityName = cityInput.value.trim();
    if(cityName === ""){
        alert("Please enter a city");
        return;
    }
    try{
        const weatherData = await getWeatherData(cityName);
        const forecastData = await getForecastData(cityName);
        await displayWeather(weatherData, forecastData);
        displayForecast(forecastData);
        dashboard.style.display = "flex";
    }
    catch(error){
        console.log(error);
        alert(error.message);
    }
});

async function getWeatherData(cityName){
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if(!response.ok){
        throw new Error("Could not fetch weather");
    }
    return await response.json();
}

async function getForecastData(cityName){
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if(!response.ok){
        throw new Error("Could not fetch forecast");
    }
    return await response.json();
}

async function displayWeather(data, forecastData){
    console.log(data);
    const {
        name,
        main,
        weather,
        wind,
        visibility,
        coord
    } = data;
    city.textContent = `📍 ${name}`;
    const now = new Date();
    update.textContent =
    `Last Updated: ${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    })}`;
    temp.textContent = `${Math.round(main.temp)}°C`;
    condition.textContent = weather[0].description;
    smallCards[0].textContent = `${main.humidity}%`;
    smallCards[1].textContent = `${(wind.speed * 3.6).toFixed(1)} km/h`;
    smallCards[2].textContent = `${visibility / 1000} km`;
    smallCards[3].textContent = `${main.pressure} hPa`;
    const airQuality = document.querySelector(".airQuality");
    const lat = coord.lat;
    const lon = coord.lon;
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const airResponse = await fetch(airUrl);
    const airData = await airResponse.json();
    const aqi = airData.list[0].main.aqi;
    let airText = "";
    switch(aqi){
        case 1:
            airText = "Good";
            break;
        case 2:
            airText = "Fair";
            break;
        case 3:
            airText = "Moderate";
            break;
        case 4:
            airText = "Poor";
            break;
        case 5:
            airText = "Very Poor";
            break;
    }
    airQuality.textContent = airText;
    const rainChance = document.querySelector(".rainChance");
    const rainValues = forecastData.list.map(item =>
        item.pop
    );
    const maxRain = Math.max(...rainValues);
    const rainProbability = Math.round(maxRain * 100);
    rainChance.textContent = `${rainProbability}%`;
}

function displayForecast(data){
    console.log(data);
    const now = new Date();
    const forecastList = data.list.filter(item => {
    const forecastTime = new Date(item.dt_txt);
    return forecastTime > now;
});
    dayCards.forEach((card, index) => {
        const item = forecastList[index];
        if(item){
            const emoji =
            getWeatherEmoji(
                item.weather[0].main
            );
            const temperature =
            Math.round(item.main.temp);
            const time = new Date(item.dt_txt)
            .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
            card.querySelector("h4").textContent = emoji;
            card.querySelector("h3").textContent = `${temperature}°C`;
            card.querySelector("p").textContent = time;
        }
    });
}

function getWeatherEmoji(weatherMain){
    switch(weatherMain){
        case "Clouds":
            return "☁️";
        case "Clear":
            return "☀️";
        case "Rain":
            return "🌧️";
        case "Thunderstorm":
            return "⛈️";
        case "Snow":
            return "❄️";
        case "Drizzle":
            return "🌦️";
        case "Mist":
            return "🌫️";
        default:
            return "🌍";
    }
}