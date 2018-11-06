/*
* Helpers for various task
*/

//dependincies
const crypto = require('crypto');
const config = require('./config');

//container for all helpers
let helpers = {};

// Create a SHA256 hash
helpers.hash = function(str) {
  if(typeof(str) === 'string' && str.length > 0) {
    let hash = crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

//Parse a Json string to object in all cases without throwing
helpers.parseJsonToObject = function(str) {
  try{
    var obj = JSON.parse(str);
    return obj;
  }catch(err) {
    return {};
  }

};

//create string of random characters of given length
helpers.createRandomString = function(strLength){

  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  const possibleCharacters = 'asdfghjklqwertyuiopzxcvbnm1234567890';
  let str = '';
  for(let i = 0; i < strLength; i++)
  {
    str += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
  }

  return str;
}








module.exports = helpers;