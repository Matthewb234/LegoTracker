import { Routes, Route } from "react-router";
import {LoginPage} from "./pages/LoginPage.tsx";
import {AuthLayout} from "./features/auth/AuthLayout.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {FeatureGuard} from "./features/FeatureGuard.tsx";
import {ScanPage} from "./pages/ScanPage.tsx";
import {CollectionPage} from "./pages/CollectionPage.tsx";
import {HomePage} from "@/pages/HomePage.tsx";
import {SidebarLayout} from "@/features/sidebar/SidebarLayout.tsx";
import {ConnectionsPage} from "@/pages/ConnectionsPage.tsx";
import {FriendCollectionPage} from "@/pages/FriendCollectionPage.tsx";
import {ProfilePage} from "@/pages/ProfilePage.tsx";
import {DebugPanel} from "@/features/pwa/DebugPanel.tsx";
import AuthCallback from "@/pages/AuthCallbackPage.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/debug" element={<DebugPanel />} />
        <Route element={<SidebarLayout />}>
          <Route index element={<HomePage />} />

          <Route element={<FeatureGuard />}>
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/edit-profile" element={<ProfilePage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/collection/:userId" element={<FriendCollectionPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
