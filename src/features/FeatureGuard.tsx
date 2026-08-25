import {Navigate, Outlet} from "react-router";
import {useAuth} from "@/providers/auth/AuthContext";

export function FeatureGuard() {
    const { session, loading } = useAuth()

    if (loading)  {
        return null
    } else if (session == null) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />
}
