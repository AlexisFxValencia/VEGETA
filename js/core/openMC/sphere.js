class sphere{
	constructor(radius, x_center, y_center, z_center, color = 0x00ff00){
        this.radius = radius;
        this.x_center = x_center;
        this.y_center = y_center;
        this.z_center = z_center;
        this.points = [];
        this.n_detail_theta = 70;
        this.n_detail_phi = 70;
        this.radius_squared = radius * radius;
        this.color = color;
        this.id;
        this.type;
        
        
	}

    generate_points(){
        let points_1 =[];
        for ( let i = 0; i < this.n_detail_theta; i++ ){
            let theta = i * Math.PI/this.n_detail_theta;
            for ( let j = 0; j < this.n_detail_phi; j++ ){
                let phi = j * 2 * Math.PI/this.n_detail_phi;
                let x_1 = this.radius * Math.sin(theta)*Math.cos(phi) + this.x_center;
                let y_1 = this.radius * Math.sin(theta)*Math.sin(phi) + this.y_center;
                let z_1 = this.radius * Math.cos(theta) + this.z_center;
                let vect_coord_1 = new THREE.Vector3( x_1, y_1, z_1 );
                points_1.push(vect_coord_1);
            }
        }
        this.points = points_1;
    }

    includes(tested_vector, sign){
        let distance = Math.pow(tested_vector.x - this.x_center, 2) + Math.pow(tested_vector.y - this.y_center, 2) + Math.pow(tested_vector.z - this.z_center, 2);
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
