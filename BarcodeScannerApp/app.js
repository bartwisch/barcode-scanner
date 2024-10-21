document.getElementById('toggleFlashlight').addEventListener('click', function() {
    console.log('Toggle flashlight clicked');
    // Attempt to toggle the flashlight
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(function(stream) {
            let track = stream.getVideoTracks()[0];
            if (typeof track.getCapabilities === 'function') {
                let capabilities = track.getCapabilities();
                if (capabilities.torch) {
                    let torchStatus = track.getSettings().torch;
                    track.applyConstraints({ advanced: [{ torch: !torchStatus }] });
                }
            }
        })
        .catch(function(error) {
            console.log('Error accessing camera for flashlight:', error);
        });
    }
});

document.getElementById('autoScan').addEventListener('click', function() {
    console.log('Auto scan clicked');
    // Toggle continuous scanning
    if (Quagga.running) {
        Quagga.stop();
    } else {
        Quagga.start();
    }
});

// Setup QuaggaJS for barcode scanning
Quagga.init({
    inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#barcodeResult')    // Display the camera stream
    },
    decoder: {
        readers: ["code_128_reader"]  // List of barcode types to search for
    }
}, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Initialization finished. Ready to start");
    Quagga.start();
});

// Event listener for processed barcodes
Quagga.onDetected(function(result) {
    var code = result.codeResult.code;
    console.log("Barcode detected and processed : [" + code + "]", result);
    document.getElementById('barcodeResult').textContent = "Scanned Code: " + code;
});
