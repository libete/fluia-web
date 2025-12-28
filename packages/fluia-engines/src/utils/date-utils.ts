/**
 * Date utilities para engines
 */

export const dateUtils = {
  /**
   * Gera dateKey considerando reset às 04:00
   */
  getDateKey(timezone: string = "America/Sao_Paulo"): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === "year")?.value;
    const month = parts.find(p => p.type === "month")?.value;
    const day = parts.find(p => p.type === "day")?.value;
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "12");
    
    if (hour < 4) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return yFormatter.format(yesterday);
    }
    
    return `${year}-${month}-${day}`;
  },
};
