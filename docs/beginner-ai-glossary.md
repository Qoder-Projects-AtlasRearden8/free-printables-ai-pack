---
title: "Beginner AI Glossary"
shortTitle: "AI glossary"
number: "02"
group: "ai"
category: "Plain-English reference"
subtitle: "The words, minus the fog."
description: "Forty-two AI terms explained like a patient friend would: no prerequisites, no jargon chains, and a plain-English example for the words that matter."
coverLine: "A pocket reference for the AI conversation you keep finding yourself in — without pretending you already speak the language."
inside:
  - "A model is not a brain"
  - "The words inside a chat window"
  - "Agents, tools, and local AI"
  - "Privacy, safety, and trust"
  - "How to decode a sales pitch"
nextAction: "Choose five terms you could not have explained this morning, then explain them out loud without using jargon. That is the real test."
accent: "#607e5d"
---

<!-- page -->

# Start with the big picture

AI is an umbrella term, not one product. Most of the tools in today’s headlines are pattern machines: they learn from huge collections of examples, then produce a likely answer. That can be genuinely useful. It can also be wrong with a straight face.

## A model is not a brain

> [!NOTE] The most useful mental model
> A language model is closer to an extremely well-read autocomplete than to a person with intentions. It predicts likely words, sounds, and patterns from what it has seen. It does not understand consequences the way you do.

## The four-step story

1. **Collect examples.** Training data is gathered and prepared — text, images, audio, code, or records.
2. **Find patterns.** Training changes millions or billions of internal numbers called parameters.
3. **Save the pattern.** The result is a model: a learned system that can make predictions.
4. **Use the pattern.** When you type a prompt, inference produces an output. The model is being used, not newly educated.

## The foundational words

:::term-grid
### Artificial intelligence (AI)
Computer systems built to do tasks that usually require human judgment, like recognizing an image or drafting text. AI is a broad label, not one thing.

### Algorithm
A defined set of steps for solving a problem. A recipe is a useful analogy. AI algorithms can adjust from examples, but they are still procedures.

### Machine learning
A way of building software where a system learns patterns from examples instead of following only hand-written rules.

### Model
The learned pattern-matcher saved after training. In everyday use, “the model” is the part of a tool that turns your input into a prediction.

### Generative AI
AI that creates new text, images, audio, video, or code by predicting patterns from earlier examples. New output is not automatically original or accurate.

### Training data
The examples used to teach a model. Quality, gaps, and bias in this data shape what the model can do and where it fails.

### Inference
The moment a trained model produces an answer. In a normal chat, inference is use — not permanent learning.

### Parameters
The internal numerical settings adjusted during training. More parameters can add capability, but bigger does not automatically mean better.

### Chatbot
A conversational interface for a model. It can feel like a person while remaining software that predicts a likely response.
:::

<!-- page -->

# The words inside a chat window

When someone says “the model has a two-million-token context window,” this is the vocabulary they are using. You do not need to memorize it. You need enough to ask a good follow-up question.

:::term-grid
### Large language model (LLM)
A model trained on large amounts of text to predict what comes next. That simple objective supports drafting, summarizing, explaining, and translating — with mistakes.

### Token
A chunk of text, roughly part of a word, that a model processes. Tokens drive context limits, speed, and sometimes the price of an API.

### Context window
The amount of text and conversation a model can consider at one time. When it fills up, older material may be dropped or compressed. Think working memory, not a permanent file.

### Prompt
The instructions, examples, and context you give the model. A prompt is a request with boundaries, not a magic spell.

### System prompt
Instructions set by the app or developer that sit above your message. You usually cannot see or change them, and they can govern tone, rules, and tools.

### Temperature
A setting that influences randomness. Lower values tend to be more predictable; higher values can be more varied. It has nothing to do with emotion.

### Hallucination
A confident-sounding output that is fabricated or wrong. The model is not lying on purpose; it is generating something plausible. Verify names, numbers, quotes, and links.

### Knowledge cutoff
The point after which a model’s training data roughly stops. Without browsing or live data, it may not know recent events or changed rules.

### Fine-tuning
Extra training on examples to shape behavior or style. It is not a reliable database, and specialization does not guarantee accuracy.

### Retrieval-augmented generation (RAG)
The tool finds relevant documents first, then gives them to the model as context. Useful for grounding — but the model can still misread or misuse the source.

### Embedding
A numerical representation of meaning. Embeddings help software find text or images that are conceptually similar, powering search and RAG.

### Multimodal
Able to work with more than one kind of input or output — text, images, audio, and so on. Check which modes a specific tool actually supports.
:::

> [!TIP] What “memory” usually means
> A chat window may remember the current conversation. A product may also store details across chats as a memory feature. Neither is the same as the underlying model permanently learning from you during a normal conversation.

<!-- page -->

# When AI gets tools

A chat model can only produce tokens. An AI product can do much more when it is connected to search, files, calendars, code, or payment systems. The vocabulary here is mostly about permission.

:::term-grid
### Agent
An AI system given a goal, tools, and permission to take multiple steps — not just answer once. More autonomy means more chances for costly or harmful actions, so check what it can access.

### Tool use
When a model can call something outside itself, such as a calculator, search, or calendar. Without a connected tool, it is generating an answer, not checking one.

### Function calling
A structured way for a model to request a specific tool action with specific arguments. It helps software connect the model to real operations.

### Model Context Protocol (MCP)
An open standard for connecting AI applications to data and tools through a common interface. Think shared adapter, not automatic safety. Each connection still needs review.

### API
Application Programming Interface: a way for one piece of software to talk to another. APIs let builders put models inside their own apps and workflows.

### Workflow automation
Using software to run a series of steps without manual effort. Automation may use rules, AI, or both; every automatic step deserves a stop button and a way to check results.

### Local AI
Running a model on your own device rather than sending requests to a cloud service. It can improve privacy and offline access, but hardware, speed, and quality are limited.

### Open weights
A model whose trained parameters can be downloaded and run. “Open weights” does not necessarily mean the training data, code, or license is open — or that the model is unrestricted.

### Quantization
A technique for compressing a model to use less memory and run on smaller hardware. It can reduce quality, so compare outputs rather than assuming parity.

### VRAM
Memory on a graphics card (GPU). Local models need it to run smoothly; too little can mean slower work or a model that will not fit.
:::

> [!WARNING] The more access, the more verification
> An agent that can read your email, change files, or spend money is a different risk from a chat box that can only talk. Start with read-only access, limit the tools, and put a human in front of irreversible actions.

<!-- page -->

# Privacy, safety, and trust

This is not the scary chapter. It is the practical one. You do not need to become a security researcher; you need to know which words describe which risks, and where to look.

:::term-grid
### Personally identifiable information (PII)
Data that can identify a person directly or in combination: names, addresses, ID numbers, contact details, and sometimes seemingly ordinary details.

### Data retention
How long a service stores your chats, files, or account data. Deleting a conversation may not immediately remove copies from backups or logs.

### Training opt-out
A setting that stops a service from using your content to improve its models, where offered. It usually does not erase past history; check deletion separately.

### Prompt injection
Hidden instructions in content — a web page, document, or email — that try to override what the user or developer intended. It matters most when an AI can browse, open files, or take actions.

### Guardrail
A product rule or filter meant to prevent certain harmful outputs or actions. Guardrails reduce risk; they do not eliminate it.

### Alignment
The broad effort to make AI systems behave in line with human intentions and values. It is an unsolved research and product problem, not a finished feature.

### Jailbreak
A prompt or trick that gets around a model’s safeguards. Treat a jailbroken answer as evidence of a flaw, not as permission or reliable truth.

### Deepfake
Synthetic audio, images, or video made to look like a real person or event. Public images and voice recordings can become raw material for deception.

### Watermark
A visible or hidden signal suggesting content was made by AI. Watermarks can be removed, missed, or faked, so treat them as clues rather than proof.

### Benchmark
A standardized test used to compare AI systems. Scores can help, but they may not reflect your real task, and benchmarks can be gamed or saturated.

### AI slop
Low-effort synthetic content produced at scale. It can crowd search results, marketplaces, and social feeds, making source quality harder to judge.
:::

> [!NOTE] “Safety” is a claim to inspect
> Ask which harms a product is protecting against, what its testing actually measured, and what a human can review. “Built-in safety” is not a synonym for “safe in every situation.”

<!-- page -->

# Decode the sales pitch

The AI label tells you almost nothing about whether a product is useful, private, or honest. These translations can help you ask better questions than “Is it AI?”

| You’ll hear | What it might actually mean |
| --- | --- |
| “AI-powered” | Some part uses machine learning or automation. Ask what it does that a simpler tool could not do, and what happens when it is wrong. |
| “Private and secure” | Not a technical guarantee. Look for retention terms, training controls, encryption, and who can access your content. |
| “Open source” | Check the license, weights, code, and data separately. Open weights alone do not make the whole product open source. |
| “Agentic” | It can take actions through tools. Find out which actions, with what permissions, and whether a human approves them. |
| “Reasoning model” | Designed for more deliberate processing. It can still be wrong, and may be slower or more expensive. |
| “Personalized” | Uses your history, memory, or data to shape results. Find out what is stored and how to clear it. |
| “Hallucination-free” | A marketing claim, not a guarantee. No current system is error-free, especially on facts, numbers, and citations. |

## Three questions for any AI claim

1. **What does it do on a normal Tuesday?** Ask for a specific task, not a polished demo.
2. **What data does it need — and keep?** Include everything you would be revealing in the input.
3. **How would I catch it being wrong?** If there is no way to check, the workflow is too fragile.

```prompt Learn any new AI term
I’m a beginner learning about AI. Explain [term] in plain English with: one analogy, one real-world example, one way it can fail, and one related term I should know. Define any jargon you use. If the definition depends on a specific product, say so.
```

> [!TIP] Fluency is not the goal
> You do not need to sound impressive. You need to understand enough to decide when a tool is useful, when it is guessing, and when the answer needs a human with actual responsibility.

