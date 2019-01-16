const expect = require('chai').expect;
const chai = require('chai').use(require('chai-as-promised'));
const should = chai.should(); // eslint-disable-line
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const TestSetup = require('./setup');
const testApp = 'test-app';
let script = 'gh-pages';
let setup;

before(async () => {
  setup = new TestSetup();
});

describe('after running script without script name', () => {
  it('should display the missing script name error', async () => {
    await setup.node(['./evergreen-scripts.js']).catch((err) => {
      expect(err).to.be.equal('Error, missing script name\n');
    });
  });
});

describe('after running script with gh-pages', function () {
  this.timeout(60000);
  before(async () => {
    process.chdir(path.resolve(process.cwd(), testApp));
    await setup.node(['../evergreen-scripts.js', script]);
  });

  it('should create the dist worktree', async () => {
    const targetExists = await fs.existsSync(path.resolve(process.cwd(), 'dist'));

    expect(targetExists).to.be.true;
  });
  it('should have the worktree on the correct branch', async () => {
    const branch = await setup.git('cat', ['.git/worktrees/dist/HEAD']);

    expect(branch).to.be.equal('ref: refs/heads/gh-pages\n');
  });

  it('should have the worktree as a git repository', async () => {
    const repository = await setup.git('cat', ['.git/worktrees/dist/gitdir']);
    const directory = path.resolve(process.cwd(), 'dist', '.git');

    expect(repository).to.be.equal(directory + '\n');
  });

  it('should have run the build script', async () => {
    const targetExists = await fs.existsSync(path.resolve(process.cwd(), 'public', 'index.html'));

    expect(targetExists).to.be.true;
  });
  it('should have all the build files copied to the worktree folder', async () => {
    const buildDir = path.resolve(process.cwd(), 'public');
    const targetDir = path.resolve(process.cwd(), 'dist');
    const files = await fsPromises.readdir(buildDir);

    return Promise.all(files.map(async file => {
      return await fs.existsSync(path.join(targetDir, file)).should.equal(true);
    }));
  });
});