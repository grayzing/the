# the

## Installation and setup for development

Pull the repo:

```bash
git pull https://github.com/grayzing/the.git
```

### Setup Gemma 4 on Ollama

If you are on a Linux device, you may run this command to install Ollama:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Otherwise, you shall install Ollama on your device according to the instructions:
https://ollama.com/download

Then you must pull Gemma 4 from the Ollama repositories. This will take a while, so be patient!:

```bash
ollama pull gemma4:e4b
```

Then install the requirements for the server,

```bash
cd server
pip install -r requirements.txt
```

### Running the server
If you are not already in the server directory, cd into it.

```bash
cd server
flask --app decider run
```