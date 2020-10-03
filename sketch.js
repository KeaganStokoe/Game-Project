/*
Explanation of extensions:

    1. Add advanced graphics: I added a variety of colours and details to my game. This included making my game character look like a robot, making the final checkpoint a rocket ship that takes off with flames appearing at the base of it, and using a colour palette that makes the game seem as if it is taking place on a different planet. At times I struggled to find colours that complemented each other, and which looked aesthetic within the game world. I learnt valuable design lessons and was forced to think about the player experience as I added different features and graphics. I believe this will be valuable should I ever build client-facing products in the future. 
    
    2. Add sound: I added four different sounds to my game. I added a sound for collecting a collectable, for jumping, for falling into the canyon and for reaching the end of the level. Initially, I struggled with finding the sounds, and finding sounds of the correct length. Eventually, I located a website that allowed me to download sounds, and then I used a sound snipping tool to cut the sound to only the parts that I wanted. This was a valuable lesson in working through a problem and finding a solution to it using external resources. Including the sound at the correct points in the game enabled me to practice working with the game logic.  
    
    3. Add platforms: I added platforms to my game. This was a great way to practice using the factory pattern method. I had watched the videos and understood how the factory method worked, but actually implementing it made it clear how powerful this method is. The ease of adding more platforms shows me that it is an important and useful tool to have in my programming toolkit. I enjoyed adding platforms of varying heights and placing collectables above these platforms because it made the game more challenging. I struggled with using the distance function to make sure that my character remained on top of the platform, but as I worked through the problem I was able to figure it out and reaffirm my understanding of the game logic.  
    
    Other: Formatting my code was an important lesson to learn. A part I struggled with is the fact that the formatting used throughout the course and the way that the p5.js code documents are formatted differ slightly. I formatted my code in accordance with the course and particularly with the advice offered in the video 'The elegant coder' because that style of formatting made it easier to read and understand the code. 
        
*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var trees_x;
var clouds;
var mountains;
var collectables;
var canyon;
var platforms;

var game_score;
var lives;
var rocketShip;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

function preload() 
{
    soundFormats('mp3', 'wav');

    //Load sounds used in game
    jumpSound = loadSound('assets/jump.mp3');
    jumpSound.setVolume(0.2);

    collectSound = loadSound('assets/collect.wav');
    collectSound.setVolume(0.15);

    lifeLostSound = loadSound('assets/life_lost.wav');
    lifeLostSound.setVolume(0.05);

    levelCompleteSound = loadSound('assets/level_complete.wav');
    levelCompleteSound.setVolume(0.3);
}

function setup() 
{
    createCanvas(1024, 576);
    floorPos_y = height * 3 / 4;
    lives = 3;
    startGame();
}

function draw() 
{
    // Fill the sky navy
    background(11, 0, 84);

    // Draw pink ground
    noStroke();
    fill(220, 50, 100);
    rect(0, floorPos_y, width, height / 4);

    // Push and translate functions
    push();
    translate(scrollPos, 0);

    // Draw clouds
    drawClouds();

    // Draw mountains
    drawMountains();

    // Draw trees
    drawTrees();

    // Draw canyons
    for (var i = 0; i < canyon.length; i++) 
    {
        drawCanyon(canyon[i]);
        checkCanyon(canyon[i]);
    }

    // Draw collectable items
    for (var i = 0; i < collectables.length; i++) 
    {
        if (!collectables[i].isFound) 
        {
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]);
        }
    }

    // Draw platforms
    for (var i = 0; i < platforms.length; i++) 
    {
        platforms[i].draw();
    }

    // Draw rocketship
    renderRocketship();

    pop();

    // Draw game character
    drawGameChar();

    // Draw game score to top left of screen
    fill(255);
    noStroke();
    textSize(22);
    text("Score: " + game_score, 20, 30)

    // Draw lives remaining to top right of screen
    for (var i = 0; i < lives; i++) 
    {
        fill(255);
        noStroke();
        textSize(22);
        text("Lives: ", width - 200, 38)

        fill(255, 215, 0)
        ellipse((900 + i * 40), 30, 30)
    }

    // Text to display game over
    if (lives < 1) 
    {
        gameChar_y += 100
        fill(255);
        noStroke();
        textSize(48);
        text("Game over. Press space to continue.",
          width / 2 - 400, height / 2)
        return;
    }

    // Text to display level complete
    if (rocketShip.isReached == true) 
    {
        fill(255);
        noStroke();
        textSize(48);
        text("Level complete. Press space to continue.",
          width / 2 - 400, height / 2 - 180)
        return;
    }

    // Logic to make the game character move or the background scroll.
    if (isLeft) 
    {
        if (gameChar_x > width * 0.2) 
        {
          gameChar_x -= 5;
        } 
        else 
        {
          scrollPos += 5;
        }
    }

    if (isRight) 
    {
        if (gameChar_x < width * 0.8) 
        {
          gameChar_x += 5;
        } 
        else 
        {
          scrollPos -= 5; // negative for moving against the background
        }
    }

    // Logic to make the game character rise and fall.
    if (gameChar_y < floorPos_y) 
    {
        var isContact = false;
        for (var i = 0; i < platforms.length; i++) 
        {
          if (platforms[i].checkContact(gameChar_world_x, gameChar_y) == true) 
          {
            isContact = true;
            break;
          }
        }
        if (isContact == false) 
        {
          gameChar_y += 2;
          isFalling = true;
        }
    } 
    else 
    {
        isFalling = false;
    }
    if (isPlummeting) 
    {
        gameChar_y += 9;
        lifeLostSound.play();
    }

    // Logic to recognise end of level
    if (rocketShip.isReached == false) 
    {
        checkRocketship();
    }

    // Update real position of gameChar for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;

    //Function to check if player has died
    checkPlayerDie();
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed() 
{
  // Left arrow or A to move left
  if (key == "A" || keyCode == 37) 
  {
    isLeft = true;
  }

  // Right arrow or D to move right
  if (key == "D" || keyCode == 39) 
  {
    isRight = true;
  }

  // Space or W to jump
  if (key == " " || key == "W") 
  {
    if (!isFalling) 
    {
      gameChar_y -= 100;
      jumpSound.play();
    }
  }
}

function keyReleased() 
{
  if (key == "A" || keyCode == 37) 
  {
    isLeft = false;
  } else if (key == "D" || keyCode == 39) 
  {
    isRight = false;
  }
}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.
function drawGameChar() 
{
    if (isLeft && isFalling) 
      {
        //jumping-left code
        fill(238, 130, 238);
        ellipse(gameChar_x - 6, gameChar_y - 62, 10, 10); //character eye

        fill(47, 79, 79);
        rect(gameChar_x - 8, gameChar_y - 70, 20, 19, 5); //character head

        fill(47, 79, 79);
        rect(gameChar_x - 6, gameChar_y - 55, 16, 20, 2); //character body

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x + 1, gameChar_y - 35, gameChar_x + 10, gameChar_y - 24.5)
        noStroke(0); //character legs

        fill(47, 79, 79);
        ellipse(gameChar_x + 10, gameChar_y - 24.5, 8, 8); //character wheel

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 50, gameChar_x - 7, gameChar_y - 60)
        noStroke(0); //character arms
      } 
    else if (isRight && isFalling) 
      {
        //jumping-right code
        fill(238, 130, 238);
        ellipse(gameChar_x + 10, gameChar_y - 62, 10, 10); //character eye

        fill(47, 79, 79);
        rect(gameChar_x - 8, gameChar_y - 70, 20, 19, 5); //character head

        fill(47, 79, 79);
        rect(gameChar_x - 6, gameChar_y - 55, 16, 20, 2); //character body

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x + 1, gameChar_y - 35, gameChar_x - 6, gameChar_y - 24.5)
        noStroke(0); //character legs

        fill(47, 79, 79);
        ellipse(gameChar_x - 6, gameChar_y - 24.5, 8, 8); //character wheel

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 50, gameChar_x + 9, gameChar_y - 60)
        noStroke(0); //character arms
      } 
    else if (isLeft) 
      {
        //walking left code
        fill(238, 130, 238);
        ellipse(gameChar_x - 6, gameChar_y - 52, 10, 10); //character eye

        fill(47, 79, 79);
        rect(gameChar_x - 8, gameChar_y - 60, 20, 19, 5); //character head

        fill(47, 79, 79);
        rect(gameChar_x - 6, gameChar_y - 45, 16, 20, 2); //character body

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x + 1, gameChar_y - 25, gameChar_x + 3, gameChar_y - 14.5)
        noStroke(0); //character legs

        fill(47, 79, 79);
        ellipse(gameChar_x + 3, gameChar_y - 14.5, 8, 8); //character wheel

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 40, gameChar_x - 6, gameChar_y - 30)
        noStroke(0); //character arms
      } 
    else if (isRight) 
      {
        //walking right code
        fill(238, 130, 238);
        ellipse(gameChar_x + 10, gameChar_y - 52, 10, 10); //character eye

        fill(47, 79, 79);
        rect(gameChar_x - 8, gameChar_y - 60, 20, 19, 5); //character head

        fill(47, 79, 79);
        rect(gameChar_x - 6, gameChar_y - 45, 16, 20, 2); //character body

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x + 1, gameChar_y - 25, gameChar_x - 1, gameChar_y - 14.5)
        noStroke(0); //character legs

        fill(47, 79, 79);
        ellipse(gameChar_x - 1, gameChar_y - 14.5, 8, 8); //character wheel

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 40, gameChar_x + 9, gameChar_y - 30)
        noStroke(0); //character arms
      } 
    else if (isFalling || isPlummeting) 
      {
        //    //jumping facing forwards code
        fill(47, 79, 79);
        rect(gameChar_x - 13, gameChar_y - 70, 26, 18, 5); //character head

        fill(47, 79, 79);
        rect(gameChar_x - 9, gameChar_y - 60, 18, 30, 2); //character body

        fill(238, 130, 238);
        ellipse(gameChar_x, gameChar_y - 62, 18, 11);
        stroke(47, 79, 79);
        strokeWeight(6);
        point(gameChar_x, gameChar_y - 62) //character eye

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x - 8, gameChar_y - 30, gameChar_x - 4, gameChar_y - 16.5)
        line(gameChar_x + 7, gameChar_y - 30, gameChar_x + 3, gameChar_y - 16.5)
        noStroke(0); //character legs

        fill(47, 79, 79);
        ellipse(gameChar_x, gameChar_y - 15, 6, 9); //character wheel

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x - 10, gameChar_y - 50, gameChar_x - 17, gameChar_y - 40)
        line(gameChar_x + 9, gameChar_y - 50, gameChar_x + 16, gameChar_y - 40)
        noStroke(0); //character arms
      } 
    else 
      {
        //front facing code
        fill(47, 79, 79);
        rect(gameChar_x - 13, gameChar_y - 60,
          26, 18, 5); //character head

        fill(47, 79, 79);
        rect(gameChar_x - 9, gameChar_y - 50,
          18, 30, 2); //character body

        fill(238, 130, 238);
        ellipse(gameChar_x, gameChar_y - 52, 18, 11);
        stroke(47, 79, 79);
        strokeWeight(6);
        point(gameChar_x, gameChar_y - 52) //character eye

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x - 8, gameChar_y - 20,
          gameChar_x - 4, gameChar_y - 6.5)
        line(gameChar_x + 7, gameChar_y - 20,
          gameChar_x + 3, gameChar_y - 6.5)
        noStroke(0); //character legs

        fill(47, 79, 79);
        ellipse(gameChar_x, gameChar_y - 5, 6, 9); //character wheel

        stroke(192, 192, 192);
        strokeWeight(3);
        line(gameChar_x - 10, gameChar_y - 40,
          gameChar_x - 12, gameChar_y - 30)
        line(gameChar_x + 9, gameChar_y - 40,
          gameChar_x + 11, gameChar_y - 30)
        noStroke(0); //character arms
      }
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds() 
{
    for (var i = 0; i < clouds.length; i++) 
    {
        fill(255, 250, 250);
        ellipse(clouds[i].pos_x, clouds[i].pos_y, 60, 60);
        ellipse(clouds[i].pos_x + 28, clouds[i].pos_y, 45, 45);
        ellipse(clouds[i].pos_x - 28, clouds[i].pos_y, 45, 45);

        fill(255, 240, 245);
        ellipse(clouds[i].pos_x + 20, clouds[i].pos_y + 20, 60, 60);
        ellipse(clouds[i].pos_x + 48, clouds[i].pos_y + 20, 45, 45);
        ellipse(clouds[i].pos_x - 8, clouds[i].pos_y + 20, 45, 45);
    }
}

// Function to draw mountains objects.
function drawMountains() 
{
    for (var i = 0; i < mountain.length; i++) 
    {
        fill(105, 105, 105);
        triangle(mountain[i].pos_x - 50, mountain[i].pos_y,
          mountain[i].pos_x + 100, mountain[i].pos_y - 250,
          mountain[i].pos_x + 250, mountain[i].pos_y);

        fill(255, 240, 245);
        triangle(mountain[i].pos_x + 60, mountain[i].pos_y - 180,
          mountain[i].pos_x + 100, mountain[i].pos_y - 250,
          mountain[i].pos_x + 140, mountain[i].pos_y - 180);
    }
}

// Function to draw tree objects.
function drawTrees() 
{
    for (var i = 0; i < trees_x.length; i++) 
    {
        fill(216, 191, 216);
        rect(trees_x[i] + 75, floorPos_y - 100, 50, 105);

        fill(95, 158, 160);
        triangle(trees_x[i] + 25, floorPos_y - 100,
          trees_x[i] + 100, floorPos_y - 200,
          trees_x[i] + 175, floorPos_y - 100);

        triangle(trees_x[i], -50 + floorPos_y,
          trees_x[i] + 100, floorPos_y - 150,
          trees_x[i] + 200, floorPos_y - 50);
    }
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon) 
{
      fill(11, 0, 84);
      rect(t_canyon.pos_x,
        floorPos_y,
        t_canyon.width, 176);

      fill(255, 160, 20);
      rect(t_canyon.pos_x,
        floorPos_y + 70,
        t_canyon.width, 176);
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon) 
{
  if (gameChar_world_x > t_canyon.pos_x &&
    gameChar_world_x < t_canyon.pos_x + t_canyon.width &&
    gameChar_y >= floorPos_y) 
  {
      isPlummeting = true;
  }
}

//Function to render rocketship
function renderRocketship() 
{
    if (rocketShip.isReached) 
    {
        fill(148, 0, 211);
        rect(rocketShip.pos_x, floorPos_y - 80, 70, 20);
        ellipse(rocketShip.pos_x + 35, floorPos_y - 105, 50, 110)
        fill(255, 215, 0)
        ellipse(rocketShip.pos_x + 35, floorPos_y - 105, 30, 60)
        fill(255, 69, 0);
        rect(rocketShip.pos_x + 10, floorPos_y - 60, 50, 10);
    } 
    else 
    {
        fill(148, 0, 211);
        rect(rocketShip.pos_x, floorPos_y - 20, 70, 20);
        ellipse(rocketShip.pos_x + 35, floorPos_y - 55, 50, 110)
        fill(255, 215, 0)
        ellipse(rocketShip.pos_x + 35, floorPos_y - 65, 30, 60)
    }

}

//function to check if rocketship is reached
function checkRocketship() 
{
    var d = abs(gameChar_world_x - rocketShip.pos_x);
    if (d < 15) 
    {
        rocketShip.isReached = true;
        isFalling = true;
        levelCompleteSound.play();
    }
}

//function to create platforms
function createPlatforms(x, y, length, width) 
{
  var p = 
      { x: x,
        y: y,
        length: length,
        width: width,
        draw: function() 
        {
          fill(0, 255, 255);
          rect(this.x, this.y, this.length, this.width);
        },
        checkContact: function(gc_x, gc_y) 
        {
          if (gc_x > this.x && gc_x < this.x + this.length) 
          {
            var d = this.y - gc_y;
            if (d >= 0 && d < 2) 
            {
              isFalling = false;
              return true;
            }
          }
      return false;
        }
      }
  return p;
}

//function to check if player has died
function checkPlayerDie() 
{
    if (gameChar_y == height) 
    {
        lives -= 1;

        if (lives > 0) 
        {
          startGame()
        }
    }

}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.
function drawCollectable(t_collectable) 
{
    fill(220, 0, 100);
    stroke(255, 228, 225);
    strokeWeight(7);
    ellipse(t_collectable.pos_x,
    t_collectable.pos_y,
    t_collectable.size);
    noStroke();

}

// Function to check character has collected an item.
function checkCollectable(t_collectable) 
{
    if (dist(gameChar_world_x, gameChar_y,
      t_collectable.pos_x, t_collectable.pos_y) < 50) 
        {
            t_collectable.isFound = true;
            game_score += 1;
            collectSound.play();
        }
}

// ----------------------------------
// Start game function
// ----------------------------------

//function to start the game
function startGame() 
{
  gameChar_x = width / 2;
  gameChar_y = floorPos_y;
  gameChar_body_colour = fill (238, 130, 238);

  // Variable to control the background scrolling.
  scrollPos = 0;

  // Variable to store the real position of the gameChar in the game
  // world. Needed for collision detection.
  gameChar_world_x = gameChar_x - scrollPos;

  // Boolean variables to control the movement of the game character.
  isLeft = false;
  isRight = false;
  isFalling = false;
  isPlummeting = false;

  // Initialise arrays of scenery objects.
  trees_x = 
      [
        70,
        320,
        850,
        1600,
        2200
      ];

  clouds =
      [
          {
              pos_x: 100,
              pos_y: 200
          },
          {
              pos_x: 400,
              pos_y: 120
          },
          {
              pos_x: 750,
              pos_y: 200
          },
          {
              pos_x: 1350,
              pos_y: 180
          },
          {
              pos_x: 1650,
              pos_y: 150
          }
       ];

  mountain = 
       [
         {
           pos_x: width / 2 - 120,
           pos_y: floorPos_y
         },
         {
           pos_x: width / 2 + 1400,
           pos_y: floorPos_y
         },
       ];

  collectables = 
       [
        {
          pos_x: 50,
          pos_y: floorPos_y - 40,
          size: 40,
          isFound: false
        },
        {
          pos_x: 170,
          pos_y: floorPos_y - 180,
          size: 40,
          isFound: false
        },
        {
          pos_x: 600,
          pos_y: floorPos_y - 40,
          size: 40,
          isFound: false
        },
        {
          pos_x: 900,
          pos_y: floorPos_y - 40,
          size: 40,
          isFound: false
        },
        {
          pos_x: 1200,
          pos_y: floorPos_y - 40,
          size: 40,
          isFound: false
        },
        {
          pos_x: 1350,
          pos_y: floorPos_y - 40,
          size: 40,
          isFound: false
        },
        {
          pos_x: 1700,
          pos_y: floorPos_y - 40,
          size: 40,
          isFound: false
        },
        {
          pos_x: 2015,
          pos_y: floorPos_y - 240,
          size: 40,
          isFound: false
        },
        {
          pos_x: 2250,
          pos_y: floorPos_y - 40,
          size: 40,
          isFound: false
        },
      ];

  canyon = 
      [
        {
          pos_x: 680,
          width: 140
        },
        {
          pos_x: 1400,
          width: 140
        },
      ];

  platforms = [];

  platforms.push(createPlatforms(85, floorPos_y - 90, 170, 20))
  platforms.push(createPlatforms(1750, floorPos_y - 90, 200, 20))
  platforms.push(createPlatforms(1955, floorPos_y - 150, 150, 20))

  game_score = 0;

  rocketShip = 
      {
        pos_x: 2500,
        isReached: false
      };
}