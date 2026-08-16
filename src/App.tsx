// import {lookupSet} from "./lib/api.ts";
import { Routes, Route } from "react-router";
import {LoginPage} from "./pages/LoginPage.tsx";
import {AuthLayout} from "./auth/AuthLayout.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {FeatureLayout} from "./features/FeatureLayout.tsx";
import {ScanPage} from "./pages/ScanPage.tsx";
import {CollectionPage} from "./pages/CollectionPage.tsx";
import {SearchPage} from "./pages/SearchPage.tsx";

function App() {
  return (
    <>
      <h1> Home </h1>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<FeatureLayout />}>
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
