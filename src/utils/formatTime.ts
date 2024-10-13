export default function formatTime(date: Date) {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    return `${hours}:${String(minutes).length === 1 ? `0${minutes}` : minutes}`;
}
