import { useState } from 'react'

type Question = {
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

type Mode = 'solo' | 'duel' | null
type DuelStage = 'choose' | 'create' | 'join' | 'waiting'

function App() {
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [mode, setMode] = useState<Mode>(null)
  const [difficulty, setDifficulty] = useState('')
  const [category, setCategory] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  // Duel Mode
  const [duelStage, setDuelStage] = useState<DuelStage>('choose')
  const [gameCode, setGameCode] = useState('')

  const startGame = async () => {
    setLoading(true)
    setGameOver(false)
    setScore(0)
    setCurrent(0)

    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (difficulty) params.append('difficulty', difficulty)

    const res = await fetch(`https://trivia-duel.pages.dev/start-game?${params.toString()}`)
    const data = await res.json()

    setQuestions(data.results || [])
    setLoading(false)
  }

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return
    setSelectedAnswer(answer)

    const q = questions[current]
    if (answer === q.correct_answer) {
      setScore(score + 1)
    }

    setTimeout(() => {
      const next = current + 1
      if (next >= questions.length) {
        setGameOver(true)
      } else {
        setCurrent(next)
        setSelectedAnswer(null)
      }
    }, 1000)
  }

  if (mode === null) {
    return (
      <div className="center">
        <h1>Trivia Duel</h1>
        <p>Select game mode:</p>
        <button onClick={() => setMode('solo')}>🎯 Solo</button>
        <button onClick={() => setMode('duel')}>⚔️ Duel</button>
      </div>
    )
  }

  if (mode === 'duel') {
    if (duelStage === 'choose') {
      return (
        <div className="center">
          <h2>Duel Mode</h2>
          <button onClick={() => {
            const code = Math.random().toString(36).substring(2, 7).toUpperCase()
            setGameCode(code)
            setDuelStage('create')
          }}>
            🎲 Create Game
          </button>
          <button onClick={() => setDuelStage('join')}>🔑 Join Game</button>
          <button onClick={() => setMode(null)}>← Back</button>
        </div>
      )
    }

    if (duelStage === 'create') {
      return (
        <div className="center">
          <h2>Game Created</h2>
          <p>Share this code with your opponent:</p>
          <h1>{gameCode}</h1>
          <p>Waiting for opponent to join...</p>
          <button onClick={() => setDuelStage('choose')}>← Cancel</button>
        </div>
      )
    }

    if (duelStage === 'join') {
      return (
        <div className="center">
          <h2>Join Game</h2>
          <input
            placeholder="Enter Game Code"
            value={gameCode}
            onChange={e => setGameCode(e.target.value.toUpperCase())}
          />
          <button onClick={() => {
            alert(`Joining game ${gameCode} (not yet implemented)`)
            setDuelStage('waiting')
          }}>
            Join Game
          </button>
          <button onClick={() => setDuelStage('choose')}>← Back</button>
        </div>
      )
    }

    if (duelStage === 'waiting') {
      return (
        <div className="center">
          <h2>Joined Game</h2>
          <p>Game code: <strong>{gameCode}</strong></p>
          <p>Waiting for opponent to start...</p>
          <button onClick={() => setDuelStage('choose')}>← Cancel</button>
        </div>
      )
    }
  }

  if (loading) return <div className="center">Loading...</div>

  if (gameOver) {
    return (
      <div className="center">
        <h2>Game Over</h2>
        <p>Your score: {score} / {questions.length}</p>
        <button onClick={startGame}>Play Again</button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="center">
        <h1>Trivia Duel – Solo</h1>

        <div className="selector">
          <label>Category:</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Any</option>
            <option value="9">General Knowledge</option>
            <option value="10">Books</option>
            <option value="11">Film</option>
            <option value="12">Music</option>
            <option value="13">Musicals & Theatres</option>
            <option value="14">TV</option>
            <option value="15">Video Games</option>
            <option value="16">Board Games</option>
            <option value="17">Science & Nature</option>
            <option value="18">Computers</option>
            <option value="19">Math</option>
            <option value="20">Mythology</option>
            <option value="21">Sports</option>
            <option value="22">Geography</option>
            <option value="23">History</option>
            <option value="24">Politics</option>
            <option value="25">Art</option>
            <option value="26">Celebrities</option>
            <option value="27">Animals</option>
            <option value="28">Vehicles</option>
            <option value="29">Comics</option>
            <option value="30">Gadgets</option>
            <option value="31">Anime & Manga</option>
            <option value="32">Cartoons & Animations</option>
          </select>
        </div>

        <div className="selector">
          <label>Difficulty:</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="">Any</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button onClick={startGame}>Start Game</button>
        <button onClick={() => setMode(null)}>← Back</button>
      </div>
    )
  }

  const q = questions[current]
  const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5)

  return (
    <div className="question">
      <h2 dangerouslySetInnerHTML={{ __html: q.question }} />
      <div className="options">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            className={
              selectedAnswer
                ? opt === q.correct_answer
                  ? 'correct'
                  : opt === selectedAnswer
                  ? 'wrong'
                  : ''
                : ''
            }
            dangerouslySetInnerHTML={{ __html: opt }}
          />
        ))}
      </div>
      <p>Question {current + 1} / {questions.length}</p>
    </div>
  )
}

export default App