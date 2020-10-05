export const setUser = (user) => {
  return {
    type: "SET_USER",
    payload: user,
  };
};

export const setCurrentConversation = (conversation) => {
  return {
    type: "SET_CURRENT_CONVERSATION",
    payload: conversation,
  };
};
