let initialCenter = window.innerWidth/2.0;
let lastMouseBody = null;
let footRot = 0.2;
let headAngleLimit = 1.0;
let flagHolding = false;
let sprites = {
    1: {head: {isRound: true, xScale: 0.1, yScale: 0.1, y: 2, radius: 25, height: null, width: null}, 
        body: {isUnderHead: true, xScale: 0.1, yScale: 0.1, y: 50, height: 60, width: 40},
        foot: {distance: 15, y: 81, height: 11, width:6, chamfer: {0:[0,3.5,0,0], 1:[3.5,0,0,0]}, 
        fillStyle: '#375b95'}},
    2: {head: {isRound: true, xScale: 0.08, yScale: 0.08, y: 12, radius: 22, height: null, width: null}, 
        body: {isUnderHead: true, xScale: 0.1, yScale: 0.1, y: 50, height: 60, width: 40},
        foot: {distance: 12, y: 78, height: 11, width:6, chamfer: {0:[0,3.5,0,0], 1:[3.5,0,0,0]}, 
        fillStyle: '#563b4d'}},
    3: {head: {isRound: false, xScale: 0.12, yScale: 0.12, y: -10, radius: null, height: 50, width: 62}, 
        body: {isUnderHead: false, xScale: 0.2, yScale: 0.2, y: 50, height: 120, width: 80},
        foot: {distance: 28, y: 100, height: 18, width:10, chamfer: {0:[0,3.5,0,0], 1:[3.5,0,0,0]}, 
        fillStyle: '#50355e'}}
};

function init(world, mouseConstraint){
    let ground = Matter.Bodies.rectangle(initialCenter,600,5000,60,{ isStatic: true });
    Matter.World.add(world, ground);

    // Creating initial bodies
    genRandomCharacter(world, mouseConstraint, 5);

    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
        if(event.mouse.button === 1)
            genRandomCharacter(engine.world, mouseConstraint, 3);
    });
}

function genRandomCharacter(world, mouseConstraint, qty){
    while (qty-- > 0) {     
        let spriteId = Math.floor(Math.random() * Object.keys(sprites).length) + 1;
        genCharacter(world, mouseConstraint, spriteId);
    }
}

function getHead(spriteId){
    let head;
    let spriteHead = sprites[spriteId].head;

    if(spriteHead.isRound){
        head = Matter.Bodies.circle(initialCenter,spriteHead.y,spriteHead.radius,{
            render: {
                sprite: {
                    texture: "assets/Sprite" + spriteId + "-Head.png",
                    xScale: spriteHead.xScale,
                    yScale: spriteHead.yScale,
                    angle: 0
                }
            }
        });
    }
    else {
        head = Matter.Bodies.rectangle(initialCenter,spriteHead.y,spriteHead.height,spriteHead.width,{
            render: {
                sprite: {
                    texture: "assets/Sprite" + spriteId + "-Head.png",
                    xScale: spriteHead.xScale,
                    yScale: spriteHead.yScale,
                    angle: 0
                }
            }
        });
    }
    return head;
}

function getBody(spriteId){
    let spriteBody = sprites[spriteId].body;

    return Matter.Bodies.rectangle(initialCenter,spriteBody.y,spriteBody.height,spriteBody.width, {
        render: {
            sprite: {
                texture: "assets/Sprite" + spriteId + "-Body.png",
                xScale: spriteBody.xScale,
                yScale: spriteBody.yScale,
                angle: 0
            }
        }
    });
}

function getFoot(spriteId, foot){
    let spriteFoot = sprites[spriteId].foot;
    let side = 1;

    if(foot == 1)
        side = -1;
    
    return Matter.Bodies.rectangle(initialCenter + (spriteFoot.distance * side),spriteFoot.y,spriteFoot.height,spriteFoot.width, {
        chamfer: {
            radius: spriteFoot.chamfer[foot]
          },
        render: {
            fillStyle: spriteFoot.fillStyle
        }
    });
}

function genCharacter(world, mouseConstraint, spriteId) {
    initialCenter = window.innerWidth/2.0;

    let head = getHead(spriteId);

    let body = getBody(spriteId);

    let leftFoot = getFoot(spriteId, 0);

    let rightFoot = getFoot(spriteId, 1);
    
    var character;

    if (sprites[spriteId].body.isUnderHead)
        character = Matter.Body.create({
            parts: [leftFoot, rightFoot, body, head]
        });
    else
        character = Matter.Body.create({
            parts: [leftFoot, rightFoot, head, body]
        });

    var partsQty = character.parts.length;

    Matter.World.add(world, [character]);

    Matter.Events.on(engine, 'beforeUpdate', function(event) {

        // Updating parts with compound body angle
        Matter.Body.setAngle(head, character.angle);
        Matter.Body.setAngle(body, character.angle);
        
        if(character.parts.length >= partsQty){

            // Character tends to stand
            if(Matter.Body.getSpeed(character) <= 0.1){
                if (character.angle > 0)
                    character.torque = -0.2;
                else if (character.angle < 0)
                    character.torque = 0.2;

                Matter.Body.setAngularVelocity(character, Math.min(Math.max(character.angularVelocity, -0.1), 0.1));
            }

            if(flagHolding && lastMouseBody === character){
                
                // Head rotation when grabbing
                var headRotSpeed = 0.05;
                if(++headAngleLimit > 2)
                    headAngleLimit *= -1;

                // rotaciona a head com um ângulo relativo ao seu ângulo atual
                Matter.Body.rotate(head, headRotSpeed * headAngleLimit);

                if (leftFoot.angle > 1.5)
                    footRot = -0.15;
                else if (leftFoot.angle < 0)
                    footRot = 0.15;

                Matter.Body.rotate(leftFoot, footRot);
                Matter.Body.rotate(rightFoot, footRot*-1);
            }
    }
    });

    function restoreDefaultBody(){
        head.render.sprite.texture = "assets/Sprite" + spriteId + "-Head.png"
        Matter.Body.setAngle(leftFoot, 0);
        Matter.Body.setAngle(rightFoot, 0);
    }

    Matter.Events.on(mouseConstraint, 'mouseup', function(event) {
        flagHolding = false;
        restoreDefaultBody();   
    });

    Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
        // Saving body being held
        if (event.mouse.button != 2){
            flagHolding = true;
            lastMouseBody = mouseConstraint.body;

            if (lastMouseBody === character) // Changing head sprite when being held
                head.render.sprite.texture = "assets/Sprite" + spriteId + "-HeadGrab.png";
            else if (character.parts.length >= partsQty) // Restoring default body, if alive
                restoreDefaultBody(); 
        } 

        // Head cutting
        if (event.mouse.button === 2 && character.parts.length >= partsQty) {
            if (lastMouseBody === character) {
                character.parts.splice(character.parts.findIndex(x => x === head), 1);

                Matter.Body.rotate(character, 0.3);
                body.render.sprite.texture = "assets/Sprite" + spriteId + "-BodyDead.png";
                
                Matter.World.add(world, Matter.Bodies.circle(character.position.x,
                    character.position.y,25,{
                    angle: character.angle - 0.6,
                    render: {
                        sprite: {
                            texture: "assets/Sprite" + spriteId + "-HeadDead.png",
                            xScale: sprites[spriteId].head.xScale,
                            yScale: sprites[spriteId].head.yScale,
                        }
                    }
                }));
            }
            
        }
    });
}