document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const apiEndpoint = '/api/chat';

    // This array will store the conversation history on the client-side
    // to provide context in multi-turn conversations.
    const conversationHistory = [];

    /**
     * Appends a new message to the chat box UI.
     * @param {string} role - The role of the message sender ('user' or 'bot').
     * @param {string} text - The content of the message.
     * @returns {HTMLElement} The newly created message element.
     */
    const addMessageToChatbox = (role, text) => {
        const messageElement = document.createElement('div');
        // We'll add CSS classes to style user and bot messages differently.
        messageElement.classList.add('message', `${role}-message`);
        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        // Automatically scroll to the latest message.
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    };

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();

        if (!userMessage) {
            return; // Don't send empty messages
        }

        // 1. Add the user's message to the chat box and history
        addMessageToChatbox('user', userMessage);
        conversationHistory.push({ role: 'user', content: userMessage });

        // Clear the input field
        userInput.value = '';

        // 2. Show a temporary "Thinking..." message
        const thinkingMessageElement = addMessageToChatbox('bot', 'Thinking...');

        try {
            // 3. Send the conversation history to the backend API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversation: conversationHistory }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server.');
            }

            const data = await response.json();

            // 4. Replace "Thinking..." with the AI's actual response
            if (data.result) {
                thinkingMessageElement.textContent = data.result;
                // Add the bot's response to the history for future context
                conversationHistory.push({ role: 'model', content: data.result });
            } else {
                thinkingMessageElement.textContent = 'Sorry, no response received.';
            }
        } catch (error) {
            // 5. Handle any errors that occur during the fetch
            console.error('Error during chat API call:', error);
            thinkingMessageElement.textContent = 'Failed to get response from server.';
        }
    });
});
