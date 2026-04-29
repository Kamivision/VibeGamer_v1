import { useState } from "react";
import { vibes } from "../data/quizData";

function getVibe(answers) {
  const key = answers.join("");
  return (
    vibes[key] ||
    vibes[`default${answers[answers.length - 1]}`] ||
    vibes["default0"]
  );
}

export default function useQuiz({ onComplete, questions = [], quizScoring }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;

  function select(index) {
    const next = [...answers];
    next[current] = index;
    setAnswers(next);
  }

  function goNext() {
    if (answers[current] === undefined) return;
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      const vibe = getVibe(answers);
      const scoring = quizScoring ? quizScoring(answers) : null;
      setResult(vibe);
      if (onComplete) onComplete({ answers, vibe, scoring });
    }
  }

  function goBack() {
    if (current > 0) setCurrent(current - 1);
  }

 

  function restart() {
    setCurrent(0);
    setAnswers([]);
    setResult(null);
  }

  return {
    questions,
    current,
    answers,
    result,
    progress,
    select,
    goNext,
    goBack,
    restart,
  };
}