module.exports = (url) => `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        height: 100vh;
        margin: 0;
        width: 100vw;
        overflow: hidden;
      }
    </style>
    <script
      crossorigin
      src="https://unpkg.com/react@17/umd/react.development.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"
    ></script>
    <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
  </head>

  <body>
    <div id="graphiql">Loading...</div>
    <script
      src="https://unpkg.com/graphiql/graphiql.min.js"
      type="application/javascript"
    ></script>
    <script
      src="https://unpkg.com/graphiql-explorer/graphiqlExplorer.min.js"
      type="application/javascript"
    ></script>
    <script
      src="https://unpkg.com/htm/dist/htm.umd.js"
      type="application/javascript"
    ></script>
    <script type="module">
      import ow from 'https://unpkg.com/oceanwind';
      const { React, ReactDOM, htm, GraphiQL, GraphiQLExplorer } = window;
      const html = htm.bind(React.createElement);
      
      const getFetcher = (url) => function graphQLFetcher(graphQLParams) {
        return fetch(
          url,
          {
            method: 'post',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(graphQLParams),
          },
        ).then(function (response) {
          return response.json().catch(function () {
            return response.text();
          });
        });
      }

      function GraphiQLPlayground({ url }) {
        const [query, setQuery] = React.useState(\`\`);
        const graphiqlRef = React.useRef();
        const [graphiql, setGraphiqlState] = React.useState({});
        const fetcher = React.useMemo(() => getFetcher(url), [url])
        React.useEffect(() => {
          const originalSetState = graphiqlRef.current.safeSetState;
          setGraphiqlState(graphiqlRef.current.state)
          graphiqlRef.current.safeSetState = (fn) => {
            setGraphiqlState(prev => ({ ...prev, ...fn }));
            originalSetState(fn)
          };
        }, [graphiqlRef.current])
        return html\`
          <div className=\${ow\`flex flex-row flex-1\`} key=\${url}>
            <\${GraphiQLExplorer.Explorer} 
              query=\${query} 
              onEdit=\${setQuery} 
              explorerIsOpen=\${true}
              schema=\${graphiql.schema} 
              width=\${240}
            />
            <\${GraphiQL}
              ref=\${(ref) => graphiqlRef.current = ref}
              fetcher=\${fetcher}
              query=\${query}
              onEditQuery=\${setQuery}
              defaultVariableEditorOpen=\${true}
            />
          </div>
        \`
      }

      const GRAPHQL_API_URL = ${url};

      function Playground() {
        const [url, setUrl] = React.useState(GRAPHQL_API_URL);

        return html\`
          <div className=\${ow\`flex flex-col h-screen w-screen\`}>
            <div><input type="text" defaultValue=\${url} onBlur=\${(e) => {
              setUrl(e.currentTarget.value)
            }} className=\${ow\`w-full\`} /></div>
            <\${GraphiQLPlayground} url=\${url} key=\${url} />
          </div>
        \`
      }

      ReactDOM.render(
        html\`<\${Playground} />\`,
        document.getElementById('graphiql'),
      );
    </script> 
  </body>
</html>`;
