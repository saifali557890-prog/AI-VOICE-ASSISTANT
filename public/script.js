const button = document.getElementById("recordButton");
const status = document.getElementById("status");
const chat = document.getElementById("chat");
const audioPlayer = document.getElementById("audioPlayer");

let recorder = null;
let chunks = [];
let isRecording = false;

button.addEventListener("click", async () => {

    if (!isRecording) {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            recorder = new MediaRecorder(stream);
            chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {

                try {

                    status.textContent = "Processing...";

                    const blob = new Blob(chunks, {
                        type: "audio/webm"
                    });

                    const formData = new FormData();
                    formData.append("file", blob, "voice.webm");

                    // Vercel API Route
                    const response = await fetch("/api/converse", {
                        method: "POST",
                        body: formData
                    });

                    console.log("Status:", response.status);

                    const data = await response.json();

                    console.log("Response:", data);

                    if (!response.ok) {
                        alert(data.detail || "Server Error");
                        status.textContent = "Error";
                        return;
                    }

                    chat.innerHTML += `<p><b>You:</b> ${data.user_text}</p>`;
                    chat.innerHTML += `<p><b>AI:</b> ${data.ai_response}</p>`;

                    if (data.audio) {

                        const bytes = data.audio
                            .match(/.{1,2}/g)
                            .map(x => parseInt(x, 16));

                        const uint8 = new Uint8Array(bytes);

                        const audioBlob = new Blob([uint8], {
                            type: "audio/mpeg"
                        });

                        audioPlayer.src = URL.createObjectURL(audioBlob);

                        await audioPlayer.play();

                    } else {

                        console.log("No audio received.");

                    }

                    status.textContent = "Finished";

                } catch (err) {

                    console.error(err);
                    alert(err.message);
                    status.textContent = "Error";

                }

            };

            recorder.start();

            isRecording = true;
            button.textContent = "Stop";
            status.textContent = "Recording...";

        } catch (err) {

            console.error(err);
            alert(err.message);

        }

    } else {

        recorder.stop();

        isRecording = false;
        button.textContent = "🎤 Record";

    }

});