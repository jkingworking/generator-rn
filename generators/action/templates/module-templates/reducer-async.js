const <%= actionName.reducerName %>Default = {
  error: null,
  payload: <%- reducerValue || 'false' %>,
  status: ASYNC_STATUSES.DEFAULT,
};

function <%= actionName.reducerName %> (state = <%= actionName.reducerName %>Default, action) {
  switch (action.type) {
    case <%= actionName.const %>.IN_PROGRESS:
      return {
        ...state,
        status: ASYNC_STATUSES.IN_PROGRESS,
      };
    case <%= actionName.const %>.ERROR:
      return {
        ...state,
        error: action.error,
        payload: null,
        status: ASYNC_STATUSES.ERROR,
      };
    case <%= actionName.const %>.SUCCESS:
      return {
        ...state,
        error: null,
        payload: action.payload,
        status: ASYNC_STATUSES.SUCCESS,
      };
    case RESET_APP:
      return <%= actionName.reducerName %>Default;
    default:
      return state;
  }
}
