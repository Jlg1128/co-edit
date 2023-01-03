/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import './textarea.less';

const TEXT_NAME = 'textarea-demo';

function TextAreaEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>();
  const [value, setValue] = useState('temp1111');

  const { yDoc, yText } = useMemo(() => {
    const _yDoc = new Y.Doc();
    const _yText = _yDoc.getText(TEXT_NAME);
    // @ts-ignore
    window.doc = _yDoc;
    // @ts-ignore
    window.yText = _yText;
    return { yDoc: _yDoc, yText: _yText };
  }, []);

  useEffect(() => {
    function observeHandler(event: Y.YTextEvent, transaction: Y.Transaction) {
      console.log('event', event);
      console.log('origin', transaction.origin);
    }
    if (yText) {
      yText.observe(observeHandler);
    }
    return () => {
      yText.unobserve(observeHandler);
    };
  }, [yText]);

  useEffect(() => {

  }, [value]);

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