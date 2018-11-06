/*
* Create and export configuration variables
*/

// containers for all environments

let environments = {}

// staging env (default)

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashSecret : "a sereit"
}

// Production env

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashSecret : "a sereit v2"
}

// determine env to be exported out
let currentEnvironment = typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV.toLocaleLowerCase()
    : ''

// check that current env exist, else default to staging

let environmentToExport = typeof environments[currentEnvironment] === 'object'
    ? environments[currentEnvironment]
    : environments.staging

// export module

module.exports = environmentToExport
