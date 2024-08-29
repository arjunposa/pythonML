const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let mediaRecorder;
let recordedChunks = [];

let isRecognizing = false; 
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.lang = "en-US";
recognition.interimResults = false;

document.addEventListener("DOMContentLoaded", () => {
  startRecognition();
});

function startRecognition() {
  if (!isRecognizing) {
    recognition.start();
    isRecognizing = true;
    console.log("Ready to receive a command.");
  }
}

function stopAndRestartRecognition() {
  if (isRecognizing) {
    recognition.stop();
    isRecognizing = false;
    console.log("Stopping recognition for restart...");
    setTimeout(() => {
      startRecognition();
    }, 500); 
  }
}

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  const confidence = event.results[event.results.length - 1][0].confidence;

  console.log(`Recognized: ${transcript}`);
  console.log(`Confidence: ${confidence}`);
  handleInput(transcript)
};

recognition.onspeechend = () => {
  console.log("Speech recognition has stopped.");
  stopAndRestartRecognition(); 
};

recognition.onend = () => {
  isRecognizing = false;
  console.log("Recognition ended.");
};

recognition.onerror = (event) => {
  console.error(`Error occurred in recognition: ${event.error}`);
  if (event.error === "no-speech" || "aborted") {
    stopAndRestartRecognition();
  }
};

async function handleInput(input) {
    const normalizedInput = input.toLowerCase().trim(); 
  
    switch (normalizedInput) {
      case 'hey google':
        console.log('media record start');
        startRecording()
        break;
      case 'bye google':
        console.log('media record stop');
        stopRecording()
        break;
      default:
        console.log(normalizedInput);
        break;
    }
  }
  
  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
  
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };
  
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'audio/wav' });
          recordedChunks = []; 
          const url = URL.createObjectURL(blob);
          console.log('Recording stopped. Blob URL:', url);
          Base64Conversion(blob)
  
          
        };
  
        mediaRecorder.start();
        console.log('Recording started.');
        // setTimeout(() => {
        //     stopRecording()
        // }, 5000);
      })
      .catch(error => {
        console.error('Error accessing media devices.', error);
      });
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      console.log('Stopping recording...');
    } else {
      console.log('No active recording to stop.');
    }
  }


  async function Base64Conversion(blob) {
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64encodedData = reader.result;
          const base64Data = {
            "mime": base64encodedData.split(',')[0],
            "data": base64encodedData.split(',')[1]
          };
          resolve(base64Data);
          console.log(base64Data)
        };
        reader.onerror = (error) => {
          reject(error);
        };
      });
    } catch (error) {
      console.error('Error converting to base64:', error);
      throw error;
    }
  }