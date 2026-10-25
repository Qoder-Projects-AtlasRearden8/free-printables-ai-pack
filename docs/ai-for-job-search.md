---
title: "AI for Job Search"
shortTitle: "Job search workbook"
number: "04"
group: "ai"
category: "Practical workbook"
subtitle: "Less scrolling. More signal."
description: "A fill-in workbook for using AI to decode job posts, tailor a truthful resume, write human outreach, rehearse interviews, and spot scams — without handing over your future to a chatbot."
coverLine: "AI can help you organize the search, sharpen the words, and rehearse the conversation. It cannot know your worth, invent your evidence, or guarantee a job."
inside:
  - "A truthful, low-chaos workflow"
  - "Your evidence bank worksheet"
  - "Job-post decoding prompts"
  - "Resume, outreach, and interview pages"
  - "A seven-day sprint and scam check"
nextAction: "Fill in your target role and three proof points before you prompt anything. The AI can help you shape true evidence; it cannot supply it for you."
accent: "#4e6c80"
---

<!-- page -->

# Start before you open a chatbot

A job search gets easier when you separate the work into three lanes. AI is useful in all three — as long as the facts come from you and the final decision stays with a human.

:::grid-3
### Organize
Pick a target, collect job posts, inventory real evidence, and keep a tracker. This is where AI saves the most time.

### Draft
Turn facts into a clearer resume bullet, application, or message. You edit until it sounds like a person you would hire.

### Rehearse
Practice interview answers, find vague spots, and prepare questions. Feedback is a mirror, not a verdict.
:::

## The honesty rule

> [!WARNING] Never let AI invent your experience
> No fake credentials, no invented metrics, no “confident” claims you cannot defend in an interview. AI should help you say true things more clearly. A polished lie is still a liability.

## Your twenty-minute setup

- [ ] **Choose one or two target roles.** “Any job in healthcare” is not a target; “RN care coordinator” is.
- [ ] **Collect three current job posts.** Use official employer sites or reputable listings.
- [ ] **List five real wins.** Projects, problems you solved, people you helped, systems you improved. Numbers help only if they are true.
- [ ] **Open your current resume.** Keep one master version as your source of truth.
- [ ] **Remove sensitive details** from anything you plan to paste: government IDs, account numbers, patient or client information, and confidential employer material.
- [ ] **Set a timer.** Twenty minutes of setup is worth more than two hours of prompt roulette.

> [!TIP] A useful sentence to remember
> “Use only the facts I give you. If evidence is missing, ask me for it instead of filling the gap.” Add this to almost every job-search prompt.

<!-- page -->

# Know what you’re selling

Before the AI can tailor anything, it needs the truth about you. Fill this in with facts you could comfortably explain to a hiring manager. Keep notes; this page becomes your evidence bank.

## My target

| Target role | Why this work matters to me | One thing I want to learn next |
| --- | --- | --- |
|  |  |  |
|  |  |  |

## Evidence I can defend

Focus on what you did, the skill it shows, and the result or lesson. Team wins count — name your real part.

| What I did | Skill it shows | Result, proof, or what changed |
| --- | --- | --- |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |

## My through-line

In two or three sentences, connect where you have been to the role you want. Do not make it sound like a LinkedIn parable. Just tell the honest bridge.

:::lines 3
:::

> [!NOTE] You are allowed to be a career changer
> Your nursing judgment, classroom management, caregiving, military service, or years at a front desk are not “background.” They are evidence of skills. The work is translating them accurately, not erasing them.

<!-- page -->

# Decode before you rewrite

A job post is a wish list written by a committee. Read it for the real work, the must-haves, and the gaps — before you let a tool rewrite your resume around it.

```prompt Decode the job post
Here is a job posting: [paste].

Summarize in plain English:
1. The actual daily work.
2. Requirements that seem truly essential versus nice-to-have.
3. Any signs of an unrealistic wish list.
4. Three good questions to ask an interviewer.

Use only the posting. Make it clear when you are inferring something.
```

```prompt Fit check, without flattery
Compare these two:

1. Job post: [paste]
2. My evidence bank: [paste]

Make a three-column table: requirement / evidence I already have / gap. Quote only my words. If the evidence is weak or missing, say so plainly. Do not invent experience, translate a gap into a strength, or call me a perfect fit.
```

## Read the gap, don’t hide it

- **Same skill, different words:** “Client communication” and “patient education” may be a real translation. Make the connection explicit and honest.
- **Partial experience:** Say what scope you actually handled. “Supported” and “led” are not interchangeable.
- **A true gap:** Name it, then make a plan. A short course, small project, volunteer task, informational conversation, or portfolio sample is stronger than a fictional bullet.
- **A wish-list mismatch:** If you meet most core requirements and the work excites you, applying may still be reasonable. A tool cannot decide your risk tolerance.

> [!TIP] Job descriptions are not grade sheets
> Employers routinely ask for more than they will find. Use the post to aim your language, not to reject yourself on their behalf. Let the human with the budget make the first no.

<!-- page -->

# Tailor without stretching the truth

Good tailoring makes a real match easier to see. It does not create one. Use these prompts to find the clearest honest phrasing — then keep every fact in place.

```prompt Find the honest keyword matches
Using only this job post and my resume, list the words and phrases the employer repeats. Show where each appears in my resume, if at all. Then suggest three places where a truthful rewrite could make a match clearer. Show before and after. Do not add skills, tools, dates, titles, or results.
```

```prompt Sharpen these resume bullets
Rewrite the three resume bullets below so each leads with the outcome, uses concrete verbs, and reflects the job’s language where accurate.

Keep every fact. Do not inflate titles, team size, scope, or numbers. If a bullet lacks evidence, ask me for the missing detail instead of inventing it.

Bullets: [paste]
```

## The sixty-second truth check

- [ ] **Explainability:** Could I explain every phrase in an interview without backpedaling?
- [ ] **Proof:** Can I point to where each number and result came from?
- [ ] **Continuity:** Did I preserve real dates, titles, tools, and team roles?
- [ ] **Fairness:** Would a former coworker recognize this as a fair description of my part?
- [ ] **Confidentiality:** Did I remove client names, proprietary details, patient information, and internal metrics I am not allowed to share?
- [ ] **Voice:** Does it still sound like me, or like a paint-by-numbers “results-driven professional”?

## Keep one master resume

Your master resume can be long and detailed. It is your private source of truth: every role, project, number, tool, and short story. Tailored resumes are cut from it, not conjured from a chat window. When the AI asks for missing evidence, look it up rather than letting it guess.

> [!NOTE] Keywords are not a personality
> Matching the employer’s language can help a human see your fit. Stuffing every phrase into white text or turning the page into a buzzword swamp does not. Write for the person who has to understand it, plus whatever legitimate application system is in the path.

<!-- page -->

# Write like a person

The best job messages are specific enough that the reader believes you looked. AI can help with structure and pace; you supply the real reason, the verified detail, and the warmth.

```prompt The cover letter
Help me draft a 180–220 word cover letter for [role] at [organization].

Use only the facts I provide:
- Three relevant proof points: [paste]
- Why this work matters to me: [paste]
- One specific detail from the organization’s public work or posting: [paste]

Structure: a specific opening, two short evidence paragraphs, and a warm close. Don’t invent enthusiasm, achievements, or a personal connection. Match my voice: [plain / warm / formal].
```

:::grid-2
```prompt The recruiter message
Write a 75-word email to [name] about [role]. Mention one verified detail about the team’s work, one sentence on my relevant evidence, and a low-pressure ask. No empty flattery, no invented connection, and no “I hope this email finds you well.”
```

```prompt The follow-up
Draft a follow-up [number] days after my [interview / application] on [date]. Reference one concrete point from our conversation: [detail]. Keep it under 90 words, warm and confident. Don’t invent a deadline or pressure them for a decision.
```
:::

## Before you send

- [ ] Fill every bracket. A leftover `[organization]` is a tiny confession.
- [ ] Verify the organization detail against an official source.
- [ ] Check names, titles, and spelling.
- [ ] Remove claims you could not defend or prove.
- [ ] Read it aloud. If it sounds like a brochure, cut.
- [ ] Add one sentence only you could write.

> [!WARNING] Volume is not a strategy
> AI makes it easy to send a hundred forgettable applications. The reader can usually tell. A smaller number of specific, honest applications is kinder to your time and your reputation. Do not automate a process that relies on trust.

<!-- page -->

# Interview practice that actually helps

A mock interview is useful when it pushes for specifics. A generic bot that says “great answer!” is a mirror with no reflection. These prompts ask for evidence, structure, and one clear next step.

## Build two stories you can reuse

Use real situations. A story about a small, ordinary task often reveals more than a grand one you barely remember.

| Story | Situation and task | Action I took | Result or lesson |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |

```prompt A demanding mock interview
Act as a respectful hiring manager for [role] at [industry or type of organization]. Ask me one behavioral question at a time. Wait for my answer, then rate it 1–5 on specificity, structure, and relevance. Ask one follow-up that would expose missing evidence. After five questions, name two strong themes in my answers and two answers I should rebuild. Do not invent facts for me.
```

```prompt Find the vague parts
For my answer below, identify where I was vague, where I took credit for team work, and what result I left unstated. Ask me one question per gap. Then help me rewrite only with details I confirm.

My answer: [paste]
```

## Questions worth having in your head

“Tell me about a conflict.” “Tell me about a failure.” “Tell me about a time you influenced without authority.” “How do you prioritize?” “Why this role, and why now?”

> [!NOTE] The AI interviewer is not the labor market
> It does not know the company’s culture, the interviewer’s priorities, or whether the job is still funded. Use it to make your examples sharper and your thinking clearer. Verify salary, schedule, and role expectations with the employer and current public sources.

<!-- page -->

# Your seven-day search sprint

Seven small moves, not seven perfect days. Aim for twenty to thirty minutes, take the low-energy option when you need it, and count honest progress rather than applications sprayed into the void.

## The week

- [ ] **Day 1 — Choose a direction.** Pick one or two target roles and fill in your evidence bank.
- [ ] **Day 2 — Read the market.** Decode three postings. Circle repeated skills; note the gaps that show up more than once.
- [ ] **Day 3 — Refresh the source.** Update your master resume with missing facts and clean up one outdated section.
- [ ] **Day 4 — Make one strong application.** Tailor a resume, draft the message, and have a human or a careful AI review for truth.
- [ ] **Day 5 — Rehearse.** Build two STAR stories and run five mock questions.
- [ ] **Day 6 — Verify and connect.** Research two organizations through official sources; send one specific question or follow-up.
- [ ] **Day 7 — Review.** Update the tracker, capture one lesson, and choose next week’s three priorities. Rest is part of the plan.

## Application tracker

| Date | Organization and role | Contact or source | Status | Next step and date |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

> [!TIP] The low-energy version
> Day 1: open the evidence bank and write one win. Day 3: update one bullet. Day 5: practice one answer. A job search is not a personality test. Small, repeatable contact with the work beats waiting until you feel impressive.

<!-- page -->

# Spot the scam, protect your search

AI can help you write and rehearse. It cannot tell you whether an employer is real. Use it to notice patterns, then verify through official sources and a phone call.

## Red flags that deserve a stop

- [ ] You must pay for training, equipment, a background check, or “priority placement.”
- [ ] They send a check and ask you to buy supplies or send part of the money back.
- [ ] They request crypto, gift cards, wire transfers, or unusual bank access.
- [ ] They ask for a Social Security number, bank details, or ID images before a written offer from a verified employer.
- [ ] The “interview” is only text chat, with no camera, phone, or person attached to the organization.
- [ ] The offer is urgent, secret, or too good to be true.
- [ ] The recruiter uses a free email domain while claiming to represent a large organization.
- [ ] Links lead to a lookalike domain rather than the official careers page.
- [ ] They send you software to install or ask for remote access to your computer.
- [ ] They cannot answer basic questions about the role, manager, pay structure, or location.

## Verify before you reply

1. **Open the employer’s official site yourself.** Do not trust the link in the message; use a search result or a known address.
2. **Find the job on the official careers page.** Call the published number and ask for the recruiter or HR team by name.
3. **Get it in writing.** Confirm the legal employer, pay structure, schedule, location, and onboarding process.
4. **Share sensitive details only at the right stage.** Identity and payroll information belongs in a verified, secure onboarding process — never in a chat or awkward email thread.

```prompt Check this contact for red flags
Help me assess this job contact for warning signs. I’ll paste the message with my personal details removed. Identify red flags and anything that seems legitimate, but do not certify that the employer is real. Give me three verification steps using official sources.

Message: [paste]
```

> [!WARNING] “The AI said it was fine”
> That is not verification. A language model can describe scam patterns, but it cannot independently confirm that a company, recruiter, or offer exists. Check official contact channels and never send money or credentials to unlock a job.

