# Member Service (ExpressJS)

Use ExpressJS to reimplement the loopback Member Service

This follows [Node REST API](https://github.com/ealeksandrov/NodeAPI) article.

OAuth2 and Passport Logic will be removed in next version.

## Running project

You need to have installed Node.js and MongoDB 

### Install dependencies 

To install dependencies enter project folder and run following command:
```
npm install
```

### Creating demo data (port 1337)

To create demo data in your MongoDB execute ```generateData.js``` file 
```
node generateData.js
```

### Run server

To run server execute:
```
node bin/www 
```

### Use [Node-restful](https://github.com/baugarten/node-restful)

get memeber data:
```
http GET http://localhost:1337/api/v1/members
```

get memeber data (only get social field):
```
http GET http://localhost:1337/api/v1/members?select=social
```

get memeber data (only get social field of specific user):
```
http GET http://localhost:1337/api/v1/members?select=social&_id=XXXXXXX
```
