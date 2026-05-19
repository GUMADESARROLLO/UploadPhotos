const DB_NAME = "WeddingPhotos";
const DB_VERSION = 1;
const STORE_PHOTOS = "photos";
const STORE_USERS = "users";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        const store = db.createObjectStore(STORE_PHOTOS, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("userName", "userName", { unique: false });
        store.createIndex("uploadedAt", "uploadedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        const store = db.createObjectStore(STORE_USERS, {
          keyPath: "userName",
        });
        store.createIndex("photoCount", "photoCount", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePhoto(file, userName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PHOTOS, STORE_USERS], "readwrite");
    const photoStore = tx.objectStore(STORE_PHOTOS);
    const userStore = tx.objectStore(STORE_USERS);

    const photo = {
      fileName: file.name,
      fileData: file,
      size: file.size,
      type: file.type,
      userName,
      uploadedAt: new Date().toISOString(),
    };

    photoStore.add(photo);

    const userReq = userStore.get(userName);
    userReq.onsuccess = () => {
      const user = userReq.result || { userName, photoCount: 0 };
      user.photoCount += 1;
      userStore.put(user);
    };

    tx.oncomplete = () => resolve(photo);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPhotosByUser(userName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, "readonly");
    const store = tx.objectStore(STORE_PHOTOS);
    const index = store.index("userName");
    const photos = [];

    const request = index.openCursor(IDBKeyRange.only(userName));
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        photos.push(cursor.value);
        cursor.continue();
      } else {
        resolve(photos);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllUsers() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_USERS, "readonly");
    const store = tx.objectStore(STORE_USERS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getPhotoBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, "readonly");
    const store = tx.objectStore(STORE_PHOTOS);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result?.fileData);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PHOTOS, STORE_USERS], "readwrite");
    const photoStore = tx.objectStore(STORE_PHOTOS);
    const userStore = tx.objectStore(STORE_USERS);

    const getReq = photoStore.get(id);
    getReq.onsuccess = () => {
      const photo = getReq.result;
      if (!photo) return resolve();

      photoStore.delete(id);

      const userReq = userStore.get(photo.userName);
      userReq.onsuccess = () => {
        const user = userReq.result;
        if (user) {
          user.photoCount -= 1;
          if (user.photoCount <= 0) {
            userStore.delete(user.userName);
          } else {
            userStore.put(user);
          }
        }
      };
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
