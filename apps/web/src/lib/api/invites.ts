export async function rotateShareLink(
  planId: string
): Promise<{ shareLinkId: string }> {
  const res = await fetch(`/api/travel/${planId}/share-link/rotate`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to rotate share link');
  }
  return (await res.json()) as { shareLinkId: string };
}

export async function verifyShareLink(shareId: string) {
  const res = await fetch(`/api/invites/plan/${shareId}`);
  if (!res.ok) return null;
  return (await res.json()) as { planId: string; title: string };
}

export async function acceptShareLink(
  shareId: string
): Promise<{ planId: string }> {
  const res = await fetch(`/api/invites/plan/${shareId}/accept`, {
    method: 'POST',
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 409) throw new Error('ALREADY_PARTICIPANT');
  if (res.status === 422) throw new Error('PARTICIPATION_LIMIT_EXCEEDED');
  if (res.status === 410) throw new Error('LINK_EXPIRED');
  if (res.status === 400) throw new Error('INVALID_REQUEST');
  if (res.status === 423) throw new Error('LINK_CLOSED');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as any);
    const detail = (body as any)?.detail as string | undefined;
    throw new Error(detail ? `FAILED:${detail}` : 'FAILED');
  }
  return (await res.json()) as { planId: string };
}
