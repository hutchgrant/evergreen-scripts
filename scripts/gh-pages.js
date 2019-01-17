const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const copyFolder = require('../lib/copy-folder');
const { spawn } = require('child_process');
const TARGET_DIR = 'dist';
const BUILD_DIR = 'public';
let scriptProcess, args, command;

const mngProcess = (resolve, reject) => {
  scriptProcess.on('close', code => {
    if (code !== 0) {
      reject({
        command: `${command} ${args.join(' ')}`
      });
      return;
    }
    resolve();
  });
};

/// initialize git repository
const initGit = () => {
  return new Promise((resolve, reject) => {
    command = 'git';
    args = ['init'];
    scriptProcess = spawn(command, args, { stdio: 'inherit' });
    mngProcess(resolve, reject);
  });
};

/// If testing, add git config
const gitConfig = async () => {
  if (process.env.NODE_ENV === 'testing') {
    console.log('Adding git config');
    return await fs.copyFileSync(
      path.resolve(process.cwd(), '../templates', 'gitconfig'),
      path.join(process.cwd(), '.git', 'config')
    );
  }
};

/// create branch gh-pages
const addBranch = () => {
  return new Promise(async (resolve, reject) => {
    command = 'git';
    args = ['branch', 'gh-pages'];
    let missingMaster = false;

    scriptProcess = spawn(command, args);

    scriptProcess.stderr.on('data', (data) => {
      if (data.toString().substring(0, 41) === "fatal: Not a valid object name: 'master'.") {
        missingMaster = true;
      }
    });
    scriptProcess.on('close', async code => {
      if (code !== 0) {
        if (missingMaster) {
          await createMaster();
        } else {
          reject({
            command: `${command} ${args.join(' ')}`
          });
          return;
        }
      }
      resolve();
    });
  });
};

/// Git add files
const gitAddFiles = () => {
  return new Promise((resolve, reject) => {
    command = 'git';
    args = ['add', '.'];
    scriptProcess = spawn(command, args, { stdio: 'inherit' });
    mngProcess(resolve, reject);
  });
};

/// Create initial commit in order to add master branch
const createMaster = () => {
  const commitFiles = () => {
    return new Promise((resolve, reject) => {
      command = 'git';
      args = ['commit', '-m', 'Initial Commit'];
      scriptProcess = spawn(command, args, { stdio: 'inherit' });
      mngProcess(resolve, reject);
    });
  };

  return new Promise(async (resolve, reject) => {
    try {
      await gitAddFiles();
      await commitFiles();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

/// create worktree folder using gh-pages branch
const addWorkTree = () => {
  return new Promise((resolve, reject) => {
    command = 'git';
    args = ['worktree', 'add', '--detach', TARGET_DIR];
    scriptProcess = spawn(command, args, { stdio: 'inherit' });
    mngProcess(resolve, reject);
  });
};

/// checkout orphan gh-pages within worktree
const checkoutOrphan = () => {
  return new Promise((resolve, reject) => {
    command = 'git';
    args = ['checkout', '--orphan', 'gh-pages'];
    scriptProcess = spawn(command, args, { stdio: 'inherit' });
    mngProcess(resolve, reject);
  });
};

/// Build project
const npmBuild = () => {
  return new Promise((resolve, reject) => {
    command = 'npm';
    args = ['run', 'build'];
    scriptProcess = spawn(command, args, { stdio: 'inherit' });
    mngProcess(resolve, reject);
  });
};

/// remove initial files in worktree
const gitRemoveFiles = () => {
  return new Promise((resolve, reject) => {
    command = 'git';
    args = ['rm', '-rf', '.'];
    scriptProcess = spawn(command, args, { stdio: 'inherit' });
    mngProcess(resolve, reject);
  });
};

/// copy build files
const copyBuildFiles = async () => {
  const buildDir = path.resolve(process.cwd(), '..', BUILD_DIR);
  const targetDir = path.resolve(process.cwd(), '..', TARGET_DIR);
  const files = await fsPromises.readdir(buildDir);

  return await Promise.all(
    files.map(async file => {
      const resolvedPath = path.join(buildDir, file);

      if (fs.lstatSync(resolvedPath).isDirectory()) {
        return await copyFolder(resolvedPath, targetDir);
      } else if (await fs.existsSync(resolvedPath)) {
        return await fs.copyFileSync(
          resolvedPath,
          path.join(targetDir, file)
        );
      }
    })
  );
};

/// commit everything in worktree folder
const commitGHPages = () => {
  return new Promise((resolve, reject) => {
    command = 'git';
    args = ['commit', '-m', 'Updating gh-pages'];
    scriptProcess = spawn(command, args, { stdio: 'inherit' });
    mngProcess(resolve, reject);
  });
};

/// push new gh-pages branch
const pushGHPages = () => {
  return new Promise((resolve, reject) => {
    command = 'git';
    args = ['push', 'origin', 'gh-pages'];
    scriptProcess = spawn(command, args, { stdio: 'inherit' });
    mngProcess(resolve, reject);
  });
};

const serve = () => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Building project');
      await npmBuild();

      // Change back to worktree directory
      process.chdir(path.resolve(process.cwd(), TARGET_DIR));

      console.log('Removing files...');
      await gitRemoveFiles();

      console.log('Copying build files to gh-pages worktree');
      await copyBuildFiles();

      console.log('Adding dist files to git commit');
      await gitAddFiles();

      console.log('Committing to gh-pages branch');
      await commitGHPages();

      console.log('Pushing GH pages');
      await pushGHPages();

      console.log('***************************************************');
      console.log('**********Operation Succesfully Completed**********');
      console.log('***************************************************');
      console.log('Your application is being served on github at: ');
      console.log('https://YOURUSER.github.io/YOUR_REPOSITORY');
      console.log('---------------------------------------------------');
      console.log('--Make sure you add dist to your .gitignore file---');
      console.log('---------------------------------------------------');

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

const ghpages = async () => {

  try {
    // change directory to project directory
    process.chdir(path.resolve(process.cwd()));

    // check if dist folder exists
    if (!await fs.existsSync(TARGET_DIR)) {
      console.log('Initializing git');
      await initGit();

      await gitConfig();

      console.log('Add branch gh-pages');
      await addBranch();

      console.log('Add worktree dist gh-pages');
      await addWorkTree();

      // change to worktree directory
      process.chdir(path.resolve(process.cwd(), TARGET_DIR));
      console.log('Checkout orphan gh-pages');
      await checkoutOrphan();

      // change back to project directory
      process.chdir(path.resolve(process.cwd(), '..'));
      await serve();
    } else {
      // folder dist exists!
      await serve();
    }
    process.exit(); // eslint-disable-line no-process-exit
  } catch (err) {
    console.error(err);
    process.exit(1); // eslint-disable-line no-process-exit
  }
};

ghpages();
