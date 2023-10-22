const preloader = document.querySelector('.preloader');

    window.addEventListener("load", function () {
      preloader.classList.add("hide-preloader")
    })



    /// Creating a array of objects


    const menue =[
    {
        id:1,
        title: "ChatGPT-AI",  
        category:"text-M",
        link:"https://chat.openai.com/",
        img:"Ai Logo/chatgpt-icon (1).png",
        desc:`Provide information, Answer questions `

    },
    {
        id: 2,
        title: "Jasper-AI",
        category: "text-M",
        img: "Ai Logo/Jasper Ai.png",
        desc: ` solution for generating content. `
      },
      {
        id: 3,
        title: "Midjourney-AI",
        category: "imageGen-M",
        link:"https://www.midjourney.com/home/?callbackUrl=%2Fapp%2F",
        img: "Ai Logo/Midjourney_Emblem.png",
        desc: `creating the highest quality images`,
      },
      {
        id: 4,
        title: "Uizard-AI",
        category: "Website-M",
        link: "https://uizard.io/",
        img: "Ai Logo/UIzard.jpg",
        desc: `website prototyping `,
      },
      {
        id: 5,
        title: "Tabnine-AI",
        category: "Website-M",
        link: "https://www.tabnine.com/",
        img: "Ai Logo/tabnine.jpg",
        desc: `web developers who want speed . `,
      },
      {
        id: 6,
        title: "Reply-AI",
        category: "Client-M",
        link: "https://reply.io/",
        img: "Ai Logo/ReplY.png",
        desc: `automating communications with clients. `,
      },
      {
      id: 7,
        title: "Runway-AI",
        category: "editing-M",
        link: "https://app.runwayml.com/video-tools/teams/dheerajprasad72/ai-tools",
        img: "Ai Logo/Runway.png",
        desc: `Video & Photos Editing Tools. `,
      }, 
    { 
      id: 8,
        title: "PixelBin-Ai",
        category: "editing-M",
        link: "https://www.pixelbin.io/",
        img: "Ai Logo/pixelbin_icon.png",
        desc: `Many Usefull Editing & Storage Tools  `,
      },  
    { 
      id: 9,
        title: "PixelBin-Ai",
        category: "editing-M",
        link: "https://www.pixelbin.io/",
        img: "Ai Logo/pixelbin_icon.png",
        desc: `Many Usefull Editing & Storage Tools  `,
      },  


    ];

    const filterbtn = document.querySelectorAll(".filter-btn")
    const container = document.querySelector(".container")

    filterbtn.forEach(item => {
        item.addEventListener("click", (e) => {
            const category = e.currentTarget.dataset.id
            console.log(category)
            const menuectegory = menue.filter(menueitems =>{
                if(menueitems.category === category ){
                return menueitems;
                }
            })
            if(category === "all"){
                displayMenuItems(menue);
            }
            else{
                displayMenuItems(menuectegory)
              }

        })
    
    })


    window.addEventListener('DOMContentLoaded',function(){
        // console.log("snap and Cake")
         displayMenuItems(menue)
         
       });

       function displayMenuItems(MenuItems){

        let displayMenu = MenuItems.map(function(item){
          console.log(item)
  
          return`<div class="New-1">
          <div class="Data">${item.desc}</div>
  
          <a href="${item.link}" target="_blank">
            <div class="dheeraj">
              <div class="ai-image">
                <img src="${item.img}" width="150" height="150" alt="">
              </div>
              <div>
                <h2 class="ai-name">${item.title}</h2>
              </div>
              <div class="ai-status">
                <div class="ai-views">10M views</div>
                <a class="ai-link" href="${item.link}">Try now</a>
              </div>
            </div>
          </a>
        </div>`
  
        
        }).join(" ");
        container.innerHTML = displayMenu;
        
      }
      