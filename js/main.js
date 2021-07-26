const MARKER_COLORS = ["#5797DB", "#FE8E48", "#EA7197"];
let markers = {};
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
// document.getElementById("show-on-file").style.display = "none";

// Play button
let button = document.getElementById("playbutton");
button.addEventListener("click", () => {
	wavesurfer.playPause();
	document.activeElement.blur();
});
document.addEventListener("keypress", (e) => {
	if (e.code === "Space") {
		wavesurfer.playPause();
	}
	if (e.code === "Digit1") {
		createMarker(1);
	}
	if (e.code === "Digit2") {
		createMarker(2);
	}
	if (e.code === "Digit3") {
		createMarker(3);
	}
});
document.getElementById("clear").addEventListener("click", () => {
	markers = {};
	wavesurfer.clearMarkers();
	document.getElementById("markertable").innerHTML = `<tbody><tr>
                                                        <th>Time</th>
                                                        <th>Beat</th>
                                                        <th>Type</th>
                                                        <th>Remove</th>
                                                    </tr>
                                                    </tbody>`;
});
document.getElementById("marker1").addEventListener("click", () => {
	createMarker(1);
});
document.getElementById("marker2").addEventListener("click", () => {
	createMarker(2);
});
document.getElementById("marker3").addEventListener("click", () => {
	createMarker(3);
});

// Dropzone
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
        
		var reader = new FileReader();
		reader.addEventListener("loadend", function (event) {
			// let currUrl = URL.createObjectURL(new Blob([event.target.result], {type: file.type}))
			// console.log(currUrl);
			// wavesurfer.loadBlob(new Blob([event.target.result], {type: file.type}));
			// wavesurfer.load('../static/animoe_test.mp3');
		});
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
		color: MARKER_COLORS[type - 1],
		label: time.toFixed(1),
		position: type === 1 ? "top" : "bottom",
	});
	markers[id] = {
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
    for(let id in markers) {
        let marker = markers[id];
        contents += `\nb${marker.beat} ${marker.type}`;
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
	delete markers[id];
	wavesurfer.clearMarkers();
	for (let id in markers) {
		wavesurfer.markers.add({
			time: markers[id].time,
			color: MARKER_COLORS[markers[id].type - 1],
			label: markers[id].time.toFixed(1),
			position: markers[id].type === 1 ? "top" : "bottom",
		});
	}
}
