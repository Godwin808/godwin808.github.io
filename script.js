/* =========================================================
   STUDENT GRADE COMPANION
   FIREBASE + FIRESTORE + APPLICATION
========================================================= */


/* =========================================================
   FIREBASE APP
========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* =========================================================
   FIREBASE AUTHENTICATION
========================================================= */

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyB_VuZQTtfIrro2UdLzVgAg55uzl209hm8",

  authDomain:
    "students-grade-companion.firebaseapp.com",

  projectId:
    "students-grade-companion",

  storageBucket:
    "students-grade-companion.firebasestorage.app",

  messagingSenderId:
    "174125744911",

  appId:
    "1:174125744911:web:ea57e6ba35c6dd7e82747a",

  measurementId:
    "G-5N79RQPGDT"

};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const firebaseApp =
  initializeApp(firebaseConfig);

const auth =
  getAuth(firebaseApp);

const db =
  getFirestore(firebaseApp);

const googleProvider =
  new GoogleAuthProvider();


/* =========================================================
   APPLICATION STATE
========================================================= */

let currentUser = null;

let currentResult = null;

let leaderboardStudents = [];

let comparisonStudents = [];

let undoStack = [];

let redoStack = [];


/* =========================================================
   SUBJECTS
========================================================= */

const defaultSubjects = [

  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Civic Education",
  "Agric/TD",
  "GSM",
  "Further Mathematics",
  "Geography",
  "Dressmaking",
  "Economics"

];


/* =========================================================
   AUTH MESSAGE
========================================================= */

function authMessage(
  message,
  type = "info"
) {

  const element =
    document.getElementById(
      "authMessage"
    );

  if (!element) return;

  element.textContent =
    message;

  element.style.color =
    type === "error"
      ? "#f87171"
      : "#a78bfa";

}


/* =========================================================
   AUTH SCREENS
========================================================= */

window.showLogin =
  function () {

    document
      .getElementById("loginForm")
      .classList
      .remove("hidden");

    document
      .getElementById("registerForm")
      .classList
      .add("hidden");

    document
      .getElementById("forgotForm")
      .classList
      .add("hidden");

    authMessage("");

  };


window.showRegister =
  function () {

    document
      .getElementById("loginForm")
      .classList
      .add("hidden");

    document
      .getElementById("registerForm")
      .classList
      .remove("hidden");

    document
      .getElementById("forgotForm")
      .classList
      .add("hidden");

    authMessage("");

  };


window.showForgotPassword =
  function () {

    document
      .getElementById("loginForm")
      .classList
      .add("hidden");

    document
      .getElementById("registerForm")
      .classList
      .add("hidden");

    document
      .getElementById("forgotForm")
      .classList
      .remove("hidden");

    authMessage("");

  };


/* =========================================================
   REGISTER
========================================================= */

window.registerUser =
  async function () {

    const name =
      document
        .getElementById("registerName")
        .value
        .trim();

    const email =
      document
        .getElementById("registerEmail")
        .value
        .trim();

    const password =
      document
        .getElementById("registerPassword")
        .value;

    const confirmPassword =
      document
        .getElementById("registerConfirmPassword")
        .value;


    if (
      !name ||
      !email ||
      !password
    ) {

      authMessage(
        "Please complete all fields.",
        "error"
      );

      return;

    }


    if (
      password.length < 6
    ) {

      authMessage(
        "Password must contain at least 6 characters.",
        "error"
      );

      return;

    }


    if (
      password !==
      confirmPassword
    ) {

      authMessage(
        "Passwords do not match.",
        "error"
      );

      return;

    }


    authMessage(
      "Creating your account..."
    );


    try {

      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      await updateProfile(
        result.user,
        {
          displayName:
            name
        }
      );


      authMessage(
        "Account created successfully!"
      );


    } catch (error) {

      console.error(error);

      authMessage(
        getFriendlyAuthError(error),
        "error"
      );

    }

  };


/* =========================================================
   LOGIN
========================================================= */

window.loginUser =
  async function () {

    const email =
      document
        .getElementById("loginEmail")
        .value
        .trim();

    const password =
      document
        .getElementById("loginPassword")
        .value;


    if (
      !email ||
      !password
    ) {

      authMessage(
        "Please enter your email and password.",
        "error"
      );

      return;

    }


    authMessage(
      "Signing you in..."
    );


    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      authMessage(
        "Login successful!"
      );


    } catch (error) {

      console.error(error);

      authMessage(
        getFriendlyAuthError(error),
        "error"
      );

    }

  };


/* =========================================================
   GOOGLE LOGIN
========================================================= */

window.googleLogin =
  async function () {

    authMessage(
      "Opening Google sign-in..."
    );


    try {

      await signInWithPopup(
        auth,
        googleProvider
      );


    } catch (error) {

      console.error(error);


      if (
        error.code ===
        "auth/popup-closed-by-user"
      ) {

        authMessage(
          "Google sign-in was cancelled.",
          "error"
        );

        return;

      }


      authMessage(
        getFriendlyAuthError(error),
        "error"
      );

    }

  };


/* =========================================================
   PASSWORD RESET
========================================================= */

window.resetPassword =
  async function () {

    const email =
      document
        .getElementById("forgotEmail")
        .value
        .trim();


    if (!email) {

      authMessage(
        "Please enter your email address.",
        "error"
      );

      return;

    }


    authMessage(
      "Sending password reset email..."
    );


    try {

      await sendPasswordResetEmail(
        auth,
        email
      );


      authMessage(
        "Password reset email sent. Check your inbox."
      );


    } catch (error) {

      console.error(error);

      authMessage(
        getFriendlyAuthError(error),
        "error"
      );

    }

  };


/* =========================================================
   LOGOUT
========================================================= */

window.logoutUser =
  async function () {

    try {

      await signOut(
        auth
      );

    } catch (error) {

      console.error(error);

    }

  };


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
  auth,
  async user => {

    currentUser =
      user;


    const authScreen =
      document.getElementById(
        "authScreen"
      );

    const appScreen =
      document.getElementById(
        "appScreen"
      );


    if (user) {

      authScreen
        .classList
        .add("hidden");

      appScreen
        .classList
        .remove("hidden");


      await initializeApplication(
        user
      );

    } else {

      authScreen
        .classList
        .remove("hidden");

      appScreen
        .classList
        .add("hidden");

    }

  }
);


/* =========================================================
   FRIENDLY FIREBASE ERRORS
========================================================= */

function getFriendlyAuthError(
  error
) {

  switch (error.code) {

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-not-found":
      return "No account was found with that email.";

    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/email-already-in-use":
      return "An account already exists with this email.";

    case "auth/weak-password":
      return "Please choose a stronger password.";

    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup.";

    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    default:
      return error.message ||
        "Something went wrong. Please try again.";

  }

}


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

async function initializeApplication(
  user
) {

  const name =
    user.displayName ||
    "Student";


  document.getElementById(
    "welcomeText"
  ).textContent =
    `Welcome, ${name}!`;


  document.getElementById(
    "profileName"
  ).value =
    name;


  document.getElementById(
    "profileEmail"
  ).value =
    user.email ||
    "";


  const savedPicture =
    localStorage.getItem(
      profilePictureKey()
    );


  setProfilePicture(
    savedPicture ||
    user.photoURL
  );


  loadTheme();


  createDefaultSubjects();


  await loadSavedResults();


  initializeLeaderboard();


  initializeComparison();


  await updateDashboard();


  loadQuote();


  showSection(
    "home"
  );

}


/* =========================================================
   PROFILE PICTURE
========================================================= */

function setProfilePicture(
  url
) {

  const image =
    document.getElementById(
      "profilePicture"
    );

  const topImage =
    document.getElementById(
      "topProfilePicture"
    );


  const fallback =
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(
      currentUser?.displayName ||
      "Student"
    );


  const source =
    url ||
    fallback;


  if (image)
    image.src =
      source;

  if (topImage)
    topImage.src =
      source;

}


window.changeProfilePicture =
  function (event) {

    const file =
      event.target.files[0];

    if (!file)
      return;


    const reader =
      new FileReader();


    reader.onload =
      function () {

        setProfilePicture(
          reader.result
        );


        localStorage.setItem(
          profilePictureKey(),
          reader.result
        );

      };


    reader.readAsDataURL(
      file
    );

  };


function profilePictureKey() {

  return currentUser
    ? `profilePicture_${currentUser.uid}`
    : "profilePicture";

}


window.saveProfile =
  async function () {

    if (!currentUser)
      return;


    const name =
      document
        .getElementById("profileName")
        .value
        .trim();


    if (!name) {

      alert(
        "Please enter your name."
      );

      return;

    }


    try {

      await updateProfile(
        currentUser,
        {
          displayName:
            name
        }
      );


      document.getElementById(
        "welcomeText"
      ).textContent =
        `Welcome, ${name}!`;


      setProfilePicture(
        localStorage.getItem(
          profilePictureKey()
        )
      );


      alert(
        "Profile updated successfully."
      );


    } catch (error) {

      console.error(error);

      alert(
        "Unable to update profile."
      );

    }

  };


/* =========================================================
   NAVIGATION
========================================================= */

window.showSection =
  function (section) {

    const sections = [

      "home",
      "calculator",
      "target",
      "leaderboard",
      "comparison",
      "profile",
      "about"

    ];


    sections.forEach(
      name => {

        const element =
          document.getElementById(
            name + "Section"
          );


        if (element) {

          element.classList.toggle(
            "hidden",
            name !== section
          );

        }

      }
    );


    document
      .querySelectorAll(
        ".menu-item"
      )
      .forEach(
        button => {

          button.classList.remove(
            "active"
          );

        }
      );


    const buttons =
      document.querySelectorAll(
        ".menu-item"
      );


    const index =
      sections.indexOf(
        section
      );


    if (
      index >= 0 &&
      buttons[index]
    ) {

      buttons[index]
        .classList
        .add("active");

    }


    const titles = {

      home:
        "Student Grade Companion",

      calculator:
        "Grade Calculator",

      target:
        "Grade Target",

      leaderboard:
        "Leaderboard",

      comparison:
        "Score Comparison",

      profile:
        "My Profile",

      about:
        "About"

    };


    document.getElementById(
      "pageTitle"
    ).textContent =
      titles[section] ||
      "Student Grade Companion";


    const sidebar =
      document.getElementById(
        "sidebar"
      );


    if (sidebar) {

      sidebar.classList.remove(
        "open"
      );

    }

  };


window.toggleSidebar =
  function () {

    document
      .getElementById(
        "sidebar"
      )
      .classList
      .toggle("open");

  };


/* =========================================================
   THEME
========================================================= */

window.toggleTheme =
  function () {

    const toggle =
      document.getElementById(
        "themeToggle"
      );


    document.body.classList.toggle(
      "light-mode",
      toggle.checked
    );


    localStorage.setItem(
      "theme",
      toggle.checked
        ? "light"
        : "dark"
    );

  };


function loadTheme() {

  const theme =
    localStorage.getItem(
      "theme"
    );


  const toggle =
    document.getElementById(
      "themeToggle"
    );


  if (!toggle)
    return;


  if (
    theme === "light"
  ) {

    document.body
      .classList
      .add("light-mode");

    toggle.checked =
      true;

  } else {

    document.body
      .classList
      .remove("light-mode");

    toggle.checked =
      false;

  }

}


/* =========================================================
   SUBJECT CREATION
========================================================= */

function createDefaultSubjects() {

  const container =
    document.getElementById(
      "subjects"
    );


  if (!container)
    return;


  if (
    container.children.length > 0
  ) {

    return;

  }


  defaultSubjects.forEach(
    subject => {

      createSubjectRow(
        subject
      );

    }
  );

}


function createSubjectRow(
  subjectName
) {

  const container =
    document.getElementById(
      "subjects"
    );


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "subject-row";


  row.dataset.subject =
    subjectName;


  row.innerHTML = `

    <div>

      <label>
        ${escapeHTML(
          subjectName
        )}
      </label>

    </div>


    <div>

      <label>
        Test / CA (40)
      </label>

      <input
        type="number"
        class="test-score"
        min="0"
        max="40"
        placeholder="0 - 40"
      >

    </div>


    <div>

      <label>
        Exam (60)
      </label>

      <input
        type="number"
        class="exam-score"
        min="0"
        max="60"
        placeholder="0 - 60"
      >

      <div class="subject-total">
        Total:
        <strong>0</strong>/100
      </div>

      <button
        type="button"
        class="remove-subject"
      >
        ✕ Remove
      </button>

    </div>

  `;


  const test =
    row.querySelector(
      ".test-score"
    );


  const exam =
    row.querySelector(
      ".exam-score"
    );


  const total =
    row.querySelector(
      ".subject-total strong"
    );


  function updateTotal() {

    let testScore =
      Number(
        test.value
      ) || 0;


    let examScore =
      Number(
        exam.value
      ) || 0;


    testScore =
      Math.max(
        0,
        Math.min(
          40,
          testScore
        )
      );


    examScore =
      Math.max(
        0,
        Math.min(
          60,
          examScore
        )
      );


    total.textContent =
      testScore +
      examScore;

  }


  test.addEventListener(
    "input",
    updateTotal
  );


  exam.addEventListener(
    "input",
    updateTotal
  );


  row
    .querySelector(
      ".remove-subject"
    )
    .addEventListener(
      "click",
      () => {

        saveUndoState();

        row.remove();

      }
    );


  container.appendChild(
    row
  );

}


window.addSubject =
  function () {

    const name =
      prompt(
        "Enter the subject name:"
      );


    if (
      !name ||
      !name.trim()
    ) {

      return;

    }


    saveUndoState();


    createSubjectRow(
      name.trim()
    );

  };


/* =========================================================
   CALCULATE GRADE
========================================================= */

window.calculateGrade =
  function () {

    const rows =
      document.querySelectorAll(
        ".subject-row"
      );


    const subjects = [];

    let total = 0;


    rows.forEach(
      row => {

        const test =
          Number(
            row.querySelector(
              ".test-score"
            ).value
          ) || 0;


        const exam =
          Number(
            row.querySelector(
              ".exam-score"
            ).value
          ) || 0;


        if (
          test === 0 &&
          exam === 0
        ) {

          return;

        }


        const score =
          Math.min(
            40,
            Math.max(
              0,
              test
            )
          ) +
          Math.min(
            60,
            Math.max(
              0,
              exam
            )
          );


        const subject =
          row.dataset.subject;


        const grade =
          getGrade(
            score
          );


        subjects.push({

          subject,

          test,

          exam,

          score,

          grade:
            grade.grade,

          remark:
            grade.remark

        });


        total +=
          score;

      }
    );


    if (
      subjects.length === 0
    ) {

      document.getElementById(
        "result"
      ).innerHTML =
        "<p>Please enter at least one score.</p>";

      currentResult =
        null;

      return;

    }


    const average =
      total /
      subjects.length;


    const overall =
      getGrade(
        average
      );


    currentResult = {

      name:
        document.getElementById(
          "studentName"
        ).value.trim()
        ||
        currentUser?.displayName
        ||
        "Student",

      studentClass:
        document.getElementById(
          "studentClass"
        ).value.trim()
        ||
        "Not specified",

      term:
        document.getElementById(
          "studentTerm"
        ).value
        ||
        "Not specified",

      session:
        document.getElementById(
          "studentSession"
        ).value.trim()
        ||
        "Not specified",

      total,

      count:
        subjects.length,

      average,

      grade:
        overall.grade,

      remark:
        overall.remark,

      subjects

    };


    displayResult(
      currentResult
    );

  };


function getGrade(
  score
) {

  if (
    score >= 80
  )
    return {
      grade: "A",
      remark: "Excellent"
    };


  if (
    score >= 70
  )
    return {
      grade: "B",
      remark: "Very Good"
    };


  if (
    score >= 60
  )
    return {
      grade: "C",
      remark: "Good"
    };


  if (
    score >= 50
  )
    return {
      grade: "D",
      remark: "Pass"
    };


  if (
    score >= 40
  )
    return {
      grade: "E",
      remark: "Fair"
    };


  return {
    grade: "F",
    remark: "Fail"
  };

}


/* =========================================================
   DISPLAY RESULT
========================================================= */

async function displayResult(
  data
) {

  let rows = "";


  data.subjects.forEach(
    item => {

      rows += `

        <tr>

          <td>
            ${escapeHTML(
              item.subject
            )}
          </td>

          <td>
            ${item.test}/40
          </td>

          <td>
            ${item.exam}/60
          </td>

          <td>
            ${item.score}/100
          </td>

          <td class="grade-${item.grade.toLowerCase()}">
            ${item.grade}
          </td>

          <td>
            ${escapeHTML(
              item.remark
            )}
          </td>

        </tr>

      `;

    }
  );


  const position =
    await getStudentPosition(
      data.average
    );


  document.getElementById(
    "result"
  ).innerHTML = `

    <div class="result-card">

      <h2>
        🎓 STUDENT ACADEMIC RESULT
      </h2>


      <div class="student-details">

        <div class="student-detail">

          <span>Name</span>

          <strong>
            ${escapeHTML(
              data.name
            )}
          </strong>

        </div>


        <div class="student-detail">

          <span>Class</span>

          <strong>
            ${escapeHTML(
              data.studentClass
            )}
          </strong>

        </div>


        <div class="student-detail">

          <span>Term</span>

          <strong>
            ${escapeHTML(
              data.term
            )}
          </strong>

        </div>


        <div class="student-detail">

          <span>Session</span>

          <strong>
            ${escapeHTML(
              data.session
            )}
          </strong>

        </div>

      </div>


      <div class="grade-display">
        ${data.grade}
      </div>


      <table class="result-table">

        <thead>

          <tr>

            <th>Subject</th>

            <th>Test</th>

            <th>Exam</th>

            <th>Total</th>

            <th>Grade</th>

            <th>Remark</th>

          </tr>

        </thead>


        <tbody>
          ${rows}
        </tbody>

      </table>


      <div class="summary">

        <div class="summary-box">

          <span>Total</span>

          <strong>
            ${data.total}
          </strong>

        </div>


        <div class="summary-box">

          <span>Average</span>

          <strong>
            ${data.average.toFixed(2)}%
          </strong>

        </div>


        <div class="summary-box">

          <span>Grade</span>

          <strong>
            ${data.grade}
          </strong>

        </div>


        <div class="summary-box">

          <span>Position</span>

          <strong>
            ${position}
          </strong>

        </div>

      </div>


      <div
        class="summary-box"
        style="margin-top:10px;"
      >

        <span>
          Overall Remark
        </span>

        <strong>
          ${escapeHTML(
            data.remark
          )}
        </strong>

      </div>

    </div>

  `;

}


/* =========================================================
   CLOUD SAVE RESULT
========================================================= */

window.saveResult =
  async function () {

    if (!currentResult) {

      calculateGrade();

    }


    if (
      !currentResult ||
      !currentUser
    ) {

      return;

    }


    try {

      await addDoc(

        collection(
          db,
          "users",
          currentUser.uid,
          "results"
        ),

        {

          ...currentResult,

          createdAt:
            new Date()
              .toISOString()

        }

      );


      alert(
        "☁️ Result saved successfully to the cloud!"
      );


      await loadSavedResults();

      await updateDashboard();


    } catch (error) {

      console.error(
        "Error saving result:",
        error
      );


      alert(
        "Unable to save result to the cloud. Please try again."
      );

    }

  };


/* =========================================================
   LOAD CLOUD RESULTS
========================================================= */

async function loadSavedResults() {

  const container =
    document.getElementById(
      "savedResults"
    );


  if (
    !container ||
    !currentUser
  ) {

    return;

  }


  try {

    const resultsRef =
      collection(
        db,
        "users",
        currentUser.uid,
        "results"
      );


    const resultsQuery =
      query(
        resultsRef,
        orderBy(
          "createdAt",
          "desc"
        )
      );


    const snapshot =
      await getDocs(
        resultsQuery
      );


    if (
      snapshot.empty
    ) {

      container.innerHTML =
        "<h3>📚 Results History</h3><p>No saved results yet.</p>";

      return;

    }


    let html =
      "<h3>📚 Results History</h3>";


    snapshot.forEach(
      resultDoc => {

        const result =
          resultDoc.data();


        html += `

          <div class="target-card">

            <strong>
              ${escapeHTML(
                result.name ||
                "Student"
              )}
            </strong>


            <p>
              Average:
              ${Number(
                result.average ||
                0
              ).toFixed(2)}%
            </p>


            <p>
              Grade:
              ${escapeHTML(
                result.grade ||
                "-"
              )}
            </p>


            <p>
              Saved:
              ${
                result.createdAt
                  ? new Date(
                      result.createdAt
                    ).toLocaleString()
                  : "Unknown"
              }
            </p>


            <button
              type="button"
              class="reset-btn"
              onclick="deleteSavedResult('${resultDoc.id}')"
            >
              🗑️ Delete
            </button>

          </div>

        `;

      }
    );


    container.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Error loading cloud results:",
      error
    );


    container.innerHTML = `

      <div class="target-card">

        ⚠️ Unable to load your saved results.

      </div>

    `;

  }

}


/* =========================================================
   DELETE CLOUD RESULT
========================================================= */

window.deleteSavedResult =
  async function (id) {

    if (!currentUser)
      return;


    const confirmed =
      confirm(
        "Delete this saved result?"
      );


    if (!confirmed)
      return;


    try {

      await deleteDoc(

        doc(
          db,
          "users",
          currentUser.uid,
          "results",
          id
        )

      );


      await loadSavedResults();

      await updateDashboard();


    } catch (error) {

      console.error(
        "Error deleting result:",
        error
      );


      alert(
        "Unable to delete this result."
      );

    }

  };


/* =========================================================
   POSITION
========================================================= */

async function getStudentPosition(
  average
) {

  if (!currentUser)
    return "-";


  try {

    const resultsRef =
      collection(
        db,
        "users",
        currentUser.uid,
        "results"
      );


    const snapshot =
      await getDocs(
        resultsRef
      );


    const averages = [];


    snapshot.forEach(
      resultDoc => {

        const result =
          resultDoc.data();


        if (
          typeof result.average ===
          "number"
        ) {

          averages.push(
            Number(
              result.average
            )
          );

        }

      }
    );


    averages.push(
      Number(average)
    );


    averages.sort(
      (a, b) =>
        b - a
    );


    const position =
      averages.indexOf(
        Number(average)
      ) + 1;


    if (
      position === 1
    )
      return "🥇 1st";


    if (
      position === 2
    )
      return "🥈 2nd";


    if (
      position === 3
    )
      return "🥉 3rd";


    return `${position}th`;


  } catch (error) {

    console.error(
      "Position error:",
      error
    );


    return "-";

  }

}


/* =========================================================
   LEADERBOARD
========================================================= */

function initializeLeaderboard() {

  const container =
    document.getElementById(
      "leaderboardInputs"
    );


  if (
    !container
  )
    return;


  if (
    container.children.length === 0
  ) {

    addLeaderboardStudent();

    addLeaderboardStudent();

    addLeaderboardStudent();

  }

}


window.addLeaderboardStudent =
  function () {

    const container =
      document.getElementById(
        "leaderboardInputs"
      );


    const row =
      document.createElement(
        "div"
      );


    row.className =
      "leaderboard-row";


    row.innerHTML = `

      <input
        type="text"
        placeholder="Student name"
        class="leader-name"
      >


      <input
        type="number"
        placeholder="Score / 100"
        min="0"
        max="100"
        class="leader-score"
      >


      <button
        type="button"
        class="remove-subject"
      >
        ✕
      </button>

    `;


    row
      .querySelector(
        "button"
      )
      .onclick =
      () =>
        row.remove();


    container.appendChild(
      row
    );

  };


window.calculateLeaderboard =
  function () {

    const rows =
      document.querySelectorAll(
        ".leaderboard-row"
      );


    const students = [];


    rows.forEach(
      row => {

        const name =
          row.querySelector(
            ".leader-name"
          ).value.trim();


        const score =
          Number(
            row.querySelector(
              ".leader-score"
            ).value
          );


        if (
          name &&
          !Number.isNaN(
            score
          )
        ) {

          students.push({
            name,
            score
          });

        }

      }
    );


    students.sort(
      (a, b) =>
        b.score -
        a.score
    );


    let html =
      `<div class="leaderboard-result">`;


    students.forEach(
      (student, index) => {

        let medal =
          "";


        if (
          index === 0
        )
          medal =
            "🥇";


        else if (
          index === 1
        )
          medal =
            "🥈";


        else if (
          index === 2
        )
          medal =
            "🥉";


        else
          medal =
            `${index + 1}.`;


        html += `

          <div class="leaderboard-item">

            <div class="medal">
              ${medal}
            </div>


            <div>

              <strong>
                ${escapeHTML(
                  student.name
                )}
              </strong>


              <p>
                ${student.score}/100
              </p>

            </div>

          </div>

        `;

      }
    );


    html +=
      "</div>";


    document.getElementById(
      "leaderboardResult"
    ).innerHTML =
      html;

  };


/* =========================================================
   GRADE TARGET
========================================================= */

window.calculateTarget =
  function () {

    const previous =
      Number(
        document.getElementById(
          "previousPercentage"
        ).value
      );


    const target =
      Number(
        document.getElementById(
          "targetPercentage"
        ).value
      );


    const container =
      document.getElementById(
        "targetResult"
      );


    if (
      Number.isNaN(
        previous
      ) ||
      Number.isNaN(
        target
      ) ||
      previous < 0 ||
      previous > 100 ||
      target < 0 ||
      target > 100
    ) {

      container.innerHTML = `

        <div class="target-card">

          Please enter percentages
          between 0 and 100.

        </div>

      `;

      return;

    }


    const difference =
      target -
      previous;


    let message =
      "";


    if (
      difference <= 0
    ) {

      message = `

        <div class="target-card">

          🎉 You have already reached
          your target.

          Keep maintaining your
          performance!

        </div>

      `;

    } else {

      message = `

        <div class="target-card">

          <h3>
            🎯 Your Target
          </h3>


          <p>
            Previous:
            <strong>
              ${previous}%
            </strong>
          </p>


          <p>
            Target:
            <strong>
              ${target}%
            </strong>
          </p>


          <p>
            Improvement needed:
            <strong>
              ${difference.toFixed(2)}%
            </strong>
          </p>


          <div class="target-method">

            📚 Focus on subjects where
            your scores are lowest and
            aim for consistent improvement.

          </div>


          <div class="target-method">

            📝 Aim to score at least
            <strong>
              ${target}%
            </strong>
            in your upcoming assessments.

          </div>


          <div class="target-method">

            📈 Small improvements across
            several subjects can combine
            to produce a large overall
            improvement.

          </div>

        </div>

      `;

    }


    container.innerHTML =
      message;

  };


/* =========================================================
   SCORE COMPARISON
========================================================= */

function initializeComparison() {

  const container =
    document.getElementById(
      "comparisonStudents"
    );


  if (!container)
    return;


  if (
    container.children.length === 0
  ) {

    addComparisonStudent();

    addComparisonStudent();

  }

}


window.addComparisonStudent =
  function () {

    const container =
      document.getElementById(
        "comparisonStudents"
      );


    const row =
      document.createElement(
        "div"
      );


    row.className =
      "comparison-row";


    row.innerHTML = `

      <h3>
        Student
      </h3>


      <input
        type="text"
        placeholder="Student name"
        class="comparison-name"
      >


      <div class="comparison-subjects">

        ${defaultSubjects
          .slice(0, 6)
          .map(
            subject => `

              <input
                type="number"
                min="0"
                max="100"
                placeholder="${escapeHTML(
                  subject
                )}"
                data-subject="${escapeHTML(
                  subject
                )}"
                class="comparison-score"
              >

            `
          )
          .join("")
        }

      </div>


      <button
        type="button"
        class="remove-subject"
      >
        ✕ Remove Student
      </button>

    `;


    row
      .querySelector(
        ".remove-subject"
      )
      .onclick =
      () =>
        row.remove();


    container.appendChild(
      row
    );

  };


window.compareScores =
  function () {

    const rows =
      document.querySelectorAll(
        ".comparison-row"
      );


    const students = [];


    rows.forEach(
      row => {

        const name =
          row.querySelector(
            ".comparison-name"
          ).value.trim();


        if (!name)
          return;


        const scores = {};


        row
          .querySelectorAll(
            ".comparison-score"
          )
          .forEach(
            input => {

              scores[
                input.dataset.subject
              ] =
                Number(
                  input.value
                ) || 0;

            }
          );


        students.push({
          name,
          scores
        });

      }
    );


    if (
      students.length < 2
    ) {

      document.getElementById(
        "comparisonResult"
      ).innerHTML = `

        <div class="target-card">

          Add at least two students.

        </div>

      `;

      return;

    }


    let html = `

      <div class="target-card">

        <h3>
          📊 Comparison
        </h3>

    `;


    defaultSubjects
      .slice(0, 6)
      .forEach(
        subject => {

          html += `

            <p>

              <strong>
                ${escapeHTML(
                  subject
                )}
              </strong>

              <br>

          `;


          students.forEach(
            student => {

              html += `

                ${escapeHTML(
                  student.name
                )}:
                ${student.scores[
                  subject
                ] || 0}/100

                <br>

              `;

            }
          );


          html +=
            "</p><hr>";

        }
      );


    html +=
      "</div>";


    document.getElementById(
      "comparisonResult"
    ).innerHTML =
      html;

  };


/* =========================================================
   UNDO / REDO
========================================================= */

function getCalculatorState() {

  const rows =
    document.querySelectorAll(
      ".subject-row"
    );


  return {

    subjects:
      Array.from(
        rows
      ).map(
        row => ({

          name:
            row.dataset.subject,

          test:
            row.querySelector(
              ".test-score"
            ).value,

          exam:
            row.querySelector(
              ".exam-score"
            ).value

        })
      )

  };

}


function restoreCalculatorState(
  state
) {

  const container =
    document.getElementById(
      "subjects"
    );


  container.innerHTML =
    "";


  state.subjects.forEach(
    item => {

      createSubjectRow(
        item.name
      );


      const row =
        container.lastElementChild;


      row.querySelector(
        ".test-score"
      ).value =
        item.test;


      row.querySelector(
        ".exam-score"
      ).value =
        item.exam;


      row.querySelector(
        ".test-score"
      ).dispatchEvent(
        new Event(
          "input"
        )
      );

    }
  );

}


function saveUndoState() {

  undoStack.push(
    getCalculatorState()
  );


  if (
    undoStack.length > 30
  ) {

    undoStack.shift();

  }


  redoStack =
    [];

}


window.undoAction =
  function () {

    if (
      undoStack.length === 0
    ) {

      return;

    }


    redoStack.push(
      getCalculatorState()
    );


    const state =
      undoStack.pop();


    restoreCalculatorState(
      state
    );

  };


window.redoAction =
  function () {

    if (
      redoStack.length === 0
    ) {

      return;

    }


    undoStack.push(
      getCalculatorState()
    );


    const state =
      redoStack.pop();


    restoreCalculatorState(
      state
    );

  };


/* =========================================================
   RESET
========================================================= */

window.resetCalculator =
  function () {

    const confirmed =
      confirm(
        "Reset all calculator information?"
      );


    if (!confirmed)
      return;


    document.getElementById(
      "studentName"
    ).value =
      "";


    document.getElementById(
      "studentClass"
    ).value =
      "";


    document.getElementById(
      "studentTerm"
    ).value =
      "";


    document.getElementById(
      "studentSession"
    ).value =
      "";


    document.getElementById(
      "subjects"
    ).innerHTML =
      "";


    createDefaultSubjects();


    document.getElementById(
      "result"
    ).innerHTML =
      "";


    currentResult =
      null;

  };


/* =========================================================
   PRINT
========================================================= */

window.printResults =
  function () {

    if (!currentResult) {

      calculateGrade();

    }


    if (!currentResult)
      return;


    window.print();

  };


/* =========================================================
   PDF
========================================================= */

window.downloadPDF =
  function () {

    if (!currentResult) {

      calculateGrade();

    }


    if (!currentResult)
      return;


    alert(
      "Choose 'Save as PDF' in the print window."
    );


    window.print();

  };


/* =========================================================
   CLOUD DASHBOARD
========================================================= */

async function updateDashboard() {

  if (!currentUser)
    return;


  try {

    const resultsRef =
      collection(
        db,
        "users",
        currentUser.uid,
        "results"
      );


    const snapshot =
      await getDocs(
        resultsRef
      );


    const results = [];


    snapshot.forEach(
      resultDoc => {

        results.push(
          resultDoc.data()
        );

      }
    );


    const count =
      results.length;


    const best =
      count
        ? Math.max(
            ...results.map(
              result =>
                Number(
                  result.average ||
                  0
                )
            )
          )
        : 0;


    const achievements =
      results.filter(
        result =>
          Number(
            result.average ||
            0
          ) >= 80
      ).length;


    const dashboardResults =
      document.getElementById(
        "dashboardResults"
      );


    const dashboardBest =
      document.getElementById(
        "dashboardBest"
      );


    const dashboardAchievements =
      document.getElementById(
        "dashboardAchievements"
      );


    const profileResults =
      document.getElementById(
        "profileResults"
      );


    const profileAchievements =
      document.getElementById(
        "profileAchievements"
      );


    if (
      dashboardResults
    )
      dashboardResults.textContent =
        count;


    if (
      dashboardBest
    )
      dashboardBest.textContent =
        best.toFixed(1) +
        "%";


    if (
      dashboardAchievements
    )
      dashboardAchievements.textContent =
        achievements;


    if (
      profileResults
    )
      profileResults.textContent =
        count;


    if (
      profileAchievements
    )
      profileAchievements.textContent =
        achievements;


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


/* =========================================================
   INSPIRATION
========================================================= */

const quotes = [

  "Believe in your ability to improve.",

  "Every mistake is an opportunity to learn.",

  "Consistency can turn small improvements into great results.",

  "Your effort today can make tomorrow easier.",

  "Keep learning. Keep improving. Keep moving forward.",

  "Progress matters more than perfection."

];


function loadQuote() {

  const element =
    document.getElementById(
      "inspirationQuote"
    );


  if (!element)
    return;


  const index =
    new Date().getDate()
    % quotes.length;


  element.textContent =
    quotes[index];

}


/* =========================================================
   SECURITY HELPER
========================================================= */

function escapeHTML(
  value
) {

  return String(
    value
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   START APPLICATION
========================================================= */

loadQuote();