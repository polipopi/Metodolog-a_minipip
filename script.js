// Pega aquí la URL de implementación de Google Apps Script cuando configures la hoja.
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcBxEnzgSVCPTaC3XP6dnr51mfjvL1XgRW5c8Pli_SWGSmMAn8ojp2gOPpXeTTITVhLg/exec";

const questions = [
  "Soy el alma de la fiesta.",
  "Soy sensible hacia las emociones de otros.",
  "Realizo mis tareas inmediatamente.",
  "Tengo frecuentes cambios de ánimo.",
  "Tengo mucha imaginación.",
  "No hablo mucho.",
  "No me interesan los problemas de otras personas.",
  "A menudo olvido poner las cosas en su lugar.",
  "Estoy relajado la mayor parte del tiempo.",
  "No estoy interesado en las ideas abstractas.",
  "En las fiestas hablo con muchas personas.",
  "Siento las emociones de los otros.",
  "Me gusta el orden.",
  "Me molesto fácilmente.",
  "Tengo dificultad para entender ideas abstractas.",
  "Prefiero pasar desapercibido.",
  "En realidad no estoy interesado en los demás.",
  "Soy desordenado.",
  "Rara vez me siento triste.",
  "No tengo buena imaginación."
];

const dimensions = [
  {name:"Extraversión", items:[1,6,11,16], reverse:[6,16], description:"Tendencia a ser sociable, activo y expresivo."},
  {name:"Amabilidad", items:[2,7,12,17], reverse:[7,17], description:"Tendencia a responder con empatía y cooperación."},
  {name:"Responsabilidad", items:[3,8,13,18], reverse:[8,18], description:"Organización, planificación y perseverancia."},
  {name:"Neuroticismo", items:[4,9,14,19], reverse:[9,19], description:"Tendencia a experimentar emociones negativas."},
  {name:"Intelecto / Imaginación", items:[5,10,15,20], reverse:[10,15,20], description:"Interés por ideas, imaginación y curiosidad intelectual."}
];

const welcome = document.querySelector("#welcome");
const participantForm = document.querySelector("#participantForm");
const quizForm = document.querySelector("#quizForm");
const results = document.querySelector("#results");
const questionsContainer = document.querySelector("#questions");
let participant = {};
let answers = {};

document.querySelector("#startButton").addEventListener("click",()=>{
  welcome.classList.add("hidden");
  participantForm.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
});

participantForm.addEventListener("submit",event=>{
  event.preventDefault();
  const data = new FormData(participantForm);
  participant = {
    fullName:String(data.get("fullName")).trim(),
    email:String(data.get("email")).trim(),
    career:String(data.get("career")).trim(),
    mood:Number(data.get("mood"))
  };
  if(!/^[A-Z0-9._%+-]+@espol\.edu\.ec$/i.test(participant.email)){
    alert("Ingresa tu correo institucional de ESPOL (@espol.edu.ec).");
    return;
  }
  participantForm.classList.add("hidden");
  renderQuestions();
  quizForm.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
});

function renderQuestions(){
  questionsContainer.innerHTML = questions.map((question,index)=>`
    <section class="question">
      <p>${index+1}. ${question}</p>
      <div class="answers">
        ${[1,2,3,4,5].map(value=>`
          <label><input type="radio" name="q${index+1}" value="${value}" required><span class="answer-number">${value}</span><small>${["Muy impreciso","Moderadamente impreciso","Neutro","Moderadamente preciso","Muy preciso"][value-1]}</small></label>
        `).join("")}
      </div>
    </section>`).join("");
  questionsContainer.addEventListener("change",updateProgress);
}

function updateProgress(){
  const count = Object.keys(answers).length;
  answers = {};
  questions.forEach((_,index)=>{
    const selected = quizForm.querySelector(`input[name="q${index+1}"]:checked`);
    if(selected) answers[index+1] = Number(selected.value);
  });
  const answered = Object.keys(answers).length;
  document.querySelector("#progressText").textContent = `${answered} de 20`;
  document.querySelector("#progressBar").style.width = `${answered/20*100}%`;
  document.querySelector("#submitQuiz").disabled = answered !== 20;
}

quizForm.addEventListener("submit",event=>{
  event.preventDefault();
  if(Object.keys(answers).length!==20) return;
  const scores = dimensions.map(dimension=>{
    const values = dimension.items.map(item=>{
      const value = answers[item];
      return dimension.reverse.includes(item) ? 6-value : value;
    });
    const mean = values.reduce((sum,value)=>sum+value,0)/values.length;
    return {...dimension, score:Math.round(((mean-1)/4)*100)};
  });
  const participantCode = "ESP-" + crypto.randomUUID().slice(0,8).toUpperCase();
  const payload = {
    participantCode,
    ...participant,
    timestamp:new Date().toISOString(),
    answers,
    scores:Object.fromEntries(scores.map(score=>[score.name,score.score]))
  };
  showResults(scores,participantCode);
  sendResults(payload);
});

function showResults(scores,code){
  quizForm.classList.add("hidden");
  results.classList.remove("hidden");
  document.querySelector("#participantCode").textContent = code;
  document.querySelector("#scoreCards").innerHTML = scores.map(score=>`
    <article class="score-card">
      <div class="score-title"><span>${score.name}</span><span class="score-value">${score.score}</span></div>
      <div class="score-track"><div style="width:${score.score}%"></div></div>
      <p>${score.description}</p>
    </article>`).join("");
  window.scrollTo({top:0,behavior:"smooth"});
}

function sendResults(payload){
  const status = document.querySelector("#saveStatus");
  if(!GOOGLE_SCRIPT_URL){
    status.textContent = "La prueba se completó. La hoja de cálculo todavía no está conectada; configura la URL de Google Apps Script para guardar las respuestas.";
    return;
  }
  fetch(GOOGLE_SCRIPT_URL,{
    method:"POST",
    mode:"no-cors",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(payload)
  }).then(()=>{
    status.textContent = "Solicitud de registro enviada. Verifica la nueva fila en la hoja de cálculo.";
  }).catch(()=>{
    status.textContent = "No se pudo enviar el registro. Comunícate con el equipo investigador.";
  });
}

document.querySelector("#restartButton").addEventListener("click",()=>{
  results.classList.add("hidden");
  welcome.classList.remove("hidden");
  participantForm.reset();
  quizForm.reset();
  answers={};
  participant={};
  updateProgress();
  window.scrollTo({top:0,behavior:"smooth"});
});
