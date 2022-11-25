# Orgchart Serverless Backend

This repository contains serverless code for Orgchart Backend.

## Development

#### Node Installation

---

We are using `node` version `14.x `

`Start the setup by installing node on your system. We can use any stable node version above 14.0`

```
nvm install 14.x

```

```
nvm use 14.x
```

#### Serverless and Plugin Installation

---

Install the `serverless` CLI via NPM:

```
npm install -g serverless
```

We are using 5 different serverless plugins in this code which are given below: -

1. serverless-offline
2. serverless-iam-roles-per-function
3. serverless-bundle
4. serverless-offline-lambda-invoke
5. serverless-plugin-tracing

Install each of the above plugins via SERVERLESS by replacing --name with plugin name given above.

```
serverless plugin install --name pluginName
```

The first time, you will need to run

```
npm install
```

Then change the current directory to services and then to the service you need to run.

```
cd services
```

```
cd service-name
```

Again, we need to run

```
npm install
```

Now, we are all set to start the serverless

```
npm run dev
```
