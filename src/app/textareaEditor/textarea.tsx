/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import './textarea.less';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import { routerQuery, getRandomColor } from '@app/util';
import textAreaSyncToYText from './textAreaSyncToYText';
import useYText from './useYText';

const TEXT_NAME = 'textarea-demo';
const ROOM_NAME = 'textarea-co-room';

const doc = new Y.Doc();
// @ts-ignore
window.doc = doc;

const initialValue = 'textarea demo playground';
function TextAreCoEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>();
  const {yText, undoManager} = useYText({name: TEXT_NAME, defaultValue: initialValue, doc});
  const [fragments, setFragments] = useState([]);

  useEffect(() => {
    const db = new IndexeddbPersistence('textAreaDemo', doc);
    db.on('synced', (idbPersistence: IndexeddbPersistence) => {
      textareaRef.current.value = yText.toString();
    });

    const wsProvider = new WebsocketProvider('ws://localhost:1234', ROOM_NAME, doc, {connect: true});
    wsProvider.on('status', event => {
      if (event.status === 'connected') {
        console.log('wsProvider成功连接✅');
      } else {
        console.log('wsProvider断开连接');
      }
    });

    const {awareness} = wsProvider;
    awareness.setLocalState({
      user: {
        name: routerQuery().username ?? `游客${Date.now().toString().slice(-5)}`,
        color: getRandomColor(),
        id: doc.clientID,
      },
      selectionRange: [0, 0],
    });
    awareness.on('change', (changes: []) => {
      let currentStates = Array.from(awareness.getStates().values());
      const text = yText.toString();
      const _fragments = [];
      let lastPosition = 0;
      if (currentStates.length > 1) {
        currentStates = currentStates.sort((state1, state2) => state1.selectionRange[0] - state2.selectionRange[0]);
      }
      currentStates.forEach((state) => {
        const {selectionRange, user} = state;
        if (selectionRange && user.id !== doc.clientID) {
          const [cursorPosition, end] = selectionRange;
          if (cursorPosition === lastPosition) {
            return;
          }
          const content = text.slice(lastPosition, cursorPosition);
          lastPosition = cursorPosition;
          _fragments.push(
            <span
              className='fake-content hidden'
              key={user.id}>
              {content}
            </span>,
          );
          _fragments.push(
            <span
              className='cursor'
              key={`${user.id}-cursor`}
              // @ts-ignore
              style={{'--cursor-color': user.color}}
              >
              <div className='cursor-label'>{user.name}</div>
            </span>,
          );
        }
      });
      setFragments(_fragments);
    });
    const unlisten = textAreaSyncToYText({yText, textarea: textareaRef.current, undoManager, awareness});
    return () => {
      wsProvider.destroy();
      unlisten();
    };
  }, []);

  return (
    <div className='co-edit-textarea-wrapper'>
      <textarea
        id='co-edit-textarea'
        className='co-edit-textarea-inner'
        ref={textareaRef}
        rows={50} />
      <div className="input overlay">{fragments}</div>
    </div>
  );
}

export default TextAreCoEditor;