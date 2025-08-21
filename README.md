# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
corepack enable && pnpm install
```

### Build

```
pnpm build
```

This command generates the api documentation and builds the app's static content into the `build` directory. It can be served using any static contents hosting service.

### Local Development

```
pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.


# Developing

If you want to make sure your docs are accurate. You should enable the `OpenApiValidator` under [server.ts](https://github.com/gnosispay/apps-monorepo/blob/7af307ac25dc52454a6ad80d7f67f708160f6467/apps/api/src/server.ts) and extend your test suite to cover the paths you want.