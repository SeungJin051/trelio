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
  if (!res.ok) throw new Error('FAILED');
  return (await res.json()) as { planId: string };
}
