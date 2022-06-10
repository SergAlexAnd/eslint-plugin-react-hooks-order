/**
 * @fileoverview A simple organizer for ordering hooks.
 */

import requireIndex from 'requireindex';

export const rules = requireIndex(`${__dirname}/rules`);
