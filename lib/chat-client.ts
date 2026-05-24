export type ChatReply = {
  content: string | null;
  threadId: string | undefined;
  assistantId: string | undefined;
};

export async function sendChatMessage(
  content: string,
  threadId?: string,
): Promise<ChatReply> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, threadId }),
  });

  if (!res.ok) {
    const { error } = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(error ?? `Chat request failed: ${res.status}`);
  }

  return res.json();
}
