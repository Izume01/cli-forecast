import axios from "axios";
import figlet from "figlet";
import inquirer from "inquirer";
import chalk from "chalk";
import dotenv from "dotenv";
import ora from "ora";

dotenv.config();

if (!process.env.API_KEY) {
  console.error(chalk.red.bold("Error: API_KEY is not set in the .env file."));
  console.error(chalk.yellow("Please create a .env file by copying .env.example, and enter your OpenWeatherMap API key."));
  process.exit(1);
}

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
    console.log(chalk.italic("Displaying a daily summary based on 3-hour interval data.")); // Clarifying message
    data.list.forEach((weather, index) => {
      if (index % 8 === 0) {
        process.stdout.write("\n");
        const date = new Date(weather.dt * 1000);
        console.log(chalk.bold.yellow(date.toDateString()));
        console.log(chalk.bold.cyan(`Temperature: ${weather.main.temp}°C`));
        console.log(chalk.bold.magenta(`Conditions: ${weather.weather[0].description}`)); // Added conditions
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
  figlet.text("Weather Forecast", async (err, data) => { // Make the callback async
    if (err) {
      console.log(chalk.red("Error generating ASCII art header."));
      console.dir(err);
      process.exit(1); // Exit if Figlet fails
    }
    console.log(chalk.blue(data));

    // Moved the rest of the main function logic inside the callback
    try {
      const {location} = await inquirer.prompt([
        {
            type: "input",
            name: "location",
            message: "Enter the location for which you want to see the weather forecast:",
        }
      ]);

      if (!location || location.trim() === "") {
        console.log(chalk.red.bold("Error: Location cannot be empty. Please enter a valid location."));
        process.exit(1);
      }

      const {forecastType} = await inquirer.prompt([
        {
            type: 'list',
            name: 'forecastType',
            message: 'Choose the type of forecast you want to see:',
            choices: [
                {name : 'Current Weather', value: 'current'},
                {name : '7-Day Weather Forecast', value: '7-day'}
            ]
        }
      ]);

      if (forecastType === 'current') {
          await getWeather(location);
      } else {
          await get7DayForecast(location);
      }
    } catch (promptError) {
      // Handle errors from inquirer prompts, e.g., if the user cancels
      console.error(chalk.red("Error during user input:"), promptError);
      process.exit(1);
    }
  });
}

main();
