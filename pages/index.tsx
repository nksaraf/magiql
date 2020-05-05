import { prettier } from "next-monaco-editor/plugins";
import "next-monaco-editor/plugins/prettier.monaco.worker";
import "../src/babel/babel.monaco.worker";
import { useDebouncedCallback } from "use-debounce";

var input = `import {
  MagiqlProvider,
  createClient,
  useQuery,
  gql,
  usePokemonQuery,
  useMagiqlQuery,
  useFragment,
  Pokemon,
} from "magiql";
import dynamic from "next/dynamic";
import React from "react";


const MagicalPokemonSearch = () => {
  const { query, loading, error }: any = useMagiqlQuery("searchPokemon", { variables: { hello: 1 }});

  const pokemons = query
    .pokemons({
      first: 10,
    })
    ?.map((pokemon: Pokemon) => ({
      image: pokemon?.image,
      id: pokemon?.id,
      name: pokemon?.name,
    }));

};

export default IndexPage;
`;

import React, { useState } from "react";

const prefix = "transform:";

export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once

  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item =
        typeof window !== "undefined"
          ? window.localStorage.getItem(prefix + key) || initialValue
          : initialValue;
      // Parse stored json or if none return initialValue
      return JSON.parse(item);
    } catch (error) {
      // If error also return initialValue
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to sessionStorage.
  const setValue = React.useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value;
        // value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        if (typeof window !== "undefined")
          window.localStorage.setItem(
            prefix + key,
            JSON.stringify(valueToStore)
          );
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    },
    [setStoredValue]
  );

  return [storedValue, setValue];
}

import MonacoEditor, { Editor } from "next-monaco-editor";
import monacoApi from "next-monaco-editor/api";

export default () => {
  const [code, setCode] = useLocalStorage("code", input);
  const [result, setResult] = React.useState("");
  const editorRef = React.useRef<monacoApi.editor.IStandaloneCodeEditor>();
  const monacoRef = React.useRef<typeof monacoApi>();

  async function transform() {
    if (
      monacoRef.current &&
      editorRef.current &&
      editorRef.current.getModel()
    ) {
      const babelWorker = await monacoRef.current.worker.get(
        "babel",
        editorRef.current.getModel().uri.path
      );

      setResult(
        await babelWorker.transform(editorRef.current.getModel().uri.toString())
      );
    }
  }

  React.useEffect(() => {
    transform();
  }, [code]);

  const [setCodeValue, _] = useDebouncedCallback((value) => {
    setCode(value);
  }, 500);

  return (
    <>
      <column gap={2}>
        <button width={6} onClick={() => transform()}>
          Transform
        </button>
        <row>
          <MonacoEditor
            defaultValue={code}
            path="code.tsx"
            onChange={setCodeValue}
            language="typescript"
            editorWillMount={(monaco) => {
              monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                {
                  noSemanticValidation: true,
                  noSyntaxValidation: true,
                }
              );
              monaco.worker.register({
                label: "babel",
              });
            }}
            ref={editorRef}
            editorDidMount={async (editor, monaco) => {
              monacoRef.current = monaco;

              if (editor.getModel()) {
                const babelWorker = await monaco.worker.get(
                  "babel",
                  editor.getModel().uri.path
                );

                setResult(
                  await babelWorker.transform(editor.getModel().uri.toString())
                );
              }
            }}
            plugins={[prettier(["typescript"])]}
            options={{
              minimap: {
                enabled: false,
              },
            }}
          />
          <MonacoEditor
            value={result}
            path="result.tsx"
            language="typescript"
            options={{
              minimap: {
                enabled: false,
              },
            }}
          />
        </row>
      </column>
    </>
  );
};
