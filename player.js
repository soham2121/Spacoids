class player {
    constructor(x, y, w, h){
        var option = {
            friction: 0.5,
            restitution: 0.8,
            isStatic: true
        }
        this.body = Bodies.rectangle(x, y, w, h, option);
        World.add(world, this.body);
        this.width = w;
        this.height = h;
    }
    
    
    display(){

        if(keyIsDown(RIGHT_ARROW)){
            this.velocity = {x: 5, y:0} 
            console.log(this.body)
        }

        var pos = this.body.position;
        var angle = this.body.angle;
             
        push();
        
        translate(pos.x, pos.y);
        rotate(angle*100);
        rectMode(CENTER);
        rect(0, 0, this.width, this.height);

        pop();
        
    }
    
}