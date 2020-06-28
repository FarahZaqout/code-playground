const path = require('path')
const fs = require('fs');

/**
 * 
 * @param {string} filename this is read automatically from the ../files directory. 
 * if not provided in code, it should be provided in the terminal as an argument.
 * example: node fileParser.js filename.ext. 
 * This should be coming from user input and the argv is for non-automated testing purposes.
 */
const fileReaderPromise = (filename) => new Promise((resolve, reject) => {
  console.log(process.argv[2])
  if (!filename && !process.argv[2]) {
    throw new Error(
      'Error: file reader function requires a filename. \nExample: node fileParser.js hello-world.html\nOr edit the function call.'
      );
  }
  const filePath = path.join(__dirname, '..', 'files', ((filename || process.argv[2])));
  fs.readFile(filePath, (err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

module.exports = fileReaderPromise;
