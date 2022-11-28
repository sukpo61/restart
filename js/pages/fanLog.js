import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  orderBy,
  query,
  getDocs,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
import { dbService, authService, storageService } from "../firebase.js";
import {
  ref,
  uploadString,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

let Uploaded = false;

export const post_onFileChange = (event) => {
  document.getElementById("posted_img").classList.remove("noDisplay");
  Uploaded = !Uploaded;
  const theFile = event.target.files[0]; // file 객체
  const reader = new FileReader();
  reader.readAsDataURL(theFile); // file 객체를 브라우저가 읽을 수 있는 data URL로 읽음.
  reader.onloadend = (finishedEvent) => {
    // 파일리더가 파일객체를 data URL로 변환 작업을 끝났을 때
    const imgDataUrl3 = finishedEvent.currentTarget.result;
    localStorage.setItem("imgDataUrl3", imgDataUrl3);
    document.getElementById("posted_img").src = imgDataUrl3;
  };
};

export const save_comment = async (event) => {
  event.preventDefault();
  let path = window.location.hash.replace("#", "");
  const comment = document.getElementById("comment");
  const { uid, photoURL, displayName } = authService.currentUser;

  if (Uploaded) {
    const imgRef = ref(
      storageService,
      `${authService.currentUser.uid}/post_images/${uuidv4()}`
    );
    const imgDataUrl3 = localStorage.getItem("imgDataUrl3");
    let downloadUrl;
    const response = await uploadString(imgRef, imgDataUrl3, "data_url");
    downloadUrl = await getDownloadURL(response.ref);

    let data = {
      text: comment.value,
      createdAt: Date.now(),
      creatorId: uid,
      profileImg: photoURL,
      nickname: displayName,
      Downurl: downloadUrl,
      like_count: 0,
      like_user_list: [],
      type: "post",
    };

    try {
      await addDoc(collection(dbService, "comments"), data);
      comment.value = "";
      if (path == "main") {
        getCommentList();
      } else {
        getCommentList_mypage();
      }
    } catch (error) {
      alert(error);
      console.log("error in addDoc:", error);
    }
    document.getElementById("posted_img").src = "";
    localStorage.removeItem("imgDataUrl3");
    Uploaded = !Uploaded;
    document.getElementById("posted_img").classList.add("noDisplay");
  } else {
    let data = {
      text: comment.value,
      createdAt: Date.now(),
      creatorId: uid,
      profileImg: photoURL,
      nickname: displayName,
      Downurl: "",
      like_count: 0,
      like_user_list: [],
      type: "post",
    };

    try {
      await addDoc(collection(dbService, "comments"), data);
      comment.value = "";
      if (path == "main") {
        getCommentList();
      } else {
        getCommentList_mypage();
      }
    } catch (error) {
      alert(error);
      console.log("error in addDoc:", error);
    }
  }
};

export const Like_Button = async (event) => {
  event.preventDefault();
  let path = window.location.hash.replace("#", "");
  const currentUid = authService.currentUser.uid;
  const id = event.target.parentNode.parentNode.id;
  const likeRef = doc(dbService, "comments", id);

  try {
    await runTransaction(dbService, async (transaction) => {
      const likeDoc = await transaction.get(likeRef);
      if (!likeDoc.exists()) {
        throw "Document does not exist!";
      }

      let like_user_list = likeDoc.data().like_user_list;
      let like_count = likeDoc.data().like_count;

      if (like_user_list.includes(currentUid)) {
        like_user_list = like_user_list.filter((e) => e !== currentUid);
        like_count--;
        transaction.update(likeRef, {
          like_user_list: like_user_list,
          like_count: like_count,
        });
        console.log(like_count, like_user_list);
        if (path == "main") {
          getCommentList();
        } else {
          getCommentList_mypage();
        }
      } else {
        like_user_list.push(currentUid);
        like_count++;
        transaction.update(likeRef, {
          like_user_list: like_user_list,
          like_count: like_count,
        });
        console.log(like_count, like_user_list);
        if (path == "main") {
          getCommentList();
        } else {
          getCommentList_mypage();
        }
      }
    });
  } catch (e) {
    console.log("Transaction failed: ", e);
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
  let path = window.location.hash.replace("#", "");
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
  } catch (error) {
    alert(error);
  }
};

export const delete_comment = async (event) => {
  let path = window.location.hash.replace("#", "");
  event.preventDefault();
  const id = event.target.parentNode.name;
  const ok = window.confirm("해당 글을 정말 삭제하시겠습니까?");
  if (ok) {
    try {
      await deleteDoc(doc(dbService, "comments", id));
    } catch (error) {
      alert(error);
    }
  }
};

export const getCommentList = async (searchContent, searchList) => {
  let cmtObjList = [];
  let showList = [];

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

  //검색어, 검색어를 포함하는 결과리스트 콘솔값

  if (searchContent != undefined && searchContent.length != 0) {
    showList = searchList;
  } else {
    showList = cmtObjList;
  }

  const commnetList = document.getElementById("comment-list");
  const currentUid = authService.currentUser.uid;
  commnetList.innerHTML = "";
  // debugger;
  showList.forEach((cmtObj) => {
    if (cmtObj.type == "post") {
      const like_check = cmtObj.like_user_list.includes(currentUid)
      const imgemptycheck = cmtObj.Downurl === "";
      const isOwner = currentUid === cmtObj.creatorId;
      const temp_html = `
                <div class="friends_post">

                <div class="friend_post_top">

                    <div class="img_and_name">

                        <img src="${
                          cmtObj.profileImg ?? "../assets/blankProfile.webp"
                        }">

                        <div class="comment_contents">
                            <div class="name_and_time">
                                <span class="friends_name">
                                ${cmtObj.nickname ?? "닉네임 없음"}
                            </span>
                            <span class="time">${new Date(cmtObj.createdAt)
                              .toString()
                              .slice(0, 25)}</span>
                            </div>
                            <div class="com"><span>${cmtObj.text}</span></div>
                            <p id="${cmtObj.id}" class="noDisplay">
                                <input class="newCmtInput" type="text">
                                <button class="updateBtn" onclick="update_comment(event),getCommentList()">완료</button>
                            </p>

                        </div>


                    </div>

                    <div class=${isOwner ? "menu" : "noDisplay"}  id="${
        cmtObj.id
      }">
                    
                                        <button onclick="onEditing(event)" class="editBtn mar_10" >
                            <span class="material-symbols-outlined botton_color">
                                edit
                            </span>
                        </button>
                     <button name="${
                       cmtObj.id
                     }" onclick="delete_comment(event),getCommentList()" class="deleteBtn mar_5">
                            <span class="material-symbols-outlined botton_color">
                                delete
                            </span>
                      </button>
              

                    </div>

                </div>



             <div id="post_img" class=${imgemptycheck ? "noDisplay" : ""}>
                   <img src="${cmtObj.Downurl}">
                   </div>
                   
                   <div class="like_comment_wrap">
                   
                    <div class="info">

                

                        <div class="emoji_img">
                        <img src="image/heart.png">

                        <span class="like_count">${cmtObj.like_count}</span>
                    </div>

                    <div class="comment">
<!--                        <p>421 Comments</p>-->

                    </div>

                </div>

                <hr>
                    
                <div class="like" id="${cmtObj.id}">
                  
                    <div class="like_icon" onclick="Like_Button(event), like_style_toggle(event)" >
                        <span class="material-symbols-outlined" id=${like_check ? "heart_color_red" : ""}>
                         favorite
                        </span>
                        <span class="like_button">좋아요</span>
                        
                    </div>

                
                 
                    <div class="like_icon" onclick="post_getCommentList(event), post_comment_toggle(event)">
                 <i class="fa-solid fa-message"></i>
                       <p class="message_post">댓글달기</p>
                 </div>     
                 
                    
                    

 
            </div>
            
            <hr>
                <div class="noDisplay" id="${cmtObj.id}_post_comment_box">
                <div class="comment_warpper" id="${cmtObj.id}">

                <img src="${
                  cmtObj.profileImg ?? "../assets/blankProfile.webp"
                }">
                    <div class="circle"></div>

                    <div class="comment_search">

                        <input placeholder="댓글을 달아주세요." id="${
                          cmtObj.id
                        }_post_text">
                       
                        

                    </div>
                    
                    <span class="material-symbols-outlined" id="comment_send" onclick="post_save_comment(event)">
                            send
                        </span>
                        
                        
                </div>
               
                <div class="post_comments" id="${cmtObj.id}_post">
                

                        
                        
                        
                        </div>
                        
                        
                        
                </div>
                

`;
      const div = document.createElement("div");
      div.classList.add("mycards");
      // debugger;
      div.innerHTML = temp_html;
      commnetList.appendChild(div);
    }
  });
};

export const getCommentList_mypage = async (searchContent, searchList) => {
  let cmtObjList = [];
  let showList = [];

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

  //검색어, 검색어를 포함하는 결과리스트 콘솔값
  // console.log(
  //   "여기는 getCommentList_mypage 함수 안",
  //   "searchContent :",
  //   typeof searchContent,
  //   searchContent,
  //   "searchList :",
  //   typeof searchList,
  //   searchList,
  //   "cmtObjList :",
  //   cmtObjList
  // );

  if (searchContent != undefined && searchContent.length != 0) {
    showList = searchList;
  } else {
    showList = cmtObjList;
  }

  const commnetList = document.getElementById("comment-list");
  const currentUid = authService.currentUser.uid;
  commnetList.innerHTML = "";
  showList.forEach((cmtObj) => {
    if (cmtObj.creatorId == currentUid && cmtObj.type == "post") {
      const isOwner = currentUid === cmtObj.creatorId;
      const imgemptycheck = cmtObj.Downurl === "";
      const LikeCheck = cmtObj.like_user_list.includes(currentUid)
      const temp_html = `
                <div class="friends_post">

                <div class="friend_post_top">

                    <div class="img_and_name">

                        <img src="${
                          cmtObj.profileImg ?? "../assets/blankProfile.webp"
                        }">

                             <div class="comment_contents">
                            <div class="name_and_time">
                                <span class="friends_name">
                                ${cmtObj.nickname ?? "닉네임 없음"}
                            </span>
                            <span class="time">${new Date(cmtObj.createdAt)
                              .toString()
                              .slice(0, 25)}</span>
                            </div>
                            <div class="com"><span>${cmtObj.text}</span></div>
                            <p id="${cmtObj.id}" class="noDisplay">
                                <input class="newCmtInput" type="text">
                                <button class="updateBtn" onclick="update_comment(event),getCommentList_mypage()">완료</button>
                            </p>

                        </div>



                    </div>

                    <div class=${isOwner ? "menu" : "noDisplay"}>
                    
                      <button onclick="onEditing(event)" class="editBtn mar_10">
                            <span class="material-symbols-outlined botton_color">
                                edit
                            </span>
                        </button>
                     <button name="${
                       cmtObj.id
                     }" onclick="delete_comment(event),getCommentList_mypage()" class="deleteBtn mar_5">
                            <span class="material-symbols-outlined botton_color">
                                delete
                            </span>
                      </button>
              
                            

                    </div>

                </div>


                   <div id="post_img" class=${imgemptycheck ? "noDisplay" : ""}>
                   <img src="${cmtObj.Downurl}">
                   </div>
                  <div class="like_comment_wrap">
                   
                    <div class="info">

                

                        <div class="emoji_img">
                        <img src="image/heart.png">

                        <span class="like_count">${cmtObj.like_count}</span>
                    </div>

                    <div class="comment">
<!--                        <p>421 Comments</p>-->

                    </div>

                </div>

                <hr>

                <div class="like" id="${cmtObj.id}">
                  
                    <button class="like_icon" onclick="Like_Button(event)" >
                    <i class="fa-regular fa-heart"></i>
                        <span class="like_button">좋아요</span>
                        
                    </button>

                
                 
                    <div class="like_icon" onclick="post_getCommentList(event), post_comment_toggle(event)">
                 <i class="fa-solid fa-message"></i>
                       <p class="message_post">댓글달기</p>
                 </div>     
                 
                    
                    

 
            </div>
            
            <hr>
                <div class="noDisplay" id="${cmtObj.id}_post_comment_box">
                <div class="comment_warpper" id="${cmtObj.id}">

                <img src="${
                  cmtObj.profileImg ?? "../assets/blankProfile.webp"
                }">
                    <div class="circle"></div>

                    <div class="comment_search">

                        <input placeholder="댓글을 달아주세요." id="${
                          cmtObj.id
                        }_post_text">
                       
                        

                    </div>
                    
                    <span class="material-symbols-outlined" id="comment_send" onclick="post_save_comment(event)">
                            send
                        </span>
                        
                        
                </div>
               
                <div class="post_comments" id="${cmtObj.id}_post">
                

                        
                        
                        
                        </div>
                        
              

            </div>

`;
      const div = document.createElement("div");
      div.classList.add("mycards");
      div.innerHTML = temp_html;
      commnetList.appendChild(div);
    }
  });
};

export const getCommentList_main_before = async (searchContent, searchList) => {
  // console.log(authService);
  let cmtObjList = [];
  let showList = [];

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

  // console.log(
  //   "여기는 getCommentList_main_before 함수 안",
  //   "searchContent :",
  //   typeof searchContent,
  //   searchContent,
  //   "searchList :",
  //   typeof searchList,
  //   searchList,
  //   "cmtObjList :",
  //   cmtObjList
  // );

  if (searchContent != undefined && searchContent.length != 0) {
    showList = searchList;
  } else {
    showList = cmtObjList;
  }

  const commnetList = document.getElementById("comment-list");
  commnetList.innerHTML = "";
  showList.forEach((cmtObj) => {
    if (cmtObj.type == "post") {
      const imgemptycheck = cmtObj.Downurl === "";

      const temp_html = `
                <div class="friends_post">

                <div class="friend_post_top">

                    <div class="img_and_name">

                        <img src="${
                          cmtObj.profileImg ?? "../assets/blankProfile.webp"
                        }">

                        <div class="comment_contents">
                            <div class="name_and_time">
                                <span class="friends_name">
                                ${cmtObj.nickname ?? "닉네임 없음"}
                            </span>
                            <span class="time">${new Date(cmtObj.createdAt)
                              .toString()
                              .slice(0, 25)}</span>
                            </div>
                            <div class="com"><span>${cmtObj.text}</span></div>
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
              
                            
<!--                        <span class=" symbols material-symbols-outlined editBtn" onclick="onEditing(event)"> -->
<!--                        edit-->
<!--                        </span>-->
<!--                        <span class="material-symbols-outlined deleteBtn" onclick="delete_comment(event)">-->
<!--                        delete-->
<!--                        </span>-->

                    </div>

                </div>



                   <div id="post_img" class=${imgemptycheck ? "noDisplay" : ""}>
                   <img src="${cmtObj.Downurl}">
                   </div>
                   
                <div class="like_wrap">
                   
                    <div class="info">

                    <div class="emoji_img">
                        <img src="image/heart.png">

                        <span class="like_count">${cmtObj.like_count}</span>
                    </div>

                    <div class="comment">
<!--                        <p>421 Comments</p>-->

                    </div>

                </div>

<!--                    <div class="like_icon">-->
<!--                        <i class="fa-solid fa-message"></i>-->
<!--                        <p>Comments</p>-->
<!--                    </div>-->

              
            </div>

`;
      const div = document.createElement("div");
      div.classList.add("mycards");
      div.innerHTML = temp_html;
      commnetList.appendChild(div);
    }
  });
};

export const post_getCommentList = async (event) => {
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
  let post_id = event.target.parentNode.parentNode.id;
  console.log(post_id);
  let post_comments = document.getElementById(post_id + "_post");
  console.log(post_comments);

  post_comments.innerHTML = "";

  const currentUid = authService.currentUser.uid;
  cmtObjList.forEach((cmtObj) => {
    if (cmtObj.post_id == post_id) {
      const isOwner = currentUid === cmtObj.creatorId;
      //현재 이메일아디와 댓글아이를 비교해 수정삭제가능하게 하는 부분인듯
      const temp_html = `<div class="friend_post_top">

                    <div class="img_and_name">

                        <img src="${
                          cmtObj.profileImg ?? "../assets/blankProfile.webp"
                        }">

                             <div class="comment_contents" id="${cmtObj.id}">
                            <div class="name_and_time">
                                <span class="friends_name">
                                ${cmtObj.nickname ?? "닉네임 없음"}
                            </span>
                            <span class="time">${new Date(cmtObj.createdAt)
                              .toString()
                              .slice(0, 25)}</span>
                            </div>
                            <div class="com"><span>${cmtObj.text}</span></div>
                            <p id="${cmtObj.id}" class="noDisplay">
                                <input class="newCmtInput">
                                <button class="updateBtn" onclick="update_comment(event),post_getCommentList(event)">완료</button>
                            </p>

                        </div>



                    </div>

                    <div class="noDisplay">

                      <button onclick="onEditing(event)" class="editBtn mar_10">
                            <span class="material-symbols-outlined botton_color">
                                edit
                            </span>
                        </button>
                     <button name="${
                       cmtObj.id
                     }" onclick="delete_comment(event),post_getCommentList(event)" class="deleteBtn mar_5">
                            <span class="material-symbols-outlined botton_color">
                                delete
                            </span>
                      </button>



                    </div>

                </div>
`;
      const div = document.createElement("div");
      div.classList.add("mycards");
      div.innerHTML = temp_html;
      post_comments.appendChild(div);
    }
  });
};

export const post_comment_toggle = async (event) => {
  event.preventDefault();
  let post_id = event.target.parentNode.parentNode.id;
  let post_comment_box = document.getElementById(post_id + "_post_comment_box");
  console.log(post_comment_box);
  post_comment_box.classList.toggle("noDisplay");
};

export const like_icon_toggle = async (event) => {
  event.preventDefault();

  let post_id = event.target.parentNode.parentNode.id;
  let post_comment_box = document.getElementById(post_id + "_post_comment_box");
  console.log(post_comment_box);
  post_comment_box.classList.toggle("noDisplay");
};

export const like_style_toggle = async (event) => {
  event.preventDefault();
  let id = event.target.id
  if(id == ""){
    event.target.id = heart_color_red
  }else {
    event.target.id = ""
  }

}

// ${like_check ? <i class="fa-solid fa-heart"></i> : <i class="fa-regular fa-heart"></i> }


export const post_save_comment = async (event) => {
  event.preventDefault();
  let post_id = event.target.parentNode.id;
  let post_comment = document.getElementById(post_id + "_post_text");
  console.log(post_comment);

  const { uid, photoURL, displayName } = authService.currentUser;

  let data = {
    text: post_comment.value,
    createdAt: Date.now(),
    creatorId: uid,
    profileImg: photoURL,
    nickname: displayName,
    Downurl: "",
    like_count: 0,
    like_user_list: [],
    post_id: post_id,
  };

  try {
    await addDoc(collection(dbService, "comments"), data);
    post_comment.value = "";
    // if (path == "main") {
    //   getCommentList();
    // } else {
    //   getCommentList_mypage();
    // }
  } catch (error) {
    alert(error);
    console.log("error in addDoc:", error);
  }

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

  console.log(post_id);
  let post_comments = document.getElementById(post_id + "_post");
  post_comments.innerHTML = "";
  console.log(post_comments);
  const currentUid = authService.currentUser.uid;

        // const isOwner = currentUid === cmtObj.creatorId;

    cmtObjList.forEach((cmtObj) => {
      if (cmtObj.post_id == post_id) {

        const temp_html = `<div class="friend_post_top">
  
                      <div class="img_and_name">
  
                          <img src="${
                            cmtObj.profileImg ?? "../assets/blankProfile.webp"
                          }">
  
                               <div class="comment_contents" id="${cmtObj.id}">
                              <div class="name_and_time">
                                  <span class="friends_name">
                                  ${cmtObj.nickname ?? "닉네임 없음"}
                              </span>
                              <span class="time">${new Date(cmtObj.createdAt)
                                .toString()
                                .slice(0, 25)}</span>
                              </div>
                              <div class="com"><span>${cmtObj.text}</span></div>
                              <p id="${cmtObj.id}" class="noDisplay">
                                  <input class="newCmtInput">
                                  <button class="updateBtn" onclick="update_comment(event),post_getCommentList(event)">완료</button>
                              </p>
  
                          </div>
  
  
  
                      </div>
  
                      <div class="noDisplay" id="${
          cmtObj.id
        }">
  
                        <button onclick="onEditing(event)" class="editBtn mar_10">
                              <span class="material-symbols-outlined botton_color">
                                  edit
                              </span>
                          </button>
                       <button name="${
                         cmtObj.id
                       }" onclick="delete_comment(event),post_getCommentList(event)" class="deleteBtn mar_5">
                              <span class="material-symbols-outlined botton_color">
                                  delete
                              </span>
                        </button>
  
  
  
                      </div>
  
                  </div>
  `;

        const div = document.createElement("div");
        div.classList.add("mycards");
        div.innerHTML = temp_html;
        post_comments.appendChild(div);
      }
    });
  };

export const getSearchResult = async (event) => {
  event.preventDefault();
  const searchContent = document.getElementById("searchInput").value;

  let searchList = [];
  const q = query(
    // db.collection("컬렉션 이름").whereField("필드명", arrayContains: "포마")
    collection(dbService, "comments"),
    // where("text", "array-contains", searchContent),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const commentObj = {
      id: doc.id,
      ...doc.data(),
    };
    if (searchContent || searchContent.length > 0) {
      if (commentObj["text"].includes(searchContent)) {
        searchList.push(commentObj);
      }
    }
  });

  getCommentList_main_before(searchContent, searchList);

  if (window.location.hash === "#mypage") {
    getCommentList_mypage(searchContent, searchList);
    return;
  }

  getCommentList(searchContent, searchList);
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
