# Developer

I use Yarn for running the commands but you can use npm as well.

## Running tests

> yarn test

## Build

> yarn build

## Features

- [ ] Database
  - [x] Log the progress of the initialization at startup
  - [x] Log the number of words and sequences at startup

- [ ] Database command
  - [ ] Indicate the status of the initialization ('status')
  - [ ] Indicate the number of sequences
  - [ ] Indicate the number of words
  - [ ] Study the possibility of removing commander or to provide another implementation
    - There are bugs with current implementation, I could be doing something wrong, or the library is not adapted to this usage ; could be nice to differentiate the implementation of the command and the arguments parsing
    - Use cmdy for instance

- [ ] Languages
  - [x] French
    - We are using Grammalecte Hunspell (modified) dictionary
    - [ ] Wiktionay
  - [x] English
    - We are using Wiktionary (modified) dictionary
    
- [ ] Expressions

- [ ] Citations

- [ ] Anagrams

## TODO

- [ ] WASM
  - [ ] Bundle the SQL.js WASM file

- [ ] Deploy the database on a custom image
  - Build the image
  - Serve the content as a static resource
  - Deploy it
  - Deploy the Nginx conf
  - Restart Nginx

- Check if can use something else than Dexie for the storage

- Publish the Lerna workspace page

- Log word count with the sequence

- Obtain the version / progress of the Github Pages build
