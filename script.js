class WebsiteManager {
    constructor() {
        this.formData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
    }

    setupEventListeners() {
        // Form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Copy button
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToClipboard());
        }

        // Share buttons
        this.setupShareButtons();

        // Logo click
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', () => this.showPage('home'));
        }
    }

    initializeAnimations() {
        // Fade in elements on load
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                }
            });
        });

        document.querySelectorAll('.feature').forEach(feature => {
            feature.classList.add('loading');
            observer.observe(feature);
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update URL without reload
        history.pushState({ page: pageId }, '', `#${pageId}`);
    }

    handleFormSubmit(e) {
        e.preventDefault();

        // Clear previous errors
        this.clearErrors();

        // Get form data
        const formData = this.getFormData();

        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }

        // Store form data
        this.formData = formData;

        // Generate formatted text
        this.generateFormattedText();

        // Show actions
        this.showActions();

        // Smooth scroll to actions
        document.getElementById('actions').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    getFormData() {
        return {
            nom: document.getElementById('nom').value.trim(),
            prenom: document.getElementById('prenom').value.trim(),
            email: document.getElementById('email').value.trim(),
            telephone: document.getElementById('telephone').value.trim(),
            sujet: document.getElementById('sujet').value.trim(),
            message: document.getElementById('message').value.trim()
        };
    }

    validateForm(data) {
        let hasErrors = false;

        // Required fields validation
        const requiredFields = [
            { field: 'nom', message: 'Le nom est requis' },
            { field: 'prenom', message: 'Le prénom est requis' },
            { field: 'email', message: 'L\'email est requis' },
            { field: 'sujet', message: 'Le sujet est requis' },
            { field: 'message', message: 'Le message est requis' }
        ];

        requiredFields.forEach(({ field, message }) => {
            if (!data[field]) {
                this.showError(`${field}Error`, message);
                hasErrors = true;
            }
        });

        // Email validation
        if (data.email && !this.isValidEmail(data.email)) {
            this.showError('emailError', 'L\'email n\'est pas valide');
            hasErrors = true;
        }

        // Phone validation (if provided)
        if (data.telephone && !this.isValidPhone(data.telephone)) {
            this.showError('telephoneError', 'Le numéro de téléphone n\'est pas valide');
            hasErrors = true;
        }

        // Message length validation
        if (data.message && data.message.length < 10) {
            this.showError('messageError', 'Le message doit contenir au moins 10 caractères');
            hasErrors = true;
        }

        return !hasErrors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Accepte tous les numéros avec au moins 8 chiffres (après suppression des espaces, tirets, points, parenthèses)
        const cleanPhone = phone.replace(/[\s\-\.\(\)\+]/g, '');
        return cleanPhone.length >= 8 && /^\d+$/.test(cleanPhone);
    }

    clearErrors() {
        document.querySelectorAll('.error').forEach(element => {
            element.textContent = '';
            element.classList.remove('show');
        });
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    generateFormattedText() {
        const text = `📋 NOUVEAU MESSAGE DE CONTACT

👤 Nom: ${this.formData.nom}
👤 Prénom: ${this.formData.prenom}
📧 Email: ${this.formData.email}
📞 Téléphone: ${this.formData.telephone || 'Non renseigné'}
📝 Sujet: ${this.formData.sujet}

💬 Message:
${this.formData.message}

---
Message envoyé depuis le formulaire de contact
Date: ${new Date().toLocaleString('fr-FR')}`;

        const previewBox = document.getElementById('previewBox');
        if (previewBox) {
            previewBox.textContent = text;
        }

        return text;
    }

    showActions() {
        const actions = document.getElementById('actions');
        if (actions) {
            actions.classList.add('show');
        }
    }

    async copyToClipboard() {
        const text = this.generateFormattedText();
        const copyBtn = document.getElementById('copyBtn');

        if (!copyBtn) return;

        const originalText = copyBtn.textContent;

        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess(copyBtn, originalText);
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
            this.showCopySuccess(copyBtn, originalText);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }

        document.body.removeChild(textArea);
    }

    showCopySuccess(button, originalText) {
        button.textContent = '✅ Copié !';
        button.classList.add('copied');

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }

    setupShareButtons() {
        // WhatsApp - Numéro spécifique
        const whatsappBtn = document.getElementById('whatsappBtn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const text = this.generateFormattedText();
                const url = `https://wa.me/22770435156?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
            });
        }

        // Telegram
        const telegramBtn = document.getElementById('telegramBtn');
        if (telegramBtn) {
            telegramBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const text = this.generateFormattedText();
                const url = `https://t.me/share/url?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
            });
        }

        // Email
        const emailBtn = document.getElementById('emailBtn');
        if (emailBtn) {
            emailBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const subject = `Contact: ${this.formData.sujet}`;
                const body = this.generateFormattedText();
                const url = `mailto:abdoulmk2006@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = url;
            });
        }
    }
}

// Global functions for compatibility
function showPage(pageId) {
    websiteManager.showPage(pageId);
    // Close mobile menu when navigating
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.remove('mobile-active');
    }
}

function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('mobile-active');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.websiteManager = new WebsiteManager();

    // Handle back/forward navigation
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.page) {
            websiteManager.showPage(e.state.page);
        }
    });

    // Handle initial page load with hash
    if (window.location.hash) {
        const pageId = window.location.hash.substring(1);
        websiteManager.showPage(pageId);
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Performance optimization: lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});