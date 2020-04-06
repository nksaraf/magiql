import { RawClientSideBasePluginConfig, ClientSideBasePluginConfig } from "@graphql-codegen/visitor-plugin-common";
import { TypeScriptPluginParsedConfig, TypeScriptPluginConfig } from "@graphql-codegen/typescript";
export interface MagiqlRawPluginConfig extends RawClientSideBasePluginConfig, TypeScriptPluginConfig {
  /**
   * @name importHooksFrom
   * @type string
   * @default ./client/hooks
   */
  importHooksFrom?: string;
  codegen?: boolean;
  /**
   * @name addDocBlocks
   * @type boolean
   * @description Allows you to enable/disable the generation of docblocks in generated code.
   * Some IDE's (like VSCode) add extra inline information with docblocks, you can disable this feature if your prefered IDE does not.
   * @default true
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-react-apollo
   *  config:
   *    addDocBlocks: true
   *
   */
  addDocBlocks?: boolean;
}

export interface MagiqlPluginConfig extends ClientSideBasePluginConfig, TypeScriptPluginParsedConfig {
  importHooksFrom: string;
  addDocBlocks: boolean;
  codegen: boolean;
}