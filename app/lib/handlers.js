/*
*   Request handlers
*/


//Dependendcies
const _data = require('./data');
const helpers = require('./helpers');

//users
let handlers = {}

handlers.getPost = function (data, callback) {
  callback(200, {
    '0': {
      slug: 'Helllllllooooo-World',
      post: 'This is just a simple hello world post, nothing else to it'
    },
    '1': {
      slug: 'Testing this time',
      post: 'Testing Testing Im just suggesting'
    }
  })
}

handlers.notFound = function (data, callback) {
  callback(404)
}

handlers.ping = function (data, callback) {
  callback(200)
}

handlers.users = function(data, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1)
  {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
}

//container for user sub methods
handlers._users = {};
//Required data: firstName, lastName, phone, password, tosAgreement
//option data: none
handlers._users.post = function(data, callback) {
  //Check all required fields filled out

  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length == 10 ? data.payload.password.trim() : false;
  let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
  console.log(typeof(data.payload.tosAgreement))

  if(firstName && lastName && phone && password && tosAgreement) {

    //make sure user doesn't exist
    _data.read('users', phone, function(err, data) {

      if(err){ 
        //hash password
        const hashedPassword = helpers.hash(password);

        if(hashedPassword)
        {
          let userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          }
  
          _data.create('users', phone, userObject, function(err) {
            if(!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, {'Error' : 'Could not create user'})
            }
          });
        } else {
          callback(500, {'Error' : 'Could not hash password'})
        }

      } else {
        callback(400, {'Error' : 'User with phone number already exist'});
      }

    });
  } else {
    callback(400, {'Error' : 'Missing required fields'});
  }
}

//Required data: phone
//optional data: none
//@TODO only let authenticated user access thier object
handlers._users.get = function(data, callback) {
  //check if phone is valid
  let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone) {

    //get token from header
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    //verify it if for phone number
    handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
      if(tokenIsValid){
        _data.read('users', phone, function(err, getData) {
          if(!err && getData) {
            //remove hash password
            delete getData.hashedPassword;
            callback(200, getData);
          }else {
            callback(404)
          }
        });

      }else{
        callback(403, {'Error' : 'Missing token in header or token is invalid'});
      }
    });


  }else {
    callback(400, {"Error" : "missing required field"})
  }
}

//Required: phone
//Optional: firstName, LastName, password [at least one required]
handlers._users.put = function(data, callback) {
  let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.length == 10 ? data.payload.phone.trim() : false;

  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length == 10 ? data.payload.password.trim() : false;

  //error if phone is invalid
  if(phone){
    if(firstName || lastName || password) {

      //get token from header
      let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
      //verify it if for phone number
      handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
        if(tokenIsValid){

          _data.read('users', phone, function(err, userData) {
            if(!err && userData){
              //update field if necessary
              if(firstName){
                userData.firstName = firstName;
              }
              if(lastName){
                userData.lastName = lastName;
              }
              if(password){
                userData.hashedPassword = helpers.hash(password);
              }

              _data.update('users', phone, userData, function(err) {
                if(!err) {
                  callback(200);
                }else {
                  console.log(err);
                  callback(500, {'Error' : 'Could not update the user'});
                }
              });

            }else{
              callback(400, {'Error' : 'The specified user does not exist'});
              
            }
          });

        } else{
          callback(403, {'Error' : 'Missing token in header or token is invalid'});
        }
      });

    }else {
      callback(400, {'Error' : 'Missing field to update'})
    }
  } else {
    console.log("first");
    callback(400, {'Error' : 'Missing required field'});
  }
}

//Required: phone
//@TODO only let authenticated users delete
//@TODO delete anything associated with this user
handlers._users.delete = function(data, callback) {
  //check if phone is valid
  let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone) {

    //get token from header
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    //verify it if for phone number
    handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
      if(tokenIsValid){
        _data.read('users', phone, function(err, getData) {
          if(!err && getData) {
            //remove hash password
            _data.delete('users', phone, function(err, data) {
              if(!err){
                callback(200)
              }else {
                callback(500, {"Error" : "Could not delete user"});
              }
            });
    
          }else {
            callback(400, {"Error" : "Could not find user"});
          }
        });
      }else{
        callback(403, {'Error' : 'Missing token in header or token is invalid'});
      }
    });
  }else {
    callback(400, {"Error" : "missing required field"});
  }
}

handlers.tokens = function(data, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1)
  {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
}

//container for token methods

handlers._tokens = {};

//required: phone, password
//optional: none
handlers._tokens.post = function(data, callback) {
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length == 10 ? data.payload.password.trim() : false;

  if(phone && password){
    //lookup user with phone number
    _data.read('users', phone, function(err, userData) {
      if(!err && userData){
        //hash sent password and compare to stored password
        let hashedPassword = helpers.hash(password);

        if(hashedPassword === userData.hashedPassword){

          //create new token with random name. set expiration 1 hour in future
          let tokenId = helpers.createRandomString(20);
          let expires = Date.now() + 1000 * 60 * 60;
          let tokenObject = {
            'phone' : phone,
            'id' : tokenId,
            'expires' : expires
          };

          _data.create('tokens', tokenId, tokenObject, function(err){
            if(!err){
              callback(200, tokenObject);
            }else{
              callback(500, {'Error' : 'Could not create token'});
            }
          });
        }else {
          callback(400, {'Error' : 'Password did not match'});
        }
      }else {
        callback(400, {'Error' : 'Could not find user'});
      }
    });

  }else{
    callback(400, {'Error' : 'Missing required fields'});
  }
}

//Required: phone
//optional: none
handlers._tokens.get = function(data, callback) {
  let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.length == 20 ? data.queryStringObject.id.trim() : false;
  if(id) {
    _data.read('tokens', id, function(err, tokenData) {
      if(!err && tokenData) {
        //remove hash password
        callback(200, tokenData);
      }else {
        callback(404)
      }
    });
  }else {
    callback(400, {"Error" : "missing required field"})
  }
}

//Required data: id, extend
//Optional: none
handlers._tokens.put = function(data, callback) {
  let id = typeof(data.payload.id) === 'string' && data.payload.id.length == 20 ? data.payload.id.trim() : false;
  let extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend == true ? true : false;
  if(id && extend){
    _data.read('tokens', id, function(err, tokenData) {
      if(!err && tokenData){
        if(tokenData.expires > Date.now()) {
          //set expiration for an hour later
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          _data.update('tokens', id, tokenData, function(err) {
            if(!err){
              callback(200);
            }else{
              callback(500, {'Error' : 'could not update the tokens expirations'});
            }
          });
        }else{
          callback(400, {"Error" : "Token expired"})

        }
      }else{
        callback(400, {"Error" : "No token exist"})

      }
    });
  }else {
    callback(400, {"Error" : "missing required field or invalid field"})
  }
}

//Required: id
//Optional: none
handlers._tokens.delete = function(data, callback) {
  let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.length == 20 ? data.queryStringObject.id.trim() : false;
  if(id) {

    _data.read('tokens', id, function(err, tokenData) {
      if(!err && tokenData) {
        //remove hash password
        _data.delete('tokens', id, function(err, data) {
          if(!err){
            callback(200)
          }else {
            callback(500, {"Error" : "Could not delete token"});
          }
        });

      }else {
        callback(400, {"Error" : "Could not find token"});
      }
    });
  }else {
    callback(400, {"Error" : "missing required field"});
  }
}


//Verify if given token id is valid for a user
handlers._tokens.verifyToken = function(id, phone, callback) {
  //lookup token
  _data.read('tokens', id, function(err, tokenData){
    if(!err && tokenData){
      if(tokenData.phone == phone && tokenData.expires > Date.now()){
        callback(true);
      }else{
        callback(false);
      }
    }else {
      callback(false);
    }
  });
}







module.exports = handlers;