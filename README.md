# CRM Application

CRM with Node Js / Ember Js
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

### Base

* [Git](http://git-scm.com/)
* [Node.js](https://nodejs.org/en/) (with NPM)
* [MongoDB] (https://www.mongodb.com/)
* [Bower](http://bower.io/) `npm install -g bower`
* [Ember CLI](http://ember-cli.com/) `npm install -g ember-cli`
* [PhantomJS](http://phantomjs.org/)
* [Watchman](https://facebook.github.io/watchman/docs/install.html)

### For crypting

* [node-gyp](https://github.com/nodejs/node-gyp) `npm install -g node-gyp`
* On Mac OSX: 
    * [Xcode](https://developer.apple.com/xcode/download/)

* On Windows:
    * Install windows build-tools `npm install --global --production windows-build-tools`
	* [Python 2.x](https://www.python.org/ftp/python/2.7.12/python-2.7.12.msi) *normally installed with the build-tools on windows*

## Installation

* `git clone <repository-url>` this repository
* `cd crm/server`
* `npm install`
* `cd ../crm-api`
* `npm install`
* `bower install`

## Running / Development

In the terminal run the following commands

### Run MongoDB
* `mongod`

### Run the server
* Open an other terminal's tab
* Go to the server folder `crm/server`
* Check that `seed = true` in `crm/server/config/config.js` for the first launch
* `npm start`

### Run Ember
* Open an other terminal's tab
* Go to the ember folder `crm/crm-api`
* `ember s`

Visit your app at [http://localhost:4200](http://localhost:4200).  
You can check `crm/server/utils/seed.js` for the emails and passwords



