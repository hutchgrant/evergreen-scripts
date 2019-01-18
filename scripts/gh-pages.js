const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const copyFolder = require('../lib/copy-folder');
const TARGET_DIR = 'dist';
const BUILD_DIR = 'public';
const Process = require('../lib/process');

let scriptProcess = new Process(true);

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
    let result;

    try {
      result = await scriptProcess.run('git', ['branch', 'gh-pages']);

    } catch (err) {
      if (err.substring(0, 41) === "fatal: Not a valid object name: 'master'.") {
        console.log('Creating master with initial commit');
        await Promise.all(
          await gitAddFiles(),
          await scriptProcess.run('git', ['commit', '-m', 'Initial Commit'])
        );
        resolve();
      } else {
        console.log('ERROR2');
        reject(result);
      }
    }
  });
};

/// Git add files
const gitAddFiles = async () => {
  return await scriptProcess.run('git', ['add', '.']);
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

/// push new gh-pages branch
const pushGHPages = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await scriptProcess.run('git', ['push', 'origin', 'gh-pages']);
      resolve();
    } catch (err) {
      if (err.substring(0, 45) === 'fatal: Could not read from remote repository.') {
        console.log('******************************');
        console.log('No remote repository added. ');
        console.log("You need to ensure sure you've created a repository on github and added it locally with: ");
        console.log('git remote add YOUR_REPO');
        console.log("Once you've added a remote repo, re-run this script.");
        console.log('******************************');
      }
      reject(err);
    }
  });
};

const serve = () => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Building project');
      await scriptProcess.run('npm', ['run', 'build']);

      // Change back to worktree directory
      process.chdir(path.resolve(process.cwd(), TARGET_DIR));
      console.log('Removing files...');
      await scriptProcess.run('git', ['rm', '-rf', '.']);

      console.log('Copying build files to gh-pages worktree');
      await copyBuildFiles();

      console.log('Adding dist files to git commit');
      await gitAddFiles();

      console.log('Committing to gh-pages branch');
      await scriptProcess.run('git', ['commit', '-m', 'Updating gh-pages']);

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
      console.log('ERROR');
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
      await scriptProcess.run('git', ['init']);

      await gitConfig();

      console.log('Add branch gh-pages');
      await addBranch();

      console.log('Add worktree dist gh-pages');
      await scriptProcess.run('git', ['worktree', 'add', '--detach', TARGET_DIR]);

      // change to worktree directory
      process.chdir(path.resolve(process.cwd(), TARGET_DIR));
      console.log('Checkout orphan gh-pages');
      await scriptProcess.run('git', ['checkout', '--orphan', 'gh-pages']);

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
