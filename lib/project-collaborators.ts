export async function getProjectCollaborators(projectId: string) {
  return []
}

export async function addCollaborator(
  projectId: string,
  email: string,
  role: "VIEWER" | "EDITOR"
) {
  return null
}

export async function removeCollaborator(projectId: string, email: string) {
  return null
}

export async function updateCollaboratorRole(
  projectId: string,
  email: string,
  role: "VIEWER" | "EDITOR"
) {
  return null
}

export function isValidCollaboratorEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function normalizeCollaboratorEmail(email: string) {
  return email.trim().toLowerCase()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getProjectShareDetails(projectId: string, identity: any) {
  return { role: "OWNER" }
}
