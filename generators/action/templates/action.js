import { <%= actionName.const %> } from '../constants';

export default function <%= actionName.camelCase %>Action (<%= actionName.reducerName %>) {
	return {
		type: <%= actionName.const %>,
		<%= actionName.reducerName %>: <%= actionName.reducerName %>
	};
}
