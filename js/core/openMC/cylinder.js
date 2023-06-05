class cylinder{
	constructor(radius, x_center, y_center, z_center, type){
        this.radius = radius;
        this.x_center = x_center;
        this.y_center = y_center;        
        this.z_center = z_center;
        this.type = type;  
        this.radius_squared = radius * radius;
        this.id;  

        this.n_detail_theta = 70; 
        this.n_height = 100;
        this.points = []; 
        this.z_center = 0;
        
        this.points_2d = [];
        this.temp_sign;
        this.mesh;
        this.bsp;
        
	}

    generate_points(){
        let points_1 =[];
        for ( let i = 0; i < this.n_detail_theta; i++ ){
            let theta = i * Math.PI/this.n_detail_theta;
            for ( let j = 0; j < this.n_height; j++ ){
                let x_1 = this.radius * Math.cos(theta) + this.x_center;
                let y_1 = this.radius * Math.sin(theta) + this.y_center;
                let z_1 = j + this.z_center - this.n_height/2;
                let vect_coord_1 = new THREE.Vector3( x_1, y_1, z_1 );
                points_1.push(vect_coord_1);
            }
        }
        this.points = points_1;
    }

    generate_points_2d(){
        let points_2d =[];
        for ( let i = 0; i < this.n_detail_theta; i++ ){
            let theta = i * Math.PI/this.n_detail_theta;
            let x_1 = this.radius * Math.cos(theta) + this.x_center;
            let y_1 = this.radius * Math.sin(theta) + this.y_center;
            let point = new THREE.Vector3( x_1, y_1, 0 );
            points_2d.push(point);
        }
        this.points_2d = points_2d;
    }

    includes(tested_vector, sign){
        if (this.type == "z-cylinder"){
            return this.includes_for_type_z(tested_vector, sign);

        }
    }

    includes_for_type_z(tested_vector, sign){
        let distance = Math.pow(tested_vector.x - this.x_center, 2) + Math.pow(tested_vector.y - this.y_center, 2);
        
        if (sign == -1){
            if (distance <= this.radius_squared){
                return true;
            } else{
                return false;
            }
        }
        if (sign == 1){
            if (distance >= this.radius_squared){
                return true;
            } else{
                return false;
            }
        }
        
    }

    generate_mesh(){
        const material = new THREE.MeshBasicMaterial( { color: this.color } );
        const geometry = new ConvexGeometry(this.points);
        const mesh = new THREE.Mesh( geometry, material );
        return mesh;
    }


}
