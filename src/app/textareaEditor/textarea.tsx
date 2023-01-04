/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import './textarea.less';
import textAreaSyncToYText from './textAreaSyncToYText';
import useYText from './useYText';

const TEXT_NAME = 'textarea-demo';

const doc = new Y.Doc();
// @ts-ignore
window.doc = doc;
const initialValue = 'textarea demo playground xxxx';
function TextAreaEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>();
  const [value, setValue] = useState(initialValue);

  const {yText, undoManager} = useYText({name: TEXT_NAME, defaultValue: initialValue, doc});

  useEffect(() => {
    function observeHandler(event: Y.YTextEvent, transaction: Y.Transaction) {
      // console.log('event', event);
      // console.log('origin', transaction.origin);
    }
    yText.observe(observeHandler);
    const unlisten = textAreaSyncToYText({yText, textarea: textareaRef.current, undoManager});
    return () => {
      yText.unobserve(observeHandler);
      unlisten();
    };
  }, []);

  function onTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    console.log('textChange', e);
    const newValue = e.target.value;
    setValue(newValue);
  }

  // @ts-ignore
  window.ref = textareaRef;

  return (
    <div className='co-edit-textarea-wrapper'>
      <textarea
        id='co-edit-textarea'
        value={value}
        onChange={(e) => onTextChange(e)}
        className='co-edit-textarea-inner'
        ref={textareaRef}
        rows={50} />
    </div>
  );
}

export default TextAreaEditor;