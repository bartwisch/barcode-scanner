let flashlightOn = false; // Track flashlight state
let autoScanActive = false; // Track auto scan state

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
                    flashlightOn = !flashlightOn; // Toggle flashlight state
                    track.applyConstraints({ advanced: [{ torch: flashlightOn }] });
                }
            }
        })
        .catch(function(error) {
            console.log('Error accessing camera for flashlight:', error);
        });
    }
});

document.getElementById('autoScan').addEventListener('change', function() {
    console.log('Auto scan toggled');
    autoScanActive = this.checked; // Update state based on checkbox
    if (autoScanActive) {
        startQuagga(); // Start scanning
        document.getElementById('barcodeResult').style.backgroundColor = 'transparent'; // Clear background when scanning
    } else {
        document.getElementById('barcodeResult').style.backgroundColor = 'rgba(211, 211, 211, 0.5)'; // Light grey with 50% opacity
    }
});

document.getElementById('manualScan').addEventListener('click', function() {
    console.log('Manual scan clicked');
    // Start scanning for 1 second
    if (!Quagga.running) {
        startQuagga();
        setTimeout(function() {
            Quagga.stop();
        }, 1000); // Stop scanning after 1 second
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
    
    // Stop scanning and wait for 2 seconds before resuming if autoscan is active
    Quagga.stop();
    setTimeout(function() {
        if (autoScanActive) {
            startQuagga(); // Restart the scanner if autoscan is active
        }
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
