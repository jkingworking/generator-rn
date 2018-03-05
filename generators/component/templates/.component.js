import React, {Component} from 'react';
import PropTypes from 'prop-types';
<% if (connectToRedux) {%>import {connect} from 'react-redux';<% } -%>

// Styles
import componentStyles from './styles';
import gs from '../../styles/globalStyles';
import styleVariables from '../../styles/styleVariables';

// Components
import {View, StyleSheet} from 'react-native';
import {SnapText} from '../StyledText';

const s = StyleSheet.create(componentStyles);

class <%= componentName.pascalCase %> extends Component {
	state = {};

	static propTypes = {
		styles: PropTypes.any,
	};

	static defaultProps = {};

	render () {
		const { styles } = this.props;
		return (
			<View style={[styles, s.component<%= componentName.pascalCase %>]}>
				<SnapText><%= componentName.pascalCase %></SnapText>
			</View>
		);
	}
}
<% if (connectToRedux) {%>
// Update these props from the state tree
const mapStateToProps = (state) => ({});

// Actions used in component
const mapDispatchToProps = (dispatch, props) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(<%= componentName.pascalCase %>);
<% } else { %>
export default <%= componentName.pascalCase %>;
<% }%>