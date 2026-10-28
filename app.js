async function sendMessage(){


let input =
document.getElementById("question");


let message=input.value;



document.getElementById("messages").innerHTML +=

"<p><b>You:</b> "+message+"</p>";



let response = await fetch(
"http://localhost:5000/chat",
{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

message:message

})


});



let data = await response.json();



document.getElementById("messages").innerHTML +=

"<p><b>Klein Assistant:</b> "+data.reply+"</p>";



input.value="";


}
