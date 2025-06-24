var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var countries = require("./data/countries.json");
var secretConfig = require("./secret-config.json");
var axios = require("axios");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/get-countries", (req, res) => {
  var countries_arr = countries.map(function(c) {
    return c.country;
  });

  res.json({status: "OK", data: countries_arr});
});

app.post("/get-daily-report", async (req, res) => {
  var current_date = req.body.current_date;
  var category = req.body.category;
  var country = req.body.country;
  var language = req.body.language;

  var prompt1 = `The current date is ${current_date}. `;
  var prompt2 = `The current date is ${current_date}. `;

  if (category != "-1") {
    prompt1 += `Within the category of ${category}, `;
    prompt2 += `Within the category of ${category}, `;
  }
  if (country != "-1") {
    prompt1 += `related to the country of ${country}, `;
    prompt2 += `related to the country of ${country}, `;
  }

  prompt1 += "can you tell me all the major historical or newsworthy events that happened on this day and month in previous years as well as holidays, anniversaries or commemorative days. Tell me any odd facts or curiosities about this day and month. Tell me about any death or birth dates of important or famous people on this day and month. Tell me if there were any important or famous people had any achievements on this day and month. Tell me also of important product launches, movie releases, album releases, book releases or game releases for this day and month. ";

  prompt1 += "Make sure you don't mention any events on any other dates besides the exact day and month I told you, even if they are close. ";
  prompt1 += "Make sure you only mention events that you are 100% sure happened on this exact day and month. ";
  
  if (category != "-1") {
    prompt1 += "Make sure you only mention events directly related to the category I have chosen. ";
  }
  if (country != "-1") {
    prompt1 += "Make sure you only mention events directly related to the country I have chosen. ";
  }

  prompt2 += "can you tell me any important events that are happening on this date? ";

  prompt1 += "Don't write anything directed at me, jump right into writing what was asked. ";
  prompt2 += "Don't write anything directed at me, jump right into writing what was asked. ";

  prompt1 += `Please answer in the following language: ${language}.`;
  prompt2 += `Please answer in the following language: ${language}.`;

  var res1 = await getChatResponse(prompt1);
  if (res1 == null) {
    res.json({status: "NOK", error: "Error getting report."});
  }

  var res2 = await getChatResponseSearch(prompt2);
  if (res2 == null) {
    res.json({status: "NOK", error: "Error getting report."});
  }

  res.json({status: "OK", data: res1 + "\n\n" + res2});
});

async function getChatResponse(prompt) {
  try{
    const response = await axios.post("https://api.openai.com/v1/responses", {
      "model": "gpt-4.1",
      "input": prompt
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + secretConfig.OPENAI_API_KEY
      }
    });
    var text = response.data.output[0].content[0].text;
    return text;
  }
  catch(err){
    console.log(err);
    return null;
  }
}

async function getChatResponseSearch(prompt) {
  try{
    const response = await axios.post("https://api.openai.com/v1/responses", {
      "model": "gpt-4.1",
      "tools": [{ "type": "web_search_preview" }],
      "input": prompt
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + secretConfig.OPENAI_API_KEY
      }
    });
    var text = response.data.output[1].content[0].text;
    return text;
  }
  catch(err){
    console.log(err);
    return null;
  }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
