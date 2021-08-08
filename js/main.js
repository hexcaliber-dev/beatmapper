const MARKERS = {
	1: {
		color: "#5797DB",
		id: "marker1",
		keyCode: "Digit1",
		label: "Place Basic Marker (1)"
	},
	2: {
		color: "#FE8E48",
		id: "marker2",
		keyCode: "Digit2",
		label: "Place Special Marker (2)"
	},
	3: {
		color: "#EA7197",
		id: "marker3",
		keyCode: "Digit3",
		label: "Place Ultimate Marker (3)"
	},
	4: {
		color: "#A471AD",
		id: "marker4",
		keyCode: "Digit4",
		label: "Place Spawn Marker (4)"
	},
}

const TABLE_HEADERS = 
`<tbody><tr>
	<th>Time</th>
	<th>Beat</th>
	<th>Type</th>
	<th>Metadata</th>
	<th>Remove</th>
</tr></tbody>`

let markerList = {};
let fileName = "";

var wavesurfer = WaveSurfer.create({
	container: "#waveform",
	height: 250,
	barHeight: 2.5,
	waveColor: "#44445F",
	progressColor: "#2D7DD2",
	plugins: [
		WaveSurfer.markers.create(),
		WaveSurfer.cursor.create({
			showTime: true,
			opacity: 1,
			customShowTimeStyle: {
				"background-color": "#000",
				color: "#fff",
				padding: "2px",
				"font-size": "15px",
			},
		}),
	],
});

// Get the template HTML and remove it from the doumenthe template HTML and remove it from the doument
var previewNode = document.getElementById("template");
previewNode.id = "";
var previewTemplate = previewNode.parentNode.innerHTML;
previewNode.parentNode.removeChild(previewNode);

// wavesurfer.load('../static/animoe_test.mp3');
// Zoom slider
let slider = document.getElementById("zoomslider");

slider.addEventListener("input", function () {
	wavesurfer.zoom(slider.value);
});

// Hide controls until file uploaded
document.getElementById("show-on-file").style.display = "none";

// Play button
let button = document.getElementById("playbutton");
button.addEventListener("click", () => {
	wavesurfer.playPause();
	document.activeElement.blur();
});

// Create marker buttons
let markerHtml = "";
for (let n in MARKERS) {
	markerHtml += `<button class="btn" data-action="${MARKERS[n].id}" id="${MARKERS[n].id}" style="background-color: ${MARKERS[n].color}">
	${MARKERS[n].label}
</button>`
}
document.getElementById('marker-buttons').innerHTML = markerHtml;

// Init keypress events
document.addEventListener("keypress", (e) => {
	if (e.code === "Space") {
		wavesurfer.playPause();
	}

	for (let n in MARKERS) {
		if (e.code === MARKERS[n].keyCode) {
			createMarker(n);
		}
	}
});

for (let n in MARKERS) {
	document.getElementById(MARKERS[n].id).addEventListener("click", () => createMarker(n));
}


// Init marker table
document.getElementById("markertable").innerHTML = TABLE_HEADERS;
document.getElementById("clear").addEventListener("click", () => {
	markerList = {};
	wavesurfer.clearMarkers();
	document.getElementById("markertable").innerHTML = TABLE_HEADERS;
});

// Dropzone initialization
Dropzone.options.drop = {
	paramName: "file", // The name that will be used to transfer the file
	maxFiles: 1,
	acceptedFiles: "audio/*",
	dictDefaultMessage: "Drop audio file here to get started!",
	previewTemplate: previewTemplate,
	previewsContainer: "#drop",
	accept: function (file, done) {
		console.log("uploaded " + file.name);
        fileName = file.name.split(".")[0];
		// var reader = new FileReader();
		// reader.addEventListener("loadend", function (event) {
		// 	// let currUrl = URL.createObjectURL(new Blob([event.target.result], {type: file.type}))
		// 	// console.log(currUrl);
		// 	// wavesurfer.loadBlob(new Blob([event.target.result], {type: file.type}));
		// 	// wavesurfer.load('../static/animoe_test.mp3');
		// });
		// reader.readAsBinaryString(file);
		wavesurfer.loadBlob(file);
		document.getElementById("show-on-file").style.display = "block";
	},
};

function createMarker(type, time) {
	if (time === undefined) time = wavesurfer.getCurrentTime();
	let id = uuidv4();
	wavesurfer.markers.add({
		time,
		color: MARKERS[type].color,
		label: time.toFixed(1),
		position: type === 1 ? "top" : "bottom",
	});
	markerList[id] = {
		time,
		type,
		beat: getBeat(time),
	};
	let newRow = document.getElementById("markertable").insertRow();
	newRow.id = id;
	[time.toFixed(2), getBeat(time), type].map((value) => {
		let cell = newRow.insertCell();
		cell.appendChild(document.createTextNode(value));
	});
	
	let metadata = newRow.insertCell();
	metadata.innerHTML = `<input type="text" id="meta-${id}" class="metadata" name="meta-${id}">`;

	let deleteBtn = newRow.insertCell();
	deleteBtn.innerHTML = `<button class="remove" id="remove-${id}">Remove</button>`;
	document.getElementById("remove-" + id).addEventListener("click", () => {
		removeMarker(id);
	});
}

function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function getQuantize() {
	return document.getElementById("quantize").checked;
}

function getBpm() {
	return document.getElementById("bpm").value;
}

function getBeat(time) {
	let beat = time / 60 * getBpm();
	return getQuantize() ? Math.round(beat) : beat;
}

function exportMarkers() {
    let contents = "bpm " + getBpm();
    for(let id in markerList) {
        let marker = markerList[id];
        contents += `\nb${marker.beat} ${marker.type} ${document.getElementById("meta-" + id).value}`;
    }
    download(fileName + ".txt", contents);
}
document.getElementById("export").addEventListener("click", exportMarkers);


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}
  
function removeMarker(id) {
	document
		.querySelector("#markertable tbody")
		.removeChild(document.getElementById(id));
	delete markerList[id];
	wavesurfer.clearMarkers();
	for (let id in markerList) {
		wavesurfer.markers.add({
			time: markerList[id].time,
			color: MARKERS[markerList[id].type].color,
			label: markerList[id].time.toFixed(1),
			position: markerList[id].type === 1 ? "top" : "bottom",
		});
	}
}
