/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Notion Integration Token - Your Notion Integration API Token */
  "notionToken": string,
  /** Database ID - The Notion Database ID containing your daily pages */
  "databaseId": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `add-memo` command */
  export type AddMemo = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `add-memo` command */
  export type AddMemo = {}
}

