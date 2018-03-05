import { <%= actionName.const %>, ASYNC_STATUSES } from '../constants';

const { DEFAULT, IN_PROGRESS, ERROR, SUCCESS } = ASYNC_STATUSES;

const defaultValue = {
  error: null,
  payload: <%- reducerValue %>,
  status: DEFAULT,
};

export default function <%= actionName.camelCase %>Reducer (state = defaultValue, action) {
  switch (action.type) {
    case `${<%= actionName.const %>}:${IN_PROGRESS}`:
      return {
        ...state,
        status: IN_PROGRESS,
      };
    case `${<%= actionName.const %>}:${ERROR}`:
      return {
        ...state,
        error: action.error,
        payload: null,
        status: ERROR,
      };
    case `${<%= actionName.const %>}:${SUCCESS}`:
      return {
        ...state,
        error: null,
        payload: action.payload,
        status: SUCCESS,
      };
    default:
      return state;
  }
}

