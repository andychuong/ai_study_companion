# AI Tools and Prompting Strategies

**Document Version:** 1.0  
**Last Updated:** November 2025

## Table of Contents

1. [Overview](#overview)
2. [AI Tools and Models](#ai-tools-and-models)
3. [Use Cases and Prompting Strategies](#use-cases-and-prompting-strategies)
4. [Prompt Engineering Best Practices](#prompt-engineering-best-practices)
5. [Model Selection Strategy](#model-selection-strategy)
6. [Error Handling and Fallbacks](#error-handling-and-fallbacks)
7. [Cost Optimization](#cost-optimization)

---

## Overview

The AI Study Companion leverages OpenAI's GPT models and embedding models to provide intelligent educational features. This document outlines the AI tools used, prompting strategies, and best practices for maintaining quality while optimizing costs.

---

## AI Tools and Models

### Primary Models

#### 1. GPT-4o (Primary LLM)
- **Purpose:** Primary model for high-quality text generation
- **Use Cases:**
  - Transcript analysis
  - Study suggestion generation
  - Practice problem generation
  - Chat responses
- **Configuration:**
  - Temperature: 0.7 (default)
  - Max Tokens: 500-2000 (varies by use case)
  - Response Format: JSON object for structured outputs
- **Advantages:**
  - Faster than GPT-4 Turbo Preview
  - Maintains high quality
  - Better instruction following

#### 2. GPT-3.5 Turbo (Fallback/Fast Model)
- **Purpose:** Fast, cost-effective alternative
- **Use Cases:**
  - Fallback when GPT-4o fails
  - Speed-critical operations
  - Lower-priority tasks
- **Configuration:**
  - Temperature: 0.7
  - Max Tokens: 200-500
- **Advantages:**
  - 10x faster than GPT-4o
  - Significantly cheaper
  - Good for simple tasks

#### 3. text-embedding-3-large (Embeddings)
- **Purpose:** Generate vector embeddings for RAG
- **Configuration:**
  - Dimensions: 3072 (can use 1024 or 256 for lower cost)
  - Input: Text chunks from transcripts
- **Use Cases:**
  - Semantic search in chat
  - Context retrieval for RAG
  - Similarity matching

### Model Selection Logic

```typescript
// Primary: GPT-4o
// Fallback: GPT-3.5 Turbo (on rate limits or errors)
// Embeddings: text-embedding-3-large (3072 dimensions)
```

---

## Use Cases and Prompting Strategies

### 1. Transcript Analysis

**Model:** GPT-4 Turbo Preview (legacy) / GPT-4o (new)

**Purpose:** Extract structured insights from tutoring session transcripts

**Prompt Structure:**
```
Extract key information from this tutoring session transcript:

[TRANSCRIPT TEXT]

Extract and return JSON with:
- topics_covered: [list of topics covered in the session]
- concepts_taught: [list of specific concepts taught, each with:
  - name: a clear, descriptive name for the concept
  - difficulty: number between 1-10 indicating concept difficulty
  - masteryLevel: number between 0-100 indicating student's mastery level]
- student_strengths: [identified strengths]
- areas_for_improvement: [areas needing work]
- action_items: [practice recommendations]
- suggested_follow_up: [next session topics]

IMPORTANT: Each concept in concepts_taught must have a descriptive "name" field.
```

**Key Strategies:**
- Explicit JSON structure requirements
- Clear field definitions with type constraints
- Emphasis on descriptive naming
- Structured output format enforcement

**Configuration:**
- Model: `gpt-4-turbo-preview` (legacy) or `gpt-4o`
- Response Format: `{ type: 'json_object' }`
- Max Tokens: 2000
- Temperature: Default (0.7)

---

### 2. Study Suggestion Generation

**Model:** GPT-4o (primary) / GPT-3.5 Turbo (fallback)

**Purpose:** Generate personalized study topic suggestions when goals are created

**Prompt Structure:**
```
Generate 5-7 study topic suggestions for a student's goal:

Goal: [SUBJECT]
Description: [DESCRIPTION]
Grade: [GRADE]
Other goals: [OTHER_SUBJECTS]

Return JSON with this structure:
{
  "suggestions": [
    {
      "topic": "Topic name",
      "description": "Why important for goal",
      "practice_activities": ["Activity 1", "Activity 2"],
      "difficulty": "beginner|intermediate|advanced",
      "prerequisites": ["Prereq 1"],
      "estimated_hours": 5,
      "relevance_score": 9
    }
  ]
}

Make suggestions specific, actionable, and appropriate for grade level. 
Include foundational and advanced topics. Return 5-7 suggestions.
```

**Key Strategies:**
- Context about student (grade, other goals)
- Structured output with specific fields
- Actionable recommendations
- Grade-appropriate content
- Relevance scoring

**Configuration:**
- Model: `gpt-4o` (try first), fallback to `gpt-3.5-turbo`
- Response Format: `{ type: 'json_object' }`
- Max Tokens: 2000
- Temperature: 0.7

---

### 3. Practice Problem Generation

**Model:** GPT-4o / GPT-3.5 Turbo

**Purpose:** Generate adaptive practice problems based on student mastery

**Prompt Structure:**
```
Generate practice problems for a student based on:
- Session topics: [TOPICS]
- Student mastery levels: [MASTERY_DATA]
- Difficulty target: [DIFFICULTY]
- Number of questions: [COUNT]

Return JSON with:
{
  "questions": [
    {
      "questionId": "unique-id",
      "question": "Question text",
      "type": "multiple_choice|short_answer|essay",
      "options": ["Option 1", "Option 2", ...],
      "correct_answer": "Correct answer",
      "explanation": "Why this is correct",
      "difficulty": 5,
      "concepts": ["Concept 1", "Concept 2"]
    }
  ]
}

Make questions:
1. Appropriate for mastery level
2. Progressive difficulty
3. Clear and unambiguous
4. Educational and reinforcing
```

**Key Strategies:**
- Adaptive difficulty based on mastery
- Progressive complexity
- Clear question structure
- Educational explanations

**Configuration:**
- Model: `gpt-4o` (primary), `gpt-3.5-turbo` (fallback)
- Response Format: `{ type: 'json_object' }`
- Max Tokens: 3000
- Temperature: 0.7

---

### 4. Chat Companion (RAG-Enhanced)

**Model:** GPT-4o / GPT-3.5 Turbo

**Purpose:** Provide contextual answers using RAG from previous sessions

**Prompt Structure:**
```
You are an AI Study Companion helping [STUDENT_NAME].

Context from previous sessions:
[RETRIEVED_CONTEXT_FROM_PINECONE]

Instructions:
1. Answer the question conversationally and at an appropriate level
2. Reference previous lessons when relevant
3. If the question requires deep explanation or the student seems confused, suggest booking a tutor session
4. Keep responses concise (2-3 paragraphs max)
5. Use examples relevant to the student's grade level

[CONVERSATION_HISTORY]

User: [CURRENT_QUESTION]
```

**Key Strategies:**
- RAG context injection from Pinecone
- Conversational tone
- Grade-appropriate responses
- Tutor routing suggestions
- Concise responses

**Configuration:**
- Model: `gpt-4o` (primary)
- Max Tokens: 500
- Temperature: 0.7
- System prompt with context

---

### 5. Hint Generation

**Model:** GPT-4 Turbo Preview

**Purpose:** Generate helpful hints for practice questions

**Prompt Structure:**
```
You are a helpful tutor. A student is working on this practice question:

Question: [QUESTION_TEXT]
Type: [QUESTION_TYPE]
Difficulty: [DIFFICULTY]/10

[OPTIONS_IF_MULTIPLE_CHOICE]

Generate a helpful hint that:
1. Guides the student toward the answer without giving it away
2. Points them in the right direction
3. Helps them think through the problem
4. Is appropriate for difficulty level [DIFFICULTY]/10
5. Is concise (2-3 sentences max)

Return only the hint text, no additional formatting or labels.
```

**Key Strategies:**
- Scaffolding approach (guide, don't give away)
- Difficulty-appropriate hints
- Concise output
- Educational focus

**Configuration:**
- Model: `gpt-4-turbo-preview`
- Max Tokens: 200
- Temperature: 0.7

---

### 6. Explanation Generation

**Model:** GPT-4 Turbo Preview

**Purpose:** Provide detailed explanations for practice questions

**Prompt Structure:**
```
You are a helpful tutor. A student is working on this practice question:

Question: [QUESTION_TEXT]
Type: [QUESTION_TYPE]
Difficulty: [DIFFICULTY]/10

[OPTIONS_IF_MULTIPLE_CHOICE]

Correct Answer: [CORRECT_ANSWER]

[STUDENT_ANSWER_IF_PROVIDED]

Generate a clear, comprehensive explanation that:
1. Explains why the correct answer is correct
2. [Addresses the student's answer and explains why it's correct or incorrect]
3. Breaks down the reasoning step-by-step
4. Is appropriate for difficulty level [DIFFICULTY]/10
5. Is educational and helps the student learn
6. Is 3-5 sentences long

Return only the explanation text, no additional formatting or labels.
```

**Key Strategies:**
- Step-by-step reasoning
- Addresses student's answer if provided
- Educational focus
- Appropriate length

**Configuration:**
- Model: `gpt-4-turbo-preview`
- Max Tokens: 300
- Temperature: 0.7

---

## Prompt Engineering Best Practices

### 1. Structured Outputs

Always use `responseFormat: { type: 'json_object' }` for structured data extraction. This ensures consistent JSON parsing and reduces errors.

### 2. Explicit Instructions

- Define exact output structure
- Specify field types and constraints
- Include examples when helpful
- Use numbered lists for multi-step requirements

### 3. Context Injection

- Include relevant student information (grade, goals, history)
- Provide session context for chat responses
- Reference previous interactions when available

### 4. Error Prevention

- Explicitly state required fields
- Define acceptable value ranges
- Specify format requirements
- Include validation instructions

### 5. Tone and Style

- Match educational context
- Use appropriate language level
- Maintain helpful, encouraging tone
- Be concise but complete

### 6. Fallback Strategies

- Always have fallback models configured
- Provide default responses for errors
- Log failures for debugging
- Gracefully degrade functionality

---

## Model Selection Strategy

### Primary Model: GPT-4o

**When to Use:**
- High-quality output required
- Complex reasoning needed
- Structured data extraction
- User-facing features

**Advantages:**
- Best quality
- Better instruction following
- Faster than GPT-4 Turbo Preview
- Reliable JSON output

### Fallback Model: GPT-3.5 Turbo

**When to Use:**
- Rate limit errors on GPT-4o
- Speed-critical operations
- Simple tasks
- Cost-sensitive operations

**Advantages:**
- 10x faster
- Significantly cheaper
- Good for simple tasks
- Reliable availability

### Embedding Model: text-embedding-3-large

**Configuration:**
- Dimensions: 3072 (best quality)
- Alternative: 1024 or 256 (lower cost)
- Always use same dimensions for consistency

---

## Error Handling and Fallbacks

### Automatic Fallback Logic

```typescript
try {
  // Try primary model (GPT-4o)
  return await chatCompletion(messages, { model: 'gpt-4o' });
} catch (error) {
  // Fallback to GPT-3.5 on rate limits or errors
  if (error?.status === 429 || error?.status === 500) {
    return await chatCompletion(messages, { model: 'gpt-3.5-turbo' });
  }
  throw error;
}
```

### Error Scenarios

1. **Rate Limits (429)**
   - Automatically fallback to GPT-3.5 Turbo
   - Log the fallback for monitoring
   - Continue processing

2. **API Errors (500)**
   - Fallback to GPT-3.5 Turbo
   - Log error details
   - Return graceful error message

3. **Invalid JSON Response**
   - Attempt JSON extraction from markdown code blocks
   - Try to find JSON object in response
   - Log parsing errors
   - Return structured error

4. **Missing API Key**
   - Return user-friendly error message
   - Log warning
   - Disable AI features gracefully

---

## Cost Optimization

### 1. Model Selection

- Use GPT-4o for quality-critical features
- Use GPT-3.5 Turbo for simple tasks
- Implement automatic fallback to cheaper models

### 2. Token Management

- Set appropriate max_tokens limits
- Use concise prompts
- Limit context window when possible
- Cache embeddings when appropriate

### 3. Embedding Optimization

- Use 1024 or 256 dimensions instead of 3072 for lower cost
- Batch embedding generation
- Cache embeddings for repeated content
- Chunk text efficiently (500 tokens per chunk)

### 4. Response Format

- Use JSON mode for structured outputs (reduces retries)
- Specify exact output structure
- Minimize response length with clear instructions

### 5. Caching Strategy

- Cache frequently accessed embeddings
- Store generated content in database
- Reuse explanations and hints when possible

### 6. Rate Limiting

- Implement request queuing
- Use exponential backoff
- Monitor usage and costs
- Set usage limits per user

---

## Monitoring and Logging

### Key Metrics to Track

1. **Model Usage**
   - Which model was used
   - Token counts (input/output)
   - Response times
   - Error rates

2. **Cost Tracking**
   - Per-model costs
   - Per-feature costs
   - Daily/monthly totals
   - Cost per user

3. **Quality Metrics**
   - JSON parsing success rate
   - Fallback frequency
   - User satisfaction
   - Error rates

### Logging Best Practices

```typescript
logger.info('OpenAI response received', {
  model: completion.model,
  usage: completion.usage,
  hasContent: !!completion.choices[0]?.message?.content,
  goalId,
  studentId,
});
```

---

## Future Improvements

1. **Fine-tuning**
   - Consider fine-tuning GPT-3.5 for specific tasks
   - Reduce costs while maintaining quality
   - Customize for educational context

2. **Prompt Templates**
   - Create reusable prompt templates
   - Version control prompts
   - A/B test prompt variations

3. **Cost Monitoring**
   - Real-time cost dashboards
   - Per-user cost limits
   - Automated alerts for high usage

4. **Quality Assurance**
   - Automated testing of AI outputs
   - Human review workflows
   - Feedback loops for improvement

---

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4o Model Details](https://platform.openai.com/docs/models/gpt-4o)
- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)

