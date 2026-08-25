// import {lookupSet} from "./lib/api.ts";
import { Routes, Route } from "react-router";
import {LoginPage} from "./pages/LoginPage.tsx";
import {AuthLayout} from "./features/auth/AuthLayout.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {FeatureGuard} from "./features/FeatureGuard.tsx";
import {ScanPage} from "./pages/ScanPage.tsx";
import {CollectionPage} from "./pages/CollectionPage.tsx";
import {HomePage} from "@/pages/HomePage.tsx";
import {SidebarLayout} from "@/features/sidebar/SidebarLayout.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<SidebarLayout />}>
          <Route index element={<HomePage />} />

          <Route element={<FeatureGuard />}>
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/collection" element={<CollectionPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
