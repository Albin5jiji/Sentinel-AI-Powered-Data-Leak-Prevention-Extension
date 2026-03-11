# AI-Powered Sensitive Data Detector (Chrome Extension)

A Chrome extension that detects sensitive information in real time while users type or interact with webpages.  
It helps prevent accidental exposure of confidential data such as emails, phone numbers, credit card numbers, and API keys.

---

## Overview

Sensitive information is often accidentally typed into forms, chat boxes, or websites where it should not be shared.

This extension monitors user input fields and webpage content to identify potentially sensitive data using a combination of **pattern detection (regex)** and **Hybrid detection engine using regex matching, entropy analysis, and machine-learning feature scoring.**.

When sensitive information is detected, the extension:

- Highlights the input field
- Displays warnings
- Blocks interaction for high-risk data
- Records analytics of detections

This mimics the behavior of a **basic Data Loss Prevention (DLP) security tool** used in enterprise environments.

---

## Features

- Real-time monitoring of input fields and editable content
- Detection of sensitive data patterns
- Feature-based ML confidence scoring
- Visual highlighting of sensitive inputs
- Warning alerts for medium-risk data
- Blocking modal for highly sensitive information
- Page-wide scanning for exposed secrets
- Detection analytics dashboard in extension popup

---

## Detected Data Types

The extension detects several categories of sensitive data including:

- Email addresses
- Credit card numbers
- Phone numbers
- Aadhaar numbers
- US Social Security Numbers
- AWS API keys
- JWT authentication tokens
- OpenAI API keys

---

## How It Works

1. The extension injects a **content script** into webpages.
2. User input is monitored in real time.
3. Text is analyzed using:
   - Regex-based pattern detection
   - Feature-based ML scoring
4. A confidence score is calculated.
5. Based on the score:
   - Low risk → ignored
   - Medium risk → warning + highlight
   - High risk → blocking modal
6. Detection statistics are stored and shown in the popup dashboard.

---

## Installation

1. Clone the repository
<<<<<<< HEAD
2. git clone https://github.com/Albin5jiji/sensitive-data-detector.git
3. Open Chrome

4. Go to
chrome://extensions
5. Enable **Developer Mode**
=======
   git clone https://github.com/YOUR-USERNAME/sensitive-data-detector.git
2. Open Chrome

3. Go to
   chrome://extensions
4. Enable **Developer Mode**
>>>>>>> 7a0854a (Added entropy-based secret detection and improved ML scoring)

6. Click **Load Unpacked**

7. Select the project folder

---

## Technologies Used

- JavaScript
- Chrome Extension API
- Regex pattern detection
- Feature-based machine learning scoring
- Browser DOM event monitoring

---

## Example Use Cases

- Prevent accidental sharing of API keys
- Detect credit card numbers typed into insecure forms
- Warn users when personal information is entered on unknown websites
- Demonstrate basic Data Loss Prevention concepts

---

## Future Improvements

- Integration with a trained ML model
- NLP-based sensitive data classification
- Enterprise security dashboard
- Cloud-based monitoring and reporting

---

## License

This project is intended for educational and demonstration purposes.
