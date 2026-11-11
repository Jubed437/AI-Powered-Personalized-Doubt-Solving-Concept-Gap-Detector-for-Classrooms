import { Annotation, END, StateGraph } from '@langchain/langgraph';
import { CONCEPTS, getPrerequisiteContext, resolveConcepts } from './concepts.js';
import {
  conceptAnalysisMessages,
  explanationMessages,
  PROMPT_VERSION,
} from './prompts.js';
import { AIServiceError, createAIProvider } from './provider.js';
import { validateConceptAnalysis, validateExplanation } from './validation.js';

const WorkflowState = Annotation.Root({
  request: Annotation(),
  provider: Annotation(),
  conceptAnalysis: Annotation(),
  resolvedConcepts: Annotation(),
  prerequisiteContext: Annotation(),
  explanation: Annotation(),
  metadata: Annotation(),
  validationErrors: Annotation(),
  retryCount: Annotation(),
  valid: Annotation(),
  allowedConceptIds: Annotation(),
});

function createWorkflow(provider) {
  const extractConcepts = async (state) => {
    const result = await state.provider.generateStructured({
      messages: conceptAnalysisMessages({
        ...state.request,
        concepts: CONCEPTS,
        repairInstruction: state.validationErrors.join(' '),
      }),
      metadata: { promptVersion: PROMPT_VERSION },
    });
    return { conceptAnalysis: result.data, metadata: { extraction: result.metadata } };
  };

  const resolveConceptsNode = (state) => ({
    resolvedConcepts: resolveConcepts(state.conceptAnalysis.concepts),
  });

  const retrieveContext = (state) => ({
    prerequisiteContext: getPrerequisiteContext(
      state.resolvedConcepts.map(({ conceptId }) => conceptId),
    ),
  });

  const generateExplanation = async (state) => {
    const allowedConceptIds = new Set([
      ...state.resolvedConcepts.map(({ conceptId }) => conceptId),
      ...state.prerequisiteContext.map(({ id }) => id),
    ]);
    const result = await state.provider.generateStructured({
      messages: explanationMessages({
        ...state.request,
        resolvedConcepts: state.resolvedConcepts,
        prerequisiteContext: state.prerequisiteContext,
        repairInstruction: state.validationErrors.join(' '),
      }),
      metadata: { promptVersion: PROMPT_VERSION },
    });
    return {
      explanation: result.data,
      metadata: { ...state.metadata, explanation: result.metadata },
      allowedConceptIds: [...allowedConceptIds],
    };
  };

  const validate = (state) => {
    const knownConceptIds = new Set(CONCEPTS.map(({ id }) => id));
    const errors = [
      ...validateConceptAnalysis(state.conceptAnalysis, knownConceptIds),
      ...validateExplanation(state.explanation, new Set(state.allowedConceptIds)),
    ];
    return {
      validationErrors: errors,
      valid: errors.length === 0,
      retryCount: state.retryCount + (errors.length > 0 ? 1 : 0),
    };
  };

  const graph = new StateGraph(WorkflowState)
    .addNode('extractConcepts', extractConcepts)
    .addNode('resolveConcepts', resolveConceptsNode)
    .addNode('retrieveContext', retrieveContext)
    .addNode('generateExplanation', generateExplanation)
    .addNode('validate', validate)
    .addNode('failed', (state) => ({
      valid: false,
      validationErrors: state.validationErrors,
    }))
    .addEdge('__start__', 'extractConcepts')
    .addEdge('extractConcepts', 'resolveConcepts')
    .addEdge('resolveConcepts', 'retrieveContext')
    .addEdge('retrieveContext', 'generateExplanation')
    .addEdge('generateExplanation', 'validate')
    .addConditionalEdges('validate', (state) => {
      if (state.valid) return END;
      return state.retryCount <= 1 ? 'extractConcepts' : 'failed';
    })
    .addEdge('failed', END);

  return graph.compile();
}

export async function analyzeDoubt(request, { provider = createAIProvider() } = {}) {
  const workflow = createWorkflow(provider);
  const result = await workflow.invoke({
    request,
    provider,
    conceptAnalysis: null,
    resolvedConcepts: [],
    prerequisiteContext: [],
    explanation: null,
    metadata: {},
    validationErrors: [],
    retryCount: 0,
    valid: false,
    allowedConceptIds: [],
  });

  if (!result.valid) {
    throw new AIServiceError('The AI response did not pass validation. Please retry.', {
      code: 'AI_OUTPUT_INVALID',
      statusCode: 502,
    });
  }

  return {
    promptVersion: PROMPT_VERSION,
    concepts: result.resolvedConcepts,
    unknownTerms: result.conceptAnalysis.unknownTerms,
    prerequisiteReview: result.prerequisiteContext,
    explanation: result.explanation,
    metadata: result.metadata,
  };
}
