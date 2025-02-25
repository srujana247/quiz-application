const startBtn = document.querySelector(".start"),
  numQuestions = document.querySelector("#num-questions"),
  category = document.querySelector("#category"),
  difficulty = document.querySelector("#difficulty"),
  timePerQuestion = document.querySelector("#time"),
  quiz = document.querySelector(".quiz"),
  startScreen = document.querySelector(".start-screen"),
  endScreen = document.querySelector(".end-screen"),
  submitBtn = document.querySelector(".submit"),
  nextBtn = document.querySelector(".next"),
  logoutButton = document.querySelector(".logout-button");

let questions = [],
  time = 30,
  score = 0,
  currentQuestion,
  timer;

// Start Quiz
startBtn.addEventListener("click", () => {
  const num = numQuestions.value,
    cat = category.value,
    diff = difficulty.value;

  // Show loading animation
  startBtn.innerHTML = "Loading...";
  startBtn.disabled = true;

  // Fetch questions from the API
  const url = `https://opentdb.com/api.php?amount=${num}&category=${cat}&difficulty=${diff}&type=multiple`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.results && data.results.length > 0) {
        questions = data.results;
        startBtn.innerHTML = "Start Quiz";
        startBtn.disabled = false;

        // Hide start screen and show quiz screen
        startScreen.classList.remove("active");
        quiz.classList.add("active");

        // Hide logout button
        logoutButton.style.display = "none";

        // Start the quiz
        currentQuestion = 0;
        showQuestion(questions[currentQuestion]);
      } else {
        alert("Failed to load questions. Please try again.");
        startBtn.innerHTML = "Start Quiz";
        startBtn.disabled = false;
      }
    })
    .catch((error) => {
      console.error("Error fetching questions:", error);
      alert("An error occurred. Please check your connection and try again.");
      startBtn.innerHTML = "Start Quiz";
      startBtn.disabled = false;
    });
});

// Show Question
const showQuestion = (question) => {
  const questionText = document.querySelector(".question"),
    answersWrapper = document.querySelector(".answer-wrapper"),
    questionNumber = document.querySelector(".number");

  // Display question text
  questionText.innerHTML = question.question;

  // Display question number
  questionNumber.innerHTML = `Question <span class="current">${
    currentQuestion + 1
  }</span><span class="total">/${questions.length}</span>`;

  // Shuffle and display answers
  const answers = [
    ...question.incorrect_answers,
    question.correct_answer.toString(),
  ];
  answers.sort(() => Math.random() - 0.5);
  answersWrapper.innerHTML = "";
  answers.forEach((answer) => {
    answersWrapper.innerHTML += `
      <div class="answer">
        <span class="text">${answer}</span>
        <span class="checkbox">
          <i class="fas fa-check"></i>
        </span>
      </div>
    `;
  });

  // Add event listeners to answers
  const answersDiv = document.querySelectorAll(".answer");
  answersDiv.forEach((answer) => {
    answer.addEventListener("click", () => {
      if (!answer.classList.contains("checked")) {
        answersDiv.forEach((a) => a.classList.remove("selected"));
        answer.classList.add("selected");
        submitBtn.disabled = false;
      }
    });
  });

  // Start timer
  time = timePerQuestion.value;
  startTimer(time);
};

// Timer
const startTimer = (time) => {
  const progressBar = document.querySelector(".progress-bar"),
    progressText = document.querySelector(".progress-text");

  let counter = time;
  timer = setInterval(() => {
    if (counter >= 0) {
      const percentage = (counter / time) * 100;
      progressBar.style.width = `${percentage}%`;
      progressText.innerHTML = `${counter}`;
      counter--;
    } else {
      clearInterval(timer);
      checkAnswer();
    }
  }, 1000);
};

// Check Answer
const checkAnswer = () => {
  clearInterval(timer); // Stop the timer
  const selectedAnswer = document.querySelector(".answer.selected");
  if (selectedAnswer) {
    const answer = selectedAnswer.querySelector(".text").innerHTML;
    if (answer === questions[currentQuestion].correct_answer) {
      score++;
      selectedAnswer.classList.add("correct");
    } else {
      selectedAnswer.classList.add("wrong");
      document.querySelectorAll(".answer").forEach((answer) => {
        if (
          answer.querySelector(".text").innerHTML ===
          questions[currentQuestion].correct_answer
        ) {
          answer.classList.add("correct");
        }
      });
    }
  }
  document.querySelectorAll(".answer").forEach((answer) => {
    answer.classList.add("checked");
  });
  submitBtn.style.display = "none";
  nextBtn.style.display = "block"; // Show Next button after submission
};

// Submit Button
submitBtn.addEventListener("click", () => {
  checkAnswer(); // Check answer immediately
});

// Next Button
nextBtn.addEventListener("click", () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion(questions[currentQuestion]);
    submitBtn.style.display = "block";
    nextBtn.style.display = "none"; // Hide Next button for the new question
    submitBtn.disabled = true; // Disable Submit button until an answer is selected
  } else {
    showScore();
  }
});

// Show Score
const showScore = () => {
  quiz.classList.remove("active");
  endScreen.classList.add("active");
  document.querySelector(".final-score").innerHTML = score;
  document.querySelector(".total-score").innerHTML = `/${questions.length}`;
};

// Restart Quiz
document.querySelector(".restart").addEventListener("click", () => {
  window.location.reload();
});