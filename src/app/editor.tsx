import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { createEditor, Transforms, Editor, Text, Descendant, Element } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import './index.less';

// Define a React component renderer for our code blocks.
const CodeElement = (props: any) => (
  <pre {...props.attributes}>
    <code>{props.children}</code>
  </pre>
);

const DefaultElement = (props: any) => <p {...props.attributes}>{props.children}</p>;
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];
const MainEditor = () => {
  const [editor] = useState(() => withReact(createEditor()));

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // Define a React component to render leaves with bold text.
  const Leaf = (props: any) => (
    <span
        {...props.attributes}
        style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
      >
      {props.children}
    </span>
  );

  useEffect(() => {
  }, []);

  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
  return (
    <div>
      <button onClick={(e) => {
        e.preventDefault();
        Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        });
      }}>
        点击
      </button>
      <Slate
      editor={editor}
      value={initialValue}
      onChange={(value: Descendant[]) => {
        const isAstChange = editor.operations.some(
          (op: any) => op.type !== 'set_selection',
        );
        console.log('editor.operations', editor.operations);
        console.log('value', value);
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(value);
          localStorage.setItem('content', content);
        }
      }}
      >
        <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event: any) => {
          if (!event.ctrlKey) {
            return;
          }
          if (event.key === '`') {
            event.preventDefault();
            // Determine whether any of the currently selected blocks are code blocks.
            const [match] = Editor.nodes(editor, {
              match: (n) => n.type === 'code',
            });
            // Toggle the block type depending on whether there's already a match.
            Transforms.setNodes(
              editor,
              { type: match ? 'paragraph' : 'code' },
              { match: (n: any) => Editor.isBlock(editor, n) },
            );
          } else if (event.key === 'b') {
            event.preventDefault();
            const [match] = Editor.nodes(editor, {
              match: (n) => Text.isText(n) && n.bold,
            });
            Transforms.setNodes(
              editor,
              { bold: !match },
              { match: (n: any) => {
                console.log('n', n.bold);
                console.log('nentity', n);
                console.log('🦊', Element.isElement(n));
                console.log('block', Editor.isBlock(editor, n));
                return Text.isText(n);
              },
              split: true },
            );
          }
        }}
       />
      </Slate>
    </div>
  );
};

export default MainEditor;