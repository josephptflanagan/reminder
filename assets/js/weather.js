let idCounter = 0;
let cities = [];

function uvColor(uvIndex) {

    let color = ["magenta", "white"];

    if (uvIndex >= 0 && uvIndex < 3) {
        color = ["green", "white"];
    }
    else if (uvIndex >= 3 && uvIndex < 6) {
        color = ["yellow", "black"];
    }
    else if (uvIndex >= 6 && uvIndex < 8) {
        color = ["orange", "white"];
    }
    else if (uvIndex >= 8 && uvIndex < 11) {
        color = ["red", "white"];
    }
    return color;

};

function dateFormat(date, type) {

    if (type == 0) {
        let formattedDate = date.split("T")[0];
        let dateArr = formattedDate.split("-");
        return "(" + dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0] + ")";
    }
    else {
        let formattedDate = date.split(" ")[0];
        let dateArr = formattedDate.split("-");
        return dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0];
    }


};

function getWeatherData(cityName) {

    //create the address to access the api for the chosen city
    let weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=333533caeef70abd76ddaed589322a0e"
    let forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=333533caeef70abd76ddaed589322a0e"

    //fetch data from the weather api
    fetch(weatherApiUrl)

        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {

                    let lat = data.coord.lat;
                    let lon = data.coord.lon;

                    let uvApiUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=333533caeef70abd76ddaed589322a0e&lat=" + lat + "&lon=" + lon

                    //fetch data from the weather api
                    fetch(uvApiUrl).then(function (response) {
                        if (response.ok) {
                            response.json().then(function (uvData) {

                                fetch(forecastUrl).then(function (response) {
                                    if (response.ok) {
                                        response.json().then(function (forecastData) {

                                            //if data comes through, send it to be compiled
                                            compileWeatherData(data, uvData, forecastData, cityName);
                                        })
                                    }
                                    else {
                                        alert("Error: " + response.statusText);
                                    }
                                })
                                    .catch(function (error) {
                                        alert("Unable to Access Open Weather");
                                    })

                            })
                        }
                        else {
                            alert("Error: " + response.statusText);
                        }
                    })
                        .catch(function (error) {
                            alert("Unable to Access Open Weather");
                        })
                })
            }
            else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            alert("Unable to Access Open Weather");
        })

};

function forecastCompiler(forecastData) {

    //console.log("first min temp: " + forecastData.list[0].main.temp_min);

    let data = [];

    // DATA: day 1 date | day 1 icon | day 1 low | day 1 high | day 1 humidity |
    //       day 2 date | day 2 icon | day 2 low | day 2 high | day 2 humidity |
    //       day 3 date | day 3 icon | day 3 low | day 3 high | day 3 humidity |
    //       day 4 date | day 4 icon | day 4 low | day 4 high | day 4 humidity |
    //       day 5 date | day 5 icon | day 5 low | day 5 high | day 5 humidity |

    for (let i = 0; i < 40; i = i + 8) {
        let min = null;
        let max = null;

        //console.log("i:" + i)

        let tempDate = forecastData.list[i].dt_txt;
        tempDate = dateFormat(tempDate, 1);

        let iconId = forecastData.list[i].weather[0].icon;
        //console.log("iconId:" + iconId)

        if (iconId[2] == "n") {

            iconId = iconId[0] + iconId[1] + "d";

        }

        let iconUrl = "https://openweathermap.org/img/wn/" + iconId + "@2x.png";

        let humid = forecastData.list[i].main.humidity;

        for (let j = 0; j < 8; j++) {

            //console.log("i+j: "+ (i+j));

            if (min == null || min < forecastData.list[i + j].main.temp_min) {
                min = forecastData.list[i + j].main.temp_min
            }

            if (max == null || max > forecastData.list[i + j].main.temp_max) {
                max = forecastData.list[i + j].main.temp_max
            }

        }
        data.push(tempDate);
        data.push(iconUrl);
        data.push(min);
        data.push(max);
        data.push(humid);

    }
    return data;
}

//takes in both data files and the user input name, and creates cityDataObjects
function compileWeatherData(data, uvData, forecastData, cityName) {
    //console.log(data);
    //console.log(uvData);
    //console.log(forecastData);

    let temperature = data.main.temp;
    let humid = data.main.humidity;
    let windSpeed = data.wind.speed;
    let iconID = data.weather[0].icon;
    let ultraViolet = uvData.value;
    let date = moment().format();

    let idGenerator = "city-" + idCounter
    idCounter++;

    let iconUrl = "https://openweathermap.org/img/wn/" + iconID + "@2x.png";

    let formattedDate = dateFormat(date, 0);

    let forecast = forecastCompiler(forecastData);

    let cityDataObj = {
        name: cityName,
        id: idGenerator,
        humidity: humid,
        temp: temperature,
        wind: windSpeed,
        icon: iconUrl,
        uv: ultraViolet,
        date: formattedDate,
        fiveDay: forecast
    };

    let alreadyStored = false;
    for (let i = 0; i < cities.length; i++) {
        if (cityDataObj.name == cities[i].name) {
            cities[i] = cityDataObj;
            alreadyStored = true;
        }
    }
    if (alreadyStored == false) {
        cities.push(cityDataObj);
    }


    saveCities();

    display(cityDataObj);

};
//Takes in cityDataObjects and passes them on to all 3 display programs
function display(cityDataObj) {
    displayCityButtons(cityDataObj);
    displayCurrentWeatherData(cityDataObj);
    displayForecastWeatherData(cityDataObj);
};

//creates the city buttons and adds them to the HTML
function displayCityButtons(cityWeatherObject) {

    let deleteX = $("<i>")
        .text("X");

    let cityDeleteButton = $("<button>")
        .addClass("delete-btn")
        .attr("id", cityWeatherObject.id)
        .append(deleteX);

    let cityButton = $("<button>")
        .addClass("city-btn")
        .attr("id", cityWeatherObject.id)
        .text(cityWeatherObject.name);

    let cityPlateLeft = $("<div>")
        .addClass("col-10 button-div")
        .append(cityButton);

    let cityPlateRight = $("<div>")
        .addClass("col-2 button-div")
        .append(cityDeleteButton);

    let cityPlate = $("<div>")
        .addClass("row")
        .attr("id", cityWeatherObject.id)
        .append(cityPlateLeft, cityPlateRight);

    $("#locations").prepend(cityPlate);

};

//creates the current weather card and appends it to the HTML
function displayCurrentWeatherData(cityWeatherObject) {

    let icon = $("<img>")
        .attr("src", cityWeatherObject.icon);

    let cityTitle = $("<h3>")
        .text(cityWeatherObject.name)
        .append(icon);

    let tempLevel = $("<p>")
        .text("Temperature: " + cityWeatherObject.temp + " °F");

    let humidityLevel = $("<p>")
        .text("Humdity: " + cityWeatherObject.humidity + "%");

    let windLevel = $("<p>")
        .text("Wind Speed: " + cityWeatherObject.wind + " MPH");

    let uvSpan = $("<span>")
        .css("background-color", uvColor(cityWeatherObject.uv)[0])
        .css("color", uvColor(cityWeatherObject.uv)[1])
        .text(cityWeatherObject.uv);

    let uvLevel = $("<p>")
        .text("UV index: ")
        .append(uvSpan);

    let cardContent = $("<div>")
        .addClass("card-content")
        .append(cityTitle, tempLevel, humidityLevel, windLevel, uvLevel);

    let today = $("<div>")
        .addClass("card")
        .append(cardContent);

    $("#today").empty();

    $("#today").append(today);
};

function displayForecastWeatherData(cityWeatherObject) {

    // DATA: day 1 date | day 1 icon | day 1 low | day 1 high | day 1 humidity |
    //       day 2 date | day 2 icon | day 2 low | day 2 high | day 2 humidity |
    //       day 3 date | day 3 icon | day 3 low | day 3 high | day 3 humidity |
    //       day 4 date | day 4 icon | day 4 low | day 4 high | day 4 humidity |
    //       day 5 date | day 5 icon | day 5 low | day 5 high | day 5 humidity |

    $("#five-day").empty();

    let forecastTitle = $("<h3>")
        .addClass("row forecast-title")
        .text("5-Day Forecast");

    let datePlate = $("<div>")
        .attr("id", "date-plate")
        .addClass("row");

    $("#five-day").append(forecastTitle, datePlate);

    for (let i = 0; i < 5; i++) {

        let date = $("<h5>")
            .text(cityWeatherObject.fiveDay[i * 5]);

        let icon = $("<img>")
            .attr("src", cityWeatherObject.fiveDay[i * 5 + 1])
            .addClass("forecast-icon");

        let tempMax = $("<p>")
            .text("High: " + cityWeatherObject.fiveDay[i * 5 + 2] + " °F");

        let tempMin = $("<p>")
            .text("Low: " + cityWeatherObject.fiveDay[i * 5 + 3] + " °F");

        let Humidity = $("<p>")
            .text("Humidity: " + cityWeatherObject.fiveDay[i * 5 + 4] + " %");

        let cardLeft = $("<div>")
            .append(tempMax, tempMin, Humidity)

        let cardBody = $("<div>")
            .addClass("forecast-card-body")
            .append(cardLeft, icon)

        let cardHeader = $("<div>")
            .addClass("forecast-card-header")
            .append(date)

        let forecastCard = $("<div>")
            .addClass("forecast-card")
            .append(cardHeader, cardBody);

        $("#date-plate").append(forecastCard);

    }

};

function deleteCity(cityId) {

    console.log("entered delete function");
    //console.log("deleteCity Accessed, cityID: " + cityId);
    let citySelected = $("#" + cityId).parent(".row").prevObject[0];
    //console.log(citySelected);
    citySelected.remove();

    let updatedCities = [];

    //loop through city list
    for (let i = 0; i < cities.length; i++) {
        //if cities[i].id doesn't match the value of the current city it is kept, thus
        //only the city being deleted is not added to the array
        console.log("cities[i].id:" + cities[i].id + ", cityId: " + cityId);
        if (cities[i].id !== cityId) {
            updatedCities.push(cities[i]);
        }
    }
    console.log("updatedCities:" + updatedCities);
    console.log("cities:" + cities);
    //reassign cities array to be the same as updatedcities
    cities = updatedCities;

    console.log("cities:" + cities);

    saveCities();

    //update current weather display to remove data from deleted city
    if (cities.length != 0) {
        displayCurrentWeatherData(cities[cities.length - 1]);
    }


};

function saveCities() {
    //console.log("saveCities, cities: " + JSON.stringify(cities));
    localStorage.clear();
    localStorage.setItem("cities", JSON.stringify(cities));
};

function loadCities() {
    //grabs saved cities
    let loadedCities = localStorage.getItem("cities");

    localStorage.clear();

    if (!loadedCities) {
        cities = [];
        return false;
    };

    //parses saved cities and adds to cities array
    cities = JSON.parse(loadedCities);

    for (let i = 0; i < cities.length; i++) {
        getWeatherData(cities[i].name);
    }

};

//when the search bar is 
$("#search-button").on("click", function () {

    //get and store the city name from the search bar
    let cityName = $(this).siblings("#search-bar").val().trim();

    //cityName = nameFormat(cityName); Formatting not working correctly,
    //                                  will reopen route when it is fixed

    if (cityName != "") {
        //control to keep from searching the same name twice
        for (let i = 0; i < cities.length; i++) {
            if (cityName == cities[i].name) {
                alert("That City is Already Listed")
                return
            }
        }
        //sends viable city name to the GetWeatherData function
        getWeatherData(cityName);
    }
    else {
        return;
    }

});

$("#locations").on("click", function () {
    //console.log(event.target);

    if (event.target.matches(".city-btn")) {
        let cityId = event.target.getAttribute("id");
        //console.log("cityId: " + cityId);
        for (let i = 0; i < cities.length; i++) {
            if (cities[i].id == cityId) {
                displayForecastWeatherData(cities[i]);
                displayCurrentWeatherData(cities[i]);
            }
        }

    }
    else if (event.target.matches(".delete-btn")) {
        let cityId = event.target.getAttribute("id");
        deleteCity(cityId);
    }

});

loadCities();