# Get Vercel Source Code

## Instructions

1 - Install the dependecies.

```
npm i
```

2 - Get your Vercel token at https://vercel.com/account/tokens, copy `.env.example` as `.env` and update the value:

```
VERCEL_TOKEN=""
```

3 - Run the script and wait until complete.

```
node index.js <VERCEL URL> <DESTINATION>
```

For example, `node index.js my-app.vercel.app my-app`.
