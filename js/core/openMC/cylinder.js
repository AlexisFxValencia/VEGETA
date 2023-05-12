class cylinder{
	constructor(radius, x_center, y_center, type){
        this.x_center = x_center;
        this.y_center = y_center;
        this.radius = radius;
        this.radius_squared = radius * radius;
        this.id;
        this.type = type;    

        this.n_detail_theta = 70; 
        this.n_height = 100;
        this.points = []; 
        this.z_center = 0;
        
	}

    generate_points(){
        let points_1 =[];
        for ( let i = 0; i < this.n_detail_theta; i++ ){
            let theta = i * Math.PI/this.n_detail_theta;
            for ( let j = 0; j < this.n_height; j++ ){
                let x_1 = this.radius * Math.sin(theta) + this.x_center;
                let y_1 = this.radius * Math.sin(theta) + this.y_center;
                let z_1 = j + this.z_center - this.n_height/2;
                let vect_coord_1 = new THREE.Vector3( x_1, y_1, z_1 );
                points_1.push(vect_coord_1);
            }
        }
        this.points = points_1;
    }

    includes(tested_vector, sign){
        if (this.type == "z"){
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
