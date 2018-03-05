# <%= componentRepoName %>
<%= componentDescription %>

## Getting Started 

### Installation    
	$ npm install --save @snapk/<%= componentName.packageName %>

### Usage    
<% if (componentType === 'module' || componentType === 'hoc') { %>
#### Installing reducers
**Be sure to hook up the reducers in this <%= componentType %> or things won't work right.**  
In the service's reducer file import the reducers from this package and add them to the combine reducers
list.

	import {reducers as <%= componentName.camelCase %>Reducers} from '@snapk/<%= componentName.packageName %>';
	
	export default combineReducers(Object.assign({},
    	<%= componentName.camelCase %>Reducers, {
    	    serviceReducer,
    	    ...
    	})
    );
<% } %>

#### Using Components

<% if (componentType === 'module') { %>
	import {actions as <%= componentName.camelCase %>Actions, components as <%= componentName.camelCase %>Components, reducers as <%= componentName.camelCase %>Reducers} from '@snapk/<%= componentName.packageName %>';
	let {ProvidedComponent, AnotherProvidedComponent} = <%= componentName.camelCase %>Components;
	...
	render () {
		return (
			<ProvidedComponent {...rest} />
		);
	}
	...
	
<% } else if (componentType === 'hoc') { %>
	import <%= componentName.camelCase %>, {actions, constants} from '@snapk/<%= componentName.packageName %>';
	
	class App extends React.Component {
        render () {
            return (
                <MyGreatComponent props />
            );
        }
    }

    export default <%= componentName.camelCase %>(App);
<% } else if (componentType === 'component') { %>
	import <%= componentName.pascalCase %> from '@snapk/<%= componentName.packageName %>';
	
	App (...rest) {
        return (
            <<%= componentName.pascalCase %> {...rest} />
        );
    }
        
<% } else { %>
	import <%= componentName.camelCase %> from '@snapk/<%= componentName.packageName %>';
<% } %>

## API reference
<% if (componentType === 'hoc' || componentType === 'module') { %>
### Package Exports
<% if (componentType === 'hoc') { %>
- **<%= componentName.camelCase %>** _function_ **default export**  
This is the HOC function that provides the HOC function
<% } %>
<% if (componentType === 'module') { %>
- **components** _collection_  
This in a collection of components provided by this package.
<% } %>
- **actions** _collection_  
This in a collection of actions provided by this package.
- **constants** _collection_  
This in a collection of all the constants referenced within this package.
- **reducers** _object_  
This object contains all the reducers used within this package. It should be imported by each
service and added to its reducers to ensure proper functionality. These are name spaced to prevent
collisions with other state reducers 
<% } %>
<% if (s3Deploy) { %>
## CDN hosted Versions
A fully compiled, standalone version of the <%= componentName.kebabCase %> is hosted on the snap kitchen
AWS S3 CDN. All versions of the <%= componentName.kebabCase %> are published automatically to the snap
kitchen AWS S3
CDN under the current version number e.g. 
```
// Javascript
https://static-web.snapkitchen.com/<%= componentName.packageName %>/x.x.x/index.js
```
<% } %>
## Basic Repo Commands
1. `npm start` - Begins watching the js and babel compiles it
1. `npm start-linked` - links this package into the local npm node_modules/ and begins watching the js
and babel compiles it into the `/lib` this is useful when npm linking this package into another package
for local development. 
1. `npm test` - Runs the unit test on this module
1. `npm lint` - This runs as part of test. It runs the happiness linter.

## NPM versioning
This package uses semantic versioning, to increment package versions use the npm commands

1. `npm version major` - Bumps the major version e.g. 1.1.3 => 2.0.0  
  This should be done when a breaking change is introduced.
2. `npm version minor` - Bumps the minor version e.g. 1.1.3 => 1.2.0  
  This should be done when a feature / non-breaking change is introduced.
3. `npm version patch` - Bumps the patch version e.g. 1.1.3 => 1.1.4  
  This should be done when a bug is fixed.
