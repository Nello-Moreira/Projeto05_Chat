function openMenu(){
    const menuContainer = document.querySelector(".menu-container");
    const menu = menuContainer.querySelector(".menu");

    menuContainer.classList.add("active");
    menu.classList.add("active");
}

function closeMenu(menuContainerBlankSpace){
    const menuContainer = menuContainerBlankSpace.parentNode;
    const menu = menuContainer.querySelector(".menu");

    menuContainer.classList.remove("active");
    menu.classList.remove("active");
}

function selectMenuOption(element){
    const section = element.parentNode;
    const activeList = section.querySelectorAll("ion-icon.active");

    if (activeList.length > 0){
        activeList[0].classList.remove("active");
    }
    element.querySelectorAll('ion-icon')[1].classList.add("active");
}


function sendMessage(){
    const main = document.querySelector('main');
    const messageInput = document.querySelector('#new-message');

    if (messageInput.value !== ""){
        console.log(messageInput.value);
        messageInput.value = "";
    }

}