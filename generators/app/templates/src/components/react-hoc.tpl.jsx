import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default function <%= componentName.camelCase %>HOC (WrappedComponent) {
	<%= componentName.camelCase %>HOC.displayName = '<%= componentNameForImport %>HOC - function';

	return class <%= componentNameForImport %>HOC extends Component {
		constructor (props, context) {
			super(props);
			context = (props.context) ? props.context : context;
			// let currentState = context.store.getState();

			this.state = {
				context: context,
				stateSubscription: context.store.subscribe(this.componentWillReceiveData.bind(this))
			};
		}

		static displayName = '<%= componentNameForImport %>HOC - class';

		static propTypes = {
			context: PropTypes.shape({
				store: PropTypes.object.isRequired
			})
		};

		static contextTypes = {
			store: PropTypes.object
		};

		componentWillUnmount () {
			this.state.stateSubscription();
		}

		componentWillReceiveData () {
			// let nextState = this.state.context.store.getState();
		}

		render () {
			return (
				<WrappedComponent {...this.props} />
			);
		}
	};
}

export * as actions from '../actions';
export * as constants from '../constants';
export * as reducers from '../reducers';
