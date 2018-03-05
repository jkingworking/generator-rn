import { <%= actionName.const %> } from '../constants';
let defaultValue = <%- reducerValue || 'false' %>;

export default function <%= actionName.camelCase %>Reducer (state = defaultValue, action) {
	switch (action.type) {
		case <%= actionName.const %>:
			return action.<%= actionName.reducerName %>;
		default:
			return state;
	}
}
