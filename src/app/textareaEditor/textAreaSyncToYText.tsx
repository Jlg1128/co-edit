import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';

type SyncProps = {
  yText: Y.Text,
  textarea: HTMLTextAreaElement,
  undoManager: Y.UndoManager,
  db: IndexeddbPersistence,
}

function textAreaSyncToYText({yText, textarea, undoManager, db}: SyncProps) {
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

  function yTextObserveHandler(event: Y.YTextEvent, transaction: Y.Transaction) {
    const origin = transaction.origin;
    if (origin instanceof WebsocketProvider) {
      textarea.value = yText.toString();
    }
  }

  function handleInput(e: InputEvent) {
    const {inputType, data} = e;
    console.log('InputEvent', e);
    const newVal = getVal();
    const newRange = getRange();
    if (inputType.startsWith('insert')) {
      yDoc.transact(() => {
        if (range[0] !== range[1]) {
          const deleteLength = range[1] - range[0];
          yText.delete(range[0], deleteLength);
        }
        yText.insert(range[0], data);
      }, yDoc.clientID);
    } else if (inputType.startsWith('delete')) {
      yDoc.transact(() => {
        yText.delete(newRange[0], val.length - newVal.length);
      }, yDoc.clientID);
    } else if (inputType === 'historyUndo') {
      undoManager.undo();
    } else if (inputType === 'historyRedo') {
      undoManager.redo();
    }
    textarea.value = yText.toString();
    textarea.setSelectionRange(newRange[0], newRange[1]);
    console.log('yText', yText.toJSON());
  }
  function handleKeyDown(e: KeyboardEvent) {
    setRange();
    setVal();
  }

  if (textarea) {
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);
  }

  db.on('synced', (idbPersistence: IndexeddbPersistence) => {
    // @ts-ignore
    window.idbPersistence = idbPersistence;
    textarea.value = yText.toString();
    yText.observe(yTextObserveHandler);
  });

  return () => {
    textarea.removeEventListener('input', handleInput);
    textarea.removeEventListener('keydown', handleKeyDown);
    yText.unobserve(yTextObserveHandler);
  };
}

export default textAreaSyncToYText;