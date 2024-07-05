
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getFirestore, collection,getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
let redirectLink;
const blockConfig = {
  apiKey: "AIzaSyBWqvrjcrcxMUjJ6ezhwboFWaTQa0fe7qU",
  authDomain: "blckchainn.firebaseapp.com",
  projectId: "blckchainn",
  storageBucket: "blckchainn.appspot.com",
  messagingSenderId: "664202081660",
  appId: "1:664202081660:web:59546a2d82f00e42a0a0f9",
  measurementId: "G-5BPQTQP3Y0"
};

const blockApp = initializeApp(blockConfig);
const firestore = getFirestore(blockApp);
// Get the user ID from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('usr');

// Check if the usr parameter exists
if (!userId) {
// Redirect to /index.html if the usr parameter doesn't exist
window.location.href = '/index.html';
}
const usersCollection = collection(firestore, "users");
const userDocRef = doc(usersCollection, userId);

getDoc(userDocRef)
    .then((doc) => {
        if (doc.exists()) {
            const userData = doc.data();
            const userType = userData.userType;

            if (userType === "GDC") {
              // Redirect to admin page
              redirectLink = '/gdc.html?usr=' + userId;
          } else if (userType === "Dealer Shop") {
              // Redirect to standard page
              redirectLink = '/dlr.html?usr=' + userId;
          } else if (userType === "GTD") {
            // Redirect to standard page
            redirectLink = '/gtd.html?usr=' + userId;
          } else if (userType === "Boarders"){
              // Handle other user types or redirect to a default page
              redirectLink = '/brdr.html?usr=' + userId;
          }else{
              // Handle other user types or redirect to a default page
              redirectLink = '/ur.html?usr=' + userId;
          }
          runSecondScript();
        } else {
            console.error("User document does not exist");
            window.location.href = '/index.html';
        }
        
    })
    .catch((error) => {
        console.error("Error getting user document:", error);
        runSecondScripts();
    });
    function runSecondScript() {
          var loadingAnimation = document.getElementById("lodin");
          var loadingText = document.getElementById("loadingText");
          var sentences = ["checking server status...", "connecting...", "done."];
          var index = 0;

          function changeText() {
              loadingText.textContent = sentences[index];
              index = (index + 1) % sentences.length;
              
              // Stop changing text after the last sentence
              if (index === 0) {
                  clearInterval(intervalId);

                  loadingAnimation.classList.remove("loading-animation");
                  loadingAnimation.classList.add("check-mark");
                  loadingAnimation.style.animation = "none";
                  if (redirectLink) {
                    window.location.href = redirectLink;
                  } else {
                    // Handle the case where the redirect link is not available
                    console.error("Redirect link not found");
                  }
              }
          }

          // Change text every 2 seconds (adjust as needed)
          var intervalId = setInterval(changeText, 2000);
    }
    function runSecondScripts() {
      var loadingAnimation = document.getElementById("lodin");
      var loadingText = document.getElementById("loadingText");
      var sentences = ["checking server status...", "server isnt available...", "trying again..."];
      var index = 0;

      function changeText() {
          loadingText.textContent = sentences[index];
          index = (index + 1) % sentences.length;
          
          // Stop changing text after the last sentence
          if (index === 0) {
              clearInterval(intervalId);
          }
      }

      // Change text every 2 seconds (adjust as needed)
      var intervalId = setInterval(changeText, 2000);
}