# Evergreen Scripts

[![GitHub release](https://img.shields.io/github/tag/hutchgrant/evergreen-scripts.svg)](https://github.com/hutchgrant/evergreen-scripts/tags)
![CircleCI branch](https://img.shields.io/circleci/project/github/hutchgrant/evergreen-scripts/master.svg?style=plastic)
[![GitHub issues](https://img.shields.io/github/issues-raw/hutchgrant/evergreen-scripts.svg)](https://github.com/hutchgrant/evergreen-scripts/issues)
[![GitHub pulls](https://img.shields.io/github/issues-pr-raw/hutchgrant/evergreen-scripts.svg)](https://github.com/hutchgrant/evergreen-scripts/pulls)
[![GitHub license](https://img.shields.io/badge/license-apache-blue.svg)](https://raw.githubusercontent.com/hutchgrant/evergreen-scripts/master/LICENSE)

## Overview
Additional scripts for [evergreen applications](https://github.com/ProjectEvergreen/create-evergreen-app).

### Project Goals
Extending the functionality and usage of evergreen apps with additional scripts.

#### Under Development
This repo and Project Evergreen itself are still young and maturing rapidly.  The Project Evergreen GitHub organization [project tracker](https://github.com/ProjectEvergreen/project-evergreen/projects) captures the high level goals and next steps, with plans to keep adding those lessons learned as features and improvements to this repo.

> 🙏 Please feel free to contribute, we are always looking forward to meeting like minded developers to collaborate with!

## Serve apps via gh-pages

To make life easier and automate the task of deploying to gh-pages

Add this script to your `package.json` with:

```
npm i -D evergreen-scripts
```

Make sure the project already has the remote repository setup:

```
git remote add YOUR_REPO
```

Modify your `package.json` with the script and your github pages url
```
"homepage": "https://hutchgrant.github.io/evergreen-web-components"
"scripts": {
    "gh-pages": "evergreen-scripts gh-pages"
}
```

Anytime you want to build/update the files being served on github pages, simply:

```
npm run gh-pages
```

The script will automatically:

1) (re)initialize git
2) create branch gh-pages, if master doesn't exist it will create an initial commit
3) add worktree dist with branch gh-pages
4) checkout orphan gh-pages
5) remove the initial files
6) create an additional webpack config for your github pages path
7) add a 404.html file that forwards to the index.html file so routing works as you would expect in a SPA.
8) build project
9) copy build files to work tree
10) commit to gh-pages branch
11) push to gh-pages branch.

### Troubleshooting

1) If you didn't already have the remote repository setup, make sure you `git remote add YOUR_REPO` and then run the script again
2) I'm changing my homepage and it's not being reflected in my build, what do I do? After the initial build, that var isn't read anymore, you can however change the public path manually in the generated `ghpages.config.js` file
3) Where do I change the title of the 404 and index? `webpack.config.ghpages.js` at the top.
4) How do I reset my build to default? delete the dist folder and run the script again.

### License

Released under the Apache-2.0 License