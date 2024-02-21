let engine = Matter.Engine.create();

// Render
const rightCanvasBorder = 15;

let render = Matter.Render.create({
    element: document.getElementById("canvas"),
    engine: engine,
    options: {
        width: document.documentElement.clientWidth - rightCanvasBorder,
        height: document.documentElement.clientHeight * 0.8,
        wireframes:false,
    },
});

// Render resizing
window.addEventListener('resize', () => { 
    render.bounds.max.x = window.innerWidth - rightCanvasBorder;
    render.options.width = window.innerWidth - rightCanvasBorder;
    render.canvas.width = window.innerWidth - rightCanvasBorder;
});

// Mouse interactions
let mouse = Matter.Mouse.create(render.canvas);
    let mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            render: {visible: false}
        }
    });
render.mouse = mouse;
Matter.World.add(engine.world, mouseConstraint);

// Show world
init(engine.world, mouseConstraint);
Matter.Runner.run(engine);
Matter.Render.run(render);