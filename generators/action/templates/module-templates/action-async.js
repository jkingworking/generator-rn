const <%= actionName.camelCase %>InProgress = {
  type: <%= actionName.const %>.IN_PROGRESS,
  status: ASYNC_STATUSES.IN_PROGRESS,
};

const <%= actionName.camelCase %>Error = error => ({
  type: <%= actionName.const %>.ERROR,
  error,
});

const <%= actionName.camelCase %>Success = payload => ({
  type: <%= actionName.const %>.SUCCESS,
  payload,
});

export function <%= actionName.camelCase %>Action () {
  return async (dispatch, getState) => {
    const { apiUrl } = getState();

    dispatch(<%= actionName.camelCase %>InProgress);

    try {
      const resp = await fetch(`${apiUrl}/`, {
        method: 'GET',
        oauth: true,
        // body: {}
      });

      const payload = await resp.json();

      return (resp.status >= 400)
        ? dispatch(<%= actionName.camelCase %>Error(payload))
        : dispatch(<%= actionName.camelCase %>Success(payload));
    } catch (e) {
      dispatch(<%= actionName.camelCase %>Error(e));
    }
  };
}
