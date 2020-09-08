module.exports = {
  src: "./",
  schema: "./schema.graphql",
  extensions: ["js", "jsx", "ts", "tsx", "graphql"],
  artifactDirectory: "generated/graphql",
  language: "typescript",
  exclude: [
    "**/node_modules/**",
    "**/__mocks__/**",
    "**/__generated__/**",
    "generated/relay/**",
  ],
};
