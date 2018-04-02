export function <%= actionName.camelCase %>Action (<%= actionName.reducerName %>) {
  return {
    type: <%= actionName.const %>,
    payload: <%= actionName.reducerName %>
  };
}
