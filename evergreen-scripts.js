#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const script = process.argv[2];

const runScript = () => {
  switch (script) {

    case 'gh-pages':
      const args = [path.resolve(process.cwd(), `../scripts/${script}.js`)];
      
      console.log(args);
      const scriptProcess = spawn('node', args, { stdio: 'inherit' });

      scriptProcess.on('close', code => {
        if (code !== 0) {
          reject({
            command: `${command} ${args.join(' ')}`
          });
          return;
        }
        resolve();
      });
      break;
    default:
      console.error('Error, missing script name');
      process.exit(1); // eslint-disable-line no-process-exit
      break;

  }
};

const run = async () => {
  try {
    await runScript();
  } catch (err) {
    console.error(err);
  }
  process.exit(); // eslint-disable-line no-process-exit
};

run();