const axiosBase = axios.create({
    baseURL: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol',
    timeout: 2000
});

function login(){
    const userName = document.querySelector('#username').value;
    const loginPromise = axiosBase.post("/participants",
    {
        name: userName
    });
    loginPromise.then(timedFunctions);
    loginPromise.catch(loginError);
}

function loginError(error){
    const errorStatus = error.response.status; 
    
    if (errorStatus === 400){
        document.querySelector("#login-error").innerHTML = "Este nome de usuário já está em uso, por favor, tente outro."
    }
}

function refreshStatus(userName){
    axiosBase.post("/status",
    {
        name: userName
    });
}

function openMenu() {
    const menuContainer = document.querySelector(".menu-container");
    const menu = menuContainer.querySelector(".menu");

    menuContainer.classList.add("active");
    menu.classList.add("active");
}

function closeMenu(menuContainerBlankSpace) {
    const menuContainer = menuContainerBlankSpace.parentNode;
    const menu = menuContainer.querySelector(".menu");

    menuContainer.classList.remove("active");
    menu.classList.remove("active");
}

function selectMenuOption(element) {
    let elementParentNode = element.parentNode;

    if (elementParentNode.tagName === "UL"){
        elementParentNode = elementParentNode.parentNode;
    }

    const section = elementParentNode; 
    const activeList = section.querySelectorAll("ion-icon.active");
    
    if (activeList.length > 0) {
        activeList[0].classList.remove("active");
    }
    element.querySelectorAll('ion-icon')[1].classList.add("active");
    
    // If the option "Todos" is selected, the option "Público" must be active
    if (getReceiver() === "Todos") {
        const privacySection = document.querySelector("#privacy-settings");
        const public = privacySection.querySelector("#public");
        const private = privacySection.querySelector("#private");

        public.querySelectorAll("ion-icon")[1].classList.add("active");
        private.querySelectorAll("ion-icon")[1].classList.remove("active");
    }

    updateMsgPrivacyInfo();
}

function getPrivacy(){
    const privacySection = document.querySelector("#privacy-settings");
    const privacySelection = privacySection.querySelector("ion-icon.active").parentNode;
    
    return privacySelection.children[0].children[1].innerHTML;
}

function getReceiver(){
    const receiverSection = document.querySelector("#contacts")
    const receiver = receiverSection.querySelector("ion-icon.active").parentNode;
    
    return receiver.children[0].children[1].innerHTML;
}

function updateMsgPrivacyInfo() {
    let sendToInfo = `Enviando para ${getReceiver()}`;
    
    if (getPrivacy() === "Reservadamente"){
        sendToInfo += " (reservadamente)"
    }

    document.querySelector("#msg-privacy-info").innerHTML = sendToInfo;
}

function updateMsgScreen(msgList, msgScreen, behavior){
    for (index in msgList){
        const currentMessage = msgList[index];
        const msgDiv = document.createElement("div");
        const timeSpan = document.createElement("span");
        const msgInfosDiv = document.createElement("span");
        const senderSpan = document.createElement("span");
        const toSpan = document.createElement("span");
        const receiverSpan = document.createElement("span");
        const colonSpan = document.createElement("span");
        const msgTextSpan = document.createElement("span");
        
        timeSpan.classList.add("time");
        msgInfosDiv.classList.add("msg-infos");
        senderSpan.classList.add("msg-sender");
        toSpan.classList.add("msg-to")
        receiverSpan.classList.add("msg-receiver");
        msgTextSpan.classList.add("msg-text");
        msgDiv.classList.add("message-container");
        if (currentMessage.type == "status"){
            msgDiv.classList.add("status-msg-color");
        }else if (currentMessage.type == "private_message"){
            msgDiv.classList.add("private-msg-color");
        }

        timeSpan.innerHTML = `(${currentMessage.time})`;
        senderSpan.innerHTML = `${currentMessage.from}`;
        toSpan.innerHTML = " para ";
        receiverSpan.innerHTML = `${currentMessage.to}`;
        colonSpan.innerHTML = ":";
        msgTextSpan.innerHTML = `${currentMessage.text}`;

        msgInfosDiv.appendChild(senderSpan);
        msgInfosDiv.appendChild(toSpan);
        msgInfosDiv.appendChild(receiverSpan);
        msgInfosDiv.appendChild(colonSpan);

        msgDiv.appendChild(timeSpan);
        msgDiv.appendChild(msgInfosDiv);
        msgDiv.appendChild(msgTextSpan);
        
        msgScreen.appendChild(msgDiv);
        msgDiv.scrollIntoView({behavior: behavior, block: "start", inline: "nearest"});
    }
}

function getLastMsgIndex(displayedMsgs, serverMsgs) {
    function getTypeOfMsg(msgContainer){
        if (msgContainer.classList.contains("status-msg-color")){
            return "status";
        }else if(msgContainer.classList.contains("private-msg-color")){
            return "private_message";
        }else{
            return "message";
        }
    }
    function equalMsgs(firstMsg, secondMsg){
        for (key in firstMsg){
            if (firstMsg[key] !== secondMsg[key]){
                return false;
            }
        }
        return true;
    }

    const lastMsg = displayedMsgs[displayedMsgs.length - 1]
    const lastMsgObject = {
        from: lastMsg.querySelector("span.msg-sender").innerHTML,
        to: lastMsg.querySelector("span.msg-receiver").innerHTML,
        text: lastMsg.querySelector("span.msg-text").innerHTML,
        type: getTypeOfMsg(lastMsg),
        time: lastMsg.querySelector("span.time").innerHTML.slice(1, 9)
    }

    for (let i = serverMsgs.length - 1; i >= 0; i--) {
        if (equalMsgs(lastMsgObject, serverMsgs[i])) {
            return i;
        }
    }

    return -1;
}

function getMessages(){
    function updateMsgs(response){
        const serverMsgs = response.data
        const msgScreen = document.querySelector("main");
        const displayedMsgs = document.querySelectorAll(".message-container")
        
        if (displayedMsgs.length === 0){
            updateMsgScreen(serverMsgs, msgScreen, "auto");
        }else{
            const lastMsgIndex = getLastMsgIndex(displayedMsgs, serverMsgs);

            if (lastMsgIndex !== (serverMsgs.length - 1)){

                // the screen should updated from the message following the last
                updateMsgScreen(serverMsgs.slice(lastMsgIndex + 1), msgScreen, "smooth");
            }
        }
    }

    const msgPromise = axiosBase.get("/messages");
    msgPromise.then(updateMsgs);
}

function getParticipants(){
    function updateParticipants(response){
        const participants = response.data
        
        const activeUsersUL = document.querySelector("#active-users");
        const activeUsers = activeUsersUL.children

        // Removing displayed users
        for (let i = activeUsers.length - 1; i >= 0; i--){
            activeUsersUL.removeChild(activeUsers[i]);
        }

        // Adding online users
        for (index in participants){
            const user = document.createElement("li");
            const userDiv = document.createElement("div");
            const userName = document.createElement("p");
            const personIcon = document.createElement("ion-icon");
            const checkIcon = document.createElement("ion-icon");
            
            user.classList.add("menu-option");
            user.setAttribute("onclick", "selectMenuOption(this)");
            userName.innerHTML = participants[index].name;
            personIcon.name = "person-circle";
            checkIcon.name = "checkmark";

            userDiv.appendChild(personIcon);
            userDiv.appendChild(userName);
            user.appendChild(userDiv);
            user.appendChild(checkIcon);
            activeUsersUL.appendChild(user);
        }
    }

    const usersPromise = axiosBase.get("/participants");
    usersPromise.then(updateParticipants);
}

function checkMsgInput(){
    const msgContainer = document.querySelector(".message-input-container");
    const msg = msgContainer.querySelector("input").value;
    const sendIcon = msgContainer.querySelector("ion-icon");

    if (msg !== "") {
        sendIcon.classList.add("active");
        sendIcon.setAttribute("onclick", "sendMessage()");
    }else{
        sendIcon.classList.remove("active");
        sendIcon.removeAttribute("onclick");
    }
}

function sendMessage() {
    const main = document.querySelector('main');
    const messageInput = document.querySelector('#new-message');

    if (messageInput.value !== "") {
        console.log(messageInput.value);
        messageInput.value = "";
    }
}

function timedFunctions(){
    const userName = document.querySelector('#username').value;
    document.querySelector(".login-page").classList.add("hidden");

    setInterval(checkMsgInput, 500);
    setInterval(refreshStatus, 5000, userName);
    
    getMessages();
    getParticipants();

    setInterval(getMessages, 3000);
    setInterval(getParticipants, 10000);
}