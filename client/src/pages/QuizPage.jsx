import QuizForm from "../components/QuizForm";
import DisplayQuizResults from "../components/DisplayQuizResults";
import useQuiz from "../hooks/useQuiz";
import { questions } from "../data/quizData";
import quizScoring from "../data/quizScoring";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, saveQuizResult } from "../utilities";

function getSavedVibe(quizResults) {
  const savedVibe = quizResults?.vibe;

  if (!savedVibe || typeof savedVibe !== "object") {
    return null;
  }

  if (typeof savedVibe.name !== "string" || typeof savedVibe.desc !== "string") {
    return null;
  }

  return {
    name: savedVibe.name,
    desc: savedVibe.desc,
    traits: Array.isArray(savedVibe.traits) ? savedVibe.traits : [],
  };
}

export default function QuizPage() {
  const { user } = useOutletContext();
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [savedResult, setSavedResult] = useState(null);
  const [isLoadingSavedResult, setIsLoadingSavedResult] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedQuizResult() {
      if (!user) {
        setSavedResult(null);
        setIsRetaking(false);
        return;
      }

      setIsLoadingSavedResult(true);

      try {
        const response = await api.get("profile/");
        if (!isMounted) {
          return;
        }

        setSavedResult(getSavedVibe(response.data?.quiz_results));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSavedResult(null);
      } finally {
        if (isMounted) {
          setIsLoadingSavedResult(false);
        }
      }
    }

    loadSavedQuizResult();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function handleQuizComplete({ answers, vibe, scoring }) {
    setSaveStatus("saving");
    setSaveError("");

    const quizResult = {
      answers,
      vibe: {
        name: vibe.name,
        desc: vibe.desc,
        traits: vibe.traits,
      },
      scores: scoring,
      meta: {
        completedAt: new Date().toISOString(),
        questionCount: questions.length,
      },
    };

    try {
      await saveQuizResult({
        personality: vibe.name,
        quizResult,
        vibeTraits: vibe.traits,
      });
      setSavedResult(quizResult.vibe);
      setIsRetaking(false);
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveError("We couldn't save your quiz results to your profile.");
      console.error("Failed to save quiz results:", error);
    }
  }

  const quiz = useQuiz({
    questions,
    onComplete: handleQuizComplete,
    quizScoring,
  });

  function handleRestart() {
    setIsRetaking(true);
    setSaveStatus("idle");
    setSaveError("");
    quiz.restart();
  }

  const resultToDisplay = quiz.result || savedResult;
  const shouldShowResults = Boolean(resultToDisplay) && !isRetaking;

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <h1 className="text-6xl font-bold text-white">Vibe Quiz</h1>
      {isLoadingSavedResult ? (
        <p className="mt-4 text-white">Loading your saved quiz...</p>
      ) : shouldShowResults ? (
        <DisplayQuizResults
          result={resultToDisplay}
          restart={handleRestart}
          saveError={saveError}
          saveStatus={saveStatus}
        />
      ) : (
        <QuizForm {...quiz} />
      )}
    </div>
  );
}
