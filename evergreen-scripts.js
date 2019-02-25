#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const commander = require('commander');
const scriptPkg = require(path.join(__dirname, 'package.json'));

let script = '', src = '';

console.log(`${chalk.rgb(175, 207, 71)('-------------------------------------------------------')}`);
console.log(`${chalk.rgb(175, 207, 71)('Welcome to Evergeen-Scripts ♻️')}`);
console.log(`${chalk.rgb(175, 207, 71)('-------------------------------------------------------')}`);

new commander.Command(scriptPkg.name)
  .version(scriptPkg.version)
  .arguments('<evergreen-script>')
  .usage(`${chalk.green('<evergreen-script>')} [options]`)
  .option('--src <source-directory>', "Set the source directory of your application's index.html file. Defaults to ./src ")
  .action((cmd, options) => {
    script = cmd;
    src = options.src || 'src';
  })
  .parse(process.argv);

const runScript = () => {
  return new Promise(async (resolve, reject) => {
    switch (script) {

      case 'gh-pages':
        const args = [path.resolve(__dirname, `scripts/${script}.js`), src];
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