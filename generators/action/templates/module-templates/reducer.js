const <%= actionName.reducerName %>Default = <%- reducerValue || 'false' %>;

function <%= actionName.reducerName %> (state = <%= actionName.reducerName %>Default, action) {
  switch (action.type) {
    case <%= actionName.const %>:
      return action.payload;
    case RESET_APP:
      return <%= actionName.reducerName %>Default;
    default:
      return state;
  }
}
