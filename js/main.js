import { handleAuth, onToggle, logout } from "./pages/auth.js";
import { changeProfile, onFileChange, toggleEdit } from "./pages/profile.js";
import { socialLogin } from "./pages/auth.js";
import { handleLocation, goTomain, goToLogin, darkBtnclick } from "./router.js";
import { authService } from "./firebase.js";
import {
  save_comment,
  update_comment,
  onEditing,
  delete_comment,
  post_onFileChange,
  getSearchResult,
  Like_Button,
  post_save_comment,
  post_getCommentList,
  post_comment_toggle,
  getCommentList,
  getCommentList_mypage,
} from "./pages/fanLog.js";

// url 바뀌면 handleLocation 실행하여 화면 변경
window.addEventListener("hashchange", handleLocation);

window.addEventListener("hashchange", () => {
  if ($("#body").hasClass("dark-theme")) {
    let darkBtn = document.getElementById("dark-btn");
    darkBtn.classList.toggle("dark-btn-on");
  }
});

// 첫 랜딩 또는 새로고침 시 handleLocation 실행하여 화면 변경
document.addEventListener("DOMContentLoaded", function () {
  // Firebase 연결상태를 감시
  authService.onAuthStateChanged((user) => {
    // Firebase 연결되면 화면 표시
    handleLocation();
    const hash = window.location.hash;
    if (user) {
      // 로그인 상태이므로 항상 팬명록 화면으로 이동
      if (hash === "") {
        // 로그인 상태에서는 로그인 화면으로 되돌아갈 수 없게 설정
        window.location.replace("#main");
      }
    }
    // else {
    //   // 로그아웃 상태이므로 로그인 화면으로 강제 이동
    //   if (hash === "") {
    //     window.location.replace("#main_before");
    //   }
    // }
  });
});

window.addEventListener("resize", function () {
  let login_layout = document.querySelector(".login_layout");
  let logo = document.querySelector(".team_logo img");
  let windowWidth = window.innerWidth,
    standard = 1300;
  if (windowWidth < standard) {
    login_layout.style.justifyContent = "center";
    logo.style.width = 0;
  } else {
    login_layout.style.justifyContent = "space-between";
    logo.style.width = "280px";
  }
});

//
// document.addEventListener("DOMContentLoaded", () => {
//   let imgName = [
//     "mount",
//     "milky_way",
//     "bridge",
//     "cat",
//     "switzerland",
//     "nature",
//     "bangtan",
//     "black_pink",
//   ];
//
//   let randomNumber = Math.floor(Math.random() * imgName.length);
//
//   document.querySelector("#background_image").src =
//     "/images/" + imgName[randomNumber] + ".jpg";
// });

// onclick, onchange, onsubmit 이벤트 핸들러 리스트
window.onToggle = onToggle;
window.handleAuth = handleAuth;
window.goTomain = goTomain;
window.socialLogin = socialLogin;
window.logout = logout;
window.onFileChange = onFileChange;
window.changeProfile = changeProfile;
window.save_comment = save_comment;
window.update_comment = update_comment;
window.onEditing = onEditing;
window.delete_comment = delete_comment;
window.toggleMenu = toggleMenu; //프로필 드롭다운 메뉴 기능 관련
window.goToLogin = goToLogin;
// test
window.post_onFileChange = post_onFileChange;
window.getSearchResult = getSearchResult;
window.toggleEdit = toggleEdit;
window.darkBtnclick = darkBtnclick;
window.Like_Button = Like_Button;
window.post_save_comment = post_save_comment;
window.post_getCommentList = post_getCommentList;
window.post_comment_toggle = post_comment_toggle;
window.getCommentList_mypage = getCommentList_mypage;
window.getCommentList = getCommentList;
