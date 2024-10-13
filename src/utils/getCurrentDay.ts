export function getCurrentDay(): string {
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const currentDayIndex = new Date().getDay();
    return days[currentDayIndex];
}

export function getCurrentDayIndex(day: string): number {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.indexOf(day);
}
