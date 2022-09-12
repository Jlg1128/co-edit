import { BaseElement, BaseEditor, Node } from 'slate';

declare module 'slate' {
  export interface BaseElement {
    type?: string;
    bold?: any;
  }

  export interface BaseEditor {
    type?: string;
    bold?: any;
  }

  export interface Node {
    type?: string;
    bold?: any;
  }
}