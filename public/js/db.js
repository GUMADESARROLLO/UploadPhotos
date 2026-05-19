const SERVER = typeof window !== "undefined" ? window.location.origin : "";

export async function uploadPhotoToServer(file, userName, email, guestId) {
  const form = new FormData();
  form.append("file", file);
  form.append("userName", userName);
  form.append("email", email || "");
  if (guestId) form.append("guestId", guestId);
  try {
    const res = await fetch(SERVER + "/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

export async function deletePhotoFromServer(url) {
  try {
    await fetch(SERVER + url, { method: "DELETE" });
  } catch {
  }
}

export async function fetchUsersFromServer() {
  try {
    const res = await fetch(SERVER + "/api/users");
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchPhotosByGuest(guestId) {
  try {
    const res = await fetch(SERVER + "/api/photos-by-guest/" + guestId);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchPhotoBlobFromServer(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return await res.blob();
  } catch {
    return null;
  }
}
