export const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

export const num = (n: number) => new Intl.NumberFormat("pt-BR").format(n || 0);

export const robuxToBRL = (robux: number, pricePer100 = 3.8) =>
  +(robux / 100 * pricePer100).toFixed(2);

export const relative = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora mesmo";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
};
