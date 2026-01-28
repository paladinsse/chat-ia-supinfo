    document.addEventListener("DOMContentLoaded", function () {
        const chatForm = document.getElementById("chat-form");
        const userInput = document.getElementById("user-input");
        const chatMessages = document.getElementById("chat-messages");
        const loaderElement = document.getElementById("loader");


        const OLLAMA_API_URL = "http://localhost:5000/api/chat";

        let conversationHistory = [];

        function appendMessage(sender, text) {
            const dateActuelle = new Date();
            const heureActuelle = dateActuelle.getHours();
            const minuteActuelle = dateActuelle.getMinutes();

            const messageElement = document.createElement("div");
            messageElement.className = `message ${sender.toLowerCase()}-message`;

            const senderElement = document.createElement("strong");
            senderElement.textContent = heureActuelle + ":" + minuteActuelle + " " + sender + ": ";

            const textElement = document.createElement("span");

            const formattedText = formatCodeBlocks(text);
            textElement.innerHTML = formattedText;

            messageElement.appendChild(senderElement);
            messageElement.appendChild(textElement);

            chatMessages.appendChild(messageElement);
            chatMessages.Top = chatMessages.scrollHeight;

        }
        const resetChatButton = document.getElementById("reset-chat-button");
        loadConversationHistory()

        chatForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const userMessage = userInput.value.trim();
            if (!userMessage) return;
            toggleLoaderVisibility(true);
            appendMessage("User", userMessage);
            userInput.value = "";
            userInput.focus();

            try {
                    conversationHistory.push({
                    role: "user",
                    content: userMessage,
                });

                const messages = [{ role: "system" }, ...conversationHistory];

                const requestData = {
                    model: "llama3.2:3b",
                    messages: messages,
                    stream: false,
                };

                const response = await fetch(OLLAMA_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                const data = await response.json();

                conversationHistory.push({
                    role: "assistant",
                    content: data.message.content,
                });

                appendMessage("Assistant", data.message.content);
                saveConversationHistory();
            } catch (error) {
                console.error(
                    "Erreur lors de la communication avec Ollama:",
                    error
                );
                appendMessage(
                    "Système",
                    "Désolé, une erreur est survenue lors de la communication avec l'IA."
                );
            }
            finally {
                toggleLoaderVisibility(false);
            }
        });

        function formatCodeBlocks(text) {
            const formattedText = text.replace(
                /```([a-z]*)\n([\s\S]*?)\n```/g,
                function (match, language, code) {
                    return `<pre><code class="language-${language}">${escapeHTML(
                        code
                    )}</code></pre>`;
                }
            );

            return formattedText.replace(/`([^`]+)`/g, "<code>$1</code>");
        }

        function escapeHTML(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function saveConversationHistory() {
            localStorage. setItem(
                "conversationHistory",
                JSON. stringify(conversationHistory)
            );
            console.log("Historique de conversation sauvegardé.") ;
        }

        function loadConversationHistory() {
            const savedHistory = localStorage.getItem("conversationHistory");
            if (savedHistory) {
                conversationHistory = JSON.parse(savedHistory);

                chatMessages. innerHTML = "";

                conversationHistory. forEach((message) => {
                    const sender = message. role === "user" ? "User" : "Assistant";
                    appendMessage(sender, message. content) ;
                });
                console. log("Historique de conversation chargé.");
            } else {
                appendMessage (
                    "Système",
                    "Bienvenue ! Posez votre première question à l'IA."
                );
            console.log("Aucun historique de conversation trouvé.");
            }
        }

        function resetConversation() {
            conversationHistory = [];
            chatMessages. innerHTML = "";
            userInput. value = ""
            userInput. focus ();
            appendMessage(
                "Système",
                "Nouvelle conversation demarrée. Posez votre premiere question !"
            );
            console.log("Conversation réinitialisée.") ;
            localStorage. removeItem ("conversationHistory");
        }

        function alertReset() {
            var testReset = (prompt("Voulez vous réitilisé le chat si oui tapez \"Oui\""))
            if (testReset == "Oui"){
                console.log("Condition vraie")
                resetConversation()
                console.log("Fonction appelé")
            }
        }

        if (resetChatButton) {
            resetChatButton.addEventListener("click", alertReset)
        }
        
        function toggleLoaderVisibility (show) {
            if (loaderElement) {
                if (show) {
                    loaderElement.classList.remove("loader-hidden");
                } else {
                    loaderElement.classList.add("loader-hidden");

                }

            }
        }
    });

