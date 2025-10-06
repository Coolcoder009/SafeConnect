// document.addEventListener('DOMContentLoaded', function() {
//     // DOM Elements
//     const chatMessages = document.getElementById('chat-messages');
//     const messageInput = document.getElementById('message-input');
//     const sendBtn = document.getElementById('send-btn');
//     const voiceBtn = document.getElementById('voice-btn');
//     const typingIndicator = document.getElementById('typing-indicator');
//     const logoutBtn = document.getElementById('logout-btn');

//     // Speech Recognition Setup
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     let recognition;
    
//     if (SpeechRecognition) {
//         recognition = new SpeechRecognition();
//         recognition.continuous = false;
//         recognition.interimResults = false;
//         recognition.lang = 'en-US';

//         recognition.onstart = function() {
//             voiceBtn.classList.add('listening');
//             messageInput.placeholder = "Listening...";
//         };

//         recognition.onresult = function(event) {
//             const transcript = event.results[0][0].transcript;
//             messageInput.value = transcript;
//             voiceBtn.classList.remove('listening');
//             messageInput.placeholder = "Type your message...";
//         };

//         recognition.onerror = function(event) {
//             console.error('Speech recognition error', event.error);
//             voiceBtn.classList.remove('listening');
//             messageInput.placeholder = "Type your message...";
//             addMessage('Sorry, I didn\'t catch that. Please try again.', 'user');
//         };

//         recognition.onend = function() {
//             voiceBtn.classList.remove('listening');
//             messageInput.placeholder = "Type your message...";
//         };
//     } else {
//         voiceBtn.style.display = 'none';
//         console.log('Speech recognition not supported in this browser');
//     }

//     // Event Listeners
//     sendBtn.addEventListener('click', sendMessage);
//     messageInput.addEventListener('keypress', function(e) {
//         if (e.key === 'Enter') {
//             sendMessage();
//         }
//     });

//     voiceBtn.addEventListener('click', function() {
//         if (recognition) {
//             if (voiceBtn.classList.contains('listening')) {
//                 recognition.stop();
//             } else {
//                 recognition.start();
//             }
//         }
//     });

//     logoutBtn.addEventListener('click', function() {
//         if (confirm('Are you sure you want to logout?')) {
//             window.location.href = 'index.html';
//         }
//     });

//     // Bot responses
//     const botResponses = [
//         "I'm an AI assistant designed to help with your questions!",
//         "That's an interesting point. Could you tell me more?",
//         "I understand what you're saying. Let me think about that...",
//         "I'm here to assist you with any information you need!",
//         "That's a great question! Let me provide some information about that.",
//         "I'm constantly learning to better assist users like you!",
//         "Thanks for sharing that with me. Is there anything else I can help with?",
//         "I appreciate your message. How can I assist you further?",
//         "I'm designed to provide helpful and accurate information.",
//         "Let me know if you need help with anything specific!"
//     ];

//     const greetingResponses = [
//         "Hello! How can I assist you today?",
//         "Hi there! What can I help you with?",
//         "Greetings! I'm here to answer your questions.",
//         "Welcome! How may I be of service?"
//     ];

//     const questionResponses = [
//         "I'd be happy to help with that!",
//         "That's a good question. Let me explain...",
//         "I can provide information about that topic.",
//         "Let me share some insights on that subject."
//     ];

//     // Function to send message
//     function sendMessage() {
//         const message = messageInput.value.trim();
//         if (message === '') return;

//         // Add user message
//         addMessage(message, 'user');
//         messageInput.value = '';

//         // Show typing indicator
//         typingIndicator.classList.add('active');
        
//         // Simulate bot thinking
//         setTimeout(() => {
//             typingIndicator.classList.remove('active');
//             const botResponse = generateBotResponse(message);
//             addMessage(botResponse, 'bot');
            
//             // Scroll to bottom
//             chatMessages.scrollTop = chatMessages.scrollHeight;
//         }, 1500);
//     }

//     // Function to add message to chat
//     function addMessage(text, sender) {
//         const messageDiv = document.createElement('div');
//         messageDiv.classList.add('message', `${sender}-message`);
//         messageDiv.textContent = text;
//         chatMessages.appendChild(messageDiv);
        
//         // Scroll to bottom
//         chatMessages.scrollTop = chatMessages.scrollHeight;
//     }

//     // Function to generate bot response
//     function generateBotResponse(userMessage) {
//         const lowerMessage = userMessage.toLowerCase();
        
//         // Greetings
//         if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
//             return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
//         }
        
//         // Questions
//         if (lowerMessage.includes('?') || lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why')) {
//             return questionResponses[Math.floor(Math.random() * questionResponses.length)];
//         }
        
//         // Default response
//         return botResponses[Math.floor(Math.random() * botResponses.length)];
//     }

//     // Auto-focus on message input
//     messageInput.focus();
// });

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const logoutBtn = document.getElementById('logout-btn');

    // Chat history to maintain context (last 3 messages)
    let chatHistory = [];
    let userAge = null; // This should be set from login/signup

    // Get user age from localStorage (set during login/signup)
    function getUserAge() {
        return localStorage.getItem('userAge') || 25; // Default to 25 if not set
    }

    // Speech Recognition Setup (keep your existing code)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            voiceBtn.classList.add('listening');
            messageInput.placeholder = "Listening...";
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            voiceBtn.classList.remove('listening');
            messageInput.placeholder = "Type your message...";
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            voiceBtn.classList.remove('listening');
            messageInput.placeholder = "Type your message...";
            addMessage('Sorry, I didn\'t catch that. Please try again.', 'user');
        };

        recognition.onend = function() {
            voiceBtn.classList.remove('listening');
            messageInput.placeholder = "Type your message...";
        };
    } else {
        voiceBtn.style.display = 'none';
        console.log('Speech recognition not supported in this browser');
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    voiceBtn.addEventListener('click', function() {
        if (recognition) {
            if (voiceBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        }
    });

    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear chat history and redirect
            chatHistory = [];
            localStorage.removeItem('userAge');
            window.location.href = 'index.html';
        }
    });

    // Function to send message to FastAPI backend
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '') return;

        // Add user message to UI
        addMessage(message, 'user');
        
        // Add to chat history (keep only last 2 messages + current = 3 total)
        chatHistory.push(message);
        if (chatHistory.length > 3) {
            chatHistory = chatHistory.slice(-3); // Keep only last 3 messages
        }

        messageInput.value = '';
        
        // Show typing indicator
        typingIndicator.classList.add('active');
        
        try {
            // Call FastAPI backend
            const response = await callMentalHealthAPI(message);
            
            typingIndicator.classList.remove('active');
            
            // Add bot response to UI
            addMessage(response.response_message, 'bot');
            
            // Show risk level indicator if there's a risk
            if (response.risk_level > 0) {
                showRiskIndicator(response);
            }
            
        } catch (error) {
            typingIndicator.classList.remove('active');
            console.error('API Error:', error);
            addMessage('I apologize, but I\'m having trouble processing your message right now. Please try again.', 'bot');
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to call FastAPI backend
    async function callMentalHealthAPI(currentMessage) {
        const userAge = getUserAge();
        
        // Prepare messages array (last 2 previous messages + current message)
        const messagesToSend = [...chatHistory]; // This includes the current message already
        
        const requestBody = {
            messages: messagesToSend,
            age: parseInt(userAge)
        };

        console.log('Sending to API:', requestBody);

        const response = await fetch('http://localhost:8000/api/response/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    }

    // Function to add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to show risk indicator
    function showRiskIndicator(response) {
        const riskIndicator = document.createElement('div');
        riskIndicator.classList.add('risk-indicator');
        
        let riskLevel = '';
        let color = '';
        
        switch(response.risk_level) {
            case 1:
                riskLevel = 'Low Risk';
                color = '#ffa726';
                break;
            case 2:
                riskLevel = 'Medium Risk';
                color = '#ef5350';
                break;
            case 3:
                riskLevel = 'High Risk';
                color = '#d32f2f';
                break;
            default:
                riskLevel = 'Risk Detected';
                color = '#ffa726';
        }
        
        riskIndicator.innerHTML = `
            <div style="background: ${color}; color: white; padding: 8px 12px; border-radius: 15px; font-size: 12px; margin: 5px 0;">
                <i class="fas fa-exclamation-triangle"></i> ${riskLevel} - ${response.action_taken}
            </div>
        `;
        
        chatMessages.appendChild(riskIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Auto-focus on message input
    messageInput.focus();
});