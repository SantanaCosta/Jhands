const initialCenter = window.innerWidth/2.0;

function init(world){
    let ground = Matter.Bodies.rectangle(initialCenter,600,5000,60,{ isStatic: true });
    Matter.World.add(world, ground);

    // Creating initial bodies
    genRandomBody(world, 5);
}

// TO DO
function genRandomBody(world, qty) {
    let boxA = Matter.Bodies.rectangle(initialCenter,200,80,80);
    let boxB = Matter.Bodies.rectangle(initialCenter,50,80,80);

    Matter.World.add(world, [boxA, boxB]);
}