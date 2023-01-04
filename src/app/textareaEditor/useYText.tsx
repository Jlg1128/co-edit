/* eslint-disable @typescript-eslint/naming-convention */
import { useMemo } from 'react';
import * as Y from 'yjs';

export default function useYText({name, defaultValue = '', doc}) {
  const { yDoc, yText, undoManager } = useMemo(() => {
    const _yText = doc.getText(name);
    _yText.insert(0, defaultValue);
    const _undoManager = new Y.UndoManager(_yText, {trackedOrigins: new Set([doc.clientID]), captureTimeout: 500});
    // @ts-ignore
    window.yText = _yText;
    // @ts-ignore
    window.undoManager = _undoManager;
    return { yDoc: doc, yText: _yText, undoManager: _undoManager };
  }, []);
  return {yDoc, yText, undoManager};
}