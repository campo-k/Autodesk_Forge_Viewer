/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

'use strict'; // http://www.w3schools.com/js/js_strict.asp

module.exports = {
	// Autodesk Forge configuration
	// Required scopes for your application on server-side
	scope: ['data:read', 'data:write', 'data:create', 'data:search'],
	// this this callback URL when creating your client ID and secret
	callbackURL: 'http://dev.aftest.com:3005/api/callback',
	// credentials
	credentials: {
	  client_id: 'JlvxOz7sEUpg9iux6JBN2E6r0Q8YAiOr',
	  client_secret: '0BR05VAvAhQW5Sbo'
	},
	bucket_key: 'test_' + 'JlvxOz7sEUpg9iux6JBN2E6r0Q8YAiOr'.toLowerCase()
};