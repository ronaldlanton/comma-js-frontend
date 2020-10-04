const initialState = {
  user: {
    display_picture: null,
    email: null,
    name: {
      givenName: null,
      familyName: null,
    },
    _id: null,
  },
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      let modifiedState = state;
      modifiedState.user = action.payload;
      return modifiedState;
    default:
      return state;
  }
};

export default userReducer;
