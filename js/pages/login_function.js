// Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-analytics.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyDuM8KXkh0ASlpvM_xIryV7YuB7gXdZXM4",
        authDomain: "test-a6f5c.firebaseapp.com",
        projectId: "test-a6f5c",
        storageBucket: "test-a6f5c.appspot.com",
        messagingSenderId: "546247560866",
        appId: "1:546247560866:web:936539458a41f27cbb51fb",
        measurementId: "G-MXKS43J261"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";

    const auth = getAuth();

    // document.getElementById('signUpButton').addEventListener('click', (event) => {
    //     event.preventDefault()
    //     const signUpEmail = document.getElementById('signUpEmail').value
    //     const signUpPassword = document.getElementById('signUpPassword').value
    //
    //     createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
    //         .then((userCredential) => {
    //             console.log(userCredential)
    //             // Signed in
    //             const user = userCredential.user;
    //             // ...
    //         })
    //         .catch((error) => {
    //             console.log('error')
    //             const errorCode = error.code;
    //             const errorMessage = error.message;
    //             // ..
    //         });
    //
    // })

    function CheckEmail(str) {

        var reg_email = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;

        if (!reg_email.test(str)) {

            return false;

        } else {

            return true;

        }

    }


    function CheckPassword(str) {

        var reg_password = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

        if (!reg_password.test(str)) {

            return false;

        } else {

            return true;

        }

    }


    function CreatePasswordCheck() {


        const signInPassword_input = document.getElementById('password_value')
        const signUpPassword = document.getElementById('password_value').value
        const pwRegex =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        const matchedPw = signUpPassword.match(pwRegex);
        const passwordcheck = document.getElementById('password_info_over_string');

        signInPassword_input.classList.remove('red_line');
        $("#password_info").text("");

        if (matchedPw === null) {

            passwordcheck.classList.remove('grin_string');


        } else {

            passwordcheck.classList.remove('red_string');
            passwordcheck.classList.add('grin_string');

        }


    }


    function LoginFunction(event) {
        event.preventDefault()
        const signInEmail = document.getElementById('email_value').value
        const signInPassword = document.getElementById('password_value').value
        const signInEmail_input = document.getElementById('email_value')
        const signInPassword_input = document.getElementById('password_value')


        $("#email_info").text("");
        $("#password_info").text("");
        signInEmail_input.classList.remove('red_line');
        signInPassword_input.classList.remove('red_line');

        if (!signInEmail) {

            $("#email_info").text("이메일을 입력하세요.");
            signInEmail_input.classList.add('red_line');

            return;
        } else {
            if (!CheckEmail(signInEmail)) {

                $("#email_info").text("이메일 주소를 입력해주세요.");
                signInEmail_input.classList.add('red_line');

                return;
            }
        }
        if (!signInPassword) {

            $("#password_info").text("비밀번호를 입력하세요.");
            signInPassword_input.classList.add('red_line');

            return;
        } else {
            signInWithEmailAndPassword(auth, signInEmail, signInPassword)
                .then((userCredential) => {
                    // Signed in
                    console.log(userCredential)
                    const user = userCredential.user;
                    let link = 'https://www.naver.com/'
                    location.href = link;
                    // ...
                })
                .catch((error) => {
                    console.log('로그인 실패')
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    $("#password_info").text("이메일 또는 비밀번호가 잘못되었습니다.");
                    signInEmail_input.classList.add('red_line');
                    signInPassword_input.classList.add('red_line');

                });


        }


    }


    function CreateFunction(event) {
        event.preventDefault()
        const signUpEmail = document.getElementById('email_value').value
        const signUpPassword = document.getElementById('password_value').value
        const signInEmail_input = document.getElementById('email_value')
        const passwordcheck = document.getElementById('password_info_over_string');
        const signInPassword_input = document.getElementById('password_value')


        $("#email_info").text("");

        if (!signUpEmail) {

            $("#email_info").text("이메일을 입력하세요.");
            signInEmail_input.classList.add('red_line');

            return;

        } else {

            if (!CheckEmail(signUpEmail)) {

                $("#email_info").text("이메일 주소를 입력해주세요.");
                signInEmail_input.classList.add('red_line');

                return;

            }

        }

        if (!signUpPassword) {

            $("#password_info").text("비밀번호를 입력하세요.");
            signInPassword_input.classList.add('red_line');
            return;

        }

        if (!CheckPassword(signUpPassword)) {

            passwordcheck.classList.add('red_string');
            signInPassword_input.classList.add('red_line');
        } else {

            createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
                .then((userCredential) => {
                    console.log(userCredential)
                    let link = 'https://www.naver.com/'
                    location.href = link;
                    // Signed in
                    const user = userCredential.user;
                    // ...
                })
                .catch((error) => {
                    console.log('error')
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // ..
                });


        }


    }


    window.LoginFunction = LoginFunction

    window.CreateFunction = CreateFunction

    window.CreatePasswordCheck = CreatePasswordCheck

