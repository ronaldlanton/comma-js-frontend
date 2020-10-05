const initialState = {
  conversation: {
    _id: null,
    thread_participants: [],
    tabs: [],
    new_for: [],
    date_created: null,
    date_updated: null,
  },
};

const conversationReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_CURRENT_CONVERSATION":
      let modifiedState = state;
      modifiedState.conversation = action.payload;
      return modifiedState;
    default:
      return state;
  }
};

export default conversationReducer;
