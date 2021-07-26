var wavesurfer = WaveSurfer.create({
	container: "#waveform",
	height: 250,
	barHeight: 3,
    waveColor: "#44445F",
    progressColor: "#2D7DD2",
	plugins: [
		WaveSurfer.markers.create({
			markers: [
				{
					time: 5.5,
					label: "V1",
					color: "#ff990a",
				},
				{
					time: 10,
					label: "V2",
					color: "#00ffcc",
					position: "top",
				},
			],
		}),
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

// Play button
let button = document.getElementById("playbutton");
button.addEventListener("click", wavesurfer.playPause.bind(wavesurfer));

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
		var reader = new FileReader();
        console.log(file instanceof Blob);
		reader.addEventListener("loadend", function (event) {
            // let currUrl = URL.createObjectURL(new Blob([event.target.result], {type: file.type}))
            // console.log(currUrl);
			// wavesurfer.loadBlob(new Blob([event.target.result], {type: file.type}));
            // wavesurfer.load('../static/animoe_test.mp3');
		});
		// reader.readAsBinaryString(file);
        wavesurfer.loadBlob(file);
	},
};


