import 'react-native';
import React from 'react';
import <%= componentName.pascalCase %> from './<%= componentName.pascalCase %>';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer.create(<<%= componentName.pascalCase %> />).toJSON();

  expect(tree).toMatchSnapshot();
});
