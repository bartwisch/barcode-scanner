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

document.getElementById('manualScan').addEventListener('click', function() {
    console.log('Manual scan clicked');
    // Start scanning once
    if (!Quagga.running) {
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
        readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader"]  // Expanded list of barcode types
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
    document.getElementById('barcodeResult').innerHTML = "<strong>Scanned Code:</strong> " + code;
    // Create a popup with the scanned code and an OK button
    let popup = document.createElement('div');
    popup.innerHTML = `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid black; z-index: 100;">
        <p>Scanned Code: ${code}</p>
        <button id="okButton">OK</button>
    </div>`;
    document.body.appendChild(popup);
    document.getElementById('okButton').addEventListener('click', function() {
        popup.remove();
        window.location.reload(true);
    });
});
