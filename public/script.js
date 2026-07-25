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

                    status.textContent = "🤖 AI is processing your voice...";

                    const blob = new Blob(chunks, {
                        type: "audio/webm"
                    });

                    console.log("Audio Blob:", blob);

                    const formData = new FormData();
                    formData.append("file", blob, "voice.webm");

                    console.log("Sending request to FastAPI...");

                    const response = await fetch("http://127.0.0.1:8000/api/converse", {
                        method: "POST",
                        body: formData
                    });

                    console.log("HTTP Status:", response.status);

                    const text = await response.text();

                    console.log("Raw Server Response:", text);

                    let data = {};

                    if (text) {
                        try {
                            data = JSON.parse(text);
                        } catch (err) {
                            throw new Error("Server returned invalid JSON:\n\n" + text);
                        }
                    }

                    if (!response.ok) {
                        throw new Error(data.detail || "Server Error");
                    }

                    console.log("Parsed Data:", data);

                    // Remove welcome message
                    const welcome = document.querySelector(".welcome");
                    if (welcome) {
                        welcome.remove();
                    }

                    // User message
                    chat.innerHTML += `
                        <p style="
                            background:#2563eb;
                            color:white;
                            padding:12px;
                            border-radius:12px;
                            margin-bottom:12px;
                        ">
                            👤 <b>You:</b><br>
                            ${data.user_text}
                        </p>
                    `;

                    // AI message
                    chat.innerHTML += `
                        <p style="
                            background:#7c3aed;
                            color:white;
                            padding:12px;
                            border-radius:12px;
                            margin-bottom:12px;
                        ">
                            🤖 <b>AI:</b><br>
                            ${data.ai_response}
                        </p>
                    `;

                    chat.scrollTop = chat.scrollHeight;

                    // Play AI voice
                    if (data.audio) {

                        const bytes = data.audio
                            .match(/.{1,2}/g)
                            .map(x => parseInt(x, 16));

                        const audioBlob = new Blob(
                            [new Uint8Array(bytes)],
                            { type: "audio/mpeg" }
                        );

                        audioPlayer.src = URL.createObjectURL(audioBlob);

                        await audioPlayer.play();
                    }

                    status.textContent = "✅ Finished";

                }
                catch (err) {

                    console.error("FULL ERROR:", err);

                    status.textContent = "❌ Error";

                    alert(err.message);
                }

            };

            recorder.start();

            isRecording = true;

            button.innerHTML = "⏹ Stop Recording";

            button.style.background = "#ef4444";

            status.textContent = "🎙 Listening...";

        }
        catch (err) {

            console.error("Microphone Error:", err);

            alert(err.message);

        }

    }
    else {

        recorder.stop();

        isRecording = false;

        button.innerHTML = "🎤 Start Recording";

        button.style.background = "";

    }

});