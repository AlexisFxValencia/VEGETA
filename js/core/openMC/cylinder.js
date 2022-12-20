class cylinder{
	constructor(radius, x_center, y_center, type){
        this.x_center = x_center;
        this.y_center = y_center;
        this.radius = radius;
        this.radius_squared = radius * radius;
        this.id;
        this.type = type;      
        
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


}
