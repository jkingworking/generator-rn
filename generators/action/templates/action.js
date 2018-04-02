import { <%= actionName.const %> } from 'src/constants';

export default function <%= actionName.camelCase %>Action (<%= actionName.reducerName %>) {
	return {
		type: <%= actionName.const %>,
    payload: <%= actionName.reducerName %>
	};
}
