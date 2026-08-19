// import {lookupSet} from "./lib/api.ts";
import { Routes, Route } from "react-router";
import {LoginPage} from "./pages/LoginPage.tsx";
import {AuthLayout} from "./features/auth/AuthLayout.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {FeatureGuard} from "./features/FeatureGuard.tsx";
import {ScanPage} from "./pages/ScanPage.tsx";
import {CollectionPage} from "./pages/CollectionPage.tsx";
import {SearchPage} from "./pages/SearchPage.tsx";
import {HomePage} from "@/pages/HomePage.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<FeatureGuard />}>
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
