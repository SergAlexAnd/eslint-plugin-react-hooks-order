/**
 * @fileoverview A simple organizer for ordering hooks.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { RuleTester, Rule, Linter } from 'eslint';
// eslint-disable-next-line import/no-extraneous-dependencies
import { format, Options } from 'prettier';
import * as rule from '@rules/sort';

const Tester = new RuleTester();

const parserOptions: Linter.ParserOptions = {
  ecmaVersion: 6,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
};

const options = [
  {
    groups: rule.DEFAULT_GROUPS,
  },
];

const prettierOptions: Options = {
  parser: 'babel',
};

const firstTest = {
  code: format(
    `
     import { useState, useEffect, useContext,useRef, createContext } from 'react'
     const context = createContext({});
     export function ComponentA() {
       const [count, setCount] = useState(0);
       const locale = useContext(context);
       return null;
     }
     `,
    prettierOptions
  ),
  // TODO Analyze fixer in multiple components per file scenario.
  output: format(
    `
     import { useState, useEffect, useContext, useRef, createContext } from "react";
     const context = createContext({});
     export function ComponentA() {
       const locale = useContext(context);
       const [count, setCount] = useState(0);
       return null;
     }
     `,
    prettierOptions
  ),
  errors: [
    {
      message: 'Non-matching declaration order. useState comes after useContext.',
    },
    {
      message: 'Non-matching declaration order. useContext comes before useState.',
    },
  ],
  parserOptions,
  options,
};

const secondTest = {
  code: format(
    `
     import { useState, useEffect, useContext,useRef, createContext } from 'react'
     const context = createContext({});
     export function ComponentB() {
       useEffect(() => {
         console.log('Hello')
       }, [])
       const countRef = useRef(0)
     }
     `,
    prettierOptions
  ),
  // TODO Analyze fixer in multiple components per file scenario.
  output: format(
    `
     import { useState, useEffect, useContext, useRef, createContext } from "react";
     const context = createContext({});
     export function ComponentB() {
       const countRef = useRef(0);
       useEffect(() => {
         console.log("Hello");
       }, []);
     }
     `,
    prettierOptions
  ),
  errors: [
    {
      message: 'Non-matching declaration order. useEffect comes after useRef.',
    },
    {
      message: 'Non-matching declaration order. useRef comes before useEffect.',
    },
  ],
  parserOptions,
  options,
};

Tester.run('react-hooks-order/sort', rule as unknown as Rule.RuleModule, {
  valid: [
    {
      code: `
       function ComponentA() {
         const [todos, dispatch] = useReducer(todosReducer)
         const [count, setCount] = useState(0)
         const memoizedCallback = useCallback(() => {
           doSomething(a, b);
         },[a, b])
         useEffect(() => {
           document.title = 'Hello'
         }, [])
       }
       export default ComponentA
      `,
      parserOptions,
      options,
    },
  ],
  invalid: [firstTest, secondTest],
});
