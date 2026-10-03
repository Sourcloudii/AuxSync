import asyncio
import time

_timers: dict[str, dict] = {}

async def _timer_task(key: str, delay_secs: float, callback) -> None:
    await asyncio.sleep(delay_secs)
    _timers.pop(key, None)
    await callback()

def create_phase_timer(room_code: str, duration_ms: int, callback) -> None:
    clear_phase_timer(room_code)
    task = asyncio.create_task(_timer_task(room_code, duration_ms / 1000, callback))
    _timers[room_code] = {
        "task": task,
        "started_at": time.monotonic(),
        "duration": duration_ms,
    }

def clear_phase_timer(room_code: str) -> None:
    entry = _timers.pop(room_code, None)
    if entry:
        entry["task"].cancel()

def get_time_remaining(room_code: str) -> int:
    entry = _timers.get(room_code)
    if not entry:
        return 0
    elapsed_ms = (time.monotonic() - entry["started_at"]) * 1000
    return max(0, int(entry["duration"] - elapsed_ms))
