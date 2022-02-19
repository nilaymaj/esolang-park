# Esolang Park

Esolang Park is an **online interpreter and debugger** catered for **esoteric programming languages**. Think Repl.it, but a more simplified version for esoteric languages, with a visual debugger catered to each language, that runs on your own device.

The goal of Esolang Park is to be a platform for esolang enthusiasts to test and debug their code more easily, as well as for other people to discover and play around with esoteric languages without leaving the browser.

For every esolang, Esolang Park provides the following features:

- Powerful Monaco code editor
- Syntax highlighting
- Live syntax checking in the editor
- Set breakpoints in your code
- Pause and step through code execution at any time
- Adjust the speed of execution
- View the runtime's internal state during execution

Code for the core app is **completely decoupled** from the esolang runtime - adding the runtime for a new esoteric language is just writing code that implements a standard API. This allows developers to create a development environment for an esolang without worrying about the common details of text editor, error handling, debugging and input-output.

## Building the app

Esolang Park is a [Next.js](https://nextjs.org) application built with TypeScript. To run Esolang Park locally, you need to have a modern version of [Node.js](https://nodejs.org) installed. This project uses [Yarn](https://yarnpkg.com/) as its package manager, so you need that too.

Once you've cloned the repository locally, run the following commands and then navigate to http://localhost:3000 on your browser:

```sh
yarn # Install project dependencies
yarn build:worker # Build the esolang worker scripts
yarn dev # Run the development server
```

If you're interested in modifying the source code of the language providers, run `yarn dev:worker` in a separate terminal window. This starts the webpack watcher on language provider source code.

## Adding new esolangs

If you want to add new esolangs to the project, create an issue. Or you can also implement it yourself, if you're comfortable with TypeScript and a bit of React. The wiki contains a guide to implementing a language provider for Esolang Park.
