/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as classes from "../classes.js";
import type * as documents from "../documents.js";
import type * as focustime from "../focustime.js";
import type * as habits from "../habits.js";
import type * as quiz from "../quiz.js";
import type * as todo from "../todo.js";
import type * as upexam from "../upexam.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  classes: typeof classes;
  documents: typeof documents;
  focustime: typeof focustime;
  habits: typeof habits;
  quiz: typeof quiz;
  todo: typeof todo;
  upexam: typeof upexam;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
