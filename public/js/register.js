const form = document.getElementById("registerForm");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const button = document.querySelector("button");

    button.disabled = true;

    button.innerHTML = "Creating Account...";

    try{

        const response = await fetch("/customers/register",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                first_name:document.getElementById("first_name").value,

                last_name:document.getElementById("last_name").value,

                email:document.getElementById("email").value,

                phone:document.getElementById("phone").value,

                password:document.getElementById("password").value,

                confirm_password:document.getElementById("confirm_password").value

            })

        });

        const result=await response.json();

        if(!response.ok){

            throw new Error(result.message);

        }

        alert(result.message);

        window.location.href="/login.html";

    }

    catch(err){

        alert(err.message);

        button.disabled=false;

        button.innerHTML="Create Account";

    }

});
