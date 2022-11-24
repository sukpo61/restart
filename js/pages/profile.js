import { authService, storageService } from "../firebase.js";
import {
  ref,
  uploadString,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

export const changeProfile = async (event) => {
  event.preventDefault();
  console.log("함수 호출됨");

  document.getElementById("profileBtn").disabled = true;
  const imgRef = ref(
    storageService,
    `${authService.currentUser.uid}/${uuidv4()}`
  );

  const newNickname = document.getElementById("profileNickname").value;
  // 프로필 이미지 dataUrl을 Storage에 업로드 후 다운로드 링크를 받아서 photoURL에 저장.
  const imgDataUrl2 = localStorage.getItem("imgDataUrl2");
  let downloadUrl;
  if (imgDataUrl2) {
    const response = await uploadString(imgRef, imgDataUrl2, "data_url");
    downloadUrl = await getDownloadURL(response.ref);
    console.log("downloadurl: ", downloadUrl);
  }

  await updateProfile(authService.currentUser, {
    displayName: newNickname ? newNickname : null,
    photoURL: downloadUrl ? downloadUrl : null,
  })
    .then(() => {
      alert("프로필 수정 완료");
      window.location.hash = "#mypage";
      window.location.reload();
    })
    .catch((error) => {
      alert("프로필 수정 실패");
      console.log("error:", error);
    });
};

export const onFileChange = (event) => {
  const theFile = event.target.files[0]; // file 객체
  const reader = new FileReader();
  reader.readAsDataURL(theFile); // file 객체를 브라우저가 읽을 수 있는 data URL로 읽음.
  reader.onloadend = (finishedEvent) => {
    // 파일리더가 파일객체를 data URL로 변환 작업을 끝났을 때
    const imgDataUrl2 = finishedEvent.currentTarget.result;
    console.log(imgDataUrl2);
    localStorage.setItem("imgDataUrl2", imgDataUrl2);
    document.getElementById("mypage_profile").src = imgDataUrl2;
  };
};

export function toggleEdit() {
  let prof_nickname = document.getElementById("profileNickname");
  let prof_changeBtn = document.getElementById("profileBtn");

  if (prof_nickname.style.display === "none") {
    prof_nickname.style.display = "block";
  } else {
    prof_nickname.style.display = "none";
  }

  if (prof_changeBtn.style.display === "none") {
    prof_changeBtn.style.display = "block";
  } else {
    prof_changeBtn.style.display = "none";
  }
}
