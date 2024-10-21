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

let autoScanActive = false;

document.getElementById('autoScan').addEventListener('click', function() {
    console.log('Auto scan toggled');
    autoScanActive = !autoScanActive;
    if (autoScanActive) {
        Quagga.start();
    } else {
        Quagga.stop();
    }
});

document.getElementById('manualScan').addEventListener('click', function() {
    console.log('Manual scan clicked');
    // Start scanning once
    if (!Quagga.running) {
        Quagga.start();
    }
});

// Array to hold scanned codes
let scannedCodes = [];

// Setup QuaggaJS for barcode scanning
function startQuagga() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#barcodeResult'),    // Display the camera stream
            constraints: {
                facingMode: "environment" // Use the environment camera
            }
        },
        decoder: {
            readers: [
                "code_128_reader", 
                "ean_reader", 
                "ean_8_reader", 
                "code_39_reader", 
                "code_39_vin_reader", 
                "codabar_reader", 
                "upc_reader", 
                "upc_e_reader"
            ]  // Expanded list of barcode types
        }
    }, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
    });
}

// Start the Quagga scanner
startQuagga();

// Event listener for processed barcodes
Quagga.onDetected(function(result) {
    var code = result.codeResult.code;
    console.log("Barcode detected and processed : [" + code + "]", result);
    
    // Add the scanned code to the list
    scannedCodes.push(code);
    
    // Update the UI to display the scanned codes
    const scannedCodesList = document.getElementById('scannedCodesList');
    scannedCodesList.innerHTML = scannedCodes.map(c => `<li>${c}</li>`).join('');
    
    // Stop scanning and wait for 2 seconds before resuming
    Quagga.stop();
    setTimeout(function() {
        startQuagga(); // Restart the scanner
    }, 2000);
});

// Error handling for barcode detection
Quagga.onProcessed(function(result) {
    if (result && result.codeResult && result.codeResult.code) {
        console.log("Barcode detected: " + result.codeResult.code);
    } else {
        console.log("No barcode detected");
    }
});
