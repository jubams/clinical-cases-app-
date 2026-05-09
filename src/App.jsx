import { useState, useMemo, useCallback } from 'react'
import data from './cases_questions_answers.json'
import './App.css'
import {
  ChevronLeft, ChevronRight, CheckCircle, XCircle, Award,
  BookOpen, Play, Home, Shuffle, Eye
} from 'lucide-react'

const cleanText = (text) => {
  if (!text) return ''
  return text
    .replace(/\[cite:[^\]]*\]/g, '')
    .replace(/\$([^$]+)\$/g, (_, m) => m.replace(/[~_]/g, ''))
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const VIEWS = { HOME: 'home', QUIZ: 'quiz', REVIEW: 'review', SUMMARY: 'summary' }

function App() {
  const [view, setView] = useState(VIEWS.HOME)
  const [currentCase, setCurrentCase] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [shuffled, setShuffled] = useState(false)
  const [shuffledCases, setShuffledCases] = useState(null)

  const cases = useMemo(() => {
    if (shuffled && shuffledCases) return shuffledCases
    return data
  }, [shuffled, shuffledCases])

  const caseData = cases[currentCase]
  const questions = caseData.questions
  const question = questions[currentQuestion]

  const allTotalQuestions = useMemo(() =>
    cases.reduce((sum, c) => sum + c.questions.length, 0),
    [cases]
  )

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const correctCount = useMemo(() =>
    Object.values(answers).filter(a => a.isCorrect).length, [answers]
  )

  const answerKey = `${currentCase}-${currentQuestion}`
  const existingAnswer = answers[answerKey]
  const hasAnswered = !!existingAnswer

  const handleAnswer = useCallback((letter) => {
    if (hasAnswered) return
    const isCorrect = letter === question.correct_answer
    setAnswers(prev => ({
      ...prev,
      [answerKey]: { selected: letter, isCorrect }
    }))
  }, [hasAnswered, question, answerKey])

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else if (currentCase < cases.length - 1) {
      setCurrentCase(prev => prev + 1)
      setCurrentQuestion(0)
    } else {
      setView(VIEWS.SUMMARY)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    } else if (currentCase > 0) {
      const prevCase = currentCase - 1
      setCurrentCase(prevCase)
      setCurrentQuestion(cases[prevCase].questions.length - 1)
    }
  }

  const startQuiz = (shouldShuffle) => {
    if (shouldShuffle) {
      const shuffledArr = [...data].sort(() => Math.random() - 0.5)
      setShuffledCases(shuffledArr)
      setShuffled(true)
    } else {
      setShuffledCases(null)
      setShuffled(false)
    }
    setCurrentCase(0)
    setCurrentQuestion(0)
    setAnswers({})
    setView(VIEWS.QUIZ)
  }

  const resetAll = () => {
    setView(VIEWS.HOME)
    setCurrentCase(0)
    setCurrentQuestion(0)
    setAnswers({})
    setShuffled(false)
    setShuffledCases(null)
  }

  const goToCase = (idx) => {
    setCurrentCase(idx)
    setCurrentQuestion(0)
  }

  const getCaseScore = (caseIdx) => {
    const c = cases[caseIdx]
    let correct = 0
    c.questions.forEach((_, qIdx) => {
      const key = `${caseIdx}-${qIdx}`
      if (answers[key]?.isCorrect) correct++
    })
    return { correct, total: c.questions.length }
  }

  const progressPercent = Math.round((answeredCount / allTotalQuestions) * 100)

  if (view === VIEWS.HOME) {
    return (
      <div className="home-screen">
        <div className="home-bg" />
        <div className="home-content">
          <div className="home-icon-wrap">
            <BookOpen className="home-icon" />
          </div>
          <h1 className="home-title">Casos Clinicos</h1>
          <p className="home-subtitle">Practica para tu examen con casos clinicos interactivos</p>
          <div className="home-stats">
            <div className="home-stat">
              <span className="home-stat-num">{data.length}</span>
              <span className="home-stat-label">Casos</span>
            </div>
            <div className="home-stat-divider" />
            <div className="home-stat">
              <span className="home-stat-num">{allTotalQuestions}</span>
              <span className="home-stat-label">Preguntas</span>
            </div>
          </div>
          <div className="home-buttons">
            <button className="home-btn primary" onClick={() => startQuiz(false)}>
              <Play className="btn-icon" />
              Comenzar Practica
            </button>
            <button className="home-btn secondary" onClick={() => startQuiz(true)}>
              <Shuffle className="btn-icon" />
              Modo Aleatorio
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (view === VIEWS.SUMMARY) {
    const percentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
    return (
      <div className="summary-screen">
        <div className="summary-card">
          <div className="summary-header">
            <Award className="summary-award" />
            <h1 className="summary-title">Practica Completada</h1>
            <p className="summary-subtitle">Has terminado todos los casos clinicos</p>
          </div>
          <div className="summary-score-row">
            <div className="summary-score-big">
              <span className="score-correct-big">{correctCount}</span>
              <span className="score-divider-big">/</span>
              <span className="score-total-big">{answeredCount}</span>
            </div>
            <div className={`summary-percentage ${percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}`}>
              {percentage}%
            </div>
          </div>
          <p className="summary-message">
            {percentage >= 70 ? 'Excelente trabajo, estas listo!' : percentage >= 50 ? 'Buen progreso, sigue practicando' : 'Necesitas mas practica, no te rindas!'}
          </p>
          <div className="summary-cases">
            {cases.map((c, idx) => {
              const { correct, total } = getCaseScore(idx)
              return (
                <div key={idx} className="summary-case-item">
                  <div className="summary-case-info">
                    <span className="summary-case-num">Caso {idx + 1}</span>
                    <span className="summary-case-title">{cleanText(c.case_title)}</span>
                  </div>
                  <span className={`summary-case-score ${correct === total ? 'perfect' : correct > 0 ? 'partial' : 'zero'}`}>
                    {correct}/{total}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="summary-actions">
            <button className="btn-primary" onClick={resetAll}>
              <Home className="btn-icon" />
              Inicio
            </button>
            <button className="btn-secondary" onClick={() => { setView(VIEWS.REVIEW); setCurrentCase(0); setCurrentQuestion(0) }}>
              <Eye className="btn-icon" />
              Repasar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isReview = view === VIEWS.REVIEW

  return (
    <div className="quiz-screen">
      <header className="header">
        <div className="header-inner">
          <button className="header-back" onClick={resetAll}>
            <Home className="icon-sm" />
          </button>
          <div className="header-center">
            <span className="header-label">{isReview ? 'Repaso' : 'Practica'}</span>
            <span className="header-progress">{answeredCount}/{allTotalQuestions}</span>
          </div>
          <div className="header-score">
            <span className="h-score-correct">{correctCount}</span>
            <span className="h-score-sep">/</span>
            <span className="h-score-total">{answeredCount}</span>
          </div>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      <main className="quiz-main">
        <div className="case-tabs">
          {cases.map((c, idx) => {
            const { correct, total } = getCaseScore(idx)
            const done = correct + '/' + total
            return (
              <button
                key={idx}
                className={`case-tab ${idx === currentCase ? 'active' : ''} ${correct === total && total > 0 ? 'complete' : ''}`}
                onClick={() => goToCase(idx)}
                title={cleanText(c.case_title)}
              >
                <span className="case-tab-num">{idx + 1}</span>
                <span className="case-tab-score">{done}</span>
              </button>
            )
          })}
        </div>

        <div className="card case-card">
          <div className="card-top">
            <span className="badge">Caso {currentCase + 1} de {cases.length}</span>
            <span className="q-counter">Pregunta {currentQuestion + 1} / {questions.length}</span>
          </div>
          <h2 className="case-title">{cleanText(caseData.case_title)}</h2>
          <div className="case-content">{cleanText(caseData.case_content)}</div>
        </div>

        <div className="card question-card">
          <p className="question-text">{cleanText(question.question)}</p>
          <div className="options">
            {question.options.map((option) => {
              const clean = cleanText(option.text)
              let cls = 'option-btn'
              if (hasAnswered || isReview) {
                const ans = existingAnswer
                if (option.letter === question.correct_answer) cls += ' correct'
                else if (ans && option.letter === ans.selected) cls += ' incorrect'
              }
              return (
                <button
                  key={option.letter}
                  className={cls}
                  onClick={() => !isReview && handleAnswer(option.letter)}
                  disabled={hasAnswered || isReview}
                >
                  <span className="opt-letter">{option.letter}</span>
                  <span className="opt-text">{clean}</span>
                  {(hasAnswered || isReview) && option.letter === question.correct_answer && (
                    <CheckCircle className="opt-icon icon-correct" />
                  )}
                  {(hasAnswered || isReview) && existingAnswer && option.letter === existingAnswer.selected && option.letter !== question.correct_answer && (
                    <XCircle className="opt-icon icon-incorrect" />
                  )}
                </button>
              )
            })}
          </div>
          {hasAnswered && !isReview && (
            <div className={`feedback ${existingAnswer.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
              {existingAnswer.isCorrect ? 'Correcto!' : `Incorrecto — la respuesta correcta es ${question.correct_answer}`}
            </div>
          )}
        </div>

        <div className="nav-row">
          <button className="nav-btn" onClick={prevQuestion} disabled={currentCase === 0 && currentQuestion === 0}>
            <ChevronLeft className="icon-sm" />
            Anterior
          </button>
          {isReview ? (
            <button className="nav-btn primary" onClick={() => {
              if (currentCase < cases.length - 1 || currentQuestion < questions.length - 1) nextQuestion()
              else setView(VIEWS.SUMMARY)
            }}>
              {currentCase < cases.length - 1 || currentQuestion < questions.length - 1 ? 'Siguiente' : 'Ver Resultados'}
              <ChevronRight className="icon-sm" />
            </button>
          ) : (
            <button
              className="nav-btn primary"
              onClick={nextQuestion}
              disabled={!hasAnswered && currentQuestion < questions.length - 1 || (currentCase === cases.length - 1 && currentQuestion === questions.length - 1 && !hasAnswered)}
            >
              {currentQuestion < questions.length - 1 || currentCase < cases.length - 1 ? 'Siguiente' : 'Finalizar'}
              <ChevronRight className="icon-sm" />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
