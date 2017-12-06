var options = {
	env: 'AutodeskProduction',
	getAccessToken: getForgeToken
}

$(document).ready(function() {
	var width = window.outerWidth;
	var w = Math.floor(width/2);
	var h = Math.floor(width/4);
	
	$('#viewerDiv').css('width', w + 'px').css('height', h + 'px');

	getObjects();
});

$(document).on('click', '#object_list li', function() {
	var urn = $(this).attr('data-id');

	$.when(getSVF(urn)).then(function() {});
});

$(document).on('contextmenu', '#object_list li', function() {
	event.preventDefault();

	var urn = $(this).attr('data-id');
	var name = $(this).text();

	$.when(deleteObject(name, urn)).then(function() {});
});

function getForgeToken(callback) {
	$.ajax({
		url: '/api/token',
		success: function (res) {
			console.log('res de token client', res);
			callback(res.access_token, res.expires_in)
		},
		error: function(err) {
			$('span.detail').text(JSON.stringify(err));
		}
	});
}

function putItem() {
	$('.uploadFile').trigger('click');
}

function uploadItem(dom) {
	$('#progress').removeAttr('class');
	dom.form.submit()
}

function getObjects() {
	$.ajax({
		url: '/api/getObjects',
		success: function(data) {
			$('#object_list').empty();

			for (var i = 0; i < data.length; i++) {
				var tempStr = '<li data-id="' +
					data[i].objectId + '">' +
					data[i].objectKey + '</li>'
				$('#object_list').append(tempStr);
			}
		},
		error: function(err) {
			$('span.detail').text(JSON.stringify(err));
		}
	});
}

function deleteObject(name, urn) {
	$('#progress').removeAttr('class');

	$.ajax({
		url: '/api/deleteObject?name=' + name + '&urn=' + urn,
		success: function(data) {
			$('span.detail').text(JSON.stringify(data));
			$('#progress').addClass('displayNone');
			getObjects();
		},
		error: function(err) {
			$('span.detail').text(JSON.stringify(err));
		}
	});
}

function getSVF(urn) {
	$('#progress').removeAttr('class');

	$.ajax({
		url: '/api/getSVF?urn=' + urn,
		success: function(data) {
			$('span.detail').text(JSON.stringify(data));
			$('#progress').addClass('displayNone');
			
			Autodesk.Viewing.Initializer(options, function onInitialized() {
				Autodesk.Viewing.Document.load('urn:' + data.urn, onDocumentLoadSuccess, onDocumentLoadFailure);
			});
		},
		error: function(err) {
			$('span.detail').text(JSON.stringify(err));
		}
	});
}




function onDocumentLoadFailure() {
}
function onDocumentLoadSuccess(doc) {
	// A document contains references to 3D and 2D viewables.
	var viewable = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {
	'type': 'geometry',
	'role': '3d'
	}, true);
	if (viewable.length === 0) {
	console.error('Document contains no viewables.');
	return;
	}

	// Choose any of the available viewable
	var initialViewable = viewable[0]; // You can check for other available views in your model,
	var svfUrl = doc.getViewablePath(initialViewable);
	var modelOptions = {
	sharedPropertyDbPath: doc.getPropertyDbPath()
	};

	var viewerDiv = document.getElementById('viewerDiv');

	///////////////USE ONLY ONE OPTION AT A TIME/////////////////////////

	/////////////////////// Headless Viewer /////////////////////////////
	// viewer = new Autodesk.Viewing.Viewer3D(viewerDiv);
	//////////////////////////////////////////////////////////////////////

	//////////////////Viewer with Autodesk Toolbar///////////////////////
	viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv);
	//////////////////////////////////////////////////////////////////////

	viewer.start(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
}
function onLoadModelSuccess() {
}
function onLoadModelError() {
}