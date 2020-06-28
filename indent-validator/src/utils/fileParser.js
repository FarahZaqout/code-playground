const fs = require('fs');
const path = require('path');
const axios = require('axios');

const fileReaderPromise = require('./fileReaderPromise');
const { validateHtml } = require('./validateStyle');

// wraps the logic of reading the file and validating its style in one function.
const fileParser = async () => {
  // const html = await axios('https://www.theguardian.com/international').catch(console.log);
  // const data = html.data;
  try{
    const data = await fileReaderPromise();
    const dataString = data.toString();
    validateHtml.validateIndentation(dataString);
  } catch(e) {
    console.log(e)
  }
}

module.exports = fileParser;