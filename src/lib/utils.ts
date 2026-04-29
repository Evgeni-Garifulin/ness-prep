import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Источниковые названия секций приходят из markdown-заголовков вида
// "3. JavaScript fundamentals". Слева на странице уже есть собственная
// нумерация (01, 02, …), поэтому исходный префикс "N. " при отображении
// убираем чтобы не дублировать.
export function stripSectionPrefix(title: string): string {
  return title.replace(/^\s*\d+\.\s*/, "").trim();
}
