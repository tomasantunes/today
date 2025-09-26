var express = require('express');
var countries = require("../data/countries.json");
var router = express.Router();

router.get("/get-countries", (req, res) => {
  var countries_arr = countries.map(function(c) {
    return c.country;
  });

  res.json({status: "OK", data: countries_arr});
});

module.exports = router;