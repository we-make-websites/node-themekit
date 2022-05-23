const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const config = require('./config')

/**
 * Spawns a child process to run the Theme Kit executable with given parameters.
 * @param {String} args - Array to pass to the executable.
 * @param {String} cwd - Directory to run command on.
 * @param {String} logLevel - Level of logging required.
 */
function runExecutable(args, cwd, logLevel) {
  const logger = require('./logger')(logLevel)

  return new Promise((resolve, reject) => {
    logger.silly('Theme Kit command starting')
    let errors = ''
    let response = ''

    const pathToExecutable = path.join(config.destination, config.binName)
    fs.statSync(pathToExecutable)

    const childProcess = spawn(pathToExecutable, args, {
      cwd,
      stdio: ['inherit', 'pipe', 'pipe']
    })

    childProcess.on('error', (err) => {
      errors += err
      logger.error(err.toString('utf8'))
    })

    childProcess.stderr.on('data', (err) => {
      errors += err
      logger.error(err.toString('utf8'))
    })

    childProcess.stdout.on('data', (data) => {
      response += data.toString('utf8')
    })

    childProcess.on('close', () => {
      logger.silly('Theme Kit command finished')

      if (errors) {
        reject(errors)
      }

      resolve(response)
    })
  })
}

module.exports = runExecutable
