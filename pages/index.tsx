import * as Babel from "@babel/standalone";
import babel from "../src/babel";
import { prettier } from "next-monaco-editor/plugins";
import "next-monaco-editor/plugins/prettier.monaco.worker";
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

import MonacoEditor from "next-monaco-editor";

export default () => {
  const [code, setCode] = useLocalStorage("code", input);
  const [result, setResult] = React.useState("");

  // console.log(code);
  React.useEffect(() => {
    Babel.registerPlugin("magiql", babel);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        var output = Babel.transform(code, {
          presets: [["typescript", { isTsx: true, allExtensions: true }]],
          filename: "babel.tsx",
          plugins: ["magiql"],
        }).code;
        setResult(output);
      } catch (e) {
        setResult(e.message);
      }
    })();
  }, [code]);

  const [setCodeValue, _] = useDebouncedCallback((value) => {
    setCode(value);
  }, 500);
  return (
    <>
      <row>
        <MonacoEditor
          defaultValue={code}
          path="code.tsx"
          // id="code"
          onChange={setCodeValue}
          language="typescript"
          editorWillMount={(monaco) => {
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
              {
                noSemanticValidation: true,
                noSyntaxValidation: true,
              }
            );
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
          // id="result"
          language="typescript"
          options={{
            minimap: {
              enabled: false,
            },
          }}
        />
      </row>
    </>
  );
};
