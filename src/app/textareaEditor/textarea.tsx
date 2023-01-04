/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import './textarea.less';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import textAreaSyncToYText from './textAreaSyncToYText';
import useYText from './useYText';

const TEXT_NAME = 'textarea-demo';
const ROOM_NAME = 'textarea-co-room';

const doc = new Y.Doc();
// @ts-ignore
window.doc = doc;
const initialValue = 'textarea demo playground xxxx';
function TextAreaEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>();

  const {yText, undoManager} = useYText({name: TEXT_NAME, defaultValue: initialValue, doc});

  useEffect(() => {
    function observeHandler(event: Y.YTextEvent, transaction: Y.Transaction) {
      // console.log('event', event);
      // console.log('origin', transaction.origin);
    }
    yText.observe(observeHandler);
    const db = new IndexeddbPersistence('textAreaDemo', doc);
    const wsProvider = new WebsocketProvider('ws://localhost:1234', ROOM_NAME, doc, {connect: true});

    wsProvider.on('status', event => {
      if (event.status === 'connected') {
        console.log('wsProvider成功连接✅');
      } else {
        console.log('wsProvider断开连接');
      }
    });

    const unlisten = textAreaSyncToYText({yText, textarea: textareaRef.current, undoManager, db});
    return () => {
      yText.unobserve(observeHandler);
      unlisten();
      wsProvider.destroy();
    };
  }, []);

  // @ts-ignore
  window.ref = textareaRef;

  return (
    <div className='co-edit-textarea-wrapper'>
      <textarea
        id='co-edit-textarea'
        className='co-edit-textarea-inner'
        ref={textareaRef}
        rows={50} />
    </div>
  );
}

export default TextAreaEditor;