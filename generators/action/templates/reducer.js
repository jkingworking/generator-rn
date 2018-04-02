import { <%= actionName.const %>, RESET_APP } from 'src/constants';
const defaultValue = <%- reducerValue || 'false' %>;

export default function <%= actionName.camelCase %>Reducer (state = defaultValue, action) {
	switch (action.type) {
		case <%= actionName.const %>:
			return action.payload;
    case RESET_APP:
			return defaultValue;
		default:
			return state;
	}
}
