import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  orderBy,
  query,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
import { dbService, authService } from "../firebase.js";

let path = window.location.hash.replace("#", "");

export const save_comment = async (event) => {
  event.preventDefault();
  const comment = document.getElementById("comment");
  const { uid, photoURL, displayName } = authService.currentUser;
  try {
    await addDoc(collection(dbService, "comments"), {
      text: comment.value,
      createdAt: Date.now(),
      creatorId: uid,
      profileImg: photoURL,
      nickname: displayName,
    });
    comment.value = "";
    if(path == "main"){getCommentList();}else {getCommentList_mypage()}
  } catch (error) {
    alert(error);
    console.log("error in addDoc:", error);
  }
};


export const onEditing = (event) => {
  // 수정버튼 클릭
  event.preventDefault();
  const udBtns = document.querySelectorAll(".editBtn, .deleteBtn");
  udBtns.forEach((udBtn) => (udBtn.disabled = "true"));

  const cardBody = event.target.parentNode.parentNode.parentNode;
  const commentText = cardBody.children[0].children[1].children[1];
  const commentInputP = cardBody.children[0].children[1].children[2];

  commentText.classList.add("noDisplay");
  commentInputP.classList.add("d-flex");
  commentInputP.classList.remove("noDisplay");
  commentInputP.children[0].focus();
};

export const update_comment = async (event) => {
  event.preventDefault();
  const newComment = event.target.parentNode.children[0].value;
  const id = event.target.parentNode.id;

  const parentNode = event.target.parentNode.parentNode;
  const commentText = parentNode.children[0];
  commentText.classList.remove("noDisplay");
  const commentInputP = parentNode.children[1];
  commentInputP.classList.remove("d-flex");
  commentInputP.classList.add("noDisplay");

  const commentRef = doc(dbService, "comments", id);
  try {
    await updateDoc(commentRef, { text: newComment });
    if(path == "main"){getCommentList();}else {getCommentList_mypage()}

  } catch (error) {
    alert(error);
  }
};

export const delete_comment = async (event) => {
  event.preventDefault();
  const id = event.target.parentNode.name;
  const ok = window.confirm("해당 응원글을 정말 삭제하시겠습니까?");
  if (ok) {
    try {
      await deleteDoc(doc(dbService, "comments", id));
    if(path == "main"){getCommentList();}else {getCommentList_mypage()}
    } catch (error) {
      alert(error);
    }
  }
};

export const getCommentList = async () => {
  console.log(authService)
  let cmtObjList = [];
  const q = query(
    collection(dbService, "comments"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const commentObj = {
      id: doc.id,
      ...doc.data(),
    };
    cmtObjList.push(commentObj);
  });
  const commnetList = document.getElementById("comment-list");
  const currentUid = authService.currentUser.uid;
  commnetList.innerHTML = "";
  cmtObjList.forEach((cmtObj) => {

      const isOwner = currentUid === cmtObj.creatorId;
      const temp_html = `
                <div class="friends_post">

                <div class="friend_post_top">

                    <div class="img_and_name">

                        <img src="${
          cmtObj.profileImg ?? "../assets/blankProfile.webp"
      }">

                        <div class="friends_name">
                            <div class="name_and_time">
                                <span class="friends_name">
                                ${
          cmtObj.nickname ?? "닉네임 없음"
      }
                            </span>
                            <span class="time">${new Date(cmtObj.createdAt)
          .toString()
          .slice(0, 25)}</span>
                            </div>
                            <div><span>${cmtObj.text}</span></div>
                            <p id="${cmtObj.id}" class="noDisplay">
                                <input class="newCmtInput" type="text">
                                <button class="updateBtn" onclick="update_comment(event)">완료</button>
                            </p>

                        </div>


                    </div>

                    <div class=${isOwner ? "menu" : "noDisplay"}>
                    
                   <button onclick="onEditing(event)" class="editBtn btn">
                            <span class="material-symbols-outlined botton_color">
                                edit
                            </span>
                        </button>
                     <button name="${cmtObj.id}" onclick="delete_comment(event)" class="deleteBtn btn">
                            <span class="material-symbols-outlined botton_color">
                                delete
                            </span>

                    </div>

                </div>



                <img src="image/post_1.jpg">

                <div class="info">

                    <div class="emoji_img">
                        <img src="image/like.png">

                        <p>You, Charith Disanayaka and 25K others</p>
                    </div>

                    <div class="comment">
                        <p>421 Comments</p>

                    </div>

                </div>

                <hr>

                <div class="like">

                    <div class="like_icon">
                        <i class="fa-solid fa-thumbs-up activi"></i>
                        <p>Like</p>
                    </div>

                    <div class="like_icon">
                        <i class="fa-solid fa-message"></i>
                        <p>Comments</p>
                    </div>



                </div>

                <hr>

                <div class="comment_warpper">

                    <img src="image/profile.png">
                    <div class="circle"></div>

                    <div class="comment_search">

                        <input type="text" placeholder="Write a comment">
                        <i class="fa-regular fa-face-smile"></i>
                        <i class="fa-solid fa-camera"></i>
                        <i class="fa-regular fa-note-sticky"></i>

                    </div>

                </div>

            </div>

`;
      const div = document.createElement("div");
      div.classList.add("mycards");
      div.innerHTML = temp_html;
      commnetList.appendChild(div);
    });
};

export const getCommentList_mypage = async () => {
  let cmtObjList = [];
  const q = query(
    collection(dbService, "comments"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const commentObj = {
      id: doc.id,
      ...doc.data(),
    };
    cmtObjList.push(commentObj);
  });
  const commnetList = document.getElementById("comment-list");
  const currentUid = authService.currentUser.uid;
  commnetList.innerHTML = "";
  cmtObjList.forEach((cmtObj) => {
    if(cmtObj.creatorId == currentUid) {
      const isOwner = currentUid === cmtObj.creatorId;
      const temp_html = `
                <div class="friends_post">

                <div class="friend_post_top">

                    <div class="img_and_name">

                        <img src="${cmtObj.profileImg ?? "../assets/blankProfile.webp"}">

                            <div class="friends_name">
                                <div class="name_and_time">
                                    <span class="friends_name">
                                         ${cmtObj.nickname ?? "닉네임 없음"}
                                    </span>
                                    <span class="time">
                                        ${new Date(cmtObj.createdAt).toString().slice(0, 25)}
                                    </span>
                                </div>
                            <div>
                                <span>${cmtObj.text}
                                </span>
                            </div>
                            <p id="${cmtObj.id}" class="noDisplay">
                                <input class="newCmtInput" type="text">
                                <button class="updateBtn" onclick="update_comment(event)">완료</button>
                            </p>

                            </div>


                    </div>

                    <div class=${isOwner ? "menu" : "noDisplay"}>
                    
                      <button onclick="onEditing(event)" class="editBtn btn">
                            <span class="material-symbols-outlined botton_color">
                                edit
                            </span>
                        </button>
                     <button name="${cmtObj.id}" onclick="delete_comment(event)" class="deleteBtn btn">
                            <span class="material-symbols-outlined botton_color">
                                delete
                            </span>
                      </button>
              
                            
<!--                        <span class="material-symbols-outlined editBtn" onclick="onEditing(event)"> -->
<!--                        edit-->
<!--                        </span>-->
<!--                        <span class="material-symbols-outlined deleteBtn" onclick="delete_comment(event)">-->
<!--                        delete-->
<!--                        </span>-->

                    </div>

                </div>



                <img src="image/post_1.jpg">

                <div class="info">

                    <div class="emoji_img">
                        <img src="image/like.png">

                        <p>You, Charith Disanayaka and 25K others</p>
                    </div>

                    <div class="comment">
                        <p>421 Comments</p>

                    </div>

                </div>

                <hr>

                <div class="like">

                    <div class="like_icon">
                        <i class="fa-solid fa-thumbs-up activi"></i>
                        <p>Like</p>
                    </div>

                    <div class="like_icon">
                        <i class="fa-solid fa-message"></i>
                        <p>Comments</p>
                    </div>



                </div>

                <hr>

                <div class="comment_warpper">

                    <img src="image/profile.png">
                    <div class="circle"></div>

                    <div class="comment_search">

                        <input type="text" placeholder="Write a comment">
                        <i class="fa-regular fa-face-smile"></i>
                        <i class="fa-solid fa-camera"></i>
                        <i class="fa-regular fa-note-sticky"></i>

                    </div>

                </div>

            </div>

`;
      const div = document.createElement("div");
      div.classList.add("mycards");
      div.innerHTML = temp_html;
      commnetList.appendChild(div);
    }});
};

export const getCommentList_main_before = async () => {
  console.log(authService)
  let cmtObjList = [];
  const q = query(
    collection(dbService, "comments"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const commentObj = {
      id: doc.id,
      ...doc.data(),
    };
    cmtObjList.push(commentObj);
  });
  const commnetList = document.getElementById("comment-list");
  commnetList.innerHTML = "";
  cmtObjList.forEach((cmtObj) => {

      const temp_html = `
                <div class="friends_post">

                <div class="friend_post_top">

                    <div class="img_and_name">

                        <img src="${
          cmtObj.profileImg ?? "../assets/blankProfile.webp"
      }">

                        <div class="friends_name">
                            <div class="name_and_time">
                                <span class="friends_name">
                                ${
          cmtObj.nickname ?? "닉네임 없음"
      }
                            </span>
                            <span class="time">${new Date(cmtObj.createdAt)
          .toString()
          .slice(0, 25)}</span>
                            </div>
                            <div><span>${cmtObj.text}</span></div>
                            <p id="${cmtObj.id}" class="noDisplay">
                                <input class="newCmtInput" type="text">
                                <button class="updateBtn" onclick="update_comment(event)">완료</button>
                            </p>

                        </div>


                    </div>

                    <div class="noDisplay">
                    
                    <button onclick="onEditing(event)" class="editBtn btn btn-dark">수정</button>
                     <button name="${
          cmtObj.id
      }" onclick="delete_comment(event)" class="deleteBtn btn btn-dark">삭제</button>
              
                            
<!--                        <span class="material-symbols-outlined editBtn" onclick="onEditing(event)"> -->
<!--                        edit-->
<!--                        </span>-->
<!--                        <span class="material-symbols-outlined deleteBtn" onclick="delete_comment(event)">-->
<!--                        delete-->
<!--                        </span>-->

                    </div>

                </div>



                <img src="image/post_1.jpg">

                <div class="info">

                    <div class="emoji_img">
                        <img src="image/like.png">

                        <p>You, Charith Disanayaka and 25K others</p>
                    </div>

                    <div class="comment">
                        <p>421 Comments</p>

                    </div>

                </div>

                <hr>

                <div class="like">

                    <div class="like_icon">
                        <i class="fa-solid fa-thumbs-up activi"></i>
                        <p>Like</p>
                    </div>

                    <div class="like_icon">
                        <i class="fa-solid fa-message"></i>
                        <p>Comments</p>
                    </div>



                </div>

                <hr>

                <div class="comment_warpper">

                    <img src="image/profile.png">
                    <div class="circle"></div>

                    <div class="comment_search">

                        <input type="text" placeholder="Write a comment">
                        <i class="fa-regular fa-face-smile"></i>
                        <i class="fa-solid fa-camera"></i>
                        <i class="fa-regular fa-note-sticky"></i>

                    </div>

                </div>

            </div>

`;
      const div = document.createElement("div");
      div.classList.add("mycards");
      div.innerHTML = temp_html;
      commnetList.appendChild(div);
    });
};

function toggleMenu() {

  let subMenu = document.getElementById("subMenu");
        subMenu.classList.toggle("open_menu");
    }


window.toggleMenu = toggleMenu;
window.save_comment = save_comment;
window.update_comment = update_comment;
window.onEditing = onEditing;
window.delete_comment = delete_comment;
