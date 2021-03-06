import React, { <%= pureComponent ? 'PureComponent' : 'Component' %> } from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet} from 'react-native';
<% if(connectToRedux) { %>
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
<% } -%>

import componentStyles from './styles';
const s = StyleSheet.create(componentStyles);

class <%= componentName.pascalCase %> extends <%= pureComponent ? 'PureComponent' : 'Component' %> {
  static propTypes = {
    <%= ['style', ...componentProps].map(prop => `${prop}: PropTypes.any,`).join('\n    ') %>
  };

  static defaultProps = {
    <%- ['style', ...componentProps].map(prop => `${prop}: '',`).join('\n    ') %>
  };
<% if(!pureComponent){ %>
  state = {};
<% } %>
  render() {
    const { <%= ['style', ...componentProps].join(', ') %> } = this.props;

    return (
      <View style={[style, s.component<%= componentName.pascalCase %>]}>
      </View>
    );
  }
}
<% if(connectToRedux) { %>
// Update these props from the state tree
// eslint-disable-next-line no-unused-vars
const mapStateToProps = state => ({});

// Actions used in component
// eslint-disable-next-line no-unused-vars
const mapDispatchToProps = (dispatch, props) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(<%= componentName.pascalCase %>);
<% } else { %>
export default <%= componentName.pascalCase %>;
<% } -%>
