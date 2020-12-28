<p align="center">
  <img src="/public/hat2.png" width="120" /><h1  align="center"><code margin="0">relay-compile-tag</code></h1><p align="center"><i>A runtime version of Relay compiler as a <code>graphql<code> tag</p>
</p>

The Relay compiler is an amazing piece of technology that greatly improves the development experience while working with GraphQL.

`relay-compiler` uses `babel-relay-plugin` to replace the `graphql` tagged documents to `require` statements at
build time to the compiled artifacts it generates.

This package simulates the `relay-compiler` as a `graphql` tag. The output from the normal graphql parser is transformed
to the same format that the `relay-compiler` produces.

The differences are:

- Can't autodetect fragments, but the alternative:
  - The parser accepts the following syntax

The advantages of using the `relay-compiler` are:

- GraphQL Schema-aware development tooling
  - AccuTypescript code-generation
  - Build-time validation of GraphQL Documentation
- GraphQL parsing is done at build time (gets skipped at runtime for better performance)
- Don't have to include `graphql` package in bundle
- Auto detects fragments without having to import them between files
- **Fragment-focused parsing which drives the relay-runtime**

There are also some interrupts on the way,

- GraphQL schema needed locally
- Strict rules for naming of GraphQL documents (can be seen as an advantage as well)
- Additional build-time step required for smaller projects
  - Difficult to use in CodeSandbox and similar environments
- Have to include Babel plugin in setup
- Can't use `relay-runtime` without it (`relay-runtime` is also amazing)
