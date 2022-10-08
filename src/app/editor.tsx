import React, { useState, useCallback, useMemo, useEffect, useImperativeHandle } from 'react';
import { createEditor, Transforms, Editor, Text, Descendant, Element } from 'slate';
import { Slate, Editable, withReact, useFocused, useSlate } from 'slate-react';
import { WebsocketProvider } from 'y-websocket';
// Import the core binding
import { withYjs, slateNodesToInsertDelta, YjsEditor, withYHistory, withCursors, yTextToSlateElement } from '@slate-yjs/core';

// Import yjs
import * as Y from 'yjs';
import { YText } from 'yjs/dist/src/internals';
import names from 'classnames';
import { withMarkdown } from './plugins';
import './index.less';

// Define a React component renderer for our code blocks.
const CodeElement = (props: any) => (
  <pre {...props.attributes}>
    <code>{props.children}</code>
  </pre>
);

const yDoc1 = new Y.Doc();
const yDoc2 = new Y.Doc();

yDoc1.on('update', (update, origin) => {
  console.log('origin', origin);
  // @ts-ignore
  Y.applyUpdate(yDoc2, update);
});

yDoc2.on('update', (update, origin) => {
  console.log('update', update);
  // @ts-ignore
  Y.applyUpdate(yDoc1, update);
});

// @ts-ignore
window.yDoc1 = yDoc1;
// @ts-ignore
window.yDoc2 = yDoc2;

// @ts-ignore
window.editorC = Editor;
// @ts-ignore
window.yTextToSlateElement = yTextToSlateElement;

const DefaultElement = (props: any) => <p {...props.attributes}>{props.children}</p>;

const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => !Editor.isEditor(n)
        && Element.isElement(n)
        && n[blockType] === format,
    }),
  );

  return !!match;
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
  );
  let newProperties;
  newProperties = {
    type: isActive ? 'paragraph' : format,
  };
  Transforms.setNodes(editor, newProperties);
};

const BlockButton = ({ format }) => {
  const editor = useSlate();
  return (
    <button
      className={names({ 'active': isBlockActive(
        editor,
        format,
      ) })}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      引用
    </button>
  );
};

const initialValue: Descendant[] = [
  // {
  //   type: 'paragraph',
  //   children: [
  //     { text: 'This is editable ' },
  //     { text: 'rich', bold: true },
  //     { text: ' text, ' },
  //     // @ts-ignore
  //     { text: 'much', italic: true },
  //     { text: ' better than a ' },
  //     // @ts-ignore
  //     { text: '<textarea>', code: true },
  //     { text: '!' },
  //   ],
  // },
  // {
  //   type: 'paragraph',
  //   children: [
  //     {
  //       text:
  //         "Since it's rich text, you can do things like turn a selection of text ",
  //     },
  //     { text: 'bold', bold: true },
  //     {
  //       text:
  //         ', or add a semantically rendered block quote in the middle of the page, like this:',
  //     },
  //   ],
  // },
  // {
  //   type: 'block-quote',
  //   children: [{ text: 'A wise quote.' }],
  // },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
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

  const editor = useMemo(() => withYjs(withReact(createEditor()), sharedType), []);
  // const editor = useMemo(() => withReact(createEditor()), []);

  useEffect(() => {
    // @ts-ignore
    window.editor = editor;
    // @ts-ignore
    window.sharedType = sharedType;
    // @ts-ignore
    window.YjsEditor = YjsEditor;
  }, []);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      case 'block-quote':
        return (
          <blockquote {...props.attributes}>
            {props.children}
          </blockquote>
        );
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);
  // Define a React component to render leaves with bold text.
  const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.code) {
      children = <code>{children}</code>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
  };

  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
  function handleSetElement(format) {
    if (isMarkActive(format)) {
      editor.removeMark(format);
    } else {
      editor.addMark(format, true);
    }
  }

  const isMarkActive = (format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };
  function formatActive(format) {
    const [match] = Array.from(Editor.nodes(editor, {
      at: editor.selection,
      match: (node) => !Editor.isEditor(node) && (Element.isElement(node) || Text.isText(node)) && node[format] === true,
    }));
    console.log('match', match, format);

    return !!match;
  }

  function addNode() {
    editor.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: 'paragraph',
        bold: true,
        // @ts-ignore
        children: [{ text: 'Try it out for yourself!' }],
      },
    });
  }

  function insertYDocText() {
    yDoc1.transact(() => {
      let text = yDoc1.getText('content');
      text.insert(0, '123');
    }, 'jlg');
    yDoc2.transact(() => {
      let text = yDoc2.getText('content');
      text.insert(0, '456');
    }, 'jlg');
  }
  return (
    <div className='editor-wrapper'>
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
          console.log('changes', _value);
          // @ts-ignore
          setValue({ ..._value });
        }}
      >
        <div className='buttons-wrap'>
          <button onMouseDown={e => e.preventDefault()} className={names({ 'active': isMarkActive('bold') })} onClick={() => handleSetElement('bold')}>B</button>
          <button onMouseDown={e => e.preventDefault()} className={names({ 'active': isMarkActive('italic') })} onClick={() => handleSetElement('italic')}>I</button>
          <button onMouseDown={e => e.preventDefault()} onClick={() => handleSetElement('code')}>Code</button>
          <BlockButton format='block-quote' />
          <button onMouseDown={e => e.preventDefault()} onClick={() => addNode()}>添加节点</button>
          <button onClick={() => insertYDocText()}>yDoc Text</button>
        </div>
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