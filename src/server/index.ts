import { Logger } from '@hocuspocus/extension-logger';
import { Server } from '@hocuspocus/server';
import { slateNodesToInsertDelta } from '@slate-yjs/core';
import * as Y from 'yjs';

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

console.log('1');

// Setup the server
const server = Server.configure({
  port: 1234,

  name: 'slate-yjs-demo',
  // Add logging
  extensions: [new Logger()],

  async onLoadDocument(data) {
    console.log('onload', data);
    // Load the initial value in case the document is empty
    if (data.document.isEmpty('content')) {
      const insertDelta = slateNodesToInsertDelta(initialValue);
      const sharedRoot = data.document.get('content', Y.XmlText);
      // @ts-ignore
      sharedRoot.applyDelta(insertDelta);
    }
    return data.document;
  },
});

// Start the server
server.enableMessageLogging();
server.listen();