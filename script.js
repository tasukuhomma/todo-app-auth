// Firebase読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4GjwEuXlOd6e-eUv4fikFCBo8i8BYSx0",
  authDomain: "todo-app-auth-f04cb.firebaseapp.com",
  projectId: "todo-app-auth-f04cb",
  storageBucket: "todo-app-auth-f04cb.firebasestorage.app",
  messagingSenderId: "638498700051",
  appId: "1:638498700051:web:d59d5735588d8b006f38e6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// ログイン状態監視
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    showUser();
    loadTasks();
  }
});

// ログイン
window.login = function () {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {
      currentUser = result.user;
      alert("ログイン成功！");
      showUser();
      loadTasks();
    })
    .catch((error) => {
      console.error(error);
      alert("ログイン失敗");
    });
};

// ログアウト
window.logout = function () {
  signOut(auth).then(() => {
    currentUser = null;
    document.getElementById("userInfo").textContent = "";
    document.getElementById("taskList").innerHTML = "";
  });
};

// タスク追加
window.addTask = async function () {
  if (!currentUser) {
    alert("先にログインしてね");
    return;
  }

  const input = document.getElementById("taskInput");
  const text = input.value;

  if (text === "") return;

  await addDoc(collection(db, "tasks"), {
    text: text,
    uid: currentUser.uid,
    done: false
  });

  input.value = "";
  loadTasks();
};

// タスク読み込み
async function loadTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "tasks"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();

    if (data.uid !== currentUser.uid) return;

    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = data.text;

    // ✔ボタン
    const checkBtn = document.createElement("button");
    checkBtn.textContent = "✔";

    checkBtn.onclick = async () => {
      await updateDoc(doc(db, "tasks", docSnap.id), {
        done: !data.done
      });
      loadTasks();
    };

    // 削除ボタン
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";

    deleteBtn.onclick = async () => {
      await deleteDoc(doc(db, "tasks", docSnap.id));
      loadTasks();
    };

    // 完了したら線
    if (data.done) {
      span.style.textDecoration = "line-through";
    }

    li.appendChild(span);
    li.appendChild(checkBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

// ユーザー表示
function showUser() {
  const userInfo = document.getElementById("userInfo");
  userInfo.textContent = currentUser.displayName + " でログイン中";
}

// Enterで追加
document.getElementById("taskInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    addTask();
  }
});

const btnGroup = document.createElement("div");

btnGroup.appendChild(checkBtn);
btnGroup.appendChild(deleteBtn);

li.appendChild(span);
li.appendChild(btnGroup);

if (list.innerHTML === "") {
  list.innerHTML = "<p style='opacity:0.7'>タスクがまだありません</p>";
}