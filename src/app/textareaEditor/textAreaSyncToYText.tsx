import React, { useEffect, useState } from 'react';
import { text } from 'stream/consumers';
import * as Y from 'yjs';

// 1.textArea input event，判断插入还是删除，如果是插入，判断之前的selection range是否包含
// 2.
function textAreaSyncToYText({yText, textarea}: {yText: Y.Text, textarea: HTMLTextAreaElement}) {
  let range = [0, 0];

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  let val = getVal();

  function getVal() {
    return textarea?.value || '';
  }
  function setVal() {
    val = getVal();
    return val;
  }
  function getRange() {
    return [textarea.selectionStart, textarea.selectionEnd];
  }
  function setRange() {
    range = getRange();
    return range;
  }

  const yDoc = yText.doc;

  function handleInput(e: InputEvent) {
    const {inputType, data} = e;
    if (inputType.startsWith('insert')) {
      yDoc.transact(() => {
        if (range[0] !== range[1]) {
          const deleteLength = range[1] - range[0];
          yText.delete(range[0], deleteLength);
        }
        yText.insert(range[0], data);
      }, yDoc.clientID);
    } else if (inputType.startsWith('delete')) {
      const newVal = getVal();
      const newRange = getRange();
      yDoc.transact(() => {
        yText.delete(newRange[0], val.length - newVal.length);
      }, yDoc.clientID);
    }
    console.log('yText', yText.toJSON());
  }
  function handleKeyDown(e: KeyboardEvent) {
    setRange();
    setVal();
  }

  yDoc.on('update', (a, b) => {console.log(a, b)});

  if (textarea) {
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);
  }

  return () => {
    textarea.removeEventListener('input', handleInput);
    textarea.removeEventListener('keydown', handleKeyDown);
  };
}

export default textAreaSyncToYText;