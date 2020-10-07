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

export const add = (entity, payload) => {
  return {
    type: "ADD_" + entity.toUpperCase(),
    payload: payload,
  };
};

export const unshift = (entity, payload) => {
  return {
    type: "UNSHIFT_" + entity.toUpperCase(),
    payload: payload,
  };
};

export const find = (entity, parentId) => {
  return {
    type: "GET_" + entity.toUpperCase(),
    payload: parentId,
  };
};
