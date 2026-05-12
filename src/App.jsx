import { useState, useMemo, useCallback } from 'react'
import questions from './exam_questions.json'
import './App.css'
import {
  ChevronLeft, ChevronRight, CheckCircle, XCircle, Award,
  BookOpen, Play, Home, Shuffle, Eye
} from 'lucide-react'

const BASE = import.meta.env.BASE_URL
const VIEWS = { HOME: 'home', QUIZ: 'quiz', REVIEW: 'review', SUMMARY: 'summary' }

function App() {
  const [view, setView] = useState(VIEWS.HOME)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [shuffledOrder, setShuffledOrder] = useState(null)

  const questionList = useMemo(() => {
    if (shuffledOrder) return shuffledOrder.map(i => questions[i])
    return questions
  }, [shuffledOrder])

  const totalQuestions = questionList.length
  const question = questionList[currentIndex]

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const correctCount = useMemo(() =>
    Object.values(answers).filter(a => a.isCorrect).length, [answers]
  )

  const existingAnswer = answers[currentIndex]
  const hasAnswered = !!existingAnswer

  const handleAnswer = useCallback((letter) => {
    if (hasAnswered) return
    const isCorrect = letter === question.correct_answer
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { selected: letter, isCorrect }
    }))
  }, [hasAnswered, question, currentIndex])

  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setView(VIEWS.SUMMARY)
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const startQuiz = (shouldShuffle) => {
    if (shouldShuffle) {
      const indices = questions.map((_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
      }
      setShuffledOrder(indices)
    } else {
      setShuffledOrder(null)
    }
    setCurrentIndex(0)
    setAnswers({})
    setView(VIEWS.QUIZ)
  }

  const resetAll = () => {
    setView(VIEWS.HOME)
    setCurrentIndex(0)
    setAnswers({})
    setShuffledOrder(null)
  }

  const progressPercent = Math.round((answeredCount / totalQuestions) * 100)

  if (view === VIEWS.HOME) {
    return (
      <div className="home-screen">
        <div className="home-bg" />
        <div className="home-content">
          <div className="home-icon-wrap">
            <BookOpen className="home-icon" />
          </div>
          <h1 className="home-title">Examen Medicina Forense</h1>
          <p className="home-subtitle">Practica para tu examen con preguntas de opción múltiple</p>
          <div className="home-stats">
            <div className="home-stat">
              <span className="home-stat-num">{totalQuestions}</span>
              <span className="home-stat-label">Preguntas</span>
            </div>
            <div className="home-stat-divider" />
            <div className="home-stat">
              <span className="home-stat-num">9</span>
              <span className="home-stat-label">Con imágenes</span>
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
            <h1 className="summary-title">Examen Completado</h1>
            <p className="summary-subtitle">Has terminado todas las preguntas</p>
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
            {percentage >= 70 ? 'Excelente trabajo, estás listo!' : percentage >= 50 ? 'Buen progreso, sigue practicando' : 'Necesitas más práctica, no te rindas!'}
          </p>
          <div className="summary-cases">
            {questionList.map((q, idx) => {
              const ans = answers[idx]
              const isCorrect = ans?.isCorrect
              return (
                <div key={idx} className="summary-case-item">
                  <div className="summary-case-info">
                    <span className="summary-case-num">{idx + 1}</span>
                    <span className="summary-case-title">{q.question}</span>
                  </div>
                  <span className={`summary-case-score ${isCorrect ? 'perfect' : ans ? 'zero' : 'partial'}`}>
                    {ans ? (isCorrect ? '✓' : '✗') : '—'}
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
            <button className="btn-secondary" onClick={() => { setView(VIEWS.REVIEW); setCurrentIndex(0) }}>
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
            <span className="header-label">{isReview ? 'Repaso' : 'Examen'}</span>
            <span className="header-progress">{currentIndex + 1}/{totalQuestions}</span>
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
        <div className="card question-card">
          <div className="card-top">
            <span className="badge">Pregunta {currentIndex + 1} de {totalQuestions}</span>
            {question.image && <span className="badge img-badge">Con imagen</span>}
          </div>
          <p className="question-text">{question.question}</p>
          {question.image && (
            <div className="question-image-wrap">
              <img
                src={`${BASE}${question.image.replace(/^\//, '')}`}
                alt="Imagen de la pregunta"
                className="question-image"
              />
            </div>
          )}
          <div className="options">
            {question.options.map((option) => {
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
                  <span className="opt-text">{option.text}</span>
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
          <button className="nav-btn" onClick={prevQuestion} disabled={currentIndex === 0}>
            <ChevronLeft className="icon-sm" />
            Anterior
          </button>
          {isReview ? (
            <button className="nav-btn primary" onClick={() => {
              if (currentIndex < totalQuestions - 1) nextQuestion()
              else setView(VIEWS.SUMMARY)
            }}>
              {currentIndex < totalQuestions - 1 ? 'Siguiente' : 'Ver Resultados'}
              <ChevronRight className="icon-sm" />
            </button>
          ) : (
            <button
              className="nav-btn primary"
              onClick={nextQuestion}
              disabled={!hasAnswered}
            >
              {currentIndex < totalQuestions - 1 ? 'Siguiente' : 'Finalizar'}
              <ChevronRight className="icon-sm" />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
