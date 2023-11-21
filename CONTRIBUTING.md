# Contribution guide

## Dependencies

We use [`pnpm`](https://pnpm.io/motivation) for node package management (f you use npm or yarn by mistake, no worries, there are fail-safes in place to save you from breaking something).

> [!Tip]
> Check out [`ni`](https://github.com/antfu/ni) to never think again about which package manager to use in which repo.

### Without pnpm globally installed

If you _don't_ already have `pnpm` globally installed and don't want to do that, you can always prefix each pnpm command with `npx`.

```sh
pnpm install a-new-pkg # if this is what you need to do
npx pnpm install a-new-pkg # you can achieve it like this
```

### Nuxt Modules

See [`nuxt.config.ts`](./nuxt.config.ts) for a list of Nuxt Modules this repo is equipped with to help you along the way. It's worth looking up what they they have to offer and leverage it to make our lives easier.

#### TailwindCSS

The repo is configured with [`TailwindCSS`](https://tailwindcss.com/docs/utility-first) support which we can leverage for atomic styling like so:

```vue
<button class="rounded border">I'm a custom button</button>
```

#### Nuxt UI

We have access to plenty of well-defined and accessible vue components from `@nuxt/ui` and can use them [like this](https://ui.nuxt.com/elements/button#link):

```vue
<UButton to="https://ui.nuxt.com/elements/button#link" target="_blank">I'm a button</UButton>
```

Nuxt UI is has first class support for TailwindCSS by either using the standard `class` prop or leveraging the `ui` prop [like so](https://ui.nuxt.com/getting-started/theming#ui-prop):

```vue
<UButton class="rounded">I'm a rounded button</UButton>
<UButton :ui="{ rounded: 'rounded-full' }">I'm a very rounded button</UButton>
```

_(You may not see TailwindCSS in the nuxt modules declaration because Nuxt UI brings it with it)_

#### Nuxt Icon

We have access to tens of thousands of open source icons from the [icones library](https://icones.js.org) and [use them like this](https://nuxt.com/modules/icon#usage):

```vue
<Icon name="uil:github" color="black" />
```

#### Brand colors

We have all Radicle-themed colors defined in [tailwind.config.ts](tailwind.config.ts) available as TailwindCSS classes e.g. `*-rad-fill-primary`. Those are bit more "special" than the built-in TailwindCSS colors because with one color declaration the white and dark modes are covered automatically. Which means

```vue
<button class="bg-gray-100 dark:bg-gray-900">-</button> <!-- normally we'd need to do  we only have to do this -->
<button class="bg-rad-background-default">-</button> <!-- but we only do this instead -->
```

You can see the actual color values defined in [assets/css/tailwind.css](assets/css/tailwind.css).

Combining all the above libs together we can have:

```vue
<UButton
  class="bg-rad-fill-primary text-rad-foreground-contrast rounded"
  icon="i-simple-line-icons-emotsmile"
  to="https://ui.nuxt.com/elements/button#link"
  target="_blank"
>
  I'm a happy button
</UButton>
```

#### VueUse

We have countless [amazing utilities](https://vueuse.org/functions.html) as _reactive_ [composables](https://www.patterns.dev/vue/composables) for most common (and many uncommon) use cases which we can use like this:

```ts
<script setup lang="ts">
    const target = ref(null)
    onClickOutside(target, (event) => console.log('Clicked outside "target"')) // <-- https://vueuse.org/core/onClickOutside/#onclickoutside
</script>

<template>
  <div ref="target">Hello world</div>
  <div>Outside element</div>
</template>
```

#### Pinia

The repo is configured with [Pinia](https://pinia.vuejs.org/core-concepts/), enabling usage of reactive global stores.

#### Routing

Routing on Nuxt is handled by [Vue Router](https://router.vuejs.org/) which wrapps it and adds it's own [abstractions on top](https://nuxt.com/docs/getting-started/routing).

## Launching for local development

After cloning the repo, all you have to do is run:

```shell
pnpm run dev
```

The above command will always ensure that you have the required dependencies locally when launching for development.

## Conventions

### Code style

- Keep it simple, not "smart"
- Code must be understandable without the need for any comments. If you feel the need for a comment improve your code instead. As a last resort consider using a `// HACK:` comment explaining why something needs to look odd and what it does.
- Be as consistent as possible in naming, handling things, etc.
- Prefer functional vs imperative or object-oriented programming (if it can be avoided and doing otherwise doesn't make more sense in that context).
- Every time you write a "todo" comment always add your name right after it. You're responsible to resolve it, ideally before merging the PR. If not,then create a ticket about it and add a link to it in the comment e.g. `//TODO: maninak support decimals https://github.com/cytechmobile/radicle-planning-boards/issues/69`
- Use CamelCase for .vue files and kebab-case for everything else
- Follow [Vue](https://v2.vuejs.org/v2/style-guide)/Nuxt community conventions
- Use Vue [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html#composition-api-faq) only and [`<script setup lang="ts">`](https://www.patterns.dev/vue/script-setup)
- Name similar things similarly e.g. `EmployeeCard.vue` & `EmployeeCardList.vue`
- Use `*List` suffix for dedicated component containers like shown above (even if they are rendered in a grid or whatever). Avoid doing it if the container is indepedent and could support any child component.

### Code linting

For some of the above as well as for most other superficial topics (e.g. spaces, single quotes, no semi, dangling commas, sorted imports, etc) as well as best practices are covered by [an automated linter](https://github.com/maninak/eslint-config) which lints all changed files when commiting and also runs on CI against PRs.

If you notice anything fishy, annoying (red squiggle should be yellow, conflicting rules, common false positive etc), broken or missing _please_ let the maintainer know by [filing a new issue](https://github.com/maninak/eslint-config/issues/new) or contacting them directly (if possible).

### Git foo

- Uphold commit history quality; commits are documentation people read to understand both the what and the why if not self-explanatory from your code. Don't be afraid to use the commit body if needed to further explain what a commit diff alone doesn't.
- Use [Conventional Commits](https://www.conventionalcommits.org) e.g. `refactor(auth): simplify sign-in logic`
  - You can use the VS Code extension [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits) to help you out.
  - Some common contexts are already preconfigured in the repo's [.vscode/settings.json](.vscode/settings.json); feel free to extend the list if a context keeps coming up when commiting.
- In a PR/Patch description always append `Closes #<issue-id>`
- Name new branches as `<conventional-type>/<issue-number>_<short-name-in-kebab-case>` e.g. `refactor/69_simplify-sign-in-logic`
- If you're introducing a change that breaks/extends/amends a convention, try to align pre-existing code as needed, ideally in the same PR but not all in the same commit.
  - Consider discussing with the team before investing the time.
- Sign your commits with at minimum a [DCO](https://developercertificate.org/) (Developer Certificate of Origin) text signature
  - If you use the command line make sure to use the flag `--signoff` or `-s` when commiting e.g. `git commit --signoff`
  - If you use VS Code's built-in git commit UI, the repo is configured to sign for you automatically
- Ideally sign your commits with a PGP cryptographic signature too. Here's a guide [how to set up PGP signing for git commits](https://docs.github.com/en/authentication/managing-commit-signature-verification).

## VS Code

While not required, for development it's strongly advised to use VS Code with all the [recommended extensions](.vscode/extensions.json) installed and enabled in the workspace of this repo.

> [!Tip]
> Hit `Ctrl + Shift + X` to go to the extensions panel and search for `@builtin TypeScript` then disable "TypeScript and JavaScript Language Features" for this workspace to enable [Takeover Mode](https://vuejs.org/guide/typescript/overview.html#volar-takeover-mode) for Volar and as such avoid having the TS Language Service running multiple times on your machine.

## Deployment

### prod

1. `npm run build`
2. serve `./dist`

As of writing this, the repo is configured to auto-deploy `main` branch at https://chipper-wisp-c7553e.netlify.app .

### dev

As of writing this, the repo is configured to auto-deploy preview branches for PRs against `main` and post the resulting URL as a comment in the PR.
