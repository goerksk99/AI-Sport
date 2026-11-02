import type { CoachProposal } from "./personalCoach";
export type CoachMessage = {
  id: string;
  q: string;
  a: string;
  reason?: string;
  proposal?: CoachProposal;
};
export const questionKey = (text: string) =>
  text
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/\s+/g, " ")
    .replace(/[?!.]+$/, "");
/** Repeated quick questions refresh their answer instead of filling the chat. */
export function upsertCoachMessage(
  messages: CoachMessage[],
  question: string,
  answer: string,
  details?: { reason?: string; proposal?: CoachProposal },
): CoachMessage[] {
  const id = questionKey(question);
  if (!id) return messages;
  return [
    ...messages.filter((m) => questionKey(m.q) !== id),
    { id, q: question.trim(), a: answer, ...details },
  ].slice(-30);
}
