import {
  Comment,
  ClassBody as EstreeProgram,
  Directive,
  Statement,
  ModuleDeclaration,
  MethodDefinition,
  PropertyDefinition,
  StaticBlock,
  Identifier,
  MemberExpression,
} from 'estree';

export enum NodeTypes {
  'CallExpression',
  'ExportDefaultDeclaration',
  'ExportNamedDeclaration',
  'ExpressionStatement',
  'FunctionDeclaration',
  'Identifier',
  'MemberExpression',
  'VariableDeclaration',
  'VariableDeclarator'
}

export type NodeType = keyof typeof NodeTypes;

export type Node = {
  body: {
    body: any[];
  };
  type: NodeType;
  name: string;
  init: Node[];
  callee: Node;
  expression: Node;
  property: Node;
  declaration: {
    declarations: {
      init: Node;
    }[];
  };
  declarations: {
    init: Node;
  }[] &
    Node[];
};

// export type Node = Directive | Statement | ModuleDeclaration;

// export type Node = Identifier | MemberExpression;

// export type Program = EstreeProgram;

export type Program = {
  body: Node[];
}

export type Options = {
  groups: string[];
};

export type HooksSource = {
  node: Node;
  hook: Node;
  comments: Comment[];
};

export type HooksMetadata = {
  type: Node['type'];
  declaration: Node;
} & Pick<HooksSource, 'node' | 'comments'>;
