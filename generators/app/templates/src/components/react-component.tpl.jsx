import React from 'react';
import PropTypes from 'prop-types';

function <%= componentNameForImport %> ({ className, ...rest }) {
	return (
		<div
			className={`component-<%= componentName.kebabCase %> ${className}`}
			{...rest}
		>
		</div>
	);
}

<%= componentNameForImport %>.propTypes = {
	className: PropTypes.string
};

export default <%= componentNameForImport %>;
