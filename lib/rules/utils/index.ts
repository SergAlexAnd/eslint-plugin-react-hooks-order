// eslint-disable-next-line import/no-extraneous-dependencies
import { Rule, SourceCode } from 'eslint';
import { format } from 'prettier';
import { HooksMetadata, HooksSource, Node, Program } from '../../types';
import { exportableNodes, potentialHookNodes } from './constants';

export const trim = (value: string): string => value.split('  ').join('');

export const getCodeText = (metadata: HooksMetadata, source: SourceCode): string =>
  metadata.comments
    .map((comment) => source.getText(comment as any))
    .join('\n')
    .concat('\n', source.getText(metadata.node as any));

// ! predicates
const isExportableDeclaration = (node: Node): boolean => exportableNodes.includes(node.type);

const isPotentialHookNode = (node: Node): boolean => potentialHookNodes.includes(node.type);

export const Predicates = {
  isExportableDeclaration,
  isPotentialHookNode,
};

export const mapNodes = (node: Node) => {
  let declarations: Node;

  if (Predicates.isExportableDeclaration(node)) {
    declarations = node.declaration?.declarations?.[0].init || node.declaration;
  } else {
    declarations = node.declarations?.[0].init || node;
  }

  return declarations?.body?.body;
};

export const getHooks = (body: Node[], source: SourceCode, groups: string[]) => {
  const hooks = body
    .filter(Predicates.isPotentialHookNode)
    .map(mapNodes)
    .filter(Boolean)
    .map((declarations: Node[]) => {
      const nodes: HooksSource[] = [];
      declarations.forEach?.((node) => {
        const rootNode = node as unknown as Rule.Node;

        if (node.type === 'ExpressionStatement') {
          nodes.push({
            node,
            hook: node.expression,
            comments: source.getCommentsBefore(rootNode),
          });
        }

        if (node.type === 'VariableDeclaration') {
          node.declarations.forEach((declaration) => {
            nodes.push({
              node,
              hook: declaration.init,
              comments: source.getCommentsBefore(rootNode),
            });
          });
        }
      });
      const hooksMetadata = nodes
        .map(
          ({ hook, node, comments }) =>
            ({
              type: hook.type,
              declaration:
                // eslint-disable-next-line no-nested-ternary
                hook.type === 'CallExpression' ? hook.callee : hook.type === 'VariableDeclarator' ? hook.init : null,
              node,
              comments,
            } as HooksMetadata)
        )
        .filter((node) => node.declaration)
        .map((data) => {
          const { declaration } = data;

          switch (data.type) {
            case 'MemberExpression':
              // eslint-disable-next-line no-param-reassign
              data.declaration = declaration.property;
              break;

            case 'CallExpression':
              // eslint-disable-next-line no-param-reassign
              data.declaration =
                declaration.type === 'MemberExpression' ? declaration.property : declaration.callee || declaration;
              break;

            case 'VariableDeclarator':
            default:
              // eslint-disable-next-line no-param-reassign
              data.declaration = declaration.callee?.property || declaration.callee;
              break;
          }

          return data;
        })
        .filter(Boolean)
        .filter(({ declaration }) => declaration?.name?.slice(0, 3) === 'use' && groups.includes(declaration.name));
      return hooksMetadata;
    });
  return hooks;
};

const hooksSort = (metadata: HooksMetadata[], groups: string[]) => {
  const hooks = [...metadata];
  hooks.sort((a, b) => groups.indexOf(a.declaration.name) - groups.indexOf(b.declaration.name));
  return hooks;
};

const isHookInWrongOrder = (correctOrder: HooksMetadata[], index: number, currentHook: HooksMetadata) => {
  if (correctOrder.length === 0) return true;
  return correctOrder[index].declaration.name !== currentHook.declaration.name;
};

export const validateHooks = (
  program: Program,
  ctx: Rule.RuleContext,
  metadata: HooksMetadata[],
  source: SourceCode,
  groups: string[]
) => {
  const correctOrder: HooksMetadata[] = hooksSort(metadata, groups);

  metadata.forEach((hook, i) => {
    const isWrongOrder = isHookInWrongOrder(correctOrder, i, hook);

    if (isWrongOrder) {
      const node = hook.declaration as unknown as Rule.Node;
      const rootNode = program as unknown as Rule.Node;

      const hookBadCode = trim(getCodeText(hook, source));
      const hookGoodCode = trim(getCodeText(correctOrder[i], source));

      const newSourceCode = format(trim(source.getText()).replace(hookGoodCode, hookBadCode).replace(hookBadCode, hookGoodCode), {
        parser: 'babel',
      });

      ctx.report({
        node,
        messageId: 'noMatching',
        data: {
          bad: hook.declaration.name,
          order: !i ? 'after' : 'before',
          good: correctOrder[i].declaration.name,
        },
        fix: (fixer) => fixer.replaceText(rootNode, newSourceCode.trim()),
      });
    }
  });
};

// export function isHookName(str: string) {
//   return /^use[A-Z0-9].*$/.test(str);
// }

// export function isHook(node: Node) {
//   if (node.type === 'Identifier') {
//     return isHookName(node.name);
//   }
//   if (node.type === 'MemberExpression' && !node.computed && isHook(node.property)) {
//     const obj = node.object;
//     const isPascalCaseNameSpace = /^[A-Z].*/;
//     return obj.type === 'Identifier' && isPascalCaseNameSpace.test(obj.name);
//   }
//   return false;
// }
