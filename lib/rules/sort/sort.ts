/* eslint-disable no-param-reassign */
/**
 * @fileoverview A simple organizer for ordering hooks.
 */

import { getHooks, validateHooks } from '@rules/utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Rule } from 'eslint';
import { Program } from '../../types';

export const DEFAULT_GROUPS: string[] = [
  'useReducer',
  'useContext',
  'useState',
  'useRef',
  'useDispatch',
  'useCallback',
  'useLayoutEffect',
  'useEffect',
];

module.exports = {
  meta: {
    docs: {
      description: 'A simple organizer for ordering hooks.',
      category: 'Sort',
      url: 'https://github.com/sergalexand/eslint-plugin-react-hooks-order/blob/main/docs/rules/sort.md',
      recommended: false,
    },
    messages: {
      noMatching: 'Non-matching declaration order. {{ bad }} comes {{ order }} {{ good }}.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          groups: {
            type: 'array',
          },
        },
      },
    ],
  },

  create: (ctx: Rule.RuleContext) => {
    const source = ctx.getSourceCode();
    const options = ctx.options[0];
    const groups: string[] = options?.groups || DEFAULT_GROUPS;

    return {
      Program(program: Program) {
        const hooksMetadata = getHooks(program.body, source, groups);
        hooksMetadata.forEach((d) => {
          validateHooks(program, ctx, d, source, groups);
        });
      },
    };
  },
};
