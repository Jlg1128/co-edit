const undoManager = {
  store: null,
  init(store) {
    this.store = store;
    this.bindEvents();
  },
  bindEvents() {
    this.bindKeyboardEvent();
  },
  bindKeyboardEvent() {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey) {
        let { key } = e;
        key = key.toLowerCase();
        if (key === 'z' && e.shiftKey) {
          this.redo();
        } else if (key === 'z') {
          this.undo();
        }
      }
    });
  },
  undo() {
    this.store.dispatch({
      type: 'UNDO',
    });
  },
  redo() {
    this.store.dispatch({
      type: 'REDO',
    });
  },
};

export default undoManager;