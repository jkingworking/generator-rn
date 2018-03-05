import fetch from '../core/fetch';
import {<%= actionName.const %>, ASYNC_STATUSES} from '../constants';

const { ERROR, IN_PROGRESS, SUCCESS } = ASYNC_STATUSES;

const <%= actionName.camelCase %>InProgress = {
	type: `${<%= actionName.const %>}:${IN_PROGRESS}`,
	status: IN_PROGRESS,
};

const <%= actionName.camelCase %>Error = error => ({
	type: `${<%= actionName.const %>}:${ERROR}`,
	error,
});

const <%= actionName.camelCase %>Success = payload => ({
	type: `${<%= actionName.const %>}:${SUCCESS}`,
	payload,
});

export default function <%= actionName.camelCase %>Action () {
	return async (dispatch, getState) => {
		const { apiUrl } = getState();

		dispatch(<%= actionName.camelCase %>InProgress);

		const resp = await fetch(`${apiUrl}/`, {
			method: 'GET',
			// body: {}
		});

		const payload = await resp.json();

    return (resp.status >= 400)
			? dispatch(<%= actionName.camelCase %>Error(payload))
			: dispatch(<%= actionName.camelCase %>Success(payload.data));
	};
}
