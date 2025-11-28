# Archived
The original repo is hosted on: https://explorer.radicle.gr/nodes/seed.radicle.gr/rad:z2BdUVZFvHdxRfdtGJQdSH2kyXNM6 .
Please report issues in the original repo.


![hero](../public/hero.webp)

[![Netlify Status](https://api.netlify.com/api/v1/badges/c075cf10-4d89-44d1-bd53-44a58f9ef06f/deploy-status)](https://app.netlify.com/sites/chipper-wisp-c7553e/deploys)

# Radicle Planning Boards

A project management web app leveraging [Radicle](https://radicle.xyz/) Issues and Patches.

[Radicle](https://radicle.xyz/) is a GitHub alternative bringing familiar features like Pull
Requests, Issues, etc, via a peer-to-peer, free and open-source network built on top of Git.

> DISCLAIMER: Radicle Planning Boards is currently in the early stages of development (alpha). As
> such, features found in similar tools may not be available.

## Features

- Kanban Board View
- Create and Arrange Columns
- Import/Export Columns
- Move Cards between Columns
- Create New Issues
- Filter by Issues or Patches
- [Radicle Explorer Integration](#radicle-explorer-integration)

### Radicle Explorer Integration

Radicle Planning Boards is built with [Radicle Explorer](https://app.radicle.xyz/nodes/seed.radicle.garden/rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5)
integration in mind, a web-based client for the [Radicle](https://radicle.xyz/) peer-to-peer
network. This allows it to leverage features like authentication, themes, and more to provide a
seamless experience for users.

## Under the hood

To persist the column and position of the cards, Radicle Planning Boards leverages the
issue's/patch's labels. The labels are used to store the column (`RPB:column:{columnName}`) and
position (`RPB:priority:{priority}`) of the card. This allows the app to work within Radicle's
feature set and not require its own database.

## Self hosting

You need to deploy two web apps, Radicle Planning Boards (this repository) and Radicle Explorer.

1. Deploy this repository
    - Set the `NUXT_PUBLIC_HOST_APP_ORIGIN` environment variable to the origin of your Radicle Explorer instance e.g.
    `https://radicle-explorer.example.com`
2. Deploy the
[radicle-interface-with-planning-boards](https://explorer.radicle.gr/nodes/seed.radicle.gr/rad:z2Q1LsoAqoeSJeBwu92hjb7VPVkey)
repository
    - Update `src/config.json` with the URL under which you are deploying Radicle Planning Boards e.g.:

    ```json5
    // src/config.json
    {
      // ...
      "plugins": {
        "radiclePlanningBoards": {
          "enabled": true,
          "origin": "https://radicle-planning-boards.example.com"
        }
      }
      // ...
    }
    ```

### Configuring after building

You can overwrite `NUXT_PUBLIC_HOST_APP_ORIGIN` after building, by creating a `config.json` file at the root of the
`.output` directory.

This can be useful if you want to use the same build for multiple deployments.

Example:

```json5
// config.json
{
   "hostAppOrigin": "http://localhost:3080"
}
```

> Note: You can also do this during development by creating a `config.json` file inside the `public` directory

## Contributing

Please refer to the [Contribution Guide](CONTRIBUTING.md).
