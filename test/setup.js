const os = require('os');
const { spawn } = require('child_process');

module.exports = class Setup {
  constructor(enableStdOut) {
    this.enableStdOut = enableStdOut; // debugging tests
  }

  node(args) {
    return new Promise(async (resolve, reject) => {
      const command = os.platform() === 'win32' ? 'npm.cmd' : 'node';
      const npm = spawn(command, args);
      let err = '';

      npm.on('close', code => {
        if (code !== 0) {
          reject(err);
          return;
        }
        resolve();
      });
      npm.stderr.on('data', (data) => {
        err = data.toString('utf8');
        if (this.enableStdOut) {
          console.log(err); // eslint-disable-line
        }
      });
      npm.stdout.on('data', (data) => {
        if (this.enableStdOut) {
          console.log(data.toString('utf8')); // eslint-disable-line
        }
      });
    });
  }
  git(cmd, args) {
    return new Promise(async (resolve, reject) => {
      const git = spawn(cmd, args);
      let err = '';
      let output = '';

      git.on('close', code => {
        if (code !== 0) {
          reject(err);
          return;
        }
        resolve(output);
      });
      git.stderr.on('data', (data) => {
        err = data.toString('utf8');
        if (this.enableStdOut) {
          console.log(err); // eslint-disable-line
        }
      });
      git.stdout.on('data', (data) => {
        output = data.toString('utf8'); // eslint-disable-line
      });
    });
  }
};