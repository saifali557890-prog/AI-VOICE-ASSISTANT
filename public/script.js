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

                    const formData = new FormData();
                    formData.append("file", blob, "voice.webm");

                    const response = await fetch("/api/converse", {
                        method: "POST",
                        body: formData
                    });

                    console.log("Status:", response.status);

                    const data = await response.json();

                    console.log(data);

                    if (!response.ok) {
                        throw new Error(data.detail || "Server Error");
                    }

                    // Remove welcome message
                    const welcome = document.querySelector(".welcome");
                    if (welcome) {
                        welcome.remove();
                    }

                    // User Message
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

                    // AI Message
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

                    }

                    status.textContent = "✅ Finished";

                }
                catch (err) {

                    console.error(err);

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

            console.error(err);

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