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

Install Evergreen Scripts

```
npm i -D evergreen-scripts
```

Add your remote github repository:

```
git remote add YOUR_REPO
```

Modify your `package.json` by adding the script and your github pages url
```
"homepage": "https://hutchgrant.github.io/evergreen-web-components/",
"scripts": {
    "gh-pages": "evergreen-scripts gh-pages"
}
```

Build, update, and serve files on github pages:

```
npm run gh-pages
```

The script will automatically:

1) (re)initialize git
2) create branch gh-pages, if master doesn't yet exist, it will create an initial commit
3) add git worktree dist with orphaned branch gh-pages
4) create a `ghpages.config.js` cache file containing a publicPath based on the `homepage` value in your package.json
4) create an additional webpack config for your github pages path
5) add a 404.html file that redirects to the index.html file so that routing works as you would expect in a SPA.
6) add a custom index.ghpages.html with a script to replace the state on client redirect
7) add a unique build script to your `package.json` file
8) build project using `webpack.config.ghpages.js`
8) git remove the previous files in gh-pages branch(`dist`)
9) copy build files to worktree(`dist`)
10) commit to gh-pages branch
11) push to gh-pages branch.

A guide can be found within the [Project Evergreen wiki](https://github.com/ProjectEvergreen/create-evergreen-app/wiki/Guide-Serving-Apps-via-Github-Pages)


### License

Released under the Apache-2.0 License