document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginToggle = document.getElementById('login-toggle');
    const signupToggle = document.getElementById('signup-toggle');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    // Age input elements
    const loginAgeInput = document.getElementById('login-age');
    const signupAgeInput = document.getElementById('signup-age');
    
    // Guardian info elements
    const loginGuardianInfo = document.getElementById('login-guardian-info');
    const signupGuardianInfo = document.getElementById('signup-guardian-info');
    
    // Age warning elements
    const loginAgeWarning = document.getElementById('login-age-warning');
    const signupAgeWarning = document.getElementById('signup-age-warning');
    
    // Success message elements
    const loginSuccess = document.getElementById('login-success');
    const signupSuccess = document.getElementById('signup-success');

    // Toggle between login and signup forms
    loginToggle.addEventListener('click', function() {
        switchForm('login');
    });

    signupToggle.addEventListener('click', function() {
        switchForm('signup');
    });

    function switchForm(formType) {
        if (formType === 'login') {
            loginToggle.classList.add('active');
            signupToggle.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        } else {
            signupToggle.classList.add('active');
            loginToggle.classList.remove('active');
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        }
        
        // Reset forms when switching
        resetForms();
    }

    // Age validation for login form
    loginAgeInput.addEventListener('input', function() {
        validateAge(this.value, loginGuardianInfo, loginAgeWarning);
    });

    // Age validation for signup form
    signupAgeInput.addEventListener('input', function() {
        validateAge(this.value, signupGuardianInfo, signupAgeWarning);
    });

    function validateAge(age, guardianElement, warningElement) {
        const ageValue = parseInt(age);
        
        if (isNaN(ageValue)) {
            guardianElement.classList.remove('active');
            warningElement.classList.remove('active');
            return;
        }
        
        if (ageValue < 18) {
            guardianElement.classList.add('active');
            warningElement.classList.add('active');
        } else {
            guardianElement.classList.remove('active');
            warningElement.classList.remove('active');
        }
    }

    // Form submission handlers
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission('login');
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission('signup');
    });

    function handleFormSubmission(formType) {
        const ageInput = formType === 'login' ? loginAgeInput : signupAgeInput;
        const guardianInfo = formType === 'login' ? loginGuardianInfo : signupGuardianInfo;
        const successMessage = formType === 'login' ? loginSuccess : signupSuccess;
        const age = parseInt(ageInput.value);
        
        // Check if guardian info is required but not provided
        if (age < 18) {
            const guardianName = formType === 'login' 
                ? document.getElementById('login-guardian-name').value 
                : document.getElementById('signup-guardian-name').value;
                
            const guardianPhone = formType === 'login' 
                ? document.getElementById('login-guardian-phone').value 
                : document.getElementById('signup-guardian-phone').value;
            
            if (!guardianName || !guardianPhone) {
                alert('Please provide guardian information for users under 18.');
                return;
            }
        }
        
        // Show success message
        successMessage.classList.add('active');
        
        // In a real application, you would send the form data to a server here
        console.log(`${formType} form submitted`);
        
        // Redirect to chatbot after successful login/signup
        setTimeout(() => {
            window.location.href = 'chatbot.html';
        }, 1500);
    }

    function resetForms() {
        // Reset all forms and hide messages
        loginForm.reset();
        signupForm.reset();
        loginGuardianInfo.classList.remove('active');
        signupGuardianInfo.classList.remove('active');
        loginAgeWarning.classList.remove('active');
        signupAgeWarning.classList.remove('active');
        loginSuccess.classList.remove('active');
        signupSuccess.classList.remove('active');
    }

    // Initialize the form (show login by default)
    switchForm('login');
});
// In your existing scripts.js, update the handleFormSubmission function:

function handleFormSubmission(formType) {
    const ageInput = formType === 'login' ? loginAgeInput : signupAgeInput;
    const guardianInfo = formType === 'login' ? loginGuardianInfo : signupGuardianInfo;
    const successMessage = formType === 'login' ? loginSuccess : signupSuccess;
    const age = parseInt(ageInput.value);
    
    // Check if guardian info is required but not provided
    if (age < 18) {
        const guardianName = formType === 'login' 
            ? document.getElementById('login-guardian-name').value 
            : document.getElementById('signup-guardian-name').value;
            
        const guardianPhone = formType === 'login' 
            ? document.getElementById('login-guardian-phone').value 
            : document.getElementById('signup-guardian-phone').value;
        
        if (!guardianName || !guardianPhone) {
            alert('Please provide guardian information for users under 18.');
            return;
        }
    }
    
    // Store user age in localStorage for the chatbot to use
    localStorage.setItem('userAge', age);
    
    // Show success message
    successMessage.classList.add('active');
    
    // In a real application, you would send the form data to a server here
    console.log(`${formType} form submitted`);
    console.log(`User age: ${age}`);
    
    // Redirect to chatbot after successful login/signup
    setTimeout(() => {
        window.location.href = 'chatbot.html';
    }, 1500);
}