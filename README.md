# WhatsApp AI Assistant

WhatsApp AI Assistant is a Node.js application that uses WhatsApp Web and various APIs to provide AI-driven responses to messages, handle voice messages, and perform other functions.

## Prerequisites

Before you can run the application, you'll need to obtain API keys for the following services:

- [OpenAI API Key](https://beta.openai.com/signup/): You'll need to sign up for an OpenAI account and get an API key. The application uses OpenAI's GPT-3 model for natural language processing.
- [Picovoice API Key](https://picovoice.ai/): If you intend to use voice message processing, you can sign up for a Picovoice account to obtain the necessary API key.

## Installation

1. Clone this repository to your local machine:

   ```
   git clone https://github.com/your-username/whatsapp-ai-assistant.git

   cd whatsapp-ai-assistant
   ```
   Install the required Node.js dependencies:
   
```npm install```

## Configuration

Rename the a .env-example file to .env in the root directory of the project.

Add your API keys to the .env file as follows:

```
OPENAI_API_KEY=your_openai_api_key
PICOVOICE_API_KEY=your_picovoice_api_key (only if you intend to use voice message feature)
```

## Usage

To start the WhatsApp AI Assistant, run the following command in the root of the project directory:

```npm brr```

The application will generate a QR code for WhatsApp Web authentication. Scan the QR code using your WhatsApp mobile app to authenticate.

## Functionality

The AI Assistant can respond to text messages that begin with a "!". It uses the OpenAI GPT-3 model to generate responses based on the chat history.

Voice messages are supported. When a voice message is received, the assistant will transcribe it and respond only if it begins with "GPT" (requires Picovoice API key).

## Upcomings

+ Interegrate a meme generator *(see [Blimp Projects](https://github.com/ownsupernoob2/Blimp-projects))*

+ Create a image generator using DALL-E or any other image generator

+ ~~Add commands to set your own OPENAI (and other) key (they aren't free)~~

+ ~~Add general commands for example "@help~~

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
