import React, { useState, useCallback, useMemo, useEffect, useImperativeHandle } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { createEditor, Transforms, Editor, Text, Descendant, Element } from 'slate';
import { Slate, Editable, withReact, useFocused } from 'slate-react';
import { WebsocketProvider } from 'y-websocket';
// Import the core binding
import { withYjs, slateNodesToInsertDelta, YjsEditor, withYHistory, withCursors } from '@slate-yjs/core';

// Import yjs
import * as Y from 'yjs';
import { YText } from 'yjs/dist/src/internals';
import { withMarkdown } from './plugins';
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
    children: [{ text: 'A line of text in a paragraphaa.' }],
  },
];

const yDoc = new Y.Doc();

// @ts-ignore
window.yDoc = yDoc;
// @ts-ignore
window.Y = Y;
// @ts-ignore
window.slateNodesToInsertDelta = slateNodesToInsertDelta;
// @ts-ignore
window.Transforms = Transforms;

const MainEditor = () => {
  const [value, setValue] = useState(initialValue || []);
  const sharedType = useMemo(() => {
    // Load the initial value into the yjs document
    let actualSharedType = yDoc.get('content', Y.XmlText);
    // @ts-ignore
    actualSharedType.applyDelta(slateNodesToInsertDelta(initialValue));
    return actualSharedType as Y.XmlText;
  }, []);

  const editor = useMemo(() => withYHistory(withYjs(withReact(createEditor()), sharedType)), []);

  useEffect(() => {
    // @ts-ignore
    window.editor = editor;
    // @ts-ignore
    window.sharedType = sharedType;
  }, []);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);
  // Define a React component to render leaves with bold text.
  const Leaf = (props: any) => (
    <span
        {...props.attributes}
        style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
      >
      {props.children}
    </span>
  );

  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
  function handleSetElement(type) {
    if (type === 'B') {
      Transforms.setNodes(
        editor,
        { bold: true },
        { match: n => {
          console.log('n', n, Text.isText(n));
          return Text.isText(n);
        }, split: true },
      );
    } else if (type === 'I') {

    } else if (type === 'Code') {
      Transforms.setNodes(
        editor,
        { type: 'code' },
        { match: n => Editor.isBlock(editor, n) },
      );
    } else if (type === 'Paragraph') {
      Transforms.setNodes(
        editor,
        { type: 'paragraph' },
        { match: n => Editor.isBlock(editor, n) },
      );
    }
  }
  return (
    <div>
      <div className='buttons-wrap'>
        <button onClick={() => handleSetElement('B')}>B</button>
        <button onClick={() => handleSetElement('I')}>I</button>
        <button onClick={() => handleSetElement('Code')}>Code</button>
        <button onClick={() => handleSetElement('Paragraph')}>Paragraph</button>
      </div>
      {/* <button onClick={(e) => {
        e.preventDefault();
        Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        });
        let text = yDoc.getText('我是a');
        text.insert(0, 'hhha');
      }}>
        点击更新yDoc1
      </button> */}
      <Slate
        editor={editor}
        value={value}
        onChange={(_value) => {
          // @ts-ignore
          setValue(_value);
        }}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event: any) => {
            if (event.key === '&') {
              event.preventDefault();
              editor.insertText('and');
            }
          }}
       />
      </Slate>
    </div>
  );
};

export default MainEditor;