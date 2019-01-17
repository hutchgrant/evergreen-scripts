# Evergreen Scripts

[![GitHub release](https://img.shields.io/github/tag/hutchgrant/evergreen-scripts.svg)](https://github.com/hutchgrant/evergreen-scripts/tags)
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

To make life easier and automate the task of deploying to gh-pages, we've created a simple script.

Add this script to your `package.json` with:

```
npm i evergreen-scripts
```

Add script in your `package.json`
```
"scripts": {
    "gh-pages": "evergreen-scripts gh-pages"
}
```

Anytime you want to update the files being served on github pages, simply:

```
npm run gh-pages
```

The script will automatically:

1) (re)initialize git
2) create branch gh-pages, if master doesn't exist it will create an initial commit
3) add worktree dist with branch gh-pages
4) checkout orphan gh-pages
5) remove the initial files
6) build project
7) copy build files to work tree
8) commit to gh-pages branch
9) push to gh-pages branch.

### Troubleshooting

1) If you didn't already have the remote repository setup, make sure you `git remote add YOUR_REPO` and then run the script again
2) If you are planning to serve on a specific repository, not an organization or user's repository or a custom domain e.g. https://myuser.github.io/somerepo instead of https://myuser.github.io/ 

    You'll need to add/edit the basePath in your `webpack.common.js` of your application:

    ```
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].[chunkhash].bundle.js',
        basePath = '/somerepo/'  // add/edit this
    },
    ```

    As well, edit the path to your manifest in your `src/index.html`
    ```
    <link rel="manifest" href="/YOUR_REPO/manifest.json">
    ```

    Plan is to automate this shortly.

3) Your routing doesn't work? Add [this 404.html](https://raw.githubusercontent.com/hutchgrant/evergreen-scripts/master/template/404.html) file to your `src` folder. Modify it with your repository name if you're hosting on a specific repositories github page, and not a user/organization or custom domain.

    ```
    <meta http-equiv="refresh" content="0;URL='/YOUR_REPO'"></meta>
    ```

    Also, you need to add this to your `./src/index.html`, to replace the state on redirect.

    ```
        <script>
        (function(){
            var redirect = sessionStorage.redirect;
            delete sessionStorage.redirect;
            if (redirect && redirect != location.href) {
            history.replaceState(null, null, redirect);
            }
        })();
        </script>
    ```

    To make sure the 404 is added to your build, modify the `webpack.common.js` :

    ```
    plugins: [
        // Add me
        new CopyWebpackPlugin([
        { from: '404.html', to: './404.html' }
        ]),
        /// 
        new HtmlWebpackPlugin({
        template: './index.html',
        chunksSortMode: 'dependency'
        }),
    ]
    ```

    Again, plan is to automate this shortly

### License

Released under the Apache-2.0 License