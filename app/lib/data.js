/*
*   Storing and editing data
*/

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// container for module to be exported

let lib = {};

// base directory of .data
lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = function (dir, filename, data, callback) {
    // open file for write
  fs.open(`${lib.baseDir}${dir}/${filename}.json`, 'wx', function (err,fileDescriptor) {
    if (!err && fileDescriptor) {
            // Convert data to string
      let stringData = JSON.stringify(data)

            // write file and close
      fs.writeFile(fileDescriptor, stringData, function (err) {
        if (!err) {
          fs.close(fileDescriptor, function (err) {
            if (!err) {
              callback(false)
            } else {
              callback('Error Closing file')
            }
          });
        } else {
          callback('Error Writing to new file')
        }
      });
    } else {
      callback('Could not create new file, it may already exist')
    }
  });
}

lib.read = function (dir, filename, callback) {
  fs.readFile(`${lib.baseDir}${dir}/${filename}.json`, 'utf-8', function (err, data) {
    if(!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data)
    }
    
  });
}

lib.update = function (dir, filename, data, callback) {
  fs.open(`${lib.baseDir}${dir}/${filename}.json`, 'r+', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      let stringData = JSON.stringify(data)

            // truncate file
      fs.ftruncate(fileDescriptor, function (err) {
        if (!err) {
          fs.write(fileDescriptor, stringData, function (err) {
            if (!err) {
              fs.close(fileDescriptor, function (err) {
                if (!err) {
                  callback(false)
                } else {
                  callback('error closing file')
                }
              })
            } else {
              callback('Error writing to existing file')
            }
          });
        } else {
          callback('Error truncating file')
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist')
    }
  });
}

lib.delete = function (dir, filename, callback) {
    // unlink from filesystem
  fs.unlink(`${lib.baseDir}${dir}/${filename}.json`, function (err) {
    if (!err) {
      callback(false)
    } else {
      callback('Error deleting file')
    }
  });
}

module.exports = lib
