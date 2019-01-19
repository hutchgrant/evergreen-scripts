const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

module.exports = class Setup {
  constructor(enableStdOut) {
    this.enableStdOut = enableStdOut; // debugging tests
  }

  async addHomepage(appName) {
    const projectPkg = require(path.resolve(appName, 'package.json'));

    projectPkg.homepage = 'https://hutchgrant.github.io/test-app';

    return await fs.writeFileSync(
      path.resolve(appName, 'package.json'),
      JSON.stringify(projectPkg, null, 2) + os.EOL
    );
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