// chat.js
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.chat-send-btn');

    function addMessage(content, isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    }

    function simulateTyping(element, text, index = 0) {
        if (index < text.length) {
            element.textContent += text[index];
            chatMessages.scrollTop = chatMessages.scrollHeight;
            setTimeout(() => simulateTyping(element, text, index + 1), 50);
        }
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            chatInput.value = '';

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const botMessageElement = addMessage('', false);
                simulateTyping(botMessageElement, data.response);
            } catch (error) {
                console.error('Error:', error);
                addMessage('抱歉，发生了一个错误：' + error.message, false);
            }
        }
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    addMessage("哈喽，我是朱晗，你也可以叫我Henry。关于我你有什么想问的吗？", false);
});