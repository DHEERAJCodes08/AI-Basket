
//We are using this so that on the Click of the options i can change the data in right ieallSearchAi

const btns = document.querySelectorAll(".fetch-btn")
const Info = document.querySelectorAll(".Content")
const ButtonArea = document.querySelector(".performOpt")

ButtonArea.addEventListener("click",function(e){
    const id = e.target.dataset.id;
    console.log(e.target.dataset.id)
    if(id){
        //remove the active Class for all the buttons Elements
        btns.forEach(function(btn){
                btn.classList.remove("active")
            });
           
            //adding the active class for the clicked button
            e.target.classList.add("active")
            console.log(e.target.classList.contains("active"));
            

            // remove the active Class for all the Data Elements
            //hide other contents
            Info.forEach(function(info){
                info.classList.remove("active")

            })

            //adding the active class for the clicked id data
            const element = document.getElementById(id);
            element.classList.add("active")
        }

 });

