/**
 * Возвращает текущее время в минутах с начала дня по московскому времени.
 * Используем вычисление по UTC с добавлением смещения для Москвы (UTC+3).
 */
export function getMoscowCurrentMinutes() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const moscowTime = new Date(utc + 3 * 3600000);
    return moscowTime.getHours() * 60 + moscowTime.getMinutes();
  }
  
  /**
   * Фильтрует массив времени (строки вида "HH:MM") по интервалу от текущего московского времени.
   * Если переданный параметр не является массивом, возвращается пустой массив.
   * Добавлены логи для отладки.
   * @param {string[]} times - массив времени (например, ["6:20", "7:35", ...])
   * @param {number} filterHours - интервал в часах для фильтрации
   * @returns {string[]} отфильтрованные времена
   */
  export function filterTimes(times, filterHours) {
    if (!Array.isArray(times)) {
      console.log('filterTimes: переданный times не является массивом', times);
      return [];
    }
    const currentMinutes = getMoscowCurrentMinutes();
    const endMinutes = currentMinutes + filterHours * 60;

    const result = times.filter(timeStr => {
      if (typeof timeStr !== 'string') return false;
      const trimmed = timeStr.trim();
      const parts = trimmed.split(':');
      if (parts.length !== 2) return false;
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (isNaN(hours) || isNaN(minutes)) return false;
      const timeMinutes = hours * 60 + minutes;

      return timeMinutes >= currentMinutes && timeMinutes <= endMinutes;
    });
    return result;
  }
  
  /**
   * Определяет, какой день недели по московскому времени.
   * @returns {string} "weekdays" для будних дней, "saturday" для субботы, "sunday" для воскресенья.
   */
  export function getDayKey() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const moscowTime = new Date(utc + 3 * 3600000);
    const day = moscowTime.getDay(); // 0 - воскресенье, 6 - суббота, 1-5 - будние
    if (day === 0) return 'sunday';
    else if (day === 6) return 'saturday';
    else return 'weekdays';
  }

  /**
 * Форматирует массив временных точек для красивого вывода.
 * Делит массив на строки по не более 5 точек и оборачивает результат в теги <pre>
 * для моноширинного отображения.
 *
 * @param {string[]} times - массив временных точек (например, ["6:20", "7:35", ...])
 * @returns {string} отформатированный текст или 'Нет рейсов', если массив пустой
 */
export function formatTimesList(times) {
    if (!Array.isArray(times) || times.length === 0) return 'Нет рейсов';
    
    const lines = [];
    for (let i = 0; i < times.length; i += 5) {
      // Берём подмассив из не более 5 элементов и объединяем через запятую и пробел
      lines.push(times.slice(i, i + 5).join(', '));
    }
    // Оборачиваем весь текст в <pre> для моноширинного шрифта
    return `<pre>${lines.join('\n')}</pre>`;
  }

export function randomizer(maxNum) {
    return Math.floor(Math.random() * maxNum);
}