# OData Connector

This is an Arrow connector to OData.

## Installation

```bash
$ appc install connector/appc.odata
```

A configuration file is generated for you. However, you must set a url in your configuration.

## Usage

Reference the connector in your model.

```javascript
var Products = Arrow.createModel('Products', {
	fields: {
		Name: { 
			type: String, 
			required: true
		}
	},
	connector: 'appc.odata'
});
```

If you want to expand some referenced navigation field use the model property.  
For example, to invoke the `Category` of the `Product`, set it such as:

```javascript
var Products = Arrow.createModel('Products', {
	fields: {
		Name: { 
			type: String, 
			required: true
		},
		Category: { 
			type: String, 
			required: true,
			model: 'Category'
		}
	},
	connector: 'appc.odata'
});
```

## Development

> This section is for individuals developing the OData Connector and not intended
  for end-users.

```bash
npm install
node app.js
```

### Running Unit Tests
The tests will create and use a couple of models.

```bash
npm run test:unit
```

# Contributing

This project is open source and licensed under the [Apache Public License (version 2)](http://www.apache.org/licenses/LICENSE-2.0).  Please consider forking this project to improve, enhance or fix issues. If you feel like the community will benefit from your fork, please open a pull request. 

To protect the interests of the contributors, Appcelerator, customers and end users we require contributors to sign a Contributors License Agreement (CLA) before we pull the changes into the main repository. Our CLA is simple and straightforward - it requires that the contributions you make to any Appcelerator open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It is easy, helps everyone, takes only a few minutes, and only needs to be completed once. 

[You can digitally sign the CLA](http://bit.ly/app_cla) online. Please indicate your email address in your first pull request so that we can make sure that will locate your CLA.  Once you've submitted it, you no longer need to send one for subsequent submissions.

# Legal Stuff

Appcelerator is a registered trademark of Appcelerator, Inc. Arrow and associated marks are trademarks of Appcelerator. All other marks are intellectual property of their respective owners. Please see the LEGAL information about using our trademarks, privacy policy, terms of usage and other legal information at [http://www.appcelerator.com/legal](http://www.appcelerator.com/legal).