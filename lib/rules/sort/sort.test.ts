/**
 * @fileoverview A simple organizer for ordering hooks.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { RuleTester, Rule } from 'eslint';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as rule from '@rules/sort';
import { TestData } from './sort.fixtures';

const Tester = new RuleTester();

const { cases } = TestData;

Tester.run('react-hooks-order/sort', rule as unknown as Rule.RuleModule, {
  valid: cases.valid,
  invalid: cases.invalid,
});
