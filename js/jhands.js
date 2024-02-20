let initialCenter = window.innerWidth/2.0;
let lastMouseBody = null;
let footRot = 0.2;
let headAngleLimit = 1.0;
let scales = {
    1: {roundHead: true, xScale: 0.1, yScale: 0.1, footChamferRadius: 
        {0:[3.5,0,0,0], 1:[0,3.5,0,0]}, footFillStyle: '#375b95'}
};

function init(world, mouseConstraint){
    let ground = Matter.Bodies.rectangle(initialCenter,600,5000,60,{ isStatic: true });
    Matter.World.add(world, ground);

    // Creating initial bodies
    genRandomCharacter(world, mouseConstraint, 5);
}

function genRandomCharacter(world, mouseConstraint, qty){
    while (qty-- > 0) {     
        let spriteId = Math.floor(Math.random() * Object.keys(scales).length) + 1;
        genCharacter(world, mouseConstraint, spriteId);
    }
}

function getHead(spriteId){
    let head;

    if(scales[spriteId].roundHead){
        head = Matter.Bodies.circle(initialCenter,252,25,{
            render: {
                sprite: {
                    texture: "assets/Sprite" + spriteId + "-Head.png",
                    xScale: scales[spriteId].xScale,
                    yScale: scales[spriteId].yScale,
                    angle: 0
                }
            }
        });
    }
    else {
        head = Matter.Bodies.rectangle(initialCenter,252,20,50,{
            render: {
                sprite: {
                    texture: "assets/Sprite" + spriteId + "-Head.png",
                    xScale: scales[spriteId].xScale,
                    yScale: scales[spriteId].yScale,
                    angle: 0
                }
            }
        });
    }
    return head;
}

function getBody(spriteId){

    return Matter.Bodies.rectangle(initialCenter,300,60,40, {
        render: {
            sprite: {
                texture: "assets/Sprite" + spriteId + "-Body.png",
                xScale: scales[spriteId].xScale,
                yScale: scales[spriteId].yScale,
                angle: 0
            }
        }
    });
}

function getFoot(spriteId, foot){
    let side = 1;

    if(foot == 1)
        side = -1;
    
    return Matter.Bodies.rectangle(initialCenter + (15.0 * side),331,11,6, {
        chamfer: {
            radius: scales[spriteId].footChamferRadius[foot]
          },
        render: {
            fillStyle: scales[spriteId].footFillStyle
        }
    });
}

function genCharacter(world, mouseConstraint, spriteId) {
    initialCenter = window.innerWidth/2.0;

    let head = getHead(spriteId);

    let body = getBody(spriteId);

    let leftFoot = getFoot(spriteId, 0);

    let rightFoot = getFoot(spriteId, 1);
    
    var character = Matter.Body.create({
        parts: [leftFoot, rightFoot, body, head]
    });

    var partsQty = character.parts.length;

    Matter.World.add(world, [character]);

    Matter.Events.on(engine, 'beforeUpdate', function(event) {

        // Updating parts with compound body angle
        Matter.Body.setAngle(head, character.angle);
        Matter.Body.setAngle(body, character.angle);
        
        if(lastMouseBody === character && character.parts.length >= partsQty){
            
            // Head rotation when grabbing
            var headRotSpeed = 0.05;
            if(++headAngleLimit > 2)
                headAngleLimit *= -1;

            // rotaciona a head com um ângulo relativo ao seu ângulo atual
            Matter.Body.rotate(head, headRotSpeed * headAngleLimit);

            if (leftFoot.angle > -0.8)
                footRot = -0.15;
            else if (leftFoot.angle < -2.5)
                footRot = 0.15;

            Matter.Body.rotate(leftFoot, footRot);
            Matter.Body.rotate(rightFoot, footRot*-1);
        }
    });

    Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
        // Saving body being held
        if (event.mouse.button != 2){
            lastMouseBody = mouseConstraint.body;

            if (lastMouseBody === character) // Changing head sprite when being held
                head.render.sprite.texture = "assets/Sprite" + spriteId + "-HeadGrab.png";
            else if (character.parts.length > 2){ // Restoring default body, if alive
                head.render.sprite.texture = "assets/Sprite" + spriteId + "-Head.png"
                Matter.Body.setAngle(leftFoot, 0);
                Matter.Body.setAngle(rightFoot, 0);
            }
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
                            xScale: 0.1,
                            yScale: 0.1,
                        }
                    }
                }));
            }
            
        }
    });
}