const initialState = {
  threads: {
    byId: {},
    allIds: [],
  },
  tabs: {
    byId: {},
    allIds: [],
  },
  messages: {
    byId: {},
    allIds: [],
  },
};

const applicationDataReducer = (state = initialState, action) => {
  let stateCopy = state;
  switch (action.type) {
    case "ADD_THREADS":
      return pushEntities("threads", null, stateCopy, action.payload);

    case "ADD_TABS":
      return pushEntities("tabs", "threads", stateCopy, action.payload);

    case "ADD_MESSAGES":
      return pushEntities("messages", "tabs", stateCopy, action.payload);

    case "UNSHIFT_THREADS":
      return unshiftEntities("threads", null, stateCopy, action.payload);

    case "UNSHIFT_MESSAGES":
      return unshiftEntities("messages", "tabs", stateCopy, action.payload);

    default:
      return state;
  }
};

function pushEntities(entity, parentEntity, stateCopy, payload) {
  payload[entity].forEach((currentEntity) => {
    //Fill up the object of entities with key as entity id and value as the entity itself.
    stateCopy[entity].byId[currentEntity._id] = currentEntity;

    //Push the current id to allIds array.
    stateCopy[entity].allIds.push(currentEntity._id);

    //If there is a parent entity, add the current entity id to parent entity's list of child entities.
    if (parentEntity != null && stateCopy[parentEntity])
      stateCopy[parentEntity][entity].push(currentEntity._id);
  });
  return stateCopy;
}

function unshiftEntities(entity, parentEntity, stateCopy, payload) {
  payload[entity].forEach((currentEntity) => {
    //Fill up the object of entities with key as entity id and value as the entity itself.
    stateCopy[entity].byId[currentEntity._id] = currentEntity; //Objects are unordered. Doesn't matter where you add it.

    //Push the current id to allIds array.
    stateCopy[entity].allIds.unshift(currentEntity._id);

    //If there is a parent entity, add the current entity id to parent entity's list of child entities.
    if (parentEntity != null && stateCopy[parentEntity])
      stateCopy[parentEntity][entity].unshift(currentEntity._id);
  });
  return stateCopy;
}

export default applicationDataReducer;
