[Bazk](https://www.bazk.tech/)
==========

## Guidelines
* Use the present tense ("Add feature" not "Added feature") and the imperative mood ("Move class to..." not "Moves class to...") on commits and use the name issue on pull requests.
* Pull requests must be reviewed before merged.
* Done is better than perfect. Does it work as expected? Ship now, iterate later.

## Coding Style

- CSS: https://github.com/airbnb/css
- Javascript: https://github.com/airbnb/javascript
- React: https://airbnb.io/javascript/react/

## Directory Structure
In our project, Nuxt.js is used in combination with Nuxt Layer to manage various applications as individual layers. This unique structure allows us to segregate our codebase based on their functionality or scope and handle each layer as a separate Nuxt.js application.

Here's a brief overview of the structure:

```bash
.
├── components        # UI Components
├── pages             # App pages
├── hooks             # UI Hooks
├── machines          # Xstate machines
├── providers         # App providers
```

## Installation
-----------------

#### Steps
1) Clone the repository:
```bash
$ gh repo clone hack-a-chain-software/bazk
$ cd bazk
```

2) Install frontend dependencies via YARN:
```bash
$ yarn install
```

3) Run dev server
```bash
$ yarn app dev
```
