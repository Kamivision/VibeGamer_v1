import { useNavigate } from "react-router-dom";

export default function DisplayQuizResults({ result, restart, saveStatus, saveError }) {
    const navigate = useNavigate();

    return (
        <div className={styles.wrap}>
            <div className={styles.result}>
                <div className={styles.vibeBadge}>Your Vibe is...</div>
                <h1 className={styles.vibeName}>{result.name}</h1>
                <p className={styles.vibeDesc}>{result.desc}</p>
                <div className={styles.traitRow}>
                    {result.traits.map((t) => (
                        <span key={t} className={styles.trait}>
                            {t}
                        </span>
                    ))}
                </div>
                {saveStatus === "saving" ? (
                    <p className={styles.statusMessage}>Saving your result...</p>
                ) : null}
                {saveStatus === "saved" ? (
                    <p className={styles.statusSuccess}>Saved to your profile.</p>
                ) : null}
                {saveStatus === "error" ? (
                    <p className={styles.statusError}>{saveError}</p>
                ) : null}
                <div className={styles.resultActions}>
                    <button 
                    type="button" 
                    className={`${styles.btn} ${styles.btnPrimary}`} 
                    onClick={restart}>
                        Retake quiz
                    </button>
                    <button
                    onClick={() => navigate("/recommended")}
                    type="button" 
                    className={`${styles.btn} ${styles.btnPrimary}`}>
                        Find my games
                    </button>
                    <button
                    onClick={() => navigate("/profile")}
                    type="button" 
                    className={`${styles.btn} ${styles.btnPrimary}`}>
                        Go to My Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
        wrap: "mx-auto w-full mt-4 py-6 font-sans bg-blue-700 rounded-lg",

        result: "py-4 text-center",

        vibeBadge: "mb-4 inline-block rounded-full bg-[#EEEDFE] px-[18px] py-[6px] text-xl font-medium text-[#26215C]",

        vibeName: "mb-2 text-5xl font-bold text-cyan-500",

        vibeDesc: "mx-auto mb-6 max-w-xl text-lg leading-6 text-white",

        traitRow: "mb-6 flex flex-wrap justify-center gap-2",

        trait: "rounded-full border border-black/50 px-[10px] py-1 text-lg text-cyan-300",

        statusMessage: "mb-4 text-sm text-zinc-500",

        statusSuccess: "mb-4 text-sm text-emerald-600",

        statusError: "mb-4 text-sm text-red-600",

        resultActions: "flex justify-center gap-[10px]",

        btn: "rounded-lg border px-5 py-[9px] text-sm transition-colors duration-150",

        btnGhost: "border-black/15 bg-transparent text-[#1a1a18] hover:bg-zinc-50",

        btnPrimary: "border-[#7F77DD] bg-violet-600 text-white hover:bg-violet-400",
};