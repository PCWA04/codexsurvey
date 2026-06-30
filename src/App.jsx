import { useMemo, useState } from 'react';

const scaleAgree = [
  { value: 1, label: '😵 非常不同意' },
  { value: 2, label: '😐 不太同意' },
  { value: 3, label: '🙂 普通' },
  { value: 4, label: '😃 同意' },
  { value: 5, label: '🤩 非常同意' },
];

const scaleEase = [
  { value: 1, label: '😵 非常困難' },
  { value: 2, label: '😐 有點困難' },
  { value: 3, label: '🙂 普通' },
  { value: 4, label: '😃 容易' },
  { value: 5, label: '🤩 非常容易' },
];

const scaleClarity = [
  { value: 1, label: '😵 非常不清楚' },
  { value: 2, label: '😐 不太清楚' },
  { value: 3, label: '🙂 普通' },
  { value: 4, label: '😃 清楚' },
  { value: 5, label: '🤩 非常清楚' },
];

const questions = [
  {
    id: 'Q1_UnderstandCodex',
    title: '這堂課後，我更理解 Codex 可以做什麼。',
    type: 'scale',
    options: scaleAgree,
  },
  {
    id: 'Q2_ValueForManagers',
    title: '我認為 Codex / Vibe Coding 對非工程背景的專業經理人是有價值的。',
    type: 'scale',
    options: scaleAgree,
  },
  {
    id: 'Q3_CanBuildPrototype',
    title: '我認為自己有能力用自然語言描述需求，並與 AI 協作完成簡單 prototype。',
    type: 'scale',
    options: scaleAgree,
  },
  {
    id: 'Q4_EaseOfUse',
    title: 'Codex 的操作是否容易上手？',
    type: 'scale',
    options: scaleEase,
  },
  {
    id: 'Q5_CourseStructure',
    title: '本次課程內容安排是否清楚、有邏輯？',
    type: 'scale',
    options: scaleClarity,
  },
  {
    id: 'Q6_InstructorClarity',
    title: '講師是否能用專業經理人容易理解的方式說明 Codex / Vibe Coding？',
    type: 'scale',
    options: scaleAgree,
  },
  {
    id: 'Q7_MostValuablePractice',
    title: '哪一個實作題目最有收穫？',
    type: 'choice',
    options: ['井字遊戲', '個人消費統計管家 App', 'LINE 服務小幫手', '都有幫助', '尚無明確感受'],
  },
  {
    id: 'Q8_UseCases',
    title: '你想到哪些工作或企業場景可以嘗試 Codex / Vibe Coding？',
    type: 'text',
    placeholder:
      '例如：流程自動化、內部管理工具、客戶服務、資料整理、報表 Dashboard、活動報名系統、LINE Bot、原型開發、需求溝通等。',
  },
  {
    id: 'Q9_AdoptionIntent',
    title: '你是否會考慮在自己的工作或企業中嘗試使用 Codex / Vibe Coding？',
    type: 'scale',
    options: [
      { value: 1, label: '😵 完全不會' },
      { value: 2, label: '😐 可能不會' },
      { value: 3, label: '🙂 還不確定' },
      { value: 4, label: '😃 會考慮' },
      { value: 5, label: '🤩 非常願意' },
    ],
  },
  {
    id: 'Q10_RecommendScore',
    title: '你會推薦這堂課給其他專業經理人或企業主嗎？',
    type: 'nps',
  },
];

const totalAnswerPages = questions.length + 1;

function createInitialAnswers() {
  return questions.reduce((answers, question) => {
    answers[question.id] = '';
    return answers;
  }, {});
}

export function App() {
  const endpoint = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  const [page, setPage] = useState(0);
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState(createInitialAnswers);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitMode, setSubmitMode] = useState('');

  const currentQuestion = questions[page - 2];
  const isIntroPage = page === 0;
  const isProfilePage = page === 1;
  const isQuestionPage = page >= 2 && page < questions.length + 2;
  const isReviewPage = page === questions.length + 2;
  const isSuccessPage = page === questions.length + 3;

  const progress = useMemo(() => {
    if (page === 0) return 0;
    if (isSuccessPage) return 100;
    return Math.min(100, Math.round(((page - 1) / totalAnswerPages) * 100));
  }, [isSuccessPage, page]);

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setError('');
  }

  function validateCurrentPage() {
    if (!isQuestionPage) return true;
    const value = answers[currentQuestion.id];
    if (value === '' || String(value).trim() === '') {
      setError('這題是必填，請先選擇或填寫後再繼續。');
      return false;
    }
    return true;
  }

  function goNext() {
    if (!validateCurrentPage()) return;
    setError('');
    setPage((current) => current + 1);
  }

  function goBack() {
    setError('');
    setPage((current) => Math.max(0, current - 1));
  }

  async function submitSurvey() {
    if (isSubmitting || hasSubmitted) return;

    const missingQuestion = questions.find((question) => {
      const value = answers[question.id];
      return value === '' || String(value).trim() === '';
    });

    if (missingQuestion) {
      setError('還有必填題目尚未完成，請返回檢查。');
      return;
    }

    const payload = {
      SubmittedAt: new Date().toISOString(),
      Name: name.trim(),
      ...answers,
      UserAgent: navigator.userAgent,
    };

    setIsSubmitting(true);
    setError('');

    try {
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        setSubmitMode('google-sheet');
      } else {
        const saved = JSON.parse(localStorage.getItem('vibe-coding-feedback-demo') || '[]');
        localStorage.setItem('vibe-coding-feedback-demo', JSON.stringify([...saved, payload]));
        setSubmitMode('local-demo');
      }

      setHasSubmitted(true);
      setPage(questions.length + 3);
    } catch {
      setError('送出失敗，請檢查網路或 Google Apps Script URL 後再試一次。');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Vibe Coding Workshop Feedback Survey">
        <div className={`hero ${isIntroPage ? '' : 'hero-compact'}`}>
          <div className="hero-grid" />
          <div className="brand-row">
            <img src="/vibe-mark.png" alt="Vibe Coding" className="brand-mark" />
            <div>
              <p className="eyebrow">AI × Codex × Business Impact</p>
              <p className="brand-title">VIBE CODING WORKSHOP</p>
            </div>
          </div>

          {isIntroPage && (
            <div className="hero-copy">
              <h1>Vibe Coding Workshop Feedback</h1>
              <p>
                Help us understand how professional managers and business owners see Codex after
                today’s hands-on session.
              </p>
            </div>
          )}
        </div>

        {!isSuccessPage && page > 0 && (
          <div className="progress-wrap" aria-label={`完成度 ${progress}%`}>
            <div className="progress-meta">
              <span>{isReviewPage ? '確認送出' : isProfilePage ? '基本資料' : `Q${page - 1} / 10`}</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="content-card">
          {isIntroPage && (
            <section className="screen intro-screen">
              <p className="section-kicker">課後調查</p>
              <h2>3 分鐘完成，協助我們優化下一場工作坊。</h2>
              <p className="muted">
                這份問卷採逐題作答，所有核心題目皆為必填；姓名可留白。
              </p>
              <button className="primary-button" type="button" onClick={goNext}>
                Start Feedback
              </button>
            </section>
          )}

          {isProfilePage && (
            <section className="screen">
              <p className="section-kicker">Basic Info</p>
              <h2>姓名</h2>
              <p className="muted">這題可不填。若你希望講師後續識別回饋，可留下姓名。</p>
              <label className="field-label" htmlFor="name">
                姓名（選填）
              </label>
              <input
                id="name"
                className="text-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="請輸入姓名"
              />
            </section>
          )}

          {isQuestionPage && (
            <QuestionScreen
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => updateAnswer(currentQuestion.id, value)}
            />
          )}

          {isReviewPage && (
            <section className="screen review-screen">
              <p className="section-kicker">Submit</p>
              <h2>確認送出問卷</h2>
              <p className="muted">
                送出後會儲存所有 10 題回覆。若尚未設定 Google Apps Script，系統會先存成本機 demo 資料。
              </p>
              <div className="summary-list">
                <div>
                  <span>姓名</span>
                  <strong>{name.trim() || '未填寫'}</strong>
                </div>
                <div>
                  <span>已完成題數</span>
                  <strong>10 / 10</strong>
                </div>
                <div>
                  <span>送出狀態</span>
                  <strong>{endpoint ? '連接 Google Sheet' : '本機 demo 模式'}</strong>
                </div>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={submitSurvey}
                disabled={isSubmitting || hasSubmitted}
              >
                {isSubmitting ? '送出中...' : hasSubmitted ? '已送出' : 'Submit Feedback'}
              </button>
            </section>
          )}

          {isSuccessPage && (
            <section className="screen success-screen">
              <div className="success-icon">✓</div>
              <p className="section-kicker">Complete</p>
              <h2>Thank you!</h2>
              <p>
                Your feedback helps us design better AI learning experiences for professional
                managers and business owners.
              </p>
              <p className="muted">This survey itself was built as a Vibe Coding prototype.</p>
              {submitMode === 'local-demo' && (
                <p className="demo-note">目前是本機 demo 儲存；設定 URL 後即可寫入 Google Sheet。</p>
              )}
            </section>
          )}

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </div>

        {!isSuccessPage && page > 0 && (
          <nav className="nav-row" aria-label="問卷導覽">
            <button className="secondary-button" type="button" onClick={goBack} disabled={isSubmitting}>
              Previous
            </button>
            {!isReviewPage && (
              <button className="primary-button" type="button" onClick={goNext}>
                Next
              </button>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}

function QuestionScreen({ question, value, onChange }) {
  return (
    <section className="screen question-screen">
      <p className="section-kicker">{question.id.replace('_', ' · ')}</p>
      <h2>{question.title}</h2>

      {question.type === 'scale' && (
        <div className="option-grid">
          {question.options.map((option) => (
            <button
              className={`option-card ${value === option.value ? 'selected' : ''}`}
              type="button"
              key={option.value}
              onClick={() => onChange(option.value)}
            >
              <span className="option-score">{option.value}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'choice' && (
        <div className="choice-list">
          {question.options.map((option) => (
            <button
              className={`choice-card ${value === option ? 'selected' : ''}`}
              type="button"
              key={option}
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <textarea
          className="textarea-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={question.placeholder}
          rows={6}
        />
      )}

      {question.type === 'nps' && (
        <div className="nps-wrap">
          <div className="nps-labels">
            <span>0 完全不會推薦</span>
            <span>10 非常願意推薦</span>
          </div>
          <div className="score-grid">
            {Array.from({ length: 11 }, (_, score) => (
              <button
                className={`score-button ${value === score ? 'selected' : ''}`}
                type="button"
                key={score}
                onClick={() => onChange(score)}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
