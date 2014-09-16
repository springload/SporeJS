# SporeJS

## Install

**NOTE:** You need to have node.js, mysql and npm installed

0. Clone the project

```sh
  $ git clone git@github.com:springload/SporeJS.git
```

1. Install (You might be able to skip the first two steps and " grunt build" if you have bower & grunt already installed)
```sh
  $ npm install -g bower
  $ npm install -g grunt-cli
  $ npm install
  $ grunt build
  $ cp config.disk.js app/config/config.js
  $ vim app/config/config.js
```

Set your DB user/password config in `config.js`, for both development and test and production environment.
(If you're running the server in Vagrant you probably want to set the host to an empty string).


3. If using MySQL as a choice of storage, start your MySQL service

4. Create the required databse
```sh
  $ mysql -u root -p
  > create database spore
  > quit
```

5. On the first run of SporeJS add the argument "--run-migration" to install all needed tables
```sh
  $ node spore --run-migration

  # Later, you can run with the handy default grunt task:
  $ grunt

  # or just plain
  $ node spore
```

IMPORTANT: if you have the flag `forceRebuild` to true (in your config.js file), the DB will be re-built from scratch. You should only run this option when changing DB tables. Please be aware that all existent table data is lost!

When building from scratch what happens is:

1. Models are sync (tables are created, previously deleted if existed)
2. Migrations run (if the argument "--run-migration" was added)
3. Fixtures (migrations/fixtures.yaml file containing the very basic objects)

You can watch the front-end JS and SaSS with:
```sh
  $ grunt watch
```

7. Visit [http://localhost:3000/](http://localhost:3000/)

8. Login/Logout
```sh
  login => http://localhost:3000/login
  logout => http://localhost:3000/logout
  register => http://localhost:3000/register
```

Default root user
```sh
  email: root@springload.co.nz
  password: springload
```
## Run tests

Make sure you change your `app/config/config.js` to set the correct test database. You don't want to wipe all the data.. do you?

```
...
database: 'spcore_test'
host: '10.0.0.10',
...
```
Run the tests:

```
npm test
```



## Server config for production

#### 1. Install pm2
[pm2](https://github.com/unitech/pm2) is a great process manager for node. It's much better than forever,
the less-awesome alternative.

```sh
  $ npm install pm2@latest -g
```


#### 2. Run app with pm2

```sh
  # Will start maximum processes depending on available CPUs
  $ pm2 start spore.js -i max --name "sporejs"
```

Restart the app. This will also clear all associated sessions.

```sh
  $ pm2 restart sporejs
```

Stopping the app. This will also clear all associated sessions.

```sh
  $ pm2 stop sporejs
```

```sh
  $ pm2 list
```

NOTE: currently the pm2 init script does not work correctly. The current implmentation runs via /etc/rc/local which in turn calls /root/node_startup at boot time.

Full documentation is available on the [pm2 github page](https://github.com/unitech/pm2).




