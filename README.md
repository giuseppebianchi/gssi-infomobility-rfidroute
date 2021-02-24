# Rfid Route
A system to associate RFID cards to shift work of a public transport agency.

Based on Express, Sequalize and Mysql.

```shell
npm install

node app.js
```


## API
The most relevant API endpoint, used in Infomobility system to track vehicles in real time, is:
```http
POST /api/realtime/rfidshift
```

However, a new endpoint has been added to provide more information about `Shift` object into Response.
```http
POST /api/realtime/shift/rfidshift
```

Furthermore, you may append the `check_service=1` if you want system to query only Shift related to the current active service.

```http
POST /api/realtime/rfidshift?check_service=1
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `check_service` | `boolean` | *true* of *false* |

Many API endpoints return the JSON representation of the RFID found for a list of trips.
### Request
```shell
curl --location --request POST 'http://localhost:4000/api/realtime/shift/rfidshift' \
--header 'Content-Type: application/json' \
--data-raw '{
    "trips": [
        "1:4050",
        "1:4457"
    ]
}'
```
### Response
*RfidRoute* system returns all RFID objects that contains those trips, passed in the request.
Here 3 RFID have been found, and you can observe that two of them  (6, 12) refer even to the same shift (35).
```json
{
  "found": true,
  "data": [
    {
      "rfid_id": 6,
      "rfid_code": "346435645363",
      "rs_shift_fk": 35,
      "rfid_created": "2020-09-11T18:39:58.000Z",
      "trip_shifts": [
        {
          "trip_shift_id": 362,
          "trip_id": "1:4050",
          "trip_name": "1R",
          "departure_time": 42000,
          "from": "L'AQUILONE - CENTRO COMMERCIALE",
          "arrival_time": 44400,
          "to": "TERMINALBUS 0 ARRIVI BUS AMA",
          "route": "1",
          "from_stop_id": "1:D00100",
          "to_stop_id": "1:A00000",
          "pattern_id": "1:1:1:01",
          "pattern_desc": "Da L'AQUILONE - CENTRO COMMERCIALE - A TERMINALBUS 0 ARRIVI BUS AMA",
          "shift_fk": 35,
          "ts_created": "2020-08-25T09:46:51.000Z",
          "shift": {
            "shift_id": 35,
            "shift_code": "4555",
            "shift_number": "456",
            "schedule_fk": 2,
            "shift_start": null,
            "shift_end": null,
            "rs_created": "2020-08-20T22:42:58.000Z"
          }
        }
      ]
    },
    {
      "rfid_id": 7,
      "rfid_code": "666666666666",
      "rs_shift_fk": 28,
      "rfid_created": "2020-08-21T16:49:23.000Z",
      "trip_shifts": [
        {
          "trip_shift_id": 354,
          "trip_id": "1:4457",
          "trip_name": "2",
          "departure_time": 48600,
          "from": "L'AQUILONE - CENTRO COMMERCIALE",
          "arrival_time": 49800,
          "to": "TERMINALBUS 0 ARRIVI BUS AMA",
          "route": "2",
          "from_stop_id": "1:D00100",
          "to_stop_id": "1:A00000",
          "pattern_id": "1:2:1:02",
          "pattern_desc": "Da L'AQUILONE - CENTRO COMMERCIALE - A TERMINALBUS 0 ARRIVI BUS AMA",
          "shift_fk": 28,
          "ts_created": "2020-08-23T17:49:26.000Z",
          "shift": {
            "shift_id": 28,
            "shift_code": "34564",
            "shift_number": "363456345",
            "schedule_fk": 3,
            "shift_start": null,
            "shift_end": null,
            "rs_created": "2020-08-19T17:45:50.000Z"
          }
        }
      ]
    },
    {
      "rfid_id": 12,
      "rfid_code": "007C0053A3D7",
      "rs_shift_fk": 35,
      "rfid_created": "2020-08-24T15:34:20.000Z",
      "trip_shifts": [
        {
          "trip_shift_id": 362,
          "trip_id": "1:4050",
          "trip_name": "1R",
          "departure_time": 42000,
          "from": "L'AQUILONE - CENTRO COMMERCIALE",
          "arrival_time": 44400,
          "to": "TERMINALBUS 0 ARRIVI BUS AMA",
          "route": "1",
          "from_stop_id": "1:D00100",
          "to_stop_id": "1:A00000",
          "pattern_id": "1:1:1:01",
          "pattern_desc": "Da L'AQUILONE - CENTRO COMMERCIALE - A TERMINALBUS 0 ARRIVI BUS AMA",
          "shift_fk": 35,
          "ts_created": "2020-08-25T09:46:51.000Z",
          "shift": {
            "shift_id": 35,
            "shift_code": "4555",
            "shift_number": "456",
            "schedule_fk": 2,
            "shift_start": null,
            "shift_end": null,
            "rs_created": "2020-08-20T22:42:58.000Z"
          }
        }
      ]
    }
  ]
}
```
The `found` property means whether results have been found or not.

The `rfid_code` property contains the string printed on the corrispondent RFID card.

The `trip_shifts` propery is the list of trips found for a shift.

The `shift` property represents the relative shift associated to the found RFID.
> Having a *Shift* object into results helps to check if a RFID should be considered to track a vehcile in real time, beacuse if current time is greater than **shift_end** value that RFID in not valid anymore for that shift.
> (However, if *Shift* object is not available, the validation function will use other parameters to check a valid RFID.)
---

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

`rfidroute.service`
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
```shell
systemctl enable rfidroute.service

systemctl start rfidroute.service

systemctl status rfidroute.service
```

## Stop Service
```shell
systemctl stop rfidroute.service

systemctl disable rfidroute.service
```

## Restart Service
```shell
systemctl daemon-reload

systemctl restart rfidroute.service
```


