import "./Room.css";
import { MatchSettings } from "./MatchSettings";

export function Room() {
    return (
        <main className="host_page">
            <div className="host_page__content">
                <MatchSettings />
            </div>
        </main>
    )
}