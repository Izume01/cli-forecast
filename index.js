import axios from "axios";
import figlet from "figlet";
import inquirer from "inquirer";
import chalk from "chalk";
import dotenv from "dotenv";
import ora from "ora";

dotenv.config();

const API_KEY = process.env.API_KEY;

const getWeather = async (location) => {
  const spinner = ora("Fetching weather data from the server...").start();
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}`
    );
    spinner.stop();

    const data = response.data;

    process.stdout.write("\n");
    console.log(chalk.green(`Weather Forecast for ${data.name}:`));

    process.stdout.write("\n");
    const temp = (data.main.temp - 273.15).toFixed(2);
    console.log(chalk.bold.yellow(`Temperature: ${temp}°C`));
    console.log(chalk.bold.cyan(`Conditions: ${data.weather[0].description}`));
    console.log(chalk.bold.green(`Humidity: ${data.main.humidity}%`));
    console.log(chalk.bold.blue(`Wind Speed: ${data.wind.speed} m/s`));
  } catch (error) {
    spinner.stop();
    console.log(chalk.red("Error fetching weather data."));
    console.error(chalk.yellow(error.response?.data?.message || error.message));
  }
};

const get7DayForecast = async (location) => {
  const spinner = ora(
    "Fetching 7-day weather forecast from the server..."
  ).start();
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`
    );
    spinner.stop();

    const data = response.data;
    console.log(chalk.green(`7-Day Weather Forecast for ${data.city.name}:`));
    data.list.forEach((weather, index) => {
      if (index % 8 === 0) {
        process.stdout.write("\n");
        const date = new Date(weather.dt * 1000);
        console.log(chalk.bold.yellow(date.toDateString()));
        console.log(chalk.bold.cyan(`Temperature: ${weather.main.temp}°C`));
        console.log(chalk.bold.green(`Humidity: ${weather.main.humidity}%`));
        console.log(chalk.bold.blue(`Wind Speed: ${weather.wind.speed} m/s`));
      }
    });
  } catch (error) {
    spinner.stop();
    console.log(chalk.red("Error fetching 7-day weather forecast."));
    console.error(chalk.yellow(error.response?.data?.message || error.message));
  }
};

async function main() {
  figlet.text("Weather Forecast", (err, data) => {
    if (err) {
      console.log("Something went wrong");
      console.dir(err);
      return;
    }
    console.log(chalk.blue(data));
  });

  const {location} = await inquirer.prompt([
    {
        type: "input",
        name: "location",
        message: "Enter the location for which you want to see the weather forecast:",

    }
  ])
  const {forecastType} = await inquirer.prompt([
    {
        type: 'list' , 
        name: 'forecastType',
        message: 'Choose the type of forecast you want to see:',
        choices: [
            {name : 'Current Weather', value: 'current'},
            {name : '7-Day Weather Forecast', value: '7-day'}
        ]
    }
  ])

    if (forecastType === 'current') {
        await getWeather(location);
    } else {
        await get7DayForecast(location);
    }
}

main();
