var axios = require("axios");
var secretConfig = require("../secret-config.json");

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

module.exports = {
    getChatResponse,
    getChatResponseSearch,
    default: {
        getChatResponse,
        getChatResponseSearch
    }
};
