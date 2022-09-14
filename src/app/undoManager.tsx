import lodash from 'lodash';

const undoManager = {
  undoStack: [
    // {
    //   state: {

    //   },
    //   action: {
    //     type: '',
    //     payload: '',
    //   },
    // },
  ],
  dispatch: null,
  init(dispatch) {
    this.dispatch = dispatch;
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
          console.log('redo');
          this.redo();
        } else if (key === 'z') {
          console.log('undo');
          this.undo();
        }
      }
    });
  },
  redoStack: [],
  undo() {
    if (this.undoStack.length) {
      let { state, action } = this.undoStack.pop();
      console.log({ state, action });
      // this.dispatch({
      //   type:
      // })
    }
  },
  redo() {

  },
  addUndo(state, action) {
    let newState = lodash.cloneDeep(state);
    this.undoStack.push({
      state: newState,
      action,
    });
  },
  addRedo(state, action) {
    let newState = lodash.cloneDeep(state);
    this.redoStack.push({
      state: newState,
      action,
    });
  },
};

export default undoManager;