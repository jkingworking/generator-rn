import 'react-native';
import React from 'react';
import <%= componentName.pascalCase %> from './<%= componentName.kebabCapCase %>';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
	const component = renderer.create(<<%= componentName.pascalCase %> />).toJSON();
	expect(component).toMatchSnapshot();
});
