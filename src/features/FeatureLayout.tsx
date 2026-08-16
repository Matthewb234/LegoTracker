import { Outlet } from "react-router";

export function FeatureLayout() {
    return (
        <div>
            <h1> Features </h1>
            <Outlet />
        </div>
    )
}
