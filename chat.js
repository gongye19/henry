// chat.js
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.chat-send-btn');

    function addMessage(content, isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
        messageElement.textContent = content;
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
            console.log("Sending message:", message);
            addMessage(message, true);
            chatInput.value = '';

            try {
                console.log("Sending API request");
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message }),
                });

                console.log("API response status:", response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("API response data:", data);
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

    // 添加初始问候语
    addMessage("你好！我是朱晗，也可以叫我Henry。很高兴认识你！有什么我可以帮助你的吗？", false);
});