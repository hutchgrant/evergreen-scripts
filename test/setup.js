const os = require('os');
const { spawn } = require('child_process');

module.exports = class Setup {
  constructor(enableStdOut) {
    this.enableStdOut = enableStdOut; // debugging tests
  }

  run(cmd, args) {
    return new Promise(async (resolve, reject) => {

      if (cmd === 'node') {
        cmd = os.platform() === 'win32' ? 'npm.cmd' : 'node';
      }

      const proc = spawn(cmd, args);
      let err = '';
      let output = '';

      proc.on('close', code => {
        if (code !== 0) {
          reject(err);
          return;
        }
        resolve(output);
      });
      proc.stderr.on('data', (data) => {
        err = data.toString('utf8');
        if (this.enableStdOut) {
          console.log(err); // eslint-disable-line
        }
      });
      proc.stdout.on('data', (data) => {
        output = data.toString('utf8'); // eslint-disable-line
      });
    });
  }
};