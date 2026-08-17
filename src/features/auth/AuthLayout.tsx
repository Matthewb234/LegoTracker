import { Outlet } from "react-router";

export function AuthLayout() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Outlet />
        </div>
    )
}
