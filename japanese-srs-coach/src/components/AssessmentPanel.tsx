import { FormEvent, useState } from 'react';
import {
  createAssessmentState,
  getCurrentAssessmentQuestion,
  loadAssessmentState,
  persistAssessmentState,
  startAssessment,
  submitAssessmentAnswer,
} from '../lib/assessmentEngine';
import { srsApi } from '../lib/srsApi';
import type { LearnerProfile } from '../lib/types';

export function AssessmentPanel({ profile, onCompleted }: { profile: LearnerProfile; onCompleted: () => void }) {
  const [state, setState] = useState(loadAssessmentState);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const question = getCurrentAssessmentQuestion(state);

  const begin = () => {
    const next = startAssessment();
    setState(next);
    persistAssessmentState(next);
    setAnswer('');
    setMessage('Start easy. One question at a time.');
  };

  const restart = () => {
    const next = createAssessmentState();
    setState(next);
    persistAssessmentState(next);
    setAnswer('');
    setMessage('Assessment reset. Start whenever you are ready.');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim() || !question) return;
    const submission = submitAssessmentAnswer(state, answer, profile.learnerId);
    setState(submission.state);
    persistAssessmentState(submission.state);
    setAnswer('');
    setMessage(`${submission.answerResult.toUpperCase()}: ${question.explanation}`);
    if (submission.result) {
      setSaving(true);
      try {
        await srsApi.saveAssessmentResult(submission.result);
        onCompleted();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not save the assessment.');
      } finally {
        setSaving(false);
      }
    }
  };

  const completed = state.status === 'completed' || profile.assessmentStatus === 'completed';
  return (
    <section className="panel assessment" aria-labelledby="assessment-heading">
      <div className="panel__heading-row">
        <div>
          <p className="eyebrow">Baseline</p>
          <h2 id="assessment-heading">Level assessment</h2>
        </div>
        <span className="status status--review">{completed ? 'completed' : state.status.replace('_', ' ')}</span>
      </div>
      <p><strong>Estimated level:</strong> {profile.currentEstimatedLevel}</p>
      {profile.assessmentStrengths?.length ? <p><strong>Strengths:</strong> {profile.assessmentStrengths.join(', ')}</p> : null}
      {profile.assessmentWeaknesses?.length ? <p><strong>Priorities:</strong> {profile.assessmentWeaknesses.join(', ')}</p> : null}
      <p><strong>Recommended next step:</strong> {profile.currentCurriculumStep}</p>

      {state.status === 'not_started' && (
        <button className="button button--secondary button--full" onClick={begin}>Continue assessment</button>
      )}
      {state.status === 'in_progress' && question && (
        <form onSubmit={submit} className="stack">
          <div className="progress-label"><span>Question {state.currentQuestionIndex + 1} of 10</span><span>{question.competency.replace(/_/g, ' ')}</span></div>
          <progress value={state.currentQuestionIndex} max={10} />
          <label htmlFor="assessment-answer"><strong>{question.prompt}</strong></label>
          <input id="assessment-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Answer using Romaji or English as requested" autoComplete="off" />
          <button className="button button--primary" disabled={saving || !answer.trim()}>Check answer</button>
        </form>
      )}
      {message && <p className="feedback" aria-live="polite">{message}</p>}
      {(completed || state.status === 'in_progress') && <button className="button button--text" onClick={restart}>Restart assessment</button>}
    </section>
  );
}
