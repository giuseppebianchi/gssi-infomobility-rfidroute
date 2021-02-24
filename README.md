# Rfid Route
A system to associate RFID cards to shift work of a public transport agency.

Based on Express, Sequalize and Mysql.

```shell
npm install

node app.js
```

# Deploy on Infomobility VM
To avoid further edits and configuration with systemd` service, that handles this application in backgraound, please clone this repository in
`~/production`.

In order to respect the correct path and urls, because of virtual hosting, we need to change these configuration options before deploying:

- `public/javascripts/config.js`
```js
const //urlOTP = "http://localhost:8080",
    routesAPI = "/otp/routers/default/index/routes/",
    patternsAPI = "/otp/routers/default/index/patterns/",
    tripsAPI = "";

//const baseURL = "http://localhost:4000"
const baseURL = "http://51.145.149.130/rfidroute";
const urlOTP = "http://51.145.149.130/infomobility";
```
---
- ``view/layout.pug``

Please change the ``basepath`` tag in such way that relative paths in HTML can point to (`rfidroute`) server with virtal hosting.
```js
base(href="/rfidroute/")
```
---
- ``.env``

Although systemctl does have its own .env configuration for production, ensure to provide the correct values for DB connections options, PORT and BASEPATH.
```dotenv
DB_HOST = localhost
DB_USER = rfidroute
DB_PASS = LaquilarfidroutegssiaQ2020!
DB_NAME = rfid_route
PORT = 4000
BASEPATH = /rfidroute/
```

# Systemd Service Configuration
Create service if it doesn't exist.
```
cd /etc/systemd/system/ 

touch rfidroute.service
```

rfidroute.service`
```shell
[Unit]
Description=Node.js RFID-ROUTE App
Requires=After=mysql.service       # Requires the mysql service to run first

[Service]

ExecStart=/home/cuimadmin/.nvm/versions/node/v14.5.0/bin/node /home/cuimadmin/production/rfidroute/app.js
# Required on some systems
#WorkingDirectory=/opt/nodeserver
Restart=always
# Restart service after 10 seconds if node service crashes
RestartSec=10
# Output to syslog
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=rfidroute-nodejs
#User=<alternate user>
#Group=<alternate group>
Environment=NODE_ENV=production
Environment=DB_HOST=localhost
Environment=DB_USER=rfidroute
Environment=DB_PASS=LaquilarfidroutegssiaQ2020!
Environment=DB_NAME=rfid_route
Environment=SECRET_KEY=infomobility!bianchi
Environment=PORT=4000
Environment=SESSION_LIFETIME=7200000
Environment=SESSION_SECRET=infomobility!bianchi
Environment=SESSION_NAME=sid
Environment=SESSION_SECURE=false
Environment=ADMIN_ROLE=2
Environment=BASEPATH=/rfidroute/

[Install]
WantedBy=multi-user.target

```

## Run Service
````shell
systemctl enable rfidroute.service

systemctl start rfidroute.service

systemctl status app.service
````

## Stop Service
````shell
systemctl stop rfidroute.service

systemctl disable rfidroute.service
````

## Restart Service
````shell
systemctl daemon-reload

systemctl restart rfidroute.service
````
