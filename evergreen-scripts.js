#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const script = process.argv[2];

const runScript = () => {
  return new Promise(async (resolve, reject) => {
    switch (script) {

      case 'gh-pages':
        const args = [path.resolve(__dirname, `scripts/${script}.js`)];
        const scriptProcess = spawn('node', args, { stdio: 'inherit' });

        scriptProcess.on('close', code => {
          if (code !== 0) {
            reject();
          }
          resolve();
        });
        break;
      default:
        console.error('Error, missing script name');
        process.exit(1); // eslint-disable-line no-process-exit
        break;

    }

  });
};

const run = async () => {
  try {
    await runScript();
  } catch (err) {
    console.log('Script exited with an error');
  }
  process.exit(1); // eslint-disable-line no-process-exit
};

run();