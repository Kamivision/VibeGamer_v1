import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import { userVerify } from "./utilities";
import AuthPage from "./pages/AuthPage";
import UserLibrary from "./pages/UserLibrary";
import QuizPage from "./pages/QuizPage";
import UserProfile from "./pages/UserProfile";
import NewRelease from "./pages/NewRelease";
import GenrePage from "./pages/GenrePage";
import GameDetail from "./pages/GameDetail";
import PlatformPage from "./pages/PlatformPage";
import Recommendations from "./pages/Recommendations";
import SearchResults from "./pages/SearchResults";


const router = createBrowserRouter([
  { 
        path: "/",
        element: <App/>,
        loader: userVerify,
        children:[
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "auth",
                element: <AuthPage />
            },
            {
                path: "library",
                element: <UserLibrary />
            },
            {
                path: "quiz",
                element: <QuizPage />
            },
            {
                path: "profile",
                element: <UserProfile />
            },
            {
                path: "new",
                element: <NewRelease />
            },
            {
                path: "search",
                element: <SearchResults />
            },
            {
                path: "genre/:genre",
                element: <GenrePage />
            },
            {
                path: "platform/:platform",
                element: <PlatformPage />
            },
            {
                path: "recommended",
                element: <Recommendations />

            },
            {
                path: "game/:id",
                element: <GameDetail />
            }
        ]
    },
]);

export default router;

    